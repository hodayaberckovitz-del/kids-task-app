import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { timing } = await req.json();
        
        if (!timing || !['morning', 'evening'].includes(timing)) {
            return Response.json({ 
                error: 'Invalid timing. Must be "morning" or "evening"' 
            }, { status: 400 });
        }

        // Get all families
        const families = await base44.asServiceRole.entities.Family.list();
        
        let totalEmailsSent = 0;
        const results = [];

        for (const family of families) {
            try {
                // Get all children in this family
                const children = await base44.asServiceRole.entities.ChildProfile.filter({
                    family_id: family.id
                });

                if (children.length === 0) continue;

                // Get all active tasks for this timing
                const allTasks = await base44.asServiceRole.entities.Task.filter({
                    family_id: family.id,
                    task_type: timing,
                    is_active: true
                });

                if (allTasks.length === 0) continue;

                // Group tasks by child
                const tasksByChild = {};
                children.forEach(child => {
                    tasksByChild[child.id] = allTasks.filter(t => t.child_profile_id === child.id);
                });

                // Prepare email content
                const timingEmoji = timing === 'morning' ? '☀️' : '🌙';
                const timingHe = timing === 'morning' ? 'בוקר' : 'ערב';
                
                let emailBody = `שלום ${family.family_name}! ${timingEmoji}\n\n`;
                emailBody += `הנה משימות ה${timingHe} להיום:\n\n`;

                children.forEach(child => {
                    const childTasks = tasksByChild[child.id] || [];
                    if (childTasks.length > 0) {
                        emailBody += `👤 ${child.name}:\n`;
                        childTasks.forEach((task, idx) => {
                            emailBody += `  ${idx + 1}. ${task.title}\n`;
                        });
                        emailBody += '\n';
                    }
                });

                emailBody += `בהצלחה! ⭐\nכוכב המשימות`;

                // Send email to primary parent
                await base44.asServiceRole.integrations.Core.SendEmail({
                    to: family.primary_parent_email,
                    subject: `תזכורת משימות ${timingHe} - ${family.family_name}`,
                    body: emailBody,
                    from_name: 'כוכב המשימות'
                });

                totalEmailsSent++;
                results.push({
                    family: family.family_name,
                    email: family.primary_parent_email,
                    children: children.length,
                    tasks: allTasks.length,
                    status: 'sent'
                });

            } catch (familyError) {
                console.error(`Error processing family ${family.id}:`, familyError);
                results.push({
                    family: family.family_name,
                    status: 'error',
                    error: familyError.message
                });
            }
        }

        return Response.json({
            success: true,
            timing,
            totalEmailsSent,
            results
        });

    } catch (error) {
        console.error('Error in sendDailyReminder:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});