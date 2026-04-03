import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  BookOpen,
  Users,
  Baby,
  CheckCircle,
  Star,
  Clock,
  Trophy,
  Zap,
  Target,
  Heart,
  Lightbulb,
  Gift,
  Calendar,
  Home,
  Mail,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  Settings,
  Share2,
  Sparkles,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/components/LanguageContext';

export default function Guide() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 pb-8 dark:bg-gray-900 dark:text-white" dir={isRTL ? 'rtl' : 'ltr'} style={{ userSelect: 'none' }}>
      {/* Mobile Back Button */}
      <div className="md:hidden mb-4">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Dashboard"))}
          className="gap-2 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('backToDashboard')}
        </Button>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <BookOpen className="w-12 h-12 text-purple-600" />
          <h1 className="text-5xl font-bold text-gray-800">{t('userGuide')}</h1>
        </div>
        <p className="text-xl text-gray-600">{t('userGuideDesc')}</p>
      </motion.div>

      {/* Tabs for Parents and Children */}
      <Tabs defaultValue="parents" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="parents" className="text-lg py-3">
            <Users className="w-5 h-5 mr-2" />
            {t('forParents')}
          </TabsTrigger>
          <TabsTrigger value="children" className="text-lg py-3">
            <Baby className="w-5 h-5 mr-2" />
            {t('forChildren')}
          </TabsTrigger>
        </TabsList>

        {/* Parents Guide */}
        <TabsContent value="parents">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Getting Started */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <Target className="w-8 h-8 text-green-600" />
                    {t('gettingStarted')}
                  </CardTitle>
                  <CardDescription className="text-lg">{t('gettingStartedDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      step: 1,
                      title: t('createChildProfile'),
                      desc: t('createChildProfileDesc'),
                      icon: Users,
                      link: createPageUrl("ParentPanel"),
                      linkText: t('createProfile')
                    },
                    {
                      step: 2,
                      title: t('setupTasks'),
                      desc: t('setupTasksDesc'),
                      icon: CheckCircle,
                      link: createPageUrl("ParentPanel"),
                      linkText: t('manageTasks')
                    },
                    {
                      step: 3,
                      title: t('addRewardsGoals'),
                      desc: t('addRewardsGoalsDesc'),
                      icon: Gift,
                      link: createPageUrl("ParentPanel"),
                      linkText: t('setupRewards')
                    },
                    {
                      step: 4,
                      title: t('manageSchedule'),
                      desc: t('manageScheduleDesc'),
                      icon: Calendar,
                      link: createPageUrl("ParentPanel"),
                      linkText: t('schedule')
                    }
                  ].map(({ step, title, desc, icon: Icon, link, linkText }) => (
                    <motion.div 
                      key={step}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all"
                    >
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <Icon className="w-6 h-6 text-purple-600" />
                          </div>
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-bold text-lg mb-1">
                            {t('step')} {step}: {title}
                          </h4>
                          <p className="text-gray-600 mb-3">{desc}</p>
                          <Link to={link}>
                            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                              <ArrowRight className="w-4 h-4 mr-2" />
                              {linkText}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* New Features Section */}
            <motion.div variants={itemVariants}>
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <Sparkles className="w-8 h-8 text-blue-600" />
                    {t('specialFeatures')}
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {t('specialFeaturesDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Family Sharing */}
                    <motion.div whileHover={{ scale: 1.03 }} className="p-4 bg-white rounded-xl border-2 border-blue-200">
                      <div className="flex items-start gap-3">
                        <Share2 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-bold mb-1">
                            {t('familySharing')}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {t('familySharingDesc')}
                          </p>
                          <Link to={createPageUrl('JoinFamily')}>
                            <Button size="sm" variant="outline" className="text-xs">
                              <Share2 className="w-3 h-3 mr-1" />
                              {t('open')}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>

                    {/* AI Image Generation */}
                    <motion.div whileHover={{ scale: 1.03 }} className="p-4 bg-white rounded-xl border-2 border-purple-200">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-bold mb-1">
                            {t('aiImageGeneration')}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {t('aiImageGenerationDesc')}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Multi-Language */}
                    <motion.div whileHover={{ scale: 1.03 }} className="p-4 bg-white rounded-xl border-2 border-green-200">
                      <div className="flex items-start gap-3">
                        <Globe className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-bold mb-1">
                            {t('multiLanguage')}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {t('multiLanguageDesc')}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Ideas Library */}
                    <motion.div whileHover={{ scale: 1.03 }} className="p-4 bg-white rounded-xl border-2 border-orange-200">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-bold mb-1">
                            {t('ideasLibrary')}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {t('ideasLibraryDesc')}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Teacher Panel */}
                    <motion.div whileHover={{ scale: 1.03 }} className="p-4 bg-white rounded-xl border-2 border-indigo-200">
                      <div className="flex items-start gap-3">
                        <BookOpen className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-bold mb-1">
                           🎓 {isRTL ? 'פאנל מורים' : 'Teacher Panel'}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                           {isRTL ? 'מורים יכולים לשלוח שיעורי בית ישירות לתלמידים' : 'Teachers can send homework directly to students'}
                          </p>
                          <Link to="/TeacherPanel">
                            <Button size="sm" variant="outline" className="text-xs border-indigo-400 text-indigo-700">
                              <BookOpen className="w-3 h-3 mr-1" />
                              {t('open')}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Task Types - Expandable */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <Star className="w-8 h-8 text-yellow-600" />
                    {t('taskTypes')}
                  </CardTitle>
                  <CardDescription className="text-lg">{t('taskTypesDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      id: 'regular',
                      icon: CheckCircle,
                      title: t('regularTasks'),
                      desc: t('regularTasksDesc'),
                      color: 'blue',
                      details: t('regularTasksDetails')
                    },
                    {
                      id: 'star',
                      icon: Star,
                      title: t('starTasks'),
                      desc: t('starTasksDesc'),
                      color: 'yellow',
                      details: t('starTasksDetails')
                    },
                    {
                      id: 'timed',
                      icon: Clock,
                      title: t('timedTasks'),
                      desc: t('timedTasksDesc'),
                      color: 'purple',
                      details: t('timedTasksDetails')
                    },
                    {
                      id: 'homework',
                      icon: BookOpen,
                      title: t('homeworkTasks'),
                      desc: t('homeworkTasksDesc'),
                      color: 'green',
                      details: t('homeworkTasksDetails')
                    }
                  ].map(({ id, icon: Icon, title, desc, color, details }) => (
                    <motion.div key={id} whileHover={{ scale: 1.01 }}>
                      <div 
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          expandedSection === id ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleSection(id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex gap-3 items-start flex-1">
                            <Icon className={`w-6 h-6 text-${color}-600 flex-shrink-0 mt-1`} />
                            <div className="flex-1">
                              <h4 className="font-bold mb-1">{title}</h4>
                              <p className="text-sm text-gray-600">{desc}</p>
                              {expandedSection === id && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-3 p-3 bg-white rounded-lg text-sm"
                                >
                                  {details}
                                </motion.div>
                              )}
                            </div>
                          </div>
                          {expandedSection === id ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  <div className="pt-2">
                    <Link to={createPageUrl("ParentPanel")}>
                      <Button className="w-full" variant="outline">
                        <Settings className="w-4 h-4 mr-2" />
                        {t('manageTasks')}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Token System */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <Trophy className="w-8 h-8 text-orange-600" />
                    {t('tokenSystem')}
                  </CardTitle>
                  <CardDescription className="text-lg">{t('tokenSystemDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      id: 'earn',
                      icon: Zap,
                      title: t('earnTokens'),
                      desc: t('earnTokensDesc'),
                      details: t('earnTokensDetails')
                    },
                    {
                      id: 'spend',
                      icon: Gift,
                      title: t('spendTokens'),
                      desc: t('spendTokensDesc'),
                      details: t('spendTokensDetails')
                    },
                    {
                      id: 'streak',
                      icon: Trophy,
                      title: t('streakBonus'),
                      desc: t('streakBonusDesc'),
                      details: t('streakBonusDetails')
                    }
                  ].map(({ id, icon: Icon, title, desc, details }) => (
                    <motion.div key={id} whileHover={{ scale: 1.01 }}>
                      <div 
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          expandedSection === id ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleSection(id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex gap-3 items-start flex-1">
                            <Icon className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                            <div className="flex-1">
                              <h4 className="font-bold mb-1">{title}</h4>
                              <p className="text-sm text-gray-600">{desc}</p>
                              {expandedSection === id && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-3 p-3 bg-white rounded-lg text-sm"
                                >
                                  {details}
                                </motion.div>
                              )}
                            </div>
                          </div>
                          {expandedSection === id ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Tips for Success */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <Lightbulb className="w-8 h-8 text-yellow-600" />
                    {t('tipsForSuccess')}
                  </CardTitle>
                  <CardDescription className="text-lg">{t('tipsForSuccessDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  {[
                    {
                      icon: Target,
                      title: t('startSmall'),
                      desc: t('startSmallDesc')
                    },
                    {
                      icon: Calendar,
                      title: t('beConsistent'),
                      desc: t('beConsistentDesc')
                    },
                    {
                      icon: Trophy,
                      title: t('celebrateSuccess'),
                      desc: t('celebrateSuccessDesc')
                    },
                    {
                      icon: Heart,
                      title: t('involveChild'),
                      desc: t('involveChildDesc')
                    }
                  ].map(({ icon: Icon, title, desc }, index) => (
                    <motion.div 
                      key={index}
                      whileHover={{ scale: 1.05, rotate: 1 }}
                      className="p-4 border-l-4 border-purple-500 bg-purple-50 rounded-lg cursor-pointer"
                    >
                      <div className="flex gap-3">
                        <Icon className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-bold mb-1">{title}</h4>
                          <p className="text-sm text-gray-600">{desc}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>

        {/* Children Guide */}
        <TabsContent value="children">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-3xl">
                    <Baby className="w-10 h-10 text-purple-600" />
                    {t('forChildrenGuide')}
                  </CardTitle>
                  <CardDescription className="text-lg">{t('forChildrenGuideDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    {
                      number: '1',
                      icon: CheckCircle,
                      title: t('completeTasksGuide'),
                      desc: t('completeTasksGuideDesc'),
                      emoji: '✅',
                      link: createPageUrl('Dashboard'),
                      linkText: t('home')
                    },
                    {
                      number: '2',
                      icon: Trophy,
                      title: t('collectTokensGuide'),
                      desc: t('collectTokensGuideDesc'),
                      emoji: '🪙',
                      link: createPageUrl('Dashboard'),
                      linkText: t('home')
                    },
                    {
                      number: '3',
                      icon: Gift,
                      title: t('chooseRewardsGuide'),
                      desc: t('chooseRewardsGuideDesc'),
                      emoji: '🎁',
                      link: createPageUrl('Rewards'),
                      linkText: t('rewards')
                    }
                  ].map(({ number, icon: Icon, title, desc, emoji, link, linkText }) => (
                    <motion.div 
                      key={number}
                      whileHover={{ scale: 1.02 }}
                      className="p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all"
                    >
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center text-3xl font-bold">
                            {emoji}
                          </div>
                        </div>
                        <div className="flex-grow">
                          <h4 className="text-2xl font-bold mb-2">{title}</h4>
                          <p className="text-lg text-gray-600 mb-4">{desc}</p>
                          <Link to={link}>
                            <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                              <ArrowRight className="w-4 h-4 mr-2" />
                              {linkText}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center"
      >
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
          <CardContent className="p-6 md:p-8">
            <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">{t('haveQuestions')}</h3>
            <p className="text-base md:text-lg mb-6">{t('contactSupport')}</p>
            
            <div className="flex flex-col gap-3 md:gap-4 max-w-md mx-auto">
              <Button
                size="lg"
                onClick={() => window.open('mailto:hodaya.berckovitz@gmail.com?subject=Task Star Support', '_blank')}
                className="bg-white text-purple-600 hover:bg-gray-100 font-bold text-base md:text-lg w-full py-6 rounded-2xl shadow-lg"
              >
                <Mail className="w-5 h-5 mr-2" />
                {t('sendSupportEmail')}
              </Button>
              
              <Link to={createPageUrl('Dashboard')}>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 border-2 border-white text-white hover:bg-white/20 font-bold text-base md:text-lg w-full py-6 rounded-2xl"
                >
                  <Home className="w-5 h-5 mr-2" />
                  {t('home')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}