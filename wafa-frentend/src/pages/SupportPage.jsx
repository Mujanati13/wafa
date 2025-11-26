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
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
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
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6 text-blue-600" />
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

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px] mx-auto">
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">FAQ</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Contact</span>
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <Ticket className="w-4 h-4" />
              <span className="hidden sm:inline">Mes Tickets</span>
              {tickets.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {tickets.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans la FAQ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* FAQ Categories */}
            <div className="grid gap-6">
              {filteredFAQs.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun résultat trouvé pour "{searchQuery}"</p>
                    <p className="text-sm mt-2">
                      Essayez d'autres termes ou contactez-nous directement
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredFAQs.map((category) => (
                  <Card key={category.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <category.icon className="w-5 h-5 text-primary" />
                        {category.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {category.faqs.map((faq, index) => (
                        <FAQItem key={index} question={faq.question} answer={faq.answer} />
                      ))}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Envoyer un Ticket</CardTitle>
                <CardDescription>
                  Décrivez votre problème et nous vous répondrons rapidement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Votre nom"
                        disabled={!!currentUser?.name}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="votre@email.com"
                        disabled={!!currentUser?.email}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">
                      Sujet <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Sujet de votre demande"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">
                      Message <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Décrivez votre problème en détail..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Envoyer le Ticket
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Mes Tickets</CardTitle>
                  <CardDescription>
                    Historique de vos demandes de support
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchTickets}
                  disabled={isLoadingTickets}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingTickets ? 'animate-spin' : ''}`} />
                  Actualiser
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingTickets ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Ticket className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">Aucun ticket</p>
                    <p className="text-sm mt-1">
                      Vous n'avez pas encore envoyé de demande de support
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setActiveTab('contact')}
                    >
                      Créer un ticket
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {tickets.map((ticket, index) => (
                        <motion.div
                          key={ticket._id || index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card className="bg-muted/30">
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold truncate">
                                      {ticket.subject}
                                    </h4>
                                    {getStatusBadge(ticket.status)}
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {ticket.message}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(ticket.createdAt)}
                                  </div>
                                </div>
                              </div>
                              {ticket.reply && (
                                <>
                                  <Separator className="my-3" />
                                  <div className="bg-primary/5 rounded-lg p-3">
                                    <p className="text-xs font-medium text-primary mb-1">
                                      Réponse du support
                                    </p>
                                    <p className="text-sm">{ticket.reply}</p>
                                  </div>
                                </>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
