import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // This is a scheduled function - use service role
    const allGoals = await base44.asServiceRole.entities.SavingsGoal.list();
    
    const activeGoals = allGoals.filter(g => !g.is_completed && (g.current_amount || 0) > 0);
    
    let updated = 0;
    for (const goal of activeGoals) {
      const interest = Math.floor((goal.current_amount || 0) * 0.10);
      if (interest < 1) continue;

      const newAmount = (goal.current_amount || 0) + interest;
      const isCompleted = newAmount >= goal.target_amount;

      await base44.asServiceRole.entities.SavingsGoal.update(goal.id, {
        current_amount: newAmount,
        is_completed: isCompleted,
      });

      // If completed now, notify parent
      if (isCompleted) {
        try {
          const profiles = await base44.asServiceRole.entities.ChildProfile.filter({ id: goal.child_profile_id });
          if (profiles.length > 0) {
            const profile = profiles[0];
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: profile.parent_email,
              subject: `🎉 ${profile.name} הגיע ליעד החיסכון "${goal.title}"!`,
              body: `כל הכבוד! ${profile.name} הגיע ליעד החיסכון "${goal.title}" עם ${newAmount} אסימונים! 🎊\n\nהסכום כולל ריבית שבועית של 10%.`,
            });
          }
        } catch (emailErr) {
          console.error('Email error:', emailErr.message);
        }
      }

      updated++;
    }

    return Response.json({ success: true, updated, total: activeGoals.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});