import React, { useState } from 'react';
import { 
  User, Lock, Bell, Shield, Download, Save, Camera, 
  Mail, Phone, MapPin, GraduationCap, Eye, EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/shared';
import { toast } from 'sonner';

const SettingsPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    firstName: 'Az-eddine',
    lastName: 'Serhani',
    email: 'azeddine.serhani@email.com',
    phone: '+212 6 12 34 56 78',
    university: 'Université Hassan II',
    faculty: 'Faculté de Médecine',
    currentYear: '6ème année',
    emailNotifications: true,
    pushNotifications: false,
    profileVisibility: 'public',
    shareProgress: true,
    twoFactorAuth: false,
  });

  const handleSave = () => {
    toast.success('Paramètres enregistrés avec succès!');
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <PageHeader
          title="Paramètres"
          description="Gérez vos préférences et informations de compte"
        />

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="account">Compte</TabsTrigger>
            <TabsTrigger value="academic">Académique</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>Mettez à jour vos informations de profil</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={settings.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={settings.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={settings.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>

                <Button onClick={handleSave} className="gap-2">
                  <Save className="h-4 w-4" />
                  Enregistrer les modifications
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academic Tab */}
          <TabsContent value="academic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informations académiques</CardTitle>
                <CardDescription>Gérez vos informations d'études</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="university">Université</Label>
                  <Input
                    id="university"
                    value={settings.university}
                    onChange={(e) => handleChange('university', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="faculty">Faculté</Label>
                  <Input
                    id="faculty"
                    value={settings.faculty}
                    onChange={(e) => handleChange('faculty', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentYear">Année d'études</Label>
                  <Select value={settings.currentYear} onValueChange={(value) => handleChange('currentYear', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1ère année">1ère année</SelectItem>
                      <SelectItem value="2ème année">2ème année</SelectItem>
                      <SelectItem value="3ème année">3ème année</SelectItem>
                      <SelectItem value="4ème année">4ème année</SelectItem>
                      <SelectItem value="5ème année">5ème année</SelectItem>
                      <SelectItem value="6ème année">6ème année</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSave} className="gap-2">
                  <Save className="h-4 w-4" />
                  Enregistrer les modifications
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Mot de passe</CardTitle>
                <CardDescription>Changez votre mot de passe</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mot de passe actuel</Label>
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

                <Button onClick={() => toast.success('Mot de passe mis à jour!')} className="gap-2">
                  <Save className="h-4 w-4" />
                  Mettre à jour le mot de passe
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Authentification à deux facteurs</CardTitle>
                <CardDescription>Ajoutez une couche de sécurité supplémentaire</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="twoFactor">Activer 2FA</Label>
                    <p className="text-sm text-muted-foreground">
                      Nécessite un code à chaque connexion
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
                <CardTitle>Préférences de notification</CardTitle>
                <CardDescription>Gérez comment vous recevez les notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotif">Notifications par email</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevez des emails pour les mises à jour importantes
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
                    <Label htmlFor="pushNotif">Notifications push</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevez des notifications sur votre appareil
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
