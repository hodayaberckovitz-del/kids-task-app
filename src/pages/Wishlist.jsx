import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Plus, Trash2, Star, Loader2, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/LanguageContext";

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [newWish, setNewWish] = useState({
    title: "",
    description: "",
    priority: 3,
    image_url: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    loadData();
  }, [retryCount]);

  const loadData = async () => {
    setIsLoading(true);
    setConnectionError(false);
    try {
      const currentUser = await base44.auth.me();
      const selectedChildId = localStorage.getItem('selectedChildId');
      
      if (!selectedChildId) {
        const childrenData = await base44.entities.ChildProfile.filter({ family_id: currentUser.family_id });
        if (childrenData.length > 0) {
          const firstChild = childrenData[0];
          localStorage.setItem('selectedChildId', firstChild.id);
          setProfile(firstChild);
          
          const wishes = await base44.entities.WishlistItem.filter({ 
            child_profile_id: firstChild.id,
            family_id: currentUser.family_id 
          }, '-created_date');
          setWishlistItems(wishes);
        } else {
          setProfile(null);
          setWishlistItems([]);
        }
      } else {
        const childrenData = await base44.entities.ChildProfile.filter({ 
          family_id: currentUser.family_id 
        });
        const childProfile = childrenData.find(c => c.id === selectedChildId);

        if (childProfile) {
          setProfile(childProfile);
          const wishes = await base44.entities.WishlistItem.filter({ 
            child_profile_id: childProfile.id,
            family_id: currentUser.family_id 
          }, '-created_date');
          setWishlistItems(wishes);
        } else {
          localStorage.removeItem('selectedChildId');
          setProfile(null);
          setWishlistItems([]);
        }
      }
    } catch (error) {
      console.error("Error loading wishlist:", error);
      setConnectionError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWish = async (e) => {
    e.preventDefault();
    if (!profile || !newWish.title.trim()) return;

    setIsSubmitting(true);
    try {
      await base44.entities.WishlistItem.create({
        ...newWish,
        child_profile_id: profile.id,
        family_id: profile.family_id,
        status: 'requested'
      });

      setNewWish({ title: "", description: "", priority: 3, image_url: "" });
      setShowForm(false);
      await loadData();
    } catch (error) {
      console.error(t('errorAddingWish'), error);
      alert(t('errorAddingWish'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWish = async (wishId) => {
    try {
      await base44.entities.WishlistItem.delete(wishId);
      await loadData();
    } catch (error) {
      console.error(t('errorDeletingWish'), error);
      alert(t('errorDeletingWish'));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setNewWish({ ...newWish, image_url: file_url });
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(t('errorUploadingImage'));
    }
  };

  const getPriorityStars = (priority) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < priority ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ));
  };

  if (connectionError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <WifiOff className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('connectionError')}</h2>
          <p className="text-gray-600 mb-6">{t('connectionErrorDesc')}</p>
          <Button onClick={() => setRetryCount(prev => prev + 1)} className="w-full">
            {t('retry')}
          </Button>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Heart className="w-12 h-12 text-pink-500 fill-current" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-800">{t('myWishlist')}</h1>
        </div>
        <p className="text-gray-600 text-lg">{t('myWishlistDesc')}</p>
      </motion.div>

      {/* Add Wish Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <Button
          onClick={() => setShowForm(!showForm)}
          className="w-full sm:w-auto mx-auto flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-lg py-6 px-8 rounded-2xl shadow-lg"
        >
          <Plus className="w-6 h-6" />
          {t('addNewWish')}
        </Button>
      </motion.div>

      {/* Add Wish Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{t('whatDoYouWish')}</h3>
                <form onSubmit={handleAddWish} className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-lg font-semibold">
                      {t('wishName')}
                    </Label>
                    <Input
                      id="title"
                      value={newWish.title}
                      onChange={(e) => setNewWish({ ...newWish, title: e.target.value })}
                      placeholder={t('enterWishName')}
                      className="mt-2 h-12 text-lg"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-lg font-semibold">
                      {t('wishDescription')}
                    </Label>
                    <Textarea
                      id="description"
                      value={newWish.description}
                      onChange={(e) => setNewWish({ ...newWish, description: e.target.value })}
                      placeholder={t('describeYourWish')}
                      className="mt-2 min-h-24 text-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="image" className="text-lg font-semibold">
                      {t('uploadWishImage')}
                    </Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="mt-2"
                    />
                    {newWish.image_url && (
                      <img src={newWish.image_url} alt="Preview" className="mt-2 h-32 rounded-lg object-cover" />
                    )}
                  </div>

                  <div>
                    <Label className="text-lg font-semibold mb-2 block">
                      {t('howMuchDoYouWant')}
                    </Label>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { value: 1, label: t('lowPriority') },
                        { value: 2, label: t('mediumPriority') },
                        { value: 3, label: t('highPriority') },
                        { value: 4, label: t('veryHighPriority') },
                        { value: 5, label: t('urgent') }
                      ].map(({ value, label }) => (
                        <Button
                          key={value}
                          type="button"
                          onClick={() => setNewWish({ ...newWish, priority: value })}
                          variant={newWish.priority === value ? "default" : "outline"}
                          className="flex items-center gap-1"
                        >
                          {[...Array(value)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                          <span className="ml-1">{label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      className="flex-1"
                    >
                      {t('cancel')}
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !newWish.title.trim()}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600"
                    >
                      {isSubmitting ? t('saving') : t('addToWishlist')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wishlist Items */}
      {wishlistItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {item.image_url && (
                  <div className="h-48 overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-800">{item.title}</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteWish(item.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>

                  {item.description && (
                    <p className="text-gray-600 mb-4">{item.description}</p>
                  )}

                  <div className="flex items-center gap-1 mb-3">
                    {getPriorityStars(item.priority || 3)}
                  </div>

                  <Badge variant="secondary" className="capitalize">
                    {item.status === 'requested' && t('statusRequested')}
                    {item.status === 'reviewing' && t('statusReviewing')}
                    {item.status === 'approved' && t('statusApproved')}
                    {item.status === 'fulfilled' && t('statusFulfilled')}
                    {item.status === 'rejected' && t('statusRejected')}
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="text-6xl mb-4">💭</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">{t('noWishesYet')}</h3>
          <p className="text-gray-600 text-lg">{t('noWishesYetDesc')}</p>
        </motion.div>
      )}
    </div>
  );
}