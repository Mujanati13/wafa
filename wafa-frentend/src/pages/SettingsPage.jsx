import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaCog,
  FaBell,
  FaLock,
  FaUser,
  FaPalette,
  FaLanguage,
  FaVolumeUp,
  FaEye,
  FaShieldAlt,
  FaDownload,
  FaTrash,
  FaSave,
  FaMoon,
  FaSun,
  FaGlobe,
  FaEnvelope,
  FaMobile,
  FaDesktop,
  FaCheck,
  FaTimes,
  FaExclamationTriangle
} from 'react-icons/fa';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    examReminders: true,
    resultNotifications: true,
    weeklyReports: false,
    
    // Privacy & Security
    profileVisibility: 'public',
    shareProgress: true,
    twoFactorAuth: false,
    loginAlerts: true,
    
    // Appearance
    theme: 'dark',
    language: 'fr',
    fontSize: 'medium',
    animations: true,
    
    // Study Preferences
    autoSaveAnswers: true,
    showCorrectAnswers: true,
    timerWarnings: true,
    soundEffects: true,
    
    // Data & Storage
    saveOffline: true,
    autoBackup: true,
    dataCompression: false
  });

  const [activeTab, setActiveTab] = useState('notifications');

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const settingsTabs = [
    { id: 'notifications', label: 'Notifications', icon: FaBell },
    { id: 'privacy', label: 'Confidentialité', icon: FaShieldAlt },
    { id: 'appearance', label: 'Apparence', icon: FaPalette },
    { id: 'study', label: 'Étude', icon: FaUser },
    { id: 'data', label: 'Données', icon: FaDownload }
  ];

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <h4 className="text-white font-medium">{label}</h4>
        {description && <p className="text-gray-400 text-sm mt-1">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
          checked ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-600'
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
            checked ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const SelectInput = ({ value, onChange, options, label, description }) => (
    <div className="py-3">
      <h4 className="text-white font-medium mb-2">{label}</h4>
      {description && <p className="text-gray-400 text-sm mb-3">{description}</p>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none transition-colors"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const renderNotificationsSettings = () => (
    <div className="space-y-4">
      <ToggleSwitch
        checked={settings.emailNotifications}
        onChange={(value) => handleSettingChange('emailNotifications', value)}
        label="Notifications par Email"
        description="Recevez des notifications par email pour les mises à jour importantes"
      />
      <ToggleSwitch
        checked={settings.pushNotifications}
        onChange={(value) => handleSettingChange('pushNotifications', value)}
        label="Notifications Push"
        description="Notifications instantanées sur votre appareil"
      />
      <ToggleSwitch
        checked={settings.examReminders}
        onChange={(value) => handleSettingChange('examReminders', value)}
        label="Rappels d'Examens"
        description="Rappels avant les examens planifiés"
      />
      <ToggleSwitch
        checked={settings.resultNotifications}
        onChange={(value) => handleSettingChange('resultNotifications', value)}
        label="Notifications de Résultats"
        description="Notifications quand de nouveaux résultats sont disponibles"
      />
      <ToggleSwitch
        checked={settings.weeklyReports}
        onChange={(value) => handleSettingChange('weeklyReports', value)}
        label="Rapports Hebdomadaires"
        description="Recevez un résumé de vos progrès chaque semaine"
      />
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-4">
      <SelectInput
        value={settings.profileVisibility}
        onChange={(value) => handleSettingChange('profileVisibility', value)}
        label="Visibilité du Profil"
        description="Qui peut voir votre profil et vos informations"
        options={[
          { value: 'public', label: 'Public' },
          { value: 'friends', label: 'Amis uniquement' },
          { value: 'private', label: 'Privé' }
        ]}
      />
      <ToggleSwitch
        checked={settings.shareProgress}
        onChange={(value) => handleSettingChange('shareProgress', value)}
        label="Partager les Progrès"
        description="Permettre aux autres de voir vos statistiques de progression"
      />
      <ToggleSwitch
        checked={settings.twoFactorAuth}
        onChange={(value) => handleSettingChange('twoFactorAuth', value)}
        label="Authentification à Deux Facteurs"
        description="Sécurité supplémentaire pour votre compte"
      />
      <ToggleSwitch
        checked={settings.loginAlerts}
        onChange={(value) => handleSettingChange('loginAlerts', value)}
        label="Alertes de Connexion"
        description="Notifications lors de connexions sur de nouveaux appareils"
      />
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-4">
      <SelectInput
        value={settings.theme}
        onChange={(value) => handleSettingChange('theme', value)}
        label="Thème"
        description="Choisissez l'apparence de l'interface"
        options={[
          { value: 'dark', label: 'Sombre' },
          { value: 'light', label: 'Clair' },
          { value: 'auto', label: 'Automatique' }
        ]}
      />
      <SelectInput
        value={settings.language}
        onChange={(value) => handleSettingChange('language', value)}
        label="Langue"
        description="Langue de l'interface utilisateur"
        options={[
          { value: 'fr', label: 'Français' },
          { value: 'ar', label: 'العربية' },
          { value: 'en', label: 'English' }
        ]}
      />
      <SelectInput
        value={settings.fontSize}
        onChange={(value) => handleSettingChange('fontSize', value)}
        label="Taille de Police"
        description="Taille du texte dans l'application"
        options={[
          { value: 'small', label: 'Petite' },
          { value: 'medium', label: 'Moyenne' },
          { value: 'large', label: 'Grande' }
        ]}
      />
      <ToggleSwitch
        checked={settings.animations}
        onChange={(value) => handleSettingChange('animations', value)}
        label="Animations"
        description="Activer les animations d'interface"
      />
    </div>
  );

  const renderStudySettings = () => (
    <div className="space-y-4">
      <ToggleSwitch
        checked={settings.autoSaveAnswers}
        onChange={(value) => handleSettingChange('autoSaveAnswers', value)}
        label="Sauvegarde Automatique"
        description="Sauvegarder automatiquement vos réponses pendant les examens"
      />
      <ToggleSwitch
        checked={settings.showCorrectAnswers}
        onChange={(value) => handleSettingChange('showCorrectAnswers', value)}
        label="Afficher les Bonnes Réponses"
        description="Montrer les réponses correctes après chaque question"
      />
      <ToggleSwitch
        checked={settings.timerWarnings}
        onChange={(value) => handleSettingChange('timerWarnings', value)}
        label="Alertes de Temps"
        description="Alertes quand le temps se termine bientôt"
      />
      <ToggleSwitch
        checked={settings.soundEffects}
        onChange={(value) => handleSettingChange('soundEffects', value)}
        label="Effets Sonores"
        description="Sons pour les actions et notifications"
      />
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-4">
      <ToggleSwitch
        checked={settings.saveOffline}
        onChange={(value) => handleSettingChange('saveOffline', value)}
        label="Mode Hors Ligne"
        description="Sauvegarder le contenu pour utilisation hors ligne"
      />
      <ToggleSwitch
        checked={settings.autoBackup}
        onChange={(value) => handleSettingChange('autoBackup', value)}
        label="Sauvegarde Automatique"
        description="Sauvegarder automatiquement vos données dans le cloud"
      />
      <ToggleSwitch
        checked={settings.dataCompression}
        onChange={(value) => handleSettingChange('dataCompression', value)}
        label="Compression des Données"
        description="Réduire l'utilisation de bande passante"
      />
      
      <div className="pt-6 border-t border-gray-700/50">
        <h4 className="text-white font-medium mb-4">Actions sur les Données</h4>
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between px-4 py-3 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-600/30 transition-colors">
            <div className="flex items-center space-x-3">
              <FaDownload />
              <span>Exporter mes Données</span>
            </div>
          </button>
          <button className="w-full flex items-center justify-between px-4 py-3 bg-red-600/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-600/30 transition-colors">
            <div className="flex items-center space-x-3">
              <FaTrash />
              <span>Supprimer mes Données</span>
            </div>
            <FaExclamationTriangle className="text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notifications':
        return renderNotificationsSettings();
      case 'privacy':
        return renderPrivacySettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'study':
        return renderStudySettings();
      case 'data':
        return renderDataSettings();
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Paramètres</h1>
        <p className="text-gray-400">Personnalisez votre expérience d'apprentissage</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
            <nav className="space-y-2">
              {settingsTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <tab.icon className="text-lg" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Settings Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center space-x-3 mb-6">
              {settingsTabs.find(tab => tab.id === activeTab)?.icon && 
                React.createElement(settingsTabs.find(tab => tab.id === activeTab).icon, {
                  className: "text-xl text-purple-400"
                })
              }
              <h2 className="text-xl font-semibold text-white">
                {settingsTabs.find(tab => tab.id === activeTab)?.label}
              </h2>
            </div>

            <div className="min-h-[400px]">
              {renderTabContent()}
            </div>

            {/* Save Button */}
            <div className="pt-6 border-t border-gray-700/50">
              <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300">
                <FaSave />
                <span>Sauvegarder les Modifications</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage; 