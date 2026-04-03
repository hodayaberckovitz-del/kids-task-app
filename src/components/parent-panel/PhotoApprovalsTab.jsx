import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X, Image } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { toast } from 'sonner';

export default function PhotoApprovalsTab({ childProfiles, familyId }) {
  const [pendingCompletions, setPendingCompletions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const { isRTL } = useLanguage();

  useEffect(() => {
    if (!familyId) return;
    loadPending();
  }, [familyId]);

  const loadPending = async () => {
    const [completions, tasksData] = await Promise.all([
      base44.entities.TaskCompletion.filter({ family_id: familyId, pending_approval: true }),
      base44.entities.Task.filter({ family_id: familyId })
    ]);
    setPendingCompletions(completions);
    setTasks(tasksData);
  };

  const handleApprove = async (completion) => {
    await base44.entities.TaskCompletion.update(completion.id, {
      pending_approval: false,
      photo_approved: true
    });
    setPendingCompletions(prev => prev.filter(c => c.id !== completion.id));
    toast.success(isRTL ? 'אושר! ✓' : 'Approved! ✓');
  };

  const handleReject = async (completion) => {
    // Return tokens and delete completion
    const child = childProfiles.find(c => c.id === completion.child_profile_id);
    if (child) {
      const newTokens = Math.max(0, (child.total_tokens || 0) - (completion.tokens_earned || 0));
      await base44.entities.ChildProfile.update(child.id, { total_tokens: newTokens });
    }
    await base44.entities.TaskCompletion.delete(completion.id);
    setPendingCompletions(prev => prev.filter(c => c.id !== completion.id));
    toast.success(isRTL ? 'נדחה' : 'Rejected');
  };

  if (pendingCompletions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Image className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium">{isRTL ? 'אין תמונות לאישור' : 'No photos pending approval'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">
        {isRTL ? `תמונות לאישור (${pendingCompletions.length})` : `Photos for Approval (${pendingCompletions.length})`}
      </h2>
      {pendingCompletions.map(completion => {
        const task = tasks.find(t => t.id === completion.task_id);
        const child = childProfiles.find(c => c.id === completion.child_profile_id);
        return (
          <Card key={completion.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {completion.photo_url && (
                  <img
                    src={completion.photo_url}
                    alt="proof"
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                )}
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{task?.title || completion.task_id}</p>
                  <p className="text-sm text-gray-500">{child?.name}</p>
                  <p className="text-sm text-gray-500">{completion.completed_date}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleApprove(completion)} className="bg-green-500 hover:bg-green-600">
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleReject(completion)} className="border-red-300 text-red-600 hover:bg-red-50">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}