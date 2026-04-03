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

    const allConfigs = await base44.asServiceRole.entities.WhatsAppConfig.filter({ is_active: true, send_task_reminders: true });

    for (const config of allConfigs) {
      if (!config.whatsapp_webhook_url) continue;

      const children = await base44.asServiceRole.entities.ChildProfile.filter({ family_id: config.family_id });
      const tasks = await base44.asServiceRole.entities.Task.filter({ family_id: config.family_id, is_active: true });

      for (const child of children.filter(c => !c.is_adult)) {
        const phone = config.child_phones?.[child.id];
        if (!phone) continue;
        const childTasks = tasks.filter(t => !t.child_profile_id || t.child_profile_id === child.id);
        const msg = `☀️ בוקר טוב ${child.name}! יש לך ${childTasks.length} משימות היום. בהצלחה! 🌟`;
        await sendWhatsAppMessage(config.whatsapp_webhook_url, phone, msg);
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});