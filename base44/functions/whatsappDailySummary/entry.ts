import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

async function sendWhatsAppMessage(webhookUrl, phone, message) {
  if (!webhookUrl || !phone) return;
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message })
    });
  } catch (e) {
    console.error('WhatsApp error:', e.message);
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      // Allow scheduled execution or admin
    }

    const today = new Date().toISOString().split('T')[0];
    const allConfigs = await base44.asServiceRole.entities.WhatsAppConfig.filter({ is_active: true });

    for (const config of allConfigs) {
      if (!config.whatsapp_webhook_url || !config.parent_phone) continue;

      const children = await base44.asServiceRole.entities.ChildProfile.filter({ family_id: config.family_id });
      const tasks = await base44.asServiceRole.entities.Task.filter({ family_id: config.family_id, is_active: true });
      const completions = await base44.asServiceRole.entities.TaskCompletion.filter({ family_id: config.family_id, completed_date: today });

      let summary = `📊 סיכום יומי - ${today}\n`;
      for (const child of children.filter(c => !c.is_adult)) {
        const childCompletions = completions.filter(c => c.child_profile_id === child.id);
        const childTasks = tasks.filter(t => !t.child_profile_id || t.child_profile_id === child.id);
        const tokensToday = childCompletions.reduce((s, c) => s + (c.tokens_earned || 0), 0);
        summary += `\n👦 ${child.name}: ${childCompletions.length}/${childTasks.length} משימות • 🪙 ${tokensToday} אסימונים`;
        if (child.current_streak > 0) summary += ` • 🔥 רצף ${child.current_streak}`;
      }

      await sendWhatsAppMessage(config.whatsapp_webhook_url, config.parent_phone, summary);
    }

    return Response.json({ success: true, processed: allConfigs.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});