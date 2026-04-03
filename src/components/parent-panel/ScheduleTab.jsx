import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Upload, Sparkles, Loader2, CheckCircle, Calendar, Plus, ToggleLeft, Trash2 } from 'lucide-react';
import Icon from '../shared/Icon';
import { useLanguage } from '@/components/LanguageContext';
import DailyHomeworkManager from './DailyHomeworkManager';
import { MobileSelect, SelectItem } from '@/components/ui/mobile-select';

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const SUBJECT_ICONS = ['BookOpen', 'Calculator', 'Beaker', 'Globe', 'Languages', 'Music', 'Palette', 'Dumbbell'];
const SUBJECT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export default function ScheduleTab({ profile, subjects, schedules, onDataChange, showSuccessMessage }) {
  const { t } = useLanguage();
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedData, setAnalyzedData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [editableData, setEditableData] = useState(null);
  
  const [newSubject, setNewSubject] = useState({
    name: '',
    teacher: '',
    color: SUBJECT_COLORS[0],
    icon: SUBJECT_ICONS[0],
    required_materials: []
  });

  const [newHomework, setNewHomework] = useState({
    subject_id: '',
    title: '',
    due_date: '',
    assigned_date: new Date().toISOString().split('T')[0]
  });

  const [materialInput, setMaterialInput] = useState('');

  // Handle image upload and AI analysis
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setIsAnalyzing(true);
    
    try {
      // Upload image
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      const imageUrl = uploadResult.file_url;

      // Analyze with AI
      const prompt = `
Analyze the school schedule image and return JSON with this structure:
{
  "subjects": [
    {"name": "subject name", "teacher": "teacher name if shown"},
    ...
  ],
  "lessons": [
    {"subject_name": "subject name", "day_of_week": 0-6 (0=Sunday, 1=Monday...)},
    ...
  ]
}

Important:
- Identify all subjects shown in the schedule
- Identify which days each subject appears
- day_of_week: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
- If teacher name is not shown, leave it empty
- Return only valid JSON
`;

      const analysisResult = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        file_urls: imageUrl,
        response_json_schema: {
          type: "object",
          properties: {
            subjects: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  teacher: { type: "string" }
                }
              }
            },
            lessons: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  subject_name: { type: "string" },
                  day_of_week: { type: "number" }
                }
              }
            }
          }
        }
      });

      setAnalyzedData(analysisResult);
      setEditableData(JSON.parse(JSON.stringify(analysisResult))); // Deep copy for editing
      setShowPreview(true);
      showSuccessMessage(t('scheduleAnalyzedSuccess') || 'מערכת השעות נותחה בהצלחה');
      
    } catch (error) {
      console.error("Error analyzing schedule:", error);
      showSuccessMessage(t('errorAnalyzingSchedule') || 'שגיאה בניתוח מערכת השעות');
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  // Create subjects and schedule from analyzed data
  const handleConfirmAnalyzedData = async () => {
    if (!editableData || !profile) return;

    try {
      // Create subjects with auto-assigned colors and icons
      const createdSubjects = [];
      for (let i = 0; i < editableData.subjects.length; i++) {
        const subjectData = editableData.subjects[i];
        
        // Check if subject already exists
        const existingSubject = subjects.find(s => 
          s.name.trim().toLowerCase() === subjectData.name.trim().toLowerCase() && 
          s.child_profile_id === profile.id
        );
        
        if (existingSubject) {
          createdSubjects.push(existingSubject);
        } else {
          const subject = await base44.entities.Subject.create({
            name: subjectData.name,
            teacher: subjectData.teacher || '',
            color: SUBJECT_COLORS[i % SUBJECT_COLORS.length],
            icon: SUBJECT_ICONS[i % SUBJECT_ICONS.length],
            child_profile_id: profile.id,
            family_id: profile.family_id,
            is_active: true
          });
          createdSubjects.push(subject);
        }
      }

      // Create schedule entries
      for (const lesson of editableData.lessons) {
        const subject = createdSubjects.find(s => s.name === lesson.subject_name);
        if (subject) {
          await base44.entities.Schedule.create({
            subject_id: subject.id,
            day_of_week: lesson.day_of_week,
            child_profile_id: profile.id,
            family_id: profile.family_id
          });
        }
      }

      await onDataChange();
      setShowPreview(false);
      setAnalyzedData(null);
      setEditableData(null);
      showSuccessMessage(t('scheduleCreatedSuccess') || `נוצרו ${createdSubjects.length} מקצועות!`);
      
    } catch (error) {
      console.error("Error creating schedule:", error);
      showSuccessMessage(t('errorCreatingSchedule') || 'שגיאה ביצירת מערכת השעות');
    }
  };

  // Manual subject creation
  const handleAddSubject = async () => {
    if (!newSubject.name.trim() || !profile) return;

    try {
      await base44.entities.Subject.create({
        ...newSubject,
        child_profile_id: profile.id,
        family_id: profile.family_id,
        is_active: true
      });

      setNewSubject({
        name: '',
        teacher: '',
        color: SUBJECT_COLORS[0],
        icon: SUBJECT_ICONS[0],
        required_materials: []
      });
      setMaterialInput('');

      await onDataChange();
      showSuccessMessage(t('subjectAddedSuccess') || 'מקצוע נוסף בהצלחה!');
    } catch (error) {
      console.error("Error adding subject:", error);
      showSuccessMessage(t('errorSavingSubject') || 'שגיאה בשמירת מקצוע');
    }
  };

  // Add homework
  const handleAddHomework = async () => {
    if (!newHomework.subject_id || !newHomework.title.trim() || !newHomework.due_date || !profile) return;

    try {
      await base44.entities.HomeworkTask.create({
        ...newHomework,
        child_profile_id: profile.id,
        family_id: profile.family_id,
        is_completed: false,
        tokens_earned: 0
      });

      setNewHomework({
        subject_id: '',
        title: '',
        due_date: '',
        assigned_date: new Date().toISOString().split('T')[0]
      });

      await onDataChange();
      showSuccessMessage(t('homeworkAddedSuccess') || 'שיעורי בית נוספו בהצלחה!');
    } catch (error) {
      console.error("Error adding homework:", error);
      showSuccessMessage(t('errorSavingHomework') || 'שגיאה בהוספת שיעורי בית');
    }
  };

  const addMaterial = () => {
    if (materialInput.trim()) {
      setNewSubject({
        ...newSubject,
        required_materials: [...(newSubject.required_materials || []), materialInput.trim()]
      });
      setMaterialInput('');
    }
  };

  const removeMaterial = (index) => {
    setNewSubject({
      ...newSubject,
      required_materials: newSubject.required_materials.filter((_, i) => i !== index)
    });
  };

  const handleDeleteSubject = async (subjectId) => {
    if (window.confirm(t('confirmDelete', { item: t('subject') }))) {
      try {
        // Delete associated schedules first
        const subjectSchedules = schedules.filter(s => s.subject_id === subjectId);
        for (const schedule of subjectSchedules) {
          await base44.entities.Schedule.delete(schedule.id);
        }
        
        // Delete the subject
        await base44.entities.Subject.delete(subjectId);
        await onDataChange();
        showSuccessMessage(t('subjectDeletedSuccess') || 'מקצוע נמחק בהצלחה!');
      } catch (error) {
        console.error("Error deleting subject:", error);
        // If already deleted, just refresh
        if (error.message && error.message.includes('not found')) {
          await onDataChange();
          showSuccessMessage(t('subjectDeletedSuccess') || 'מקצוע נמחק בהצלחה!');
        } else {
          showSuccessMessage(t('errorDeletingSubject') || 'שגיאה במחיקת מקצוע');
        }
      }
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <Tabs defaultValue="daily" className="w-full">
        <div className="overflow-x-auto -mx-2 px-2 md:mx-0 md:px-0 mb-4">
          <TabsList className="inline-flex md:grid w-auto md:w-full md:grid-cols-4 gap-1 md:gap-2 h-auto bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="daily" className="text-xs md:text-sm py-2 md:py-2.5 px-2 md:px-3 whitespace-nowrap">
              <ToggleLeft className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">{t('dailyHomework') || 'שיעורי בית יומיים'}</span>
              <span className="sm:hidden">{t('daily') || 'יומי'}</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="text-xs md:text-sm py-2 md:py-2.5 px-2 md:px-3 whitespace-nowrap">
              <Upload className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">{t('uploadScheduleImage') || 'העלה תמונת מערכת'}</span>
              <span className="sm:hidden">{t('upload') || 'העלה'}</span>
            </TabsTrigger>
            <TabsTrigger value="manual" className="text-xs md:text-sm py-2 md:py-2.5 px-2 md:px-3 whitespace-nowrap">
              <BookOpen className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">{t('addNewSubject') || 'הוסף מקצוע'}</span>
              <span className="sm:hidden">{t('subject') || 'מקצוע'}</span>
            </TabsTrigger>
            <TabsTrigger value="homework" className="text-xs md:text-sm py-2 md:py-2.5 px-2 md:px-3 whitespace-nowrap">
              <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">{t('addHomework') || 'הוסף שיעורי בית'}</span>
              <span className="sm:hidden">{t('homework') || 'ש״ב'}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Daily Homework Manager Tab */}
        <TabsContent value="daily">
          <DailyHomeworkManager
            profile={profile}
            subjects={subjects}
            schedules={schedules}
            onDataChange={onDataChange}
            showSuccessMessage={showSuccessMessage}
          />
        </TabsContent>

        {/* AI Upload Tab */}
        <TabsContent value="upload">
          <Card>
            <CardHeader className="p-3 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
                <span className="truncate">{t('uploadScheduleImage') || 'העלה תמונת מערכת'}</span>
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">{t('uploadScheduleImageDesc') || 'צלם או העלה תמונה של מערכת השעות והמערכת תנתח אותה אוטומטית'}</CardDescription>
            </CardHeader>
            <CardContent className="p-3 md:p-6">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="hidden"
                id="schedule-upload"
              />
              <label 
                htmlFor="schedule-upload" 
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-8 text-center hover:border-purple-400 transition-colors cursor-pointer block"
              >
                {isAnalyzing ? (
                  <div className="space-y-3 md:space-y-4">
                    <Loader2 className="w-10 h-10 md:w-12 md:h-12 mx-auto text-purple-500 animate-spin" />
                    <p className="text-sm md:text-lg font-medium text-gray-700">{t('analyzing') || 'מנתח...'}</p>
                  </div>
                ) : (
                  <div className="space-y-3 md:space-y-4">
                    <Upload className="w-10 h-10 md:w-12 md:h-12 mx-auto text-gray-400" />
                    <div>
                      <p className="text-sm md:text-lg font-medium text-gray-700">{t('dragAndDrop') || 'גרור ושחרר תמונה'}</p>
                      <p className="text-xs md:text-sm text-gray-500">{t('orClickToSelect') || 'או לחץ לבחירת קובץ'}</p>
                    </div>
                  </div>
                )}
              </label>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual Creation Tab */}
        <TabsContent value="manual">
          <Card>
            <CardHeader className="p-3 md:p-6">
              <CardTitle className="text-base md:text-lg">{t('addNewSubject') || 'הוסף מקצוע חדש'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4 p-3 md:p-6">
              <div>
                <Label htmlFor="subject-name" className="text-xs md:text-sm">{t('subjectName') || 'שם המקצוע'}</Label>
                <Input
                  id="subject-name"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                  placeholder={t('subjectNamePlaceholder') || 'לדוגמה: מתמטיקה'}
                  className="h-9 md:h-10 text-sm md:text-base"
                />
              </div>

              <div>
                <Label htmlFor="teacher-name" className="text-xs md:text-sm">{t('teacherName') || 'שם המורה'}</Label>
                <Input
                  id="teacher-name"
                  value={newSubject.teacher}
                  onChange={(e) => setNewSubject({...newSubject, teacher: e.target.value})}
                  placeholder={t('teacherNamePlaceholder') || 'שם המורה (אופציונלי)'}
                  className="h-9 md:h-10 text-sm md:text-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <Label className="text-xs md:text-sm">{t('icon') || 'אייקון'}</Label>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {SUBJECT_ICONS.map(icon => (
                      <button
                        key={icon}
                        onClick={() => setNewSubject({...newSubject, icon})}
                        className={`w-8 h-8 md:w-10 md:h-10 rounded border-2 flex items-center justify-center ${
                          newSubject.icon === icon ? 'border-purple-500 bg-purple-50' : 'border-gray-300'
                        }`}
                      >
                        <Icon name={icon} className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-xs md:text-sm">{t('color') || 'צבע'}</Label>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {SUBJECT_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setNewSubject({...newSubject, color})}
                        className={`w-8 h-8 md:w-10 md:h-10 rounded border-2 ${
                          newSubject.color === color ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs md:text-sm">{t('requiredMaterials') || 'חומרים נדרשים'}</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={materialInput}
                    onChange={(e) => setMaterialInput(e.target.value)}
                    placeholder={t('materialPlaceholder') || 'לדוגמה: מחברת, ספר'}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addMaterial();
                      }
                    }}
                    className="h-9 md:h-10 text-sm md:text-base"
                  />
                  <Button type="button" onClick={addMaterial} variant="outline" size="icon" className="h-9 w-9 md:h-10 md:w-10">
                    <Plus className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                </div>
                {newSubject.required_materials && newSubject.required_materials.length > 0 && (
                  <div className="flex flex-wrap gap-1 md:gap-2 mt-2">
                    {newSubject.required_materials.map((material, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-red-100 text-xs md:text-sm"
                        onClick={() => removeMaterial(index)}
                      >
                        {material} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Button onClick={handleAddSubject} disabled={!newSubject.name.trim()} className="w-full text-sm md:text-base h-9 md:h-10">
                {t('add') || 'הוסף'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add Homework Tab */}
        <TabsContent value="homework">
          <Card>
            <CardHeader className="p-3 md:p-6">
              <CardTitle className="text-base md:text-lg">{t('addHomework') || 'הוסף שיעורי בית'}</CardTitle>
              <CardDescription className="text-xs md:text-sm">{t('addHomeworkDesc') || 'הוסף שיעורי בית ידנית למקצוע מסוים'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4 p-3 md:p-6">
              <div>
                <Label htmlFor="homework-subject" className="text-xs md:text-sm">{t('subject') || 'מקצוע'}</Label>
                <MobileSelect 
                  value={newHomework.subject_id} 
                  onValueChange={(value) => setNewHomework({...newHomework, subject_id: value})}
                  placeholder={t('selectSubject') || 'בחר מקצוע'}
                  triggerClassName="h-9 md:h-10 text-sm md:text-base"
                >
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                  ))}
                </MobileSelect>
              </div>

              <div>
                <Label htmlFor="homework-title" className="text-xs md:text-sm">{t('homeworkDescription') || 'תיאור שיעורי הבית'}</Label>
                <Textarea
                  id="homework-title"
                  value={newHomework.title}
                  onChange={(e) => setNewHomework({...newHomework, title: e.target.value})}
                  placeholder={t('homeworkPlaceholder') || 'לדוגמה: עמוד 20 תרגילים 1-5'}
                  rows={3}
                  className="text-sm md:text-base"
                />
              </div>

              <div>
                <Label htmlFor="homework-due-date" className="text-xs md:text-sm">{t('dueDate') || 'תאריך יעד'}</Label>
                <Input
                  id="homework-due-date"
                  type="date"
                  value={newHomework.due_date}
                  onChange={(e) => setNewHomework({...newHomework, due_date: e.target.value})}
                  className="h-9 md:h-10 text-sm md:text-base"
                />
              </div>

              <Button 
                onClick={handleAddHomework} 
                disabled={!newHomework.subject_id || !newHomework.title.trim() || !newHomework.due_date}
                className="w-full text-sm md:text-base h-9 md:h-10"
              >
                <Plus className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                {t('addHomework') || 'הוסף שיעורי בית'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Subjects List */}
      <Card>
        <CardHeader className="p-3 md:p-6">
          <CardTitle className="text-base md:text-lg">{t('allSubjects') || 'כל המקצועות'}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          {subjects.length > 0 ? (
            <div className="space-y-2">
              {subjects.map(subject => {
                const subjectSchedules = schedules.filter(s => s.subject_id === subject.id);
                return (
                  <div key={subject.id} className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded border gap-2">
                    <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                      <div
                        style={{ backgroundColor: subject.color }}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      >
                        <Icon name={subject.icon} className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm md:text-base truncate">{subject.name}</p>
                        {subject.teacher && (
                          <p className="text-xs md:text-sm text-gray-500 truncate">{subject.teacher}</p>
                        )}
                        {subjectSchedules.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {subjectSchedules.map(sched => (
                              <Badge key={sched.id} variant="outline" className="text-[10px] md:text-xs px-1 py-0">
                                {t(DAYS[sched.day_of_week]) || DAYS[sched.day_of_week]}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSubject(subject.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-100 h-8 w-8 md:h-10 md:w-10 flex-shrink-0"
                    >
                      <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs md:text-sm text-gray-500 text-center py-4">{t('noSubjectsYet') || 'אין מקצועות עדיין'}</p>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <AlertDialog open={showPreview} onOpenChange={setShowPreview}>
        <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              {t('previewAndConfirm') || 'תצוגה מקדימה ואישור'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {editableData && (
                <div className="space-y-4 mt-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="font-medium text-green-800">
                      {t('foundSubjects', { count: editableData.subjects?.length || 0 })}
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      {t('foundLessons', { count: editableData.lessons?.length || 0 })}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{t('allSubjects') || 'כל המקצועות'}:</h4>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditableData({
                            ...editableData,
                            subjects: [...editableData.subjects, { name: '', teacher: '' }]
                          });
                        }}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {t('add')}
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {editableData.subjects?.map((subject, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: SUBJECT_COLORS[index % SUBJECT_COLORS.length] }}
                          >
                            <Icon name={SUBJECT_ICONS[index % SUBJECT_ICONS.length]} className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <Input
                              value={subject.name}
                              onChange={(e) => {
                                const newSubjects = [...editableData.subjects];
                                newSubjects[index].name = e.target.value;
                                // Update lesson references
                                const oldName = editableData.subjects[index].name;
                                const newLessons = editableData.lessons.map(l => 
                                  l.subject_name === oldName ? {...l, subject_name: e.target.value} : l
                                );
                                setEditableData({ ...editableData, subjects: newSubjects, lessons: newLessons });
                              }}
                              placeholder={t('subjectName')}
                              className="h-7 text-sm"
                            />
                            <Input
                              value={subject.teacher || ''}
                              onChange={(e) => {
                                const newSubjects = [...editableData.subjects];
                                newSubjects[index].teacher = e.target.value;
                                setEditableData({ ...editableData, subjects: newSubjects });
                              }}
                              placeholder={t('teacherName')}
                              className="h-7 text-sm"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:bg-red-50"
                            onClick={() => {
                              const subjectName = subject.name;
                              setEditableData({
                                subjects: editableData.subjects.filter((_, i) => i !== index),
                                lessons: editableData.lessons.filter(l => l.subject_name !== subjectName)
                              });
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">{t('schedule') || 'מערכת שעות'}:</h4>
                    <div className="grid grid-cols-7 gap-1 text-xs">
                      {DAYS.map((day, dayIndex) => (
                        <div key={day} className="text-center">
                          <div className="font-medium mb-1 p-1 bg-gray-100 rounded">
                            {t(day) || day}
                          </div>
                          {editableData.lessons
                            ?.filter(l => l.day_of_week === dayIndex)
                            .map((lesson, lessonIndex) => {
                              const globalIndex = editableData.lessons.findIndex(
                                l => l.day_of_week === dayIndex && l.subject_name === lesson.subject_name
                              );
                              return (
                                <div key={lessonIndex} className="relative group p-1 bg-blue-50 rounded mt-1 text-xs">
                                  <MobileSelect
                                   value={lesson.subject_name}
                                   onValueChange={(value) => {
                                     const newLessons = [...editableData.lessons];
                                     newLessons[globalIndex].subject_name = value;
                                     setEditableData({ ...editableData, lessons: newLessons });
                                   }}
                                   triggerClassName="w-full h-6 text-xs p-0 border-0 bg-transparent"
                                  >
                                   {editableData.subjects.map((s, i) => (
                                     <SelectItem key={i} value={s.name}>{s.name}</SelectItem>
                                   ))}
                                  </MobileSelect>
                                  <button
                                    onClick={() => {
                                      setEditableData({
                                        ...editableData,
                                        lessons: editableData.lessons.filter((_, i) => i !== globalIndex)
                                      });
                                    }}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    ×
                                  </button>
                                </div>
                              );
                            })}
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="w-full mt-1 h-6 text-xs"
                            onClick={() => {
                              if (editableData.subjects.length > 0) {
                                setEditableData({
                                  ...editableData,
                                  lessons: [...editableData.lessons, {
                                    subject_name: editableData.subjects[0].name,
                                    day_of_week: dayIndex
                                  }]
                                });
                              }
                            }}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => {
              setShowPreview(false);
              setAnalyzedData(null);
              setEditableData(null);
            }}>
              {t('cancel') || 'ביטול'}
            </AlertDialogCancel>
            <Button
              variant="outline"
              onClick={() => {
                setShowPreview(false);
                setAnalyzedData(null);
                setEditableData(null);
                document.getElementById('schedule-upload').click();
              }}
            >
              <Upload className="w-4 h-4 mr-2" />
              {t('uploadScheduleImage') || 'העלה תמונה אחרת'}
            </Button>
            <AlertDialogAction onClick={handleConfirmAnalyzedData}>
              <Sparkles className="w-4 h-4 mr-2" />
              {t('confirmAndCreate') || 'אשר וצור'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}