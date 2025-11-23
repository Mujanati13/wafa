import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
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
  Instagram
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

const LandingPage = () => {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 min-h-screen">
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
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30 pt-20">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <Badge variant="secondary" className="gap-2 text-sm">
              <Sparkles className="h-3 w-3" />
              {t("hero_badge")}
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-slate-900">
              {t("hero_title_part1")}{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {t("hero_title_highlight")}
              </span>
              <br />
              {t("hero_title_part2")}
            </h1>

            <p className="text-base md:text-lg text-slate-600 max-w-xl leading-relaxed">
              {t("hero_description")}
            </p>

            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">{t("hero_benefit_1")}</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">{t("hero_benefit_2")}</span>
              </div>
            </div>
          </motion.div>

          {/* Right: Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:flex justify-center relative"
          >
            <div className="relative">
              <Card className="w-[420px] shadow-2xl border-2">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {/* Header with gradient circle */}
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <GraduationCap className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg text-slate-900">{t("hero_card_title")}</p>
                        <p className="text-sm text-slate-500">{t("hero_card_subtitle")}</p>
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
                        <BookOpen className="h-5 w-5 text-blue-500" />
                        <span className="text-sm font-medium text-slate-700">{t("hero_card_feature_1")}</span>
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center gap-3"
                      >
                        <Award className="h-5 w-5 text-yellow-500" />
                        <span className="text-sm font-medium text-slate-700">{t("hero_card_feature_2")}</span>
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex items-center gap-3"
                      >
                        <Users className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium text-slate-700">{t("hero_card_feature_3")}</span>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Floating rating badge */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-3 -right-3"
              >
                <div className="bg-slate-900 text-white rounded-full px-4 py-2 shadow-xl flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-sm">{t("hero_rating")}</span>
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
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="secondary" className="mb-4">
            {t("features_badge")}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t("features_title")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("features_subtitle")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-2">
                <CardHeader>
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription className="text-base">
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
    { icon: <Users className="h-12 w-12 mx-auto mb-4 opacity-80" />, value: t("stat_1_value"), label: t("stat_1_label") },
    { icon: <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-80" />, value: t("stat_2_value"), label: t("stat_2_label") },
    { icon: <Award className="h-12 w-12 mx-auto mb-4 opacity-80" />, value: t("stat_3_value"), label: t("stat_3_label") },
    { icon: <Zap className="h-12 w-12 mx-auto mb-4 opacity-80" />, value: t("stat_4_value"), label: t("stat_4_label") }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
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
              <p className="text-4xl font-bold mb-2">{stat.value}</p>
              <p className="text-blue-100">{stat.label}</p>
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

  const plans = [
    {
      name: t("plan_1_name"),
      price: t("plan_1_price"),
      period: t("pricing_period"),
      description: t("plan_1_desc"),
      features: [
        t("plan_1_feature_1"),
        t("plan_1_feature_2"),
        t("plan_1_feature_3"),
        t("plan_1_feature_4")
      ],
      cta: t("plan_1_cta"),
      variant: "outline"
    },
    {
      name: t("plan_2_name"),
      price: t("plan_2_price"),
      period: t("pricing_period"),
      description: t("plan_2_desc"),
      features: [
        t("plan_2_feature_1"),
        t("plan_2_feature_2"),
        t("plan_2_feature_3"),
        t("plan_2_feature_4"),
        t("plan_2_feature_5"),
        t("plan_2_feature_6")
      ],
      cta: t("plan_2_cta"),
      variant: "default",
      popular: true
    },
    {
      name: t("plan_3_name"),
      price: t("plan_3_price"),
      period: t("pricing_period"),
      description: t("plan_3_desc"),
      features: [
        t("plan_3_feature_1"),
        t("plan_3_feature_2"),
        t("plan_3_feature_3"),
        t("plan_3_feature_4")
      ],
      cta: t("plan_3_cta"),
      variant: "outline"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="secondary" className="mb-4">
            {t("pricing_badge")}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t("pricing_title")}
          </h2>
          <p className="text-xl text-muted-foreground">
            {t("pricing_subtitle")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`h-full ${plan.popular ? 'border-primary border-2 shadow-xl' : ''}`}>
                <CardHeader>
                  {plan.popular && (
                    <Badge className="w-fit mb-2">{t("pricing_popular_badge")}</Badge>
                  )}
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant={plan.variant} 
                    className="w-full"
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
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
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="secondary" className="mb-4">
            {t("testimonials_badge")}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t("testimonials_title")}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
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
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="secondary" className="mb-4">
            {t("faq_badge")}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
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
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                  <CardDescription className="text-base">
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
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="secondary" className="mb-4">
              {t("contact_badge")}
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t("contact_title")}
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              {t("contact_subtitle")}
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{t("contact_email_label")}</p>
                  <p className="text-sm text-muted-foreground">{t("contact_email_value")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{t("contact_phone_label")}</p>
                  <p className="text-sm text-muted-foreground">{t("contact_phone_value")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{t("contact_address_label")}</p>
                  <p className="text-sm text-muted-foreground">{t("contact_address_value")}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{t("contact_form_title")}</CardTitle>
                <CardDescription>
                  {t("contact_form_subtitle")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("contact_form_name")}</label>
                      <Input placeholder={t("contact_form_name_placeholder")} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("contact_form_email")}</label>
                      <Input type="email" placeholder={t("contact_form_email_placeholder")} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("contact_form_subject")}</label>
                    <Input placeholder={t("contact_form_subject_placeholder")} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("contact_form_message")}</label>
                    <Textarea 
                      placeholder={t("contact_form_message_placeholder")}
                      rows={5}
                      required
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
    <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <GraduationCap className="h-6 w-6" />
              {t("footer_brand")}
            </h3>
            <p className="text-slate-400 text-sm">
              {t("footer_brand_description")}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t("footer_product_title")}</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">{t("footer_product_link_1")}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t("footer_product_link_2")}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t("footer_product_link_3")}</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t("footer_support_title")}</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">{t("footer_support_link_1")}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t("footer_support_link_2")}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t("footer_support_link_3")}</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t("footer_social_title")}</h4>
            <div className="flex gap-4">
              <a href="#" className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <Separator className="bg-slate-800 mb-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
          <p>{t("footer_copyright")}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">{t("footer_terms")}</a>
            <a href="#" className="hover:text-white transition-colors">{t("footer_privacy")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingPage;
