/**
 * base44 → Supabase compatibility layer
 *
 * Exposes the same API shape as the original base44 SDK so that
 * all existing components work without modification:
 *
 *   base44.entities.ChildProfile.filter({ family_id: 'x' })
 *   base44.entities.Task.create({ title: '...' })
 *   base44.auth.me()
 *   base44.auth.signUp({ email, password, full_name })
 *   base44.functions.syncWebtopHomework({ ... })
 */

import { supabase } from '@/lib/supabaseClient';

// ── table name map (camelCase entity → snake_case table) ──────────────────
const TABLE_MAP = {
  ChildProfile:          'child_profiles',
  Family:                'families',
  Task:                  'tasks',
  TaskCompletion:        'task_completions',
  Subject:               'subjects',
  HomeworkTask:          'homework_tasks',
  Schedule:              'schedules',
  Reward:                'rewards',
  WishlistItem:          'wishlist_items',
  Challenge:             'challenges',
  ChallengeCompletion:   'challenge_completions',
  ChallengeProgress:     'challenge_progress',
  BonusActivity:         'bonus_activities',
  HouseholdTask:         'household_tasks',
  MiniGame:              'mini_games',
  ParentSpecialNote:     'parent_special_notes',
  Event:                 'events',
};

// ── helper: get current user's email (for created_by) ────────────────────
async function getCurrentEmail() {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.email ?? null;
}

// ── Entity class — mirrors base44 entity API ──────────────────────────────
class Entity {
  constructor(name) {
    this._table = TABLE_MAP[name] ?? name.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
  }

  async filter(conditions = {}, sortField = null) {
    let q = supabase.from(this._table).select('*');

    for (const [key, value] of Object.entries(conditions)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        q = q.in(key, value);
      } else {
        q = q.eq(key, value);
      }
    }

    if (sortField) {
      const asc = !sortField.startsWith('-');
      q = q.order(sortField.replace(/^-/, ''), { ascending: asc });
    } else {
      q = q.order('created_at', { ascending: false });
    }

    const { data, error } = await q;
    if (error) throw error;
    return data ?? [];
  }

  async list() {
    const { data, error } = await supabase
      .from(this._table)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  async create(fields) {
    const email = await getCurrentEmail();
    const row = { ...fields };
    if (email && !row.created_by) row.created_by = email;

    const { data, error } = await supabase
      .from(this._table)
      .insert(row)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async bulkCreate(rows) {
    const email = await getCurrentEmail();
    const enriched = rows.map(r => ({
      ...r,
      created_by: r.created_by ?? email ?? undefined,
    }));
    const { data, error } = await supabase
      .from(this._table)
      .insert(enriched)
      .select();
    if (error) throw error;
    return data ?? [];
  }

  async update(id, fields) {
    const { data, error } = await supabase
      .from(this._table)
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { error } = await supabase
      .from(this._table)
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}

// ── Entities proxy ────────────────────────────────────────────────────────
const entities = new Proxy({}, {
  get(_, name) {
    return new Entity(name);
  },
});

// ── Auth ──────────────────────────────────────────────────────────────────

async function me() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw Object.assign(new Error('Not authenticated'), { status: 401 });

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email,
    full_name: profile?.full_name ?? user.user_metadata?.full_name ?? '',
    family_id: profile?.family_id ?? null,
    ...(profile ?? {}),
  };
}

async function signUp({ email, password, full_name }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name } },
  });
  if (error) throw error;
  return data;
}

async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function isAuthenticated() {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

async function updateMe(fields) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('user_profiles')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', user.id);
  if (error) throw error;
}

function logout(redirectUrl) {
  supabase.auth.signOut().then(() => {
    if (redirectUrl) window.location.href = redirectUrl;
    else window.location.href = '/Registration';
  });
}

function redirectToLogin(returnUrl) {
  window.location.href = '/Registration' + (returnUrl ? `?return=${encodeURIComponent(returnUrl)}` : '');
}

async function resetPasswordRequest(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/Registration?reset=true`,
  });
  if (error) throw error;
}

const auth = {
  me,
  signUp,
  signIn,
  isAuthenticated,
  updateMe,
  logout,
  redirectToLogin,
  resetPasswordRequest,
};

// ── Functions (Supabase Edge Functions) ───────────────────────────────────
async function callFunction(name, payload) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  const res = await fetch(`${supabaseUrl}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? `Function ${name} failed`);
  return json;
}

const functions = new Proxy({}, {
  get(_, name) {
    return (payload) => callFunction(name, payload);
  },
});

// ── File upload (replaces base44.integrations.Core.UploadFile) ────────────
async function uploadFile(file) {
  const ext = file.name.split('.').pop();
  const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from('app-uploads')
    .upload(path, file, { upsert: true });
  if (error) throw error;

  const { data } = supabase.storage.from('app-uploads').getPublicUrl(path);
  return { file_url: data.publicUrl };
}

const integrations = {
  Core: {
    UploadFile: uploadFile,
    InvokeLLM: async (params) => {
      console.warn('InvokeLLM: not available after base44 migration', params);
      return { output: '' };
    },
    GenerateImage: async () => ({ url: '' }),
    ExtractDataFromUploadedFile: async () => ({ status: 'error', details: 'Not available' }),
  },
};

// ── Export ────────────────────────────────────────────────────────────────
export const base44 = {
  entities,
  auth,
  functions,
  integrations,
};
