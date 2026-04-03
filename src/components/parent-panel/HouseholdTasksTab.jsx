import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { uploadHouseholdTasks } from '@/functions/uploadHouseholdTasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Plus, Trash2, Check, MessageSquare, Loader2, Calendar as CalendarIcon, FileSpreadsheet } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { MobileSelect, SelectItem } from '@/components/ui/mobile-select';

const CATEGORY_CONFIG = {
  cleaning: { icon: '🧹', color: 'bg-blue-100 text-blue-800' },
  cooking: { icon: '🍳', color: 'bg-orange-100 text-orange-800' },
  laundry: { icon: '👕', color: 'bg-purple-100 text-purple-800' },
  shopping: { icon: '🛒', color: 'bg-green-100 text-green-800' },
  maintenance: { icon: '🔧', color: 'bg-red-100 text-red-800' },
  other: { icon: '📦', color: 'bg-gray-100 text-gray-800' }
};

export default function HouseholdTasksTab({ profile, showSuccessMessage }) {
  const { t, isRTL } = useLanguage();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [showAddForm, setShowAddForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedTasks, setUploadedTasks] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigned_to: '',
    due_date: '',
    category: 'other',
    priority: 'medium',
    recurrence_pattern: 'none'
  });

  useEffect(() => {
    loadTasks();
    loadFamilyMembers();
  }, [currentMonth, profile]);

  const loadTasks = async () => {
    if (!profile) return;
    
    setIsLoading(true);
    try {
      const user = await base44.auth.me();
      const tasksData = await base44.entities.HouseholdTask.filter({
        month_year: currentMonth,
        family_id: user.family_id
      }, 'due_date');
      
      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFamilyMembers = async () => {
    try {
      const user = await base44.auth.me();
      const children = await base44.entities.ChildProfile.filter({
        family_id: user.family_id
      });
      setFamilyMembers([
        { name: user.full_name, id: 'parent' },
        ...children.map(c => ({ name: c.name, id: c.id }))
      ]);
    } catch (error) {
      console.error('Error loading family members:', error);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title || !newTask.due_date) {
      showSuccessMessage(t('fillAllFields'));
      return;
    }

    try {
      const user = await base44.auth.me();
      await base44.entities.HouseholdTask.create({
        ...newTask,
        month_year: currentMonth,
        family_id: user.family_id,
        is_completed: false
      });

      setNewTask({
        title: '',
        description: '',
        assigned_to: '',
        due_date: '',
        category: 'other',
        priority: 'medium',
        recurrence_pattern: 'none'
      });
      
      setShowAddForm(false);
      await loadTasks();
      showSuccessMessage(t('householdTaskAdded'));
    } catch (error) {
      console.error('Error adding task:', error);
      showSuccessMessage(t('errorSavingTask'));
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      const response = await uploadHouseholdTasks({
        file_url: uploadResult.file_url,
        month_year: currentMonth
      });

      if (response.data.success) {
        setUploadedTasks(response.data.tasks);
        showSuccessMessage(t('excelAnalyzedSuccess', { count: response.data.count }));
      } else {
        showSuccessMessage(t('errorAnalyzingExcel'));
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      showSuccessMessage(t('errorUploadingFile'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmUploadedTasks = async () => {
    if (!uploadedTasks) return;

    try {
      await base44.entities.HouseholdTask.bulkCreate(uploadedTasks);
      setUploadedTasks(null);
      await loadTasks();
      showSuccessMessage(t('tasksImportedSuccess', { count: uploadedTasks.length }));
    } catch (error) {
      console.error('Error importing tasks:', error);
      showSuccessMessage(t('errorImportingTasks'));
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      await base44.entities.HouseholdTask.update(task.id, {
        is_completed: !task.is_completed,
        completed_date: !task.is_completed ? new Date().toISOString() : null
      });
      await loadTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm(t('confirmDelete', { item: t('householdTask') }))) {
      try {
        await base44.entities.HouseholdTask.delete(taskId);
        await loadTasks();
        showSuccessMessage(t('taskDeletedSuccess'));
      } catch (error) {
        console.error('Error deleting task:', error);
        showSuccessMessage(t('errorDeletingTask'));
      }
    }
  };

  // Group tasks by date
  const tasksByDate = tasks.reduce((acc, task) => {
    const date = task.due_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {});

  const monthDate = new Date(currentMonth + '-01');
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(monthDate),
    end: endOfMonth(monthDate)
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('householdTasksTitle')}</h2>
          <p className="text-gray-600">{t('householdTasksDesc')}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Input
            type="month"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="w-40"
          />
          <a 
            href={base44.agents.getWhatsAppConnectURL('household_planner')} 
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              {t('whatsappAgent')}
            </Button>
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{tasks.length}</div>
              <div className="text-sm text-gray-600">{t('totalTasks')}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{tasks.filter(t => t.is_completed).length}</div>
              <div className="text-sm text-gray-600">{t('completed')}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{tasks.filter(t => !t.is_completed).length}</div>
              <div className="text-sm text-gray-600">{t('pending')}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {tasks.filter(t => !t.is_completed && new Date(t.due_date) < new Date()).length}
              </div>
              <div className="text-sm text-gray-600">{t('overdue')}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar">
            <CalendarIcon className="w-4 h-4 mr-2" />
            {t('calendarView')}
          </TabsTrigger>
          <TabsTrigger value="manual">
            <Plus className="w-4 h-4 mr-2" />
            {t('addManually')}
          </TabsTrigger>
          <TabsTrigger value="upload">
            <Upload className="w-4 h-4 mr-2" />
            {t('uploadExcel')}
          </TabsTrigger>
        </TabsList>

        {/* Calendar View */}
        <TabsContent value="calendar" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {daysInMonth.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const dayTasks = tasksByDate[dateStr] || [];
                const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');
                
                return (
                  <Card key={dateStr} className={`${isToday ? 'border-2 border-purple-500' : ''}`}>
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm font-bold text-center">
                        <div>{format(day, 'd')}</div>
                        <div className="text-xs text-gray-500 font-normal">
                          {format(day, 'EEE')}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 space-y-1">
                      {dayTasks.map(task => (
                        <div
                          key={task.id}
                          className={`p-2 rounded text-xs border ${
                            task.is_completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <button
                              onClick={() => handleToggleComplete(task)}
                              className="flex-shrink-0"
                            >
                              {task.is_completed ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <div className="w-4 h-4 border-2 border-gray-300 rounded" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className={`font-medium ${task.is_completed ? 'line-through text-gray-500' : ''}`}>
                                {CATEGORY_CONFIG[task.category]?.icon} {task.title}
                              </div>
                              {task.assigned_to && (
                                <div className="text-[10px] text-gray-500 mt-0.5">{task.assigned_to}</div>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="flex-shrink-0 text-red-400 hover:text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Manual Add */}
        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>{t('addNewHouseholdTask')}</CardTitle>
              <CardDescription>{t('addHouseholdTaskDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t('taskName')}</Label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder={t('householdTaskPlaceholder')}
                />
              </div>

              <div>
                <Label>{t('taskDescription')}</Label>
                <Textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder={t('taskDescriptionPlaceholder')}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('assignedTo')}</Label>
                  <MobileSelect 
                    value={newTask.assigned_to} 
                    onValueChange={(value) => setNewTask({ ...newTask, assigned_to: value })}
                    placeholder={t('selectPerson')}
                  >
                    {familyMembers.map(member => (
                      <SelectItem key={member.id} value={member.name}>{member.name}</SelectItem>
                    ))}
                  </MobileSelect>
                </div>

                <div>
                  <Label>{t('dueDate')}</Label>
                  <Input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    min={`${currentMonth}-01`}
                    max={format(endOfMonth(new Date(currentMonth + '-01')), 'yyyy-MM-dd')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>{t('category')}</Label>
                  <MobileSelect value={newTask.category} onValueChange={(value) => setNewTask({ ...newTask, category: value })}>
                    <SelectItem value="cleaning">{t('categoryCleaning')}</SelectItem>
                    <SelectItem value="cooking">{t('categoryCooking')}</SelectItem>
                    <SelectItem value="laundry">{t('categoryLaundry')}</SelectItem>
                    <SelectItem value="shopping">{t('categoryShopping')}</SelectItem>
                    <SelectItem value="maintenance">{t('categoryMaintenance')}</SelectItem>
                    <SelectItem value="other">{t('categoryOther')}</SelectItem>
                  </MobileSelect>
                </div>

                <div>
                  <Label>{t('priority')}</Label>
                  <MobileSelect value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
                    <SelectItem value="low">{t('lowPriority')}</SelectItem>
                    <SelectItem value="medium">{t('mediumPriority')}</SelectItem>
                    <SelectItem value="high">{t('highPriority')}</SelectItem>
                  </MobileSelect>
                </div>

                <div>
                  <Label>{t('recurrence')}</Label>
                  <MobileSelect value={newTask.recurrence_pattern} onValueChange={(value) => setNewTask({ ...newTask, recurrence_pattern: value })}>
                    <SelectItem value="none">{t('oneTime')}</SelectItem>
                    <SelectItem value="weekly">{t('weekly')}</SelectItem>
                    <SelectItem value="biweekly">{t('biweekly')}</SelectItem>
                    <SelectItem value="monthly">{t('monthly')}</SelectItem>
                  </MobileSelect>
                </div>
              </div>

              <Button onClick={handleAddTask} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                {t('add')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upload Excel */}
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                {t('uploadExcelFile')}
              </CardTitle>
              <CardDescription>{t('uploadExcelFileDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id="excel-upload"
              />
              <label
                htmlFor="excel-upload"
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer block"
              >
                {isUploading ? (
                  <div className="space-y-4">
                    <Loader2 className="w-12 h-12 mx-auto text-purple-500 animate-spin" />
                    <p className="text-lg font-medium text-gray-700">{t('analyzing')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 mx-auto text-gray-400" />
                    <div>
                      <p className="text-lg font-medium text-gray-700">{t('dragAndDrop')}</p>
                      <p className="text-sm text-gray-500">{t('orClickToSelect')}</p>
                    </div>
                  </div>
                )}
              </label>

              {/* Preview uploaded tasks */}
              {uploadedTasks && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="font-medium text-green-800">
                      {t('foundTasks', { count: uploadedTasks.length })}
                    </p>
                  </div>

                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {uploadedTasks.map((task, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded border">
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-gray-600 flex items-center gap-3 mt-1">
                          <span>📅 {format(new Date(task.due_date), 'dd/MM')}</span>
                          {task.assigned_to && <span>👤 {task.assigned_to}</span>}
                          <Badge className={CATEGORY_CONFIG[task.category]?.color}>
                            {CATEGORY_CONFIG[task.category]?.icon} {t(`category${task.category.charAt(0).toUpperCase() + task.category.slice(1)}`)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={() => setUploadedTasks(null)} variant="outline" className="flex-1">
                      {t('cancel')}
                    </Button>
                    <Button onClick={handleConfirmUploadedTasks} className="flex-1">
                      <Check className="w-4 h-4 mr-2" />
                      {t('confirmAndImport')}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}