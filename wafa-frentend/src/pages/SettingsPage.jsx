import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  User, Lock, Bell, Shield, Download, Save, Camera, 
  Mail, Phone, MapPin, GraduationCap, Eye, EyeOff, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageHeader } from '@/components/shared';
import { toast } from 'sonner';
import { dashboardService } from '@/services/dashboardService';

const SettingsPage = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const [showPassword, setShowPassword] = useState(false);
  const [userSemester, setUserSemester] = useState('S1');
  const [settings, setSettings] = useState({
    firstName: 'Az-eddine',
    lastName: 'Serhani',
    email: 'azeddine.serhani@email.com',
    phone: '+212 6 12 34 56 78',
    university: 'Université Hassan II',
    faculty: 'Faculté de Médecine et de Pharmacie',
    currentYear: '1ère année',
    emailNotifications: true,
    pushNotifications: false,
    profileVisibility: 'public',
    shareProgress: true,
    twoFactorAuth: false,
  });

  // Calculate study year based on semester
  const getYearFromSemester = (semester) => {
    const semNum = parseInt(semester.replace('S', ''));
    if (semNum <= 2) return '1ère année';
    if (semNum <= 4) return '2ème année';
    if (semNum <= 6) return '3ème année';
    if (semNum <= 8) return '4ème année';
    if (semNum <= 10) return '5ème année';
    return '6ème année';
  };

  // Fetch user profile and set semester
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await dashboardService.getUserProfile();
        const user = response.data?.user || response.data;
        if (user) {
          setSettings(prev => ({
            ...prev,
            firstName: user.firstName || user.name?.split(' ')[0] || prev.firstName,
            lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || prev.lastName,
            email: user.email || prev.email,
            phone: user.phone || prev.phone,
          }));
          // Get user's semester and calculate year
          const semesters = user.semesters || [];
          if (semesters.length > 0) {
            const latestSemester = semesters[semesters.length - 1];
            setUserSemester(latestSemester);
            setSettings(prev => ({
              ...prev,
              currentYear: getYearFromSemester(latestSemester)
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    fetchUserProfile();
  }, []);

  const handleSave = () => {
    toast.success(t('dashboard:settings_saved_success'));
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <PageHeader
          title={t('common:settings')}
          description={t('dashboard:manage_preferences_account')}
        />

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="account">{t('dashboard:account')}</TabsTrigger>
            <TabsTrigger value="academic">{t('dashboard:academic')}</TabsTrigger>
            <TabsTrigger value="security">{t('dashboard:security')}</TabsTrigger>
            <TabsTrigger value="notifications">{t('dashboard:notifications')}</TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard:personal_information')}</CardTitle>
                <CardDescription>{t('dashboard:update_profile_info')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t('dashboard:first_name')}</Label>
                    <Input
                      id="firstName"
                      value={settings.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t('dashboard:last_name')}</Label>
                    <Input
                      id="lastName"
                      value={settings.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('common:email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t('dashboard:phone')}</Label>
                  <Input
                    id="phone"
                    value={settings.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>

                <Button onClick={handleSave} className="gap-2">
                  <Save className="h-4 w-4" />
                  {t('dashboard:save_changes')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academic Tab */}
          <TabsContent value="academic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard:academic_information')}</CardTitle>
                <CardDescription>{t('dashboard:manage_study_info')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="university">{t('dashboard:university')}</Label>
                  <Input
                    id="university"
                    value={settings.university}
                    disabled
                    className="bg-slate-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">Ce champ ne peut pas être modifié</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="faculty">{t('dashboard:faculty')}</Label>
                  <Input
                    id="faculty"
                    value={settings.faculty}
                    disabled
                    className="bg-slate-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">Ce champ ne peut pas être modifié</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentYear">{t('dashboard:study_year')}</Label>
                  <Input
                    id="currentYear"
                    value={settings.currentYear}
                    disabled
                    className="bg-slate-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">Calculé automatiquement selon votre semestre ({userSemester})</p>
                </div>

                <Alert variant="warning" className="bg-amber-50 border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <strong>Avertissement :</strong> Aucun contenu illégal ou pornographique n'est autorisé. 
                    Le non-respect de cette règle entraînera la suppression définitive de votre compte.
                  </AlertDescription>
                </Alert>

                <Button onClick={handleSave} className="gap-2">
                  <Save className="h-4 w-4" />
                  {t('dashboard:save_changes')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('common:password')}</CardTitle>
                <CardDescription>{t('dashboard:change_your_password')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">{t('dashboard:current_password')}</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                  />
                </div>

                <Button onClick={() => toast.success(t('dashboard:password_updated'))} className="gap-2">
                  <Save className="h-4 w-4" />
                  {t('dashboard:update_password')}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard:two_factor_auth')}</CardTitle>
                <CardDescription>{t('dashboard:add_security_layer')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="twoFactor">{t('dashboard:enable_2fa')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('dashboard:requires_code_each_login')}
                    </p>
                  </div>
                  <Switch
                    id="twoFactor"
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) => handleChange('twoFactorAuth', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard:notification_preferences')}</CardTitle>
                <CardDescription>{t('dashboard:manage_how_receive_notifications')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotif">{t('dashboard:email_notifications')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('dashboard:receive_emails_important_updates')}
                    </p>
                  </div>
                  <Switch
                    id="emailNotif"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleChange('emailNotifications', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="pushNotif">{t('dashboard:push_notifications')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('dashboard:receive_notifications_device')}
                    </p>
                  </div>
                  <Switch
                    id="pushNotif"
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleChange('pushNotifications', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="shareProgress">Partager mes progrès</Label>
                    <p className="text-sm text-muted-foreground">
                      Permettre aux autres de voir votre progression
                    </p>
                  </div>
                  <Switch
                    id="shareProgress"
                    checked={settings.shareProgress}
                    onCheckedChange={(checked) => handleChange('shareProgress', checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="visibility">Visibilité du profil</Label>
                  <Select value={settings.profileVisibility} onValueChange={(value) => handleChange('profileVisibility', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="friends">Amis uniquement</SelectItem>
                      <SelectItem value="private">Privé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSave} className="gap-2">
                  <Save className="h-4 w-4" />
                  Enregistrer les préférences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;
