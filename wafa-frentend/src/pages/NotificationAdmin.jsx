import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Bell,
  Send,
  Users,
  User,
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageSquare,
  Megaphone,
  Filter,
  X,
  RefreshCw,
} from 'lucide-react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { userService } from '@/services/userService';

const NotificationAdmin = () => {
  const { t } = useTranslation(['admin', 'common']);
  const [activeTab, setActiveTab] = useState('broadcast');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [notificationHistory, setNotificationHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'system',
    priority: 'normal',
  });

  // Notification types
  const notificationTypes = [
    { value: 'system', label: 'Système', icon: Bell },
    { value: 'announcement', label: 'Annonce', icon: Megaphone },
    { value: 'reminder', label: 'Rappel', icon: Clock },
    { value: 'alert', label: 'Alerte', icon: AlertCircle },
  ];

  // Fetch users for individual notifications
  useEffect(() => {
    if (activeTab === 'individual') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers(1, 100);
      // Backend returns { success, data: { users, pagination } }
      const usersData = response.data?.users || response.users || [];
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
      setUsers([]); // Ensure users is always an array
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/notifications/admin/history`,
        { withCredentials: true }
      );
      setNotificationHistory(response.data.data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchNotificationHistory();
    }
  }, [activeTab]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBroadcast = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setSending(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/notifications/admin/send-broadcast`,
        {
          title: formData.title,
          message: formData.message,
          type: formData.type,
          priority: formData.priority,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Notification envoyée !', {
          description: `Envoyée à ${response.data.count || 'tous les'} utilisateurs.`,
        });
        setFormData({ title: '', message: '', type: 'system', priority: 'normal' });
      }
    } catch (error) {
      console.error('Broadcast error:', error);
      toast.error('Erreur lors de l\'envoi', {
        description: error.response?.data?.message || 'Veuillez réessayer.',
      });
    } finally {
      setSending(false);
    }
  };

  const handleIndividualSend = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error('Veuillez sélectionner au moins un utilisateur');
      return;
    }

    setSending(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/notifications/admin/send-system`,
        {
          userIds: selectedUsers.map(u => u._id),
          title: formData.title,
          message: formData.message,
          type: formData.type,
          priority: formData.priority,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Notifications envoyées !', {
          description: `Envoyées à ${selectedUsers.length} utilisateur(s).`,
        });
        setFormData({ title: '', message: '', type: 'system', priority: 'normal' });
        setSelectedUsers([]);
      }
    } catch (error) {
      console.error('Individual send error:', error);
      toast.error('Erreur lors de l\'envoi', {
        description: error.response?.data?.message || 'Veuillez réessayer.',
      });
    } finally {
      setSending(false);
    }
  };

  const toggleUserSelection = (user) => {
    setSelectedUsers(prev => {
      const exists = prev.find(u => u._id === user._id);
      if (exists) {
        return prev.filter(u => u._id !== user._id);
      }
      return [...prev, user];
    });
  };

  const removeSelectedUser = (userId) => {
    setSelectedUsers(prev => prev.filter(u => u._id !== userId));
  };

  const filteredUsers = Array.isArray(users) ? users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  // Select All / Deselect All
  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers([...filteredUsers]);
    }
  };

  // Check if all filtered users are selected
  const allSelected = filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Gestion des Notifications
          </h1>
          <p className="text-gray-600 mt-1">
            Envoyez des notifications à tous les utilisateurs ou individuellement
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Utilisateurs Total</p>
                <p className="text-2xl font-bold">{users.length || '...'}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sélectionnés</p>
                <p className="text-2xl font-bold">{selectedUsers.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <User className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Envoyées (30j)</p>
                <p className="text-2xl font-bold">{notificationHistory.length || '...'}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="broadcast" className="flex items-center gap-2">
            <Megaphone className="w-4 h-4" />
            Diffusion Générale
          </TabsTrigger>
          <TabsTrigger value="individual" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Individuel
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Historique
          </TabsTrigger>
        </TabsList>

        {/* Broadcast Tab */}
        <TabsContent value="broadcast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-orange-500" />
                Envoyer à tous les utilisateurs
              </CardTitle>
              <CardDescription>
                Cette notification sera envoyée à tous les utilisateurs actifs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type de notification</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      {notificationTypes.map((nt) => (
                        <SelectItem key={nt.value} value={nt.value}>
                          <div className="flex items-center gap-2">
                            <nt.icon className="w-4 h-4" />
                            {nt.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priorité</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner la priorité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Basse</SelectItem>
                      <SelectItem value="normal">Normale</SelectItem>
                      <SelectItem value="high">Haute</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Titre de la notification"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Contenu de la notification..."
                  rows={4}
                />
              </div>

              <Button
                onClick={handleBroadcast}
                disabled={sending}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer à tous les utilisateurs
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual Tab */}
        <TabsContent value="individual" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Sélectionner les utilisateurs
                  </span>
                  <Button variant="outline" size="sm" onClick={fetchUsers}>
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par nom ou email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Select All / Clear Selection */}
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="selectAll"
                      checked={allSelected}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <Label htmlFor="selectAll" className="text-sm cursor-pointer">
                      {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
                    </Label>
                  </div>
                  {selectedUsers.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedUsers([])}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Effacer ({selectedUsers.length})
                    </Button>
                  )}
                </div>

                {/* Selected Users */}
                {selectedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg">
                    {selectedUsers.map((user) => (
                      <Badge
                        key={user._id}
                        variant="secondary"
                        className="flex items-center gap-1 pr-1"
                      >
                        {user.name || user.email}
                        <button
                          onClick={() => removeSelectedUser(user._id)}
                          className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* User List */}
                <ScrollArea className="h-[300px] border rounded-lg">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <Users className="w-8 h-8 mb-2" />
                      <p>Aucun utilisateur trouvé</p>
                    </div>
                  ) : (
                    <div className="p-2 space-y-1">
                      {filteredUsers.map((user) => {
                        const isSelected = selectedUsers.find(u => u._id === user._id);
                        return (
                          <button
                            key={user._id}
                            onClick={() => toggleUserSelection(user)}
                            className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                              isSelected
                                ? 'bg-blue-100 border-blue-300'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={!!isSelected}
                              onChange={() => {}}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                              isSelected ? 'bg-blue-500' : 'bg-gray-400'
                            }`}>
                              {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{user.name || 'Sans nom'}</p>
                              <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-blue-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Notification Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                  Message personnalisé
                </CardTitle>
                <CardDescription>
                  {selectedUsers.length > 0
                    ? `${selectedUsers.length} utilisateur(s) sélectionné(s)`
                    : 'Sélectionnez des utilisateurs à gauche'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {notificationTypes.map((nt) => (
                          <SelectItem key={nt.value} value={nt.value}>
                            {nt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priorité</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Basse</SelectItem>
                        <SelectItem value="normal">Normale</SelectItem>
                        <SelectItem value="high">Haute</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Titre *</Label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Titre de la notification"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Message *</Label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Contenu de la notification..."
                    rows={6}
                  />
                </div>

                <Button
                  onClick={handleIndividualSend}
                  disabled={sending || selectedUsers.length === 0}
                  className="w-full"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Envoyer à {selectedUsers.length} utilisateur(s)
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Historique des notifications</CardTitle>
                <CardDescription>Dernières notifications envoyées</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchNotificationHistory}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loadingHistory ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : notificationHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune notification dans l'historique</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {notificationHistory.map((notif, index) => (
                      <motion.div
                        key={notif._id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{notif.title}</h4>
                              <Badge variant="outline">{notif.type}</Badge>
                              {notif.broadcast && (
                                <Badge className="bg-orange-100 text-orange-700">
                                  Diffusion
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {notif.message}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(notif.createdAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {notif.recipientCount || 1} destinataire(s)
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationAdmin;
