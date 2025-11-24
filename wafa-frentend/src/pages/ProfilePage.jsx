import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  User, Mail, Phone, MapPin, Calendar, GraduationCap, 
  BookOpen, Trophy, Medal, Star, Clock, Edit, Save, X, Camera, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PageHeader, StatCard } from '@/components/shared';
import { toast } from 'sonner';
import { userService } from '@/services/userService';

const ProfilePage = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    university: '',
    faculty: '',
    year: '',
    specialization: '',
    location: '',
    bio: ''
  });

  const [editData, setEditData] = useState({ ...profileData });

  // Fetch user profile and stats on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch profile and stats in parallel
        const [userData, statsData] = await Promise.all([
          userService.getUserProfile(),
          userService.getMyStats()
        ]);
        
        setUser(userData);
        setUserStats(statsData);
        
        // Map backend user data to profile form
        const mappedData = {
          firstName: userData.name?.split(' ')[0] || '',
          lastName: userData.name?.split(' ').slice(1).join(' ') || '',
          email: userData.email || '',
          phone: userData.phone || '',
          birthDate: userData.birthDate || '',
          university: userData.university || '',
          faculty: userData.faculty || '',
          year: userData.year || '',
          specialization: userData.specialization || '',
          location: userData.location || '',
          bio: userData.bio || ''
        };
        
        setProfileData(mappedData);
        setEditData(mappedData);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast.error(t('dashboard:failed_to_load_profile'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Map achievement types to icons
  const getAchievementIcon = (achievementId) => {
    const iconMap = {
      'top_performer': <Trophy className="h-6 w-6 text-white" />,
      'expert': <Medal className="h-6 w-6 text-white" />,
      'perfect_streak': <Star className="h-6 w-6 text-white" />,
      'studious': <BookOpen className="h-6 w-6 text-white" />,
    };
    return iconMap[achievementId] || <Trophy className="h-6 w-6 text-white" />;
  };

  // Get achievements from user stats or show empty state
  const achievements = userStats?.achievements?.length > 0 
    ? userStats.achievements.map(ach => ({
        icon: getAchievementIcon(ach.achievementId),
        title: ach.achievementName,
        description: ach.description || 'Débloquer',
        variant: 'default'
      }))
    : [];

  // Calculate stats from user data
  const stats = [
    { 
      label: t('dashboard:exams_taken'), 
      value: userStats?.examsCompleted || 0, 
      icon: <BookOpen className="h-4 w-4" /> 
    },
    { 
      label: t('dashboard:overall_average'), 
      value: userStats?.averageScore ? `${userStats.averageScore.toFixed(1)}/20` : '0/20', 
      icon: <Star className="h-4 w-4" /> 
    },
    { 
      label: t('dashboard:study_hours'), 
      value: userStats?.studyHours ? `${userStats.studyHours}h` : '0h', 
      icon: <Clock className="h-4 w-4" /> 
    },
    { 
      label: t('dashboard:ranking'), 
      value: userStats?.rank || 'N/A', 
      icon: <Trophy className="h-4 w-4" /> 
    }
  ];

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Combine firstName and lastName back into name field for backend
      const updateData = {
        name: `${editData.firstName} ${editData.lastName}`.trim(),
        phone: editData.phone,
        birthDate: editData.birthDate,
        university: editData.university,
        faculty: editData.faculty,
        year: editData.year,
        specialization: editData.specialization,
        location: editData.location,
        bio: editData.bio
      };
      
      const updatedUser = await userService.updateUserProfile(updateData);
      setUser(updatedUser);
      setProfileData({ ...editData });
      setIsEditing(false);
      toast.success(t('dashboard:profile_updated_success'));
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(t('dashboard:failed_to_update_profile'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({ ...profileData });
    setIsEditing(false);
  };

  const getInitials = () => {
    if (!profileData.firstName || !profileData.lastName) return 'U';
    return `${profileData.firstName[0]}${profileData.lastName[0]}`.toUpperCase();
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">{t('dashboard:loading_profile')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          title={t('dashboard:my_profile')}
          description={t('dashboard:manage_info_track_achievements')}
        />

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('dashboard:personal_information')}</CardTitle>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
                      <Edit className="h-4 w-4" />
                      {t('common:edit')}
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={handleSave} className="gap-2">
                        <Save className="h-4 w-4" />
                        {t('common:save')}
                      </Button>
                      <Button onClick={handleCancel} variant="outline" className="gap-2">
                        <X className="h-4 w-4" />
                        {t('common:cancel')}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="personal">{t('dashboard:personal')}</TabsTrigger>
                    <TabsTrigger value="academic">{t('dashboard:academic')}</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="personal" className="space-y-4 mt-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">{t('dashboard:first_name')}</Label>
                        <Input
                          id="firstName"
                          value={isEditing ? editData.firstName : profileData.firstName}
                          onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">{t('dashboard:last_name')}</Label>
                        <Input
                          id="lastName"
                          value={isEditing ? editData.lastName : profileData.lastName}
                          onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">{t('common:email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={isEditing ? editData.email : profileData.email}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">{t('dashboard:phone')}</Label>
                        <Input
                          id="phone"
                          value={isEditing ? editData.phone : profileData.phone}
                          onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="birthDate">{t('dashboard:birth_date')}</Label>
                        <Input
                          id="birthDate"
                          type="date"
                          value={isEditing ? editData.birthDate : profileData.birthDate}
                          onChange={(e) => setEditData({ ...editData, birthDate: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">{t('dashboard:location')}</Label>
                      <Input
                        id="location"
                        value={isEditing ? editData.location : profileData.location}
                        onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">{t('dashboard:bio')}</Label>
                      <Textarea
                        id="bio"
                        value={isEditing ? editData.bio : profileData.bio}
                        onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                        disabled={!isEditing}
                        rows={4}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="academic" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="university">{t('dashboard:university')}</Label>
                      <Input
                        id="university"
                        value={isEditing ? editData.university : profileData.university}
                        onChange={(e) => setEditData({ ...editData, university: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="faculty">{t('dashboard:faculty')}</Label>
                      <Input
                        id="faculty"
                        value={isEditing ? editData.faculty : profileData.faculty}
                        onChange={(e) => setEditData({ ...editData, faculty: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="year">{t('dashboard:year')}</Label>
                        <Input
                          id="year"
                          value={isEditing ? editData.year : profileData.year}
                          onChange={(e) => setEditData({ ...editData, year: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="specialization">{t('dashboard:specialization')}</Label>
                        <Input
                          id="specialization"
                          value={isEditing ? editData.specialization : profileData.specialization}
                          onChange={(e) => setEditData({ ...editData, specialization: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard:achievements')}</CardTitle>
                <CardDescription>{t('dashboard:your_badges_rewards')}</CardDescription>
              </CardHeader>
              <CardContent>
                {achievements.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {achievements.map((achievement, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                {achievement.icon}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold">{achievement.title}</p>
                                <p className="text-sm text-muted-foreground">{achievement.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">{t('dashboard:no_achievements_yet')}</p>
                    <p className="text-sm text-slate-400 mt-1">{t('dashboard:keep_studying_unlock_badges')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Avatar Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user?.profilePicture} />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {user?.name || `${profileData.firstName} ${profileData.lastName}`}
                    </h3>
                    <p className="text-sm text-muted-foreground">{user?.email || profileData.email}</p>
                  </div>
                  <Badge variant="secondary">{profileData.year}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('dashboard:statistics')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {stat.icon}
                      <span className="text-sm text-muted-foreground">{stat.label}</span>
                    </div>
                    <span className="font-semibold">{stat.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
