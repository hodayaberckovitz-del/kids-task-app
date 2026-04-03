import React, { useState, useEffect, useCallback } from "react";
import { Task } from "@/entities/Task";
import { TaskCompletion } from "@/entities/TaskCompletion";
import { HomeworkTask } from "@/entities/HomeworkTask";
import { Subject } from "@/entities/Subject";
import { ChildProfile } from "@/entities/ChildProfile";
import { User } from "@/entities/User";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Star, Sun, Moon, Clock, Plus, Filter, CheckCircle, Circle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useLanguage } from "@/components/LanguageContext";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import TaskCard from "../components/TaskCard";
import HomeworkCard from "../components/HomeworkCard";
import StarTaskCard from "../components/StarTaskCard";
import TimerTaskCard from "../components/TimerTaskCard";
import TaskInputModal from "../components/TaskInputModal";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [homeworkTasks, setHomeworkTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [completedToday, setCompletedToday] = useState([]);
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [taskForInput, setTaskForInput] = useState(null);
  const { t, isRTL } = useLanguage();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const childrenData = await ChildProfile.filter({ created_by: currentUser.email });
      if (childrenData.length === 0) {
        setIsLoading(false);
        return;
      }

      const selectedChildId = localStorage.getItem('selectedChildId');
      const currentProfile = childrenData.find(c => c.id === selectedChildId) || childrenData[0];
      setProfile(currentProfile);

      const today = format(new Date(), 'yyyy-MM-dd');
      
      const [tasksData, homeworkData, subjectsData, completionsData] = await Promise.all([
        Task.filter({ is_active: true, created_by: currentUser.email, child_profile_id: currentProfile.id }, 'order'),
        HomeworkTask.filter({ created_by: currentUser.email, child_profile_id: currentProfile.id }, '-created_date'),
        Subject.filter({ created_by: currentUser.email, child_profile_id: currentProfile.id }),
        TaskCompletion.filter({ completed_date: today, child_profile_id: currentProfile.id })
      ]);
      
      const profileLanguage = currentProfile.language || 'he';
      setTasks(tasksData.filter(task => !task.language || task.language === profileLanguage));
      setHomeworkTasks(homeworkData);
      setSubjects(subjectsData);
      setCompletedToday(completionsData);

    } catch (error) {
      console.error("Error loading tasks data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTaskComplete = async (task, inputValue = null) => {
    if (!profile) return;
    try {
      const today = new Date();
      const completion = await TaskCompletion.create({
        task_id: task.id,
        child_profile_id: profile.id,
        completed_date: format(today, 'yyyy-MM-dd'),
        completed_at: today.toISOString(),
        input_value: inputValue,
        tokens_earned: task.base_tokens || task.star_tokens || task.timed_tokens || 1
      });
      
      setCompletedToday(prev => [...prev, completion]);

      // Update profile tokens
      const newTokens = (profile.total_tokens || 0) + (task.base_tokens || task.star_tokens || task.timed_tokens || 1);
      const updatedProfile = await ChildProfile.update(profile.id, { total_tokens: newTokens });
      setProfile(updatedProfile);

      // For one-time tasks, deactivate them
      if (task.type === 'one-time') {
        setTasks(prev => prev.filter(t => t.id !== task.id));
      }

    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const handleHomeworkComplete = async (homework) => {
    if (!profile) return;
    try {
      await HomeworkTask.update(homework.id, { is_completed: true });
      setHomeworkTasks(prev => prev.map(hw => hw.id === homework.id ? {...hw, is_completed: true} : hw));
      
      // Award tokens for homework
      const tokensEarned = 8;
      const newTokens = (profile.total_tokens || 0) + tokensEarned;
      const updatedProfile = await ChildProfile.update(profile.id, { total_tokens: newTokens });
      setProfile(updatedProfile);
    } catch (error) {
      console.error("Error completing homework:", error);
    }
  };

  // Filter tasks based on selected filter
  const getFilteredTasks = () => {
    if (filterType === "all") return tasks;
    if (filterType === "homework") return homeworkTasks;
    return tasks.filter(task => task.task_type === filterType || task.input_type === filterType);
  };

  const isTaskCompleted = (taskId) => {
    return completedToday.some(completion => completion.task_id === taskId);
  };

  const getTaskStats = () => {
    const totalTasks = tasks.length + homeworkTasks.filter(hw => !hw.is_completed).length;
    const completedTasks = completedToday.length + homeworkTasks.filter(hw => hw.is_completed).length;
    return { total: totalTasks, completed: completedTasks };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('noChildProfile')}</h2>
        <Link to={createPageUrl("Dashboard")}>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            {t('goToDashboard')}
          </Button>
        </Link>
      </div>
    );
  }

  const stats = getTaskStats();
  const filteredTasks = getFilteredTasks();

  return (
    <div className="max-w-6xl mx-auto p-4 pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {taskForInput && (
        <TaskInputModal
          task={taskForInput}
          isOpen={!!taskForInput}
          onClose={() => setTaskForInput(null)}
          onComplete={handleTaskComplete}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('allTasks')}</h1>
          <p className="text-gray-600">
            {t('completedTasksStats', { completed: stats.completed, total: stats.total })}
          </p>
        </div>
        <Link to={createPageUrl("Dashboard")}>
          <Button variant="outline">
            <Sun className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('backToDashboard')}
          </Button>
        </Link>
      </div>

      {/* Progress Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{t('todayProgress')}</span>
            <span className="text-sm text-gray-500">{stats.completed}/{stats.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-gradient-to-r from-green-400 to-blue-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            {t('filterTasks')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allTasks')}</SelectItem>
              <SelectItem value="morning">{t('morningTasks')}</SelectItem>
              <SelectItem value="evening">{t('eveningTasks')}</SelectItem>
              <SelectItem value="star">{t('starTasks')}</SelectItem>
              <SelectItem value="timer">{t('timedTasks')}</SelectItem>
              <SelectItem value="backpack_checklist">{t('backpackTasks')}</SelectItem>
              <SelectItem value="homework">{t('homeworkTasks')}</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Tasks Grid */}
      <AnimatePresence>
        {filterType === "homework" ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {homeworkTasks.map(homework => {
              const subject = subjects.find(s => s.id === homework.subject_id);
              return (
                <HomeworkCard
                  key={homework.id}
                  homework={homework}
                  subject={subject}
                  onComplete={handleHomeworkComplete}
                />
              );
            })}
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {filteredTasks.map(task => {
              const isCompleted = isTaskCompleted(task.id);
              
              if (task.task_type === 'star') {
                return (
                  <StarTaskCard
                    key={task.id}
                    task={task}
                    isCompleted={isCompleted}
                    onComplete={task.input_type === 'text' ? () => setTaskForInput(task) : handleTaskComplete}
                  />
                );
              } else if (task.input_type === 'timer') {
                return (
                  <TimerTaskCard
                    key={task.id}
                    task={task}
                    isCompleted={isCompleted}
                    onComplete={handleTaskComplete}
                    setTaskForInput={setTaskForInput}
                  />
                );
              } else {
                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isCompleted={isCompleted}
                    onComplete={task.input_type === 'text' ? () => setTaskForInput(task) : handleTaskComplete}
                  />
                );
              }
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {filteredTasks.length === 0 && filterType !== "homework" && (
        <div className="text-center py-12">
          <Circle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-bold text-gray-600 mb-2">{t('noTasksInCategory')}</h3>
          <p className="text-gray-500">{t('tryDifferentFilter')}</p>
        </div>
      )}

      {filterType === "homework" && homeworkTasks.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-bold text-gray-600 mb-2">{t('noHomeworkTasks')}</h3>
          <p className="text-gray-500">{t('noHomeworkAvailable')}</p>
        </div>
      )}
    </div>
  );
}