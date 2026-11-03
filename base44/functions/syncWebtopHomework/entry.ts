import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const DEVICE_JSON = JSON.stringify({
  isMobile: false, isTablet: false, isDesktop: true,
  getDeviceType: "Desktop", os: "Windows", osVersion: "10",
  browser: "Chrome", browserVersion: "147.0.0.0", browserMajorVersion: 147,
  screen_resolution: "1920 x 1080", cookies: true,
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"
});

const SUBJECT_COLORS = [
  '#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFEAA7',
  '#DDA0DD','#98D8C8','#F7DC6F','#BB8FCE','#85C1E9'
];

function currentStudyYear(): number {
  const today = new Date();
  // Israeli academic year: if September or later → year+1
  return today.getMonth() >= 8 ? today.getFullYear() + 1 : today.getFullYear();
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      child_profile_id,
      webtop_url,
      webtop_username,
      webtop_password,
      webtop_data = '',
      week_index = 0,
    } = await req.json();

    if (!child_profile_id || !webtop_url || !webtop_username || !webtop_password) {
      return Response.json({ error: 'Missing required fields: child_profile_id, webtop_url, webtop_username, webtop_password' }, { status: 400 });
    }

    // Normalize URL (remove trailing slash)
    const baseUrl = webtop_url.replace(/\/$/, '');

    // Step 1: Login to webtop
    const loginResp = await fetch(`${baseUrl}/server/api/user/LoginByUserNameAndPassword`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        UserName: webtop_username,
        Password: webtop_password,
        Data: webtop_data,
        RememberMe: false,
        BiometricLogin: false,
        UniqueId: 'kids-task-app-sync-v1',
        captcha: '',
        deviceDataJson: DEVICE_JSON,
      }),
    });

    if (!loginResp.ok) {
      return Response.json({ error: `Webtop login failed: HTTP ${loginResp.status}` }, { status: 502 });
    }

    const loginBody = await loginResp.json();
    const token = loginBody?.data?.token;
    if (!token) {
      return Response.json({ error: 'Webtop login failed: no token in response. Check your credentials.' }, { status: 502 });
    }

    const authHeaders = {
      'Content-Type': 'application/json',
      'Cookie': `webToken=${token}`,
    };

    // Step 2: Get student data from dashboard
    const dashResp = await fetch(`${baseUrl}/server/api/dashboard/InitDashboard`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({}),
    });

    if (!dashResp.ok) {
      return Response.json({ error: `Webtop dashboard failed: HTTP ${dashResp.status}` }, { status: 502 });
    }

    const dashBody = await dashResp.json();
    const payload = dashBody?.data;

    // Extract first child from the dashboard (handles multiple response shapes)
    let studentData: Record<string, any> | null = null;
    if (payload && typeof payload === 'object') {
      const children = payload.childrens ?? payload.children ?? payload.students;
      if (Array.isArray(children) && children.length > 0) {
        studentData = children[0];
      } else if (Array.isArray(payload) && payload.length > 0) {
        studentData = payload[0];
      }
    }

    if (!studentData) {
      return Response.json({
        error: 'Could not extract student data from webtop. Raw dashboard response saved to logs.',
        debug: JSON.stringify(dashBody).substring(0, 500),
      }, { status: 502 });
    }

    const encryptedStudentId =
      studentData.id ?? studentData.encryptedStudentId ?? studentData.encryptId ?? studentData.encryptedId ?? '';
    const classCode =
      studentData.classCode ?? studentData.class_code ?? studentData.classId ?? studentData.classSymbol ?? '';
    const studentName =
      `${studentData.firstName ?? ''} ${studentData.lastName ?? ''}`.trim() || 'התלמיד';

    // Step 3: Fetch homework for the requested week
    const hwResp = await fetch(`${baseUrl}/server/api/PupilCard/GetPupilLessonsAndHomework`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        weekIndex: week_index,
        viewType: 0,
        studyYear: currentStudyYear(),
        studyYearName: '',
        studentID: encryptedStudentId,
        studentName: studentName,
        classCode: classCode,
        moduleID: 11,
        periodID: 0,
        periodName: '',
      }),
    });

    if (!hwResp.ok) {
      return Response.json({ error: `Webtop homework fetch failed: HTTP ${hwResp.status}` }, { status: 502 });
    }

    const hwBody = await hwResp.json();

    if (!hwBody?.status || !Array.isArray(hwBody?.data) || hwBody.data.length === 0) {
      return Response.json({ success: true, synced: 0, skipped: 0, message: 'לא נמצאו שיעורי בית לשבוע זה' });
    }

    // Get child profile to read family_id
    const profiles = await base44.asServiceRole.entities.ChildProfile.filter({ id: child_profile_id });
    if (!profiles.length) {
      return Response.json({ error: 'Child profile not found' }, { status: 404 });
    }
    const profile = profiles[0];

    // Load existing subjects for dedup / matching
    const existingSubjects = await base44.asServiceRole.entities.Subject.filter({ child_profile_id });
    const subjectMap: Record<string, any> = {};
    for (const s of existingSubjects) {
      subjectMap[s.name.trim().toLowerCase()] = s;
    }

    // Load existing webtop homework to avoid duplicates (keyed by lessonId+date or title+date)
    const existingHW = await base44.asServiceRole.entities.HomeworkTask.filter({
      child_profile_id,
      source: 'webtop',
    });
    const existingKeys = new Set<string>(
      existingHW.map((h: any) => `${h.webtop_lesson_id || h.title}|${h.assigned_date}`)
    );

    let syncedCount = 0;
    let skippedCount = 0;

    for (const day of hwBody.data) {
      const dayDate: string = (day.date ?? '').substring(0, 10);
      if (!dayDate) continue;

      for (const slot of (day.hoursData ?? [])) {
        for (const lesson of (slot.scheduale ?? [])) {
          const hwText: string = (lesson.homeWork ?? '').trim();
          if (!hwText) continue;

          const subjectName: string = (lesson.subject_name ?? 'כללי').trim();
          const lessonId: string = String(lesson.lessonId ?? lesson.id ?? '');
          const dedupeKey = `${lessonId || hwText}|${dayDate}`;

          if (existingKeys.has(dedupeKey)) {
            skippedCount++;
            continue;
          }

          // Find or create subject
          const subjectKey = subjectName.toLowerCase();
          if (!subjectMap[subjectKey]) {
            const colorIndex = Object.keys(subjectMap).length % SUBJECT_COLORS.length;
            const newSubject = await base44.asServiceRole.entities.Subject.create({
              name: subjectName,
              teacher: (lesson.teacher ?? '').trim(),
              color: SUBJECT_COLORS[colorIndex],
              icon: '📚',
              child_profile_id,
              family_id: profile.family_id,
              is_active: true,
            });
            subjectMap[subjectKey] = newSubject;
          }

          const subject = subjectMap[subjectKey];

          await base44.asServiceRole.entities.HomeworkTask.create({
            title: hwText,
            subject_id: subject.id,
            child_profile_id,
            family_id: profile.family_id,
            assigned_date: dayDate,
            due_date: addDays(dayDate, 1),
            is_completed: false,
            tokens_earned: 0,
            source: 'webtop',
            webtop_lesson_id: lessonId,
          });

          existingKeys.add(dedupeKey);
          syncedCount++;
        }
      }
    }

    return Response.json({
      success: true,
      synced: syncedCount,
      skipped: skippedCount,
      message: syncedCount > 0
        ? `סונכרנו ${syncedCount} שיעורי בית בהצלחה!`
        : 'לא נמצאו שיעורי בית חדשים (הכל כבר קיים)',
    });

  } catch (error: any) {
    console.error('syncWebtopHomework error:', error);
    return Response.json({ error: error?.message ?? 'Unknown error' }, { status: 500 });
  }
});
