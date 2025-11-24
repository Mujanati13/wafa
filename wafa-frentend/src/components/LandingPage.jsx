import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { 
  BookOpen, 
  Shield, 
  TrendingUp, 
  BadgeCheck, 
  Highlighter, 
  List, 
  StickyNote,
  ChevronRight,
  Sparkles,
  GraduationCap,
  Star,
  CheckCircle2,
  Zap,
  Users,
  Award,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Loader
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Header from "./landingPage/Header";
import FloatingSupport from "./FloatingSupport";
import { subscriptionPlanService } from "@/services/subscriptionPlanService";

const LandingPage = () => {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 min-h-screen" role="main">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <ContactSection />
      <Footer />
      <FloatingSupport />
    </div>
  );
};

// Hero Section
const HeroSection = () => {
  const { t } = useTranslation("landing");

  return (
    <section className="relative min-h-screen lg:min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30 pt-20 md:pt-24 lg:pt-20" aria-label={t("hero_badge")}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 md:w-96 md:h-96 bg-blue-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 md:w-96 md:h-96 bg-purple-400/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16 w-full">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4 md:space-y-6"
          >
            <Badge variant="secondary" className="gap-2 text-xs md:text-sm w-fit">
              <Sparkles className="h-3 w-3" />
              {t("hero_badge")}
            </Badge>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-slate-900 tracking-tight">
              {t("hero_title_part1")}{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {t("hero_title_highlight")}
              </span>
              <br />
              {t("hero_title_part2")}
            </h1>

            <p className="text-sm md:text-base lg:text-lg text-slate-600 max-w-xl leading-relaxed">
              {t("hero_description")}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-6 text-xs md:text-sm pt-2 md:pt-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-4 md:h-5 w-4 md:w-5 flex-shrink-0" />
                <span className="font-medium">{t("hero_benefit_1")}</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-4 md:h-5 w-4 md:w-5 flex-shrink-0" />
                <span className="font-medium">{t("hero_benefit_2")}</span>
              </div>
            </div>
          </motion.div>

          {/* Right: Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex lg:flex-none justify-center relative mt-8 lg:mt-0"
          >
            <div className="relative w-full lg:w-auto">
              <Card className="w-full max-w-sm md:max-w-md lg:max-w-[420px] shadow-2xl border-2 mx-auto">
                <CardContent className="p-6 md:p-8">
                  <div className="space-y-6">
                    {/* Header with gradient circle */}
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 md:h-16 md:w-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
                        <GraduationCap className="h-7 md:h-8 w-7 md:w-8 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-base md:text-lg text-slate-900">{t("hero_card_title")}</p>
                        <p className="text-xs md:text-sm text-slate-500">{t("hero_card_subtitle")}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Features list */}
                    <div className="space-y-4">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-center gap-3"
                      >
                        <BookOpen className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        <span className="text-xs md:text-sm font-medium text-slate-700">{t("hero_card_feature_1")}</span>
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center gap-3"
                      >
                        <Award className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                        <span className="text-xs md:text-sm font-medium text-slate-700">{t("hero_card_feature_2")}</span>
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex items-center gap-3"
                      >
                        <Users className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-xs md:text-sm font-medium text-slate-700">{t("hero_card_feature_3")}</span>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Floating rating badge */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-2 -right-2 lg:-top-3 lg:-right-3"
              >
                <div className="bg-slate-900 text-white rounded-full px-3 md:px-4 py-1.5 md:py-2 shadow-xl flex items-center gap-2">
                  <Star className="h-3 md:h-4 w-3 md:w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-xs md:text-sm">{t("hero_rating")}</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Features Section
const FeaturesSection = () => {
  const { t } = useTranslation("landing");

  const features = [
    {
      icon: <Shield className="h-6 w-6 text-white" />,
      title: t("feature_1_title"),
      description: t("feature_1_desc"),
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-white" />,
      title: t("feature_2_title"),
      description: t("feature_2_desc"),
      color: "from-teal-500 to-teal-600"
    },
    {
      icon: <BadgeCheck className="h-6 w-6 text-white" />,
      title: t("feature_3_title"),
      description: t("feature_3_desc"),
      color: "from-indigo-500 to-indigo-600"
    },
    {
      icon: <Highlighter className="h-6 w-6 text-white" />,
      title: t("feature_4_title"),
      description: t("feature_4_desc"),
      color: "from-yellow-500 to-yellow-600"
    },
    {
      icon: <List className="h-6 w-6 text-white" />,
      title: t("feature_5_title"),
      description: t("feature_5_desc"),
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: <StickyNote className="h-6 w-6 text-white" />,
      title: t("feature_6_title"),
      description: t("feature_6_desc"),
      color: "from-green-500 to-green-600"
    }
  ];

  return (
    <section className="py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8" aria-label={t("features_title")}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <Badge variant="secondary" className="mb-3 md:mb-4 text-xs md:text-sm">
            {t("features_badge")}
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4">
            {t("features_title")}
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("features_subtitle")}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <Card className="h-full hover:shadow-xl hover:border-primary/50 transition-all duration-300 ease-out border-2 transform hover:-translate-y-1">
                <CardHeader className="space-y-4">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg md:text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-sm md:text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Stats Section
const StatsSection = () => {
  const { t } = useTranslation("landing");

  const stats = [
    { icon: <Users className="h-10 md:h-12 w-10 md:w-12 mx-auto mb-3 md:mb-4 opacity-80" />, value: t("stat_1_value"), label: t("stat_1_label") },
    { icon: <BookOpen className="h-10 md:h-12 w-10 md:w-12 mx-auto mb-3 md:mb-4 opacity-80" />, value: t("stat_2_value"), label: t("stat_2_label") },
    { icon: <Award className="h-10 md:h-12 w-10 md:w-12 mx-auto mb-3 md:mb-4 opacity-80" />, value: t("stat_3_value"), label: t("stat_3_label") },
    { icon: <Zap className="h-10 md:h-12 w-10 md:w-12 mx-auto mb-3 md:mb-4 opacity-80" />, value: t("stat_4_value"), label: t("stat_4_label") }
  ];

  return (
    <section className="py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white" aria-label="Platform Statistics">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              {stat.icon}
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{stat.value}</p>
              <p className="text-xs sm:text-sm md:text-base text-blue-100">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Pricing Section
const PricingSection = () => {
  const { t } = useTranslation("landing");
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await subscriptionPlanService.getAllPlans();
        if (response.success && response.data) {
          // Sort plans by order or creation date
          const sortedPlans = response.data.sort((a, b) => a.order - b.order);
          setPlans(sortedPlans);
        } else {
          setError("Failed to load plans");
        }
      } catch (err) {
        console.error("Error fetching plans:", err);
        setError("Error loading pricing plans");
        // Fallback to hardcoded plans if API fails
        setPlans([
          {
            _id: "1",
            name: t("plan_1_name"),
            price: t("plan_1_price"),
            description: t("plan_1_desc"),
            features: [
              t("plan_1_feature_1"),
              t("plan_1_feature_2"),
              t("plan_1_feature_3"),
              t("plan_1_feature_4")
            ]
          },
          {
            _id: "2",
            name: t("plan_2_name"),
            price: t("plan_2_price"),
            description: t("plan_2_desc"),
            features: [
              t("plan_2_feature_1"),
              t("plan_2_feature_2"),
              t("plan_2_feature_3"),
              t("plan_2_feature_4"),
              t("plan_2_feature_5"),
              t("plan_2_feature_6")
            ]
          },
          {
            _id: "3",
            name: t("plan_3_name"),
            price: t("plan_3_price"),
            description: t("plan_3_desc"),
            features: [
              t("plan_3_feature_1"),
              t("plan_3_feature_2"),
              t("plan_3_feature_3"),
              t("plan_3_feature_4")
            ]
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [t]);

  return (
    <section className="py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8" aria-label={t("pricing_title")}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <Badge variant="secondary" className="mb-3 md:mb-4 text-xs md:text-sm">
            {t("pricing_badge")}
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4">
            {t("pricing_title")}
          </h2>
          <p className="text-base md:text-xl text-muted-foreground">
            {t("pricing_subtitle")}
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-6 max-w-5xl mx-auto">
            {plans.map((plan, index) => {
              const isPopular = index === Math.floor(plans.length / 2);
              return (
                <motion.div
                  key={plan._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex ${isPopular ? 'sm:col-span-2 lg:col-span-1 sm:max-w-sm lg:max-w-none' : ''}`}
                >
                  <Card className={`w-full h-full flex flex-col transition-all duration-300 transform hover:shadow-2xl ${isPopular ? 'border-primary border-2 shadow-xl ring-1 ring-primary/20 lg:scale-105 lg:shadow-2xl' : 'border-2 hover:border-primary/30'}`}>
                    <CardHeader className="space-y-4 pb-4">
                      {isPopular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600">{t("pricing_popular_badge")}</Badge>
                        </div>
                      )}
                      <CardTitle className="text-xl md:text-2xl">{plan.name}</CardTitle>
                      <CardDescription className="text-sm md:text-base">{plan.description}</CardDescription>
                      <div className="pt-2">
                        <span className="text-4xl md:text-5xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground text-sm md:text-base ml-1">{t("pricing_period")}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-grow">
                      <ul className="space-y-3">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm md:text-base">
                            <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <div className="p-6 pt-0">
                      <Button 
                        variant={isPopular ? "default" : "outline"}
                        className="w-full"
                        size="lg"
                      >
                        {isPopular ? t("plan_2_cta") : (index === 0 ? t("plan_1_cta") : t("plan_3_cta"))}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

// Testimonials Section
const TestimonialsSection = () => {
  const { t } = useTranslation("landing");

  const testimonials = [
    {
      name: t("testimonial_1_author"),
      role: t("testimonial_1_role"),
      content: t("testimonial_1_content"),
      rating: 5
    },
    {
      name: t("testimonial_2_author"),
      role: t("testimonial_2_role"),
      content: t("testimonial_2_content"),
      rating: 5
    },
    {
      name: t("testimonial_3_author"),
      role: t("testimonial_3_role"),
      content: t("testimonial_3_content"),
      rating: 5
    }
  ];

  return (
    <section className="py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50" aria-label={t("testimonials_title")}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <Badge variant="secondary" className="mb-3 md:mb-4 text-xs md:text-sm">
            {t("testimonials_badge")}
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4">
            {t("testimonials_title")}
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 transform hover:-translate-y-1">
                <CardContent className="pt-6 h-full flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 md:h-5 w-4 md:w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 flex-grow text-sm md:text-base leading-relaxed">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-sm md:text-base">{testimonial.name}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// FAQ Section
const FAQSection = () => {
  const { t } = useTranslation("landing");

  const faqs = [
    {
      question: t("faq_1_question"),
      answer: t("faq_1_answer")
    },
    {
      question: t("faq_2_question"),
      answer: t("faq_2_answer")
    },
    {
      question: t("faq_3_question"),
      answer: t("faq_3_answer")
    },
    {
      question: t("faq_4_question"),
      answer: t("faq_4_answer")
    }
  ];

  return (
    <section className="py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8" aria-label={t("faq_title")}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <Badge variant="secondary" className="mb-3 md:mb-4 text-xs md:text-sm">
            {t("faq_badge")}
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4">
            {t("faq_title")}
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow duration-300 border-2">
                <CardHeader className="space-y-3 pb-4">
                  <CardTitle className="text-base md:text-lg">{faq.question}</CardTitle>
                  <CardDescription className="text-sm md:text-base">
                    {faq.answer}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Contact Section
const ContactSection = () => {
  const { t } = useTranslation("landing");

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success(t("contact_success_message"));
  };

  return (
    <section className="py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50" aria-label={t("contact_title")}>
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6 md:space-y-8"
          >
            <div>
              <Badge variant="secondary" className="mb-3 md:mb-4 text-xs md:text-sm">
                {t("contact_badge")}
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4">
                {t("contact_title")}
              </h2>
              <p className="text-base md:text-lg text-muted-foreground">
                {t("contact_subtitle")}
              </p>
            </div>

            <div className="space-y-4 md:space-y-6">
              <div className="flex items-start gap-4 md:gap-5">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="h-5 md:h-6 w-5 md:w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm md:text-base">{t("contact_email_label")}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">{t("contact_email_value")}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 md:gap-5">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone className="h-5 md:h-6 w-5 md:w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm md:text-base">{t("contact_phone_label")}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">{t("contact_phone_value")}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 md:gap-5">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="h-5 md:h-6 w-5 md:w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm md:text-base">{t("contact_address_label")}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">{t("contact_address_value")}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="mt-8 lg:mt-0"
          >
            <Card className="border-2">
              <CardHeader className="space-y-3 pb-4">
                <CardTitle className="text-xl md:text-2xl">{t("contact_form_title")}</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  {t("contact_form_subtitle")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs md:text-sm font-medium">{t("contact_form_name")}</label>
                      <Input placeholder={t("contact_form_name_placeholder")} required className="text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs md:text-sm font-medium">{t("contact_form_email")}</label>
                      <Input type="email" placeholder={t("contact_form_email_placeholder")} required className="text-sm" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs md:text-sm font-medium">{t("contact_form_subject")}</label>
                    <Input placeholder={t("contact_form_subject_placeholder")} required className="text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs md:text-sm font-medium">{t("contact_form_message")}</label>
                    <Textarea 
                      placeholder={t("contact_form_message_placeholder")}
                      rows={4}
                      required
                      className="text-sm resize-none"
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    {t("contact_form_submit")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Footer
const Footer = () => {
  const { t } = useTranslation("landing");

  return (
    <footer className="bg-slate-900 text-white py-12 md:py-16 px-4 sm:px-6 lg:px-8" role="contentinfo">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8">
          <div className="col-span-2 sm:col-span-1">
            <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 md:h-6 md:w-6" />
              {t("footer_brand")}
            </h3>
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
              {t("footer_brand_description")}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">{t("footer_product_title")}</h4>
            <ul className="space-y-2 text-xs md:text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">{t("footer_product_link_1")}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t("footer_product_link_2")}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t("footer_product_link_3")}</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">{t("footer_support_title")}</h4>
            <ul className="space-y-2 text-xs md:text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">{t("footer_support_link_1")}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t("footer_support_link_2")}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t("footer_support_link_3")}</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">{t("footer_social_title")}</h4>
            <div className="flex gap-3">
              <a href="#" className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors" aria-label="Facebook">
                <Facebook className="h-4 md:h-5 w-4 md:w-5" />
              </a>
              <a href="#" className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors" aria-label="Twitter">
                <Twitter className="h-4 md:h-5 w-4 md:w-5" />
              </a>
              <a href="#" className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors" aria-label="Instagram">
                <Instagram className="h-4 md:h-5 w-4 md:w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <Separator className="bg-slate-800 mb-8" />
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs md:text-sm text-slate-400">
          <p>{t("footer_copyright")}</p>
          <div className="flex gap-4 md:gap-6">
            <a href="#" className="hover:text-white transition-colors">{t("footer_terms")}</a>
            <a href="#" className="hover:text-white transition-colors">{t("footer_privacy")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingPage;
