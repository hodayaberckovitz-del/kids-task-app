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
    console.error('WhatsApp send error:', e.message);
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await req.json();
    const { type, task_title, child_name, child_id, family_id, tokens } = payload;

    if (!family_id) return Response.json({ error: 'Missing family_id' }, { status: 400 });

    const configs = await base44.asServiceRole.entities.WhatsAppConfig.filter({ family_id, is_active: true });
    if (configs.length === 0) return Response.json({ skipped: true });

    const config = configs[0];
    if (!config.whatsapp_webhook_url) return Response.json({ skipped: true, reason: 'no webhook url' });

    if (type === 'task_completed' && config.send_completion_notifications) {
      const msg = `✅ ${child_name} סיים/ה את המשימה "${task_title}"! 🪙 אסימונים: ${tokens}`;
      await sendWhatsAppMessage(config.whatsapp_webhook_url, config.parent_phone, msg);
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});