import mongoose from "mongoose";

const landingPageSettingsSchema = new mongoose.Schema(
    {
        // Hero Section
        heroTitle: {
            type: String,
            default: "Préparez vos examens avec WAFA",
        },
        heroSubtitle: {
            type: String,
            default: "La plateforme #1 pour les étudiants en médecine au Maroc",
        },
        heroDescription: {
            type: String,
            default: "Accédez à des milliers de QCM, examens corrigés et résumés pour réussir vos études.",
        },

        // Timer/Countdown Section
        timerEnabled: {
            type: Boolean,
            default: false,
        },
        timerEndDate: {
            type: Date,
            default: null,
        },
        timerTitle: {
            type: String,
            default: "Offre spéciale se termine dans",
        },

        // Pricing Section
        pricingTitle: {
            type: String,
            default: "Nos Abonnements",
        },
        pricingSubtitle: {
            type: String,
            default: "Choisissez le plan qui vous convient",
        },
        
        // Individual plan prices and features
        freePlanFeatures: {
            type: [String],
            default: ["Accès limité aux QCM", "Statistiques de base", "1 module gratuit"],
        },
        premiumMonthlyPrice: {
            type: Number,
            default: 49,
        },
        premiumMonthlyFeatures: {
            type: [String],
            default: ["Accès illimité aux QCM", "Tous les modules", "Statistiques avancées", "Support prioritaire"],
        },
        premiumAnnualPrice: {
            type: Number,
            default: 399,
        },
        premiumAnnualFeatures: {
            type: [String],
            default: ["Tout Premium mensuel", "2 mois gratuits", "Contenu exclusif", "Accès anticipé aux nouveautés"],
        },

        // FAQ Section
        faqTitle: {
            type: String,
            default: "Questions Fréquentes",
        },
        faqItems: {
            type: [{
                question: String,
                answer: String,
            }],
            default: [
                { question: "Comment fonctionne WAFA?", answer: "WAFA est une plateforme d'apprentissage..." },
                { question: "Puis-je annuler mon abonnement?", answer: "Oui, vous pouvez annuler à tout moment..." },
            ],
        },

        // Contact Section
        contactEmail: {
            type: String,
            default: "contact@wafa.ma",
        },
        contactPhone: {
            type: String,
            default: "+212 6XX XXX XXX",
        },
        whatsappNumber: {
            type: String,
            default: "+212600000000",
        },

        // Social Links
        facebookUrl: {
            type: String,
            default: "",
        },
        instagramUrl: {
            type: String,
            default: "",
        },
        youtubeUrl: {
            type: String,
            default: "",
        },

        // Promotion Banner
        promotionEnabled: {
            type: Boolean,
            default: false,
        },
        promotionText: {
            type: String,
            default: "",
        },
        promotionLink: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

// Ensure only one settings document exists
landingPageSettingsSchema.statics.getSettings = async function() {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

export default mongoose.model("LandingPageSettings", landingPageSettingsSchema);
