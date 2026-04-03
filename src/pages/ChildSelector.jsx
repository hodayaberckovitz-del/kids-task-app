import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, User as UserIcon, Star, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useLanguage } from "@/components/LanguageContext";

export default function ChildSelector() {
  const { t, isRTL } = useLanguage();
  const [children, setChildren] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newChild, setNewChild] = useState({ name: "", age: "" });
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      console.log('ChildSelector - User family_id:', currentUser.family_id);
      
      if (!currentUser.family_id) {
        console.error("User has no family_id");
        setChildren([]);
        setShowAddForm(true);
        return;
      }
      
      const childrenData = await base44.entities.ChildProfile.filter({ 
        family_id: currentUser.family_id 
      });
      
      console.log('ChildSelector - Found children:', { 
        familyId: currentUser.family_id, 
        childCount: childrenData.length,
        children: childrenData.map(c => ({ id: c.id, name: c.name, family_id: c.family_id }))
      });
      
      // בדיקה נוספת - נטען את כל הילדים כדי לראות מה יש במערכת
      const allChildren = await base44.entities.ChildProfile.list();
      console.log('ChildSelector - ALL children in system:', {
        total: allChildren.length,
        children: allChildren.map(c => ({ 
          id: c.id, 
          name: c.name, 
          family_id: c.family_id,
          created_by: c.created_by 
        }))
      });
      
      setChildren(childrenData);
      
      if (childrenData.length === 0) {
        setShowAddForm(true);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      navigate(createPageUrl("Registration"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddChild = async () => {
    if (!newChild.name.trim() || !newChild.age) return;

    try {
      let familyId = user.family_id;
      
      if (!familyId) {
        const families = await base44.entities.Family.filter({ 
          primary_parent_email: user.email 
        });
        
        if (families.length > 0) {
          familyId = families[0].id;
        } else {
          const familyCode = Math.random().toString(36).substring(2, 8).toUpperCase();
          const newFamily = await base44.entities.Family.create({
            family_name: `${user.full_name || user.email.split('@')[0]}'s Family`,
            family_code: familyCode,
            primary_parent_email: user.email
          });
          familyId = newFamily.id;
        }
        
        await base44.auth.updateMe({ family_id: familyId });
      }

      await base44.entities.ChildProfile.create({
        name: newChild.name,
        age: parseInt(newChild.age),
        parent_name: user.full_name || "",
        parent_email: user.email,
        family_id: familyId,
        total_tokens: 0,
        current_streak: 0,
        best_streak: 0
      });
      
      setNewChild({ name: "", age: "" });
      setShowAddForm(false);
      await loadData();
    } catch (error) {
      console.error("Error adding child:", error);
      alert(t('errorSavingChild'));
    }
  };

  const handleSelectChild = (childId) => {
    // שמירה של הילד שנבחר בלוקל סטורג'
    localStorage.setItem('selectedChildId', childId);
    navigate(createPageUrl("Dashboard"));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full mb-4">
            <Star className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{t('selectChild')}</h1>
          <p className="text-gray-600 text-lg">{isRTL ? 'איזה כוכב רוצה לעבוד על המשימות שלו היום?' : 'Which star wants to work on their tasks today?'}</p>
        </motion.div>

        {/* Children Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {children.map((child, index) => (
            <motion.div
              key={child.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-300"
                onClick={() => handleSelectChild(child.id)}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserIcon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{child.name}</h3>
                  <p className="text-gray-600 mb-3">{t('age')} {child.age}</p>
                  
                  <div className="bg-orange-50 rounded-lg p-3 mb-4">
                    <div className="text-2xl font-bold text-orange-600">{child.total_tokens || 0}</div>
                    <div className="text-sm text-orange-600">{t('tokens')}</div>
                  </div>
                  
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    {t('getStarted')}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Add Child Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: children.length * 0.1 }}
          >
            <Card 
              className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-dashed border-gray-300 hover:border-purple-300"
              onClick={() => setShowAddForm(true)}
            >
              <CardContent className="p-6 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-600 mb-2">{t('addNewChild')}</h3>
                <p className="text-gray-500">{t('createProfile')}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Add Child Modal */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('addNewChild')}</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="child-name">{t('childName')}</Label>
                  <Input
                    id="child-name"
                    value={newChild.name}
                    onChange={(e) => setNewChild({...newChild, name: e.target.value})}
                    placeholder={t('enterChildName')}
                  />
                </div>

                <div>
                  <Label htmlFor="child-age">{t('age')}</Label>
                  <Input
                    id="child-age"
                    type="number"
                    value={newChild.age}
                    onChange={(e) => setNewChild({...newChild, age: e.target.value})}
                    placeholder={t('enterAge')}
                    min="3"
                    max="18"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setShowAddForm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    onClick={handleAddChild}
                    disabled={!newChild.name.trim() || !newChild.age}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {t('addNewChild')}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}