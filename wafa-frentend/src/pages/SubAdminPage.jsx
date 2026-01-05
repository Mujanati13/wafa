import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCog,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Eye,
  Mail,
  Calendar,
  Check,
  X,
  AlertTriangle,
  Crown,
  Settings,
  Users,
  FileText,
  Bell,
  BarChart3,
  CreditCard,
  BookOpen,
  HelpCircle,
  RefreshCw,
  UserPlus,
  UserMinus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { userService } from "@/services/userService";
import { toast } from "sonner";

// Permission definitions
const PERMISSIONS = {
  users: {
    label: "Gestion des Utilisateurs",
    icon: Users,
    description: "Voir, modifier et supprimer les utilisateurs",
  },
  content: {
    label: "Gestion du Contenu",
    icon: BookOpen,
    description: "Gérer les modules, questions, examens",
  },
  analytics: {
    label: "Analytiques",
    icon: BarChart3,
    description: "Accéder aux tableaux de bord et statistiques",
  },
  payments: {
    label: "Paiements",
    icon: CreditCard,
    description: "Gérer les abonnements et transactions",
  },
  notifications: {
    label: "Notifications",
    icon: Bell,
    description: "Envoyer des notifications aux utilisateurs",
  },
  reports: {
    label: "Rapports",
    icon: FileText,
    description: "Gérer les signalements et explications",
  },
  settings: {
    label: "Paramètres",
    icon: Settings,
    description: "Accéder aux paramètres du système",
  },
};

const SubAdminPage = () => {
  const [admins, setAdmins] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [adminRole, setAdminRole] = useState("editor"); // editor, moderator, admin
  const [adminPassword, setAdminPassword] = useState(""); // Password for admin
  const [editPassword, setEditPassword] = useState(""); // Password for editing admin

  // Fetch admins
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await userService.getAllUsers(1, 1000);
      if (response.success) {
        const adminUsers = response.data.users.filter((user) => user.isAdmin);
        console.log('📋 Admin users fetched:', adminUsers.map(u => ({ email: u.email, hasPassword: u.hasPassword })));
        setAdmins(adminUsers);
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast.error("Erreur lors du chargement des administrateurs");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all users for adding new admin
  const fetchAllUsers = async () => {
    try {
      const response = await userService.getAllUsers(1, 1000);
      if (response.success) {
        // Filter out existing admins
        const nonAdminUsers = response.data.users.filter(
          (user) => !user.isAdmin
        );
        setAllUsers(nonAdminUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchAdmins();
    fetchAllUsers();
  }, []);

  // Filter admins based on search
  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter users for adding new admin
  const filteredUsers = allUsers.filter(
    (user) =>
      user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  // Handle permission toggle
  const togglePermission = (permission) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  // Promote user to admin
  const handlePromoteUser = async () => {
    if (!selectedUser) {
      toast.error("Veuillez sélectionner un utilisateur");
      return;
    }

    // Check if user needs password (no existing password)
    if (!selectedUser.hasPassword && !adminPassword) {
      toast.error("Veuillez définir un mot de passe pour cet utilisateur");
      return;
    }

    if (adminPassword && adminPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    try {
      // Note: This requires a backend endpoint to promote user
      const updateData = {
        isAdmin: true,
        adminRole: adminRole,
        permissions: selectedPermissions,
      };

      // Add password if provided
      if (adminPassword) {
        updateData.password = adminPassword;
        console.log('📤 Sending password with update, length:', adminPassword.length);
      }

      console.log('📤 Update data being sent:', updateData);
      const response = await userService.updateUser(selectedUser._id, updateData);
      console.log('📥 Response:', response);

      if (response.success) {
        toast.success(
          `${selectedUser.name || selectedUser.username} est maintenant administrateur`
        );
        setShowAddDialog(false);
        setSelectedUser(null);
        setSelectedPermissions([]);
        setAdminPassword("");
        fetchAdmins();
        fetchAllUsers();
      }
    } catch (error) {
      console.error("Error promoting user:", error);
      toast.error("Erreur lors de la promotion");
    }
  };

  // Revoke admin privileges
  const handleRevokeAdmin = async () => {
    if (!selectedAdmin) return;

    try {
      const response = await userService.updateUser(selectedAdmin._id, {
        isAdmin: false,
        adminRole: null,
        permissions: [],
      });

      if (response.success) {
        toast.success(
          `Privilèges administrateur révoqués pour ${selectedAdmin.name || selectedAdmin.username}`
        );
        setShowRevokeDialog(false);
        setSelectedAdmin(null);
        fetchAdmins();
        fetchAllUsers();
      }
    } catch (error) {
      console.error("Error revoking admin:", error);
      toast.error("Erreur lors de la révocation");
    }
  };

  // Update admin permissions
  const handleUpdateAdmin = async () => {
    console.log('🚀 handleUpdateAdmin called!');
    console.log('🚀 selectedAdmin:', selectedAdmin?._id, selectedAdmin?.email);
    console.log('🚀 editPassword value:', editPassword, 'length:', editPassword?.length);
    
    if (!selectedAdmin) {
      console.log('❌ No selectedAdmin!');
      return;
    }

    // Validate password if provided
    if (editPassword && editPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    try {
      const updateData = {
        adminRole: adminRole,
        permissions: selectedPermissions,
      };

      // Add password if provided
      if (editPassword && editPassword.trim()) {
        updateData.password = editPassword.trim();
        console.log('📤 Password will be sent:', editPassword.trim());
      } else {
        console.log('⚠️ No password to send - editPassword is empty or whitespace');
      }

      console.log('📤 Final updateData:', JSON.stringify(updateData));
      console.log('📤 Calling API for user:', selectedAdmin._id);
      
      const response = await userService.updateUser(selectedAdmin._id, updateData);
      console.log('📥 API Response:', response);

      if (response.success) {
        toast.success(editPassword ? "Permissions et mot de passe mis à jour" : "Permissions mises à jour");
        setShowEditDialog(false);
        setSelectedAdmin(null);
        setEditPassword("");
        fetchAdmins();
      } else {
        console.log('❌ Response not success:', response);
        toast.error(response.message || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("❌ Error updating admin:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "super_admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "moderator":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "editor":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get role label
  const getRoleLabel = (role) => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "admin":
        return "Administrateur";
      case "moderator":
        return "Modérateur";
      case "editor":
        return "Éditeur";
      default:
        return "Administrateur";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl text-white">
                <UserCog className="w-7 h-7" />
              </div>
              Gestion des Sous-Administrateurs
            </h1>
            <p className="text-gray-600 mt-2">
              Gérez les rôles et permissions des administrateurs
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                fetchAdmins();
                fetchAllUsers();
              }}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Rafraîchir
            </Button>
            <Button
              onClick={() => {
                setShowAddDialog(true);
                setSelectedUser(null);
                setSelectedPermissions([]);
                setAdminRole("editor");
              }}
              className="gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
            >
              <UserPlus className="w-4 h-4" />
              Ajouter un Admin
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-none shadow-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Total Admins</p>
                    <p className="text-3xl font-bold">{admins.length}</p>
                  </div>
                  <Crown className="w-10 h-10 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Éditeurs</p>
                    <p className="text-3xl font-bold text-green-600">
                      {
                        admins.filter(
                          (a) => a.adminRole === "editor" || !a.adminRole
                        ).length
                      }
                    </p>
                  </div>
                  <Edit className="w-10 h-10 text-green-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Modérateurs</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {admins.filter((a) => a.adminRole === "moderator").length}
                    </p>
                  </div>
                  <ShieldCheck className="w-10 h-10 text-blue-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Utilisateurs</p>
                    <p className="text-3xl font-bold text-gray-600">
                      {allUsers.length}
                    </p>
                  </div>
                  <Users className="w-10 h-10 text-gray-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Search */}
        <Card className="border-none shadow-lg mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Rechercher un administrateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Admins List */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-500" />
              Liste des Administrateurs
            </CardTitle>
            <CardDescription>
              {filteredAdmins.length} administrateur(s) trouvé(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
            ) : filteredAdmins.length === 0 ? (
              <div className="text-center py-12">
                <ShieldAlert className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun administrateur trouvé
                </h3>
                <p className="text-gray-500">
                  Ajoutez un nouvel administrateur pour commencer
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredAdmins.map((admin, index) => (
                    <motion.div
                      key={admin._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                            {(admin.name || admin.username)?.[0]?.toUpperCase()}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {admin.name || admin.username}
                          </h4>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {admin.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Badge
                          className={`${getRoleBadgeColor(admin.adminRole)} border`}
                        >
                          {getRoleLabel(admin.adminRole)}
                        </Badge>

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {new Date(admin.createdAt).toLocaleDateString(
                            "fr-FR"
                          )}
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedAdmin(admin);
                                setAdminRole(admin.adminRole || "admin");
                                setSelectedPermissions(admin.permissions || []);
                                setEditPassword("");
                                setShowEditDialog(true);
                              }}
                              className="gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() => {
                                setSelectedAdmin(admin);
                                setAdminRole(admin.adminRole || "admin");
                                setSelectedPermissions(admin.permissions || []);
                                setEditPassword("");
                                setShowEditDialog(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                              Voir le profil
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedAdmin(admin);
                                setShowRevokeDialog(true);
                              }}
                              className="gap-2 text-red-600"
                            >
                              <UserMinus className="w-4 h-4" />
                              Révoquer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Admin Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-500" />
                Ajouter un Administrateur
              </DialogTitle>
              <DialogDescription>
                Sélectionnez un utilisateur et définissez ses permissions
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* User Search */}
              <div className="space-y-3">
                <Label>Sélectionner un utilisateur</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Rechercher un utilisateur..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="max-h-40 overflow-y-auto border rounded-lg">
                  {filteredUsers.slice(0, 10).map((user) => (
                    <div
                      key={user._id}
                      onClick={() => setSelectedUser(user)}
                      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors ${selectedUser?._id === user._id
                          ? "bg-purple-50 border-l-4 border-purple-500"
                          : ""
                        }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-sm">
                        {(user.name || user.username)?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {user.name || user.username}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      {selectedUser?._id === user._id && (
                        <Check className="w-4 h-4 text-purple-500" />
                      )}
                    </div>
                  ))}
                  {filteredUsers.length === 0 && (
                    <p className="text-center text-gray-500 py-4 text-sm">
                      Aucun utilisateur trouvé
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Password Field */}
              {selectedUser && (
                <div className="space-y-3">
                  <Label>Mot de passe {!selectedUser.hasPassword && <span className="text-red-500">*</span>}</Label>
                  <Input
                    type="password"
                    placeholder={selectedUser.hasPassword ? "Laisser vide pour conserver l'actuel" : "Définir un mot de passe (obligatoire)"}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                  />
                  {!selectedUser.hasPassword && (
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Cet utilisateur n'a pas de mot de passe (compte Google). Un mot de passe est requis.
                    </p>
                  )}
                </div>
              )}

              <Separator />

              {/* Role Selection */}
              <div className="space-y-3">
                <Label>Rôle</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "editor", label: "Éditeur", icon: Edit },
                    {
                      value: "moderator",
                      label: "Modérateur",
                      icon: ShieldCheck,
                    },
                    { value: "admin", label: "Administrateur", icon: Shield },
                  ].map((role) => (
                    <div
                      key={role.value}
                      onClick={() => setAdminRole(role.value)}
                      className={`flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer transition-all ${adminRole === role.value
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <role.icon
                        className={`w-6 h-6 ${adminRole === role.value ? "text-purple-500" : "text-gray-400"}`}
                      />
                      <span
                        className={`text-sm font-medium ${adminRole === role.value ? "text-purple-700" : "text-gray-600"}`}
                      >
                        {role.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Permissions */}
              <div className="space-y-3">
                <Label>Permissions</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(PERMISSIONS).map(([key, permission]) => (
                    <div
                      key={key}
                      onClick={() => togglePermission(key)}
                      className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${selectedPermissions.includes(key)
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <Checkbox checked={selectedPermissions.includes(key)} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <permission.icon
                            className={`w-4 h-4 ${selectedPermissions.includes(key) ? "text-purple-500" : "text-gray-400"}`}
                          />
                          <span
                            className={`font-medium text-sm ${selectedPermissions.includes(key) ? "text-purple-700" : "text-gray-700"}`}
                          >
                            {permission.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowAddDialog(false); setAdminPassword(""); setSelectedUser(null); }}>
                Annuler
              </Button>
              <Button
                onClick={handlePromoteUser}
                disabled={!selectedUser || (!selectedUser.hasPassword && !adminPassword)}
                className="bg-gradient-to-r from-purple-500 to-indigo-600"
              >
                Ajouter comme Admin
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Admin Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-purple-500" />
                Modifier les permissions
              </DialogTitle>
              <DialogDescription>
                Modifiez le rôle et les permissions de{" "}
                {selectedAdmin?.name || selectedAdmin?.username}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Role Selection */}
              <div className="space-y-3">
                <Label>Rôle</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "editor", label: "Éditeur", icon: Edit },
                    {
                      value: "moderator",
                      label: "Modérateur",
                      icon: ShieldCheck,
                    },
                    { value: "admin", label: "Administrateur", icon: Shield },
                  ].map((role) => (
                    <div
                      key={role.value}
                      onClick={() => setAdminRole(role.value)}
                      className={`flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer transition-all ${adminRole === role.value
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <role.icon
                        className={`w-6 h-6 ${adminRole === role.value ? "text-purple-500" : "text-gray-400"}`}
                      />
                      <span
                        className={`text-sm font-medium ${adminRole === role.value ? "text-purple-700" : "text-gray-600"}`}
                      >
                        {role.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Password Change */}
              <div className="space-y-3">
                <Label>Changer le mot de passe</Label>
                <Input
                  type="password"
                  placeholder="Nouveau mot de passe (laisser vide pour ne pas changer)"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                />
                {editPassword && editPassword.length > 0 && editPassword.length < 6 && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Le mot de passe doit contenir au moins 6 caractères
                  </p>
                )}
                {selectedAdmin?.hasPassword === false && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Cet utilisateur n'a pas de mot de passe (compte Google)
                  </p>
                )}
              </div>

              <Separator />

              {/* Permissions */}
              <div className="space-y-3">
                <Label>Permissions</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(PERMISSIONS).map(([key, permission]) => (
                    <div
                      key={key}
                      onClick={() => togglePermission(key)}
                      className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${selectedPermissions.includes(key)
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <Checkbox checked={selectedPermissions.includes(key)} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <permission.icon
                            className={`w-4 h-4 ${selectedPermissions.includes(key) ? "text-purple-500" : "text-gray-400"}`}
                          />
                          <span
                            className={`font-medium text-sm ${selectedPermissions.includes(key) ? "text-purple-700" : "text-gray-700"}`}
                          >
                            {permission.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => { setShowEditDialog(false); setEditPassword(""); }}
              >
                Annuler
              </Button>
              <Button
                onClick={handleUpdateAdmin}
                className="bg-gradient-to-r from-purple-500 to-indigo-600"
              >
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Revoke Admin Dialog */}
        <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Confirmer la révocation
              </DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir révoquer les privilèges
                d'administrateur de{" "}
                <strong>
                  {selectedAdmin?.name || selectedAdmin?.username}
                </strong>
                ? Cette action peut être annulée en les promouvant à nouveau.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowRevokeDialog(false)}
              >
                Annuler
              </Button>
              <Button
                onClick={handleRevokeAdmin}
                className="bg-red-500 hover:bg-red-600"
              >
                Révoquer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
};

export default SubAdminPage;
