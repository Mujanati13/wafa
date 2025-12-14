import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  MessageSquare,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Search,
  Ticket,
  Mail,
  Phone,
  MessageCircle,
  ExternalLink,
  RefreshCw,
  User,
  Calendar,
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { userService } from '@/services/userService';

const SupportPage = () => {
  const { t } = useTranslation(['common', 'dashboard']);
  const [activeTab, setActiveTab] = useState('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  // FAQ Data
  const faqCategories = [
    {
      id: 'account',
      title: 'Compte & Profil',
      icon: User,
      faqs: [
        {
          question: 'Comment modifier mon profil ?',
          answer: 'Accédez à la page Profil depuis le menu. Vos modifications sont sauvegardées automatiquement.',
        },
        {
          question: 'Comment changer mon mot de passe ?',
          answer: 'Allez dans Paramètres > Sécurité, puis cliquez sur "Modifier le mot de passe". Vous recevrez un email de confirmation.',
        },
        {
          question: 'Comment supprimer mon compte ?',
          answer: 'Contactez notre support via le formulaire ci-dessous. La suppression sera effectuée sous 48h.',
        },
      ],
    },
    {
      id: 'subscription',
      title: 'Abonnement & Paiement',
      icon: Ticket,
      faqs: [
        {
          question: 'Quels sont les moyens de paiement acceptés ?',
          answer: 'Nous acceptons PayPal pour tous les paiements. Les transactions sont sécurisées.',
        },
        {
          question: 'Comment annuler mon abonnement ?',
          answer: 'Rendez-vous dans Paramètres > Abonnement, puis cliquez sur "Annuler l\'abonnement". Vous conserverez l\'accès jusqu\'à la fin de la période payée.',
        },
        {
          question: 'Puis-je obtenir un remboursement ?',
          answer: 'Les remboursements sont possibles dans les 14 jours suivant l\'achat. Contactez notre support avec votre numéro de transaction.',
        },
      ],
    },
    {
      id: 'exams',
      title: 'Examens & Questions',
      icon: HelpCircle,
      faqs: [
        {
          question: 'Comment signaler une erreur dans une question ?',
          answer: 'Pendant un examen, cliquez sur le bouton "Signaler" (drapeau) pour reporter une question problématique.',
        },
        {
          question: 'Ma progression est-elle sauvegardée automatiquement ?',
          answer: 'Oui, votre progression est sauvegardée automatiquement toutes les 30 secondes pendant un examen.',
        },
        {
          question: 'Comment voir mes statistiques de performance ?',
          answer: 'Accédez à la page "Progrès" depuis le tableau de bord pour voir vos statistiques détaillées par module.',
        },
      ],
    },
    {
      id: 'technical',
      title: 'Problèmes Techniques',
      icon: AlertCircle,
      faqs: [
        {
          question: 'L\'application ne charge pas correctement',
          answer: 'Essayez de vider le cache de votre navigateur (Ctrl+Shift+Delete) et de rafraîchir la page. Si le problème persiste, essayez un autre navigateur.',
        },
        {
          question: 'Je ne reçois pas les emails de confirmation',
          answer: 'Vérifiez votre dossier spam/courrier indésirable. Ajoutez contact@wafa.com à vos contacts pour éviter ce problème.',
        },
        {
          question: 'Mon score ne s\'affiche pas correctement',
          answer: 'Rafraîchissez la page et attendez quelques secondes. Si le problème persiste, déconnectez-vous et reconnectez-vous.',
        },
      ],
    },
  ];

  // Load user's tickets
  const fetchTickets = async () => {
    if (!currentUser) return;
    
    setIsLoadingTickets(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/contact/my-messages`,
        { withCredentials: true }
      );
      if (response.data.success) {
        setTickets(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      // Silent fail - user might not have any tickets
    } finally {
      setIsLoadingTickets(false);
    }
  };

  // Fetch current user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await userService.getUserProfile();
        setCurrentUser(userData);
        setFormData(prev => ({
          ...prev,
          name: userData.name || '',
          email: userData.email || ''
        }));
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    
    fetchUser();
  }, []);

  useEffect(() => {
    if (activeTab === 'tickets') {
      fetchTickets();
    }
  }, [activeTab, currentUser]);

  // Filter FAQs based on search
  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(
      faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.faqs.length > 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/contact`,
        formData,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Ticket envoyé avec succès !', {
          description: 'Nous vous répondrons dans les plus brefs délais.',
        });
        setFormData(prev => ({ ...prev, subject: '', message: '' }));
        setActiveTab('tickets');
        fetchTickets();
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi', {
        description: error.response?.data?.message || 'Veuillez réessayer plus tard.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'secondary', icon: Clock },
      read: { label: 'Lu', variant: 'default', icon: CheckCircle2 },
      replied: { label: 'Répondu', variant: 'success', icon: MessageSquare },
      closed: { label: 'Fermé', variant: 'outline', icon: CheckCircle2 },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

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
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
          <HelpCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Centre d'Aide</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Trouvez des réponses à vos questions ou contactez notre équipe de support
        </p>
      </motion.div>

      {/* Quick Contact Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardContent className="pt-6 text-center">
            <a
              href="https://www.facebook.com/wafa_app"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <ExternalLink className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-1">Facebook</h3>
              <p className="text-sm text-muted-foreground">@wafa_app</p>
            </a>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardContent className="pt-6 text-center">
            <a
              href="https://wa.me/212600000000"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-1">WhatsApp</h3>
              <p className="text-sm text-muted-foreground">Réponse rapide</p>
            </a>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardContent className="pt-6 text-center">
            <a href="mailto:contact@wafa.com" className="block">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-1">Email</h3>
              <p className="text-sm text-muted-foreground">contact@wafa.com</p>
            </a>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardContent className="pt-6 text-center">
            <a
              href="https://instagram.com/wafa_app"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <ExternalLink className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="font-semibold mb-1">Instagram</h3>
              <p className="text-sm text-muted-foreground">@wafa_app</p>
            </a>
          </CardContent>
        </Card>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Questions Fréquentes
            </CardTitle>
            <CardDescription>
              Trouvez rapidement des réponses à vos questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans la FAQ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* FAQ Categories */}
            <div className="grid gap-6 mt-4">
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun résultat trouvé pour "{searchQuery}"</p>
                  <p className="text-sm mt-2">
                    Contactez-nous via WhatsApp ou Email pour plus d'aide
                  </p>
                </div>
              ) : (
                filteredFAQs.map((category) => (
                  <div key={category.id} className="border rounded-lg p-4">
                    <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
                      <category.icon className="w-5 h-5 text-primary" />
                      {category.title}
                    </h3>
                    <div className="space-y-2">
                      {category.faqs.map((faq, index) => (
                        <FAQItem key={index} question={faq.question} answer={faq.answer} />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

// FAQ Item Component
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors text-left">
          <span className="font-medium text-sm">{question}</span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 pb-3"
          >
            <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
              {answer}
            </p>
          </motion.div>
        </AnimatePresence>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default SupportPage;
