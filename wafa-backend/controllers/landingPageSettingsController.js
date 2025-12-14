import LandingPageSettings from "../models/landingPageSettingsModel.js";
import asyncHandler from '../handlers/asyncHandler.js';

export const landingPageSettingsController = {
    // Get current settings
    getSettings: asyncHandler(async (req, res) => {
        const settings = await LandingPageSettings.getSettings();
        res.status(200).json({
            success: true,
            data: settings
        });
    }),

    // Update settings
    updateSettings: asyncHandler(async (req, res) => {
        let settings = await LandingPageSettings.findOne();
        
        if (!settings) {
            settings = await LandingPageSettings.create(req.body);
        } else {
            // Update only provided fields
            Object.keys(req.body).forEach(key => {
                if (req.body[key] !== undefined) {
                    settings[key] = req.body[key];
                }
            });
            await settings.save();
        }

        res.status(200).json({
            success: true,
            data: settings,
            message: "Paramètres mis à jour avec succès"
        });
    }),

    // Update hero section
    updateHero: asyncHandler(async (req, res) => {
        const { heroTitle, heroSubtitle, heroDescription } = req.body;
        
        const settings = await LandingPageSettings.getSettings();
        if (heroTitle) settings.heroTitle = heroTitle;
        if (heroSubtitle) settings.heroSubtitle = heroSubtitle;
        if (heroDescription) settings.heroDescription = heroDescription;
        await settings.save();

        res.status(200).json({
            success: true,
            data: settings,
            message: "Section Hero mise à jour"
        });
    }),

    // Update timer settings
    updateTimer: asyncHandler(async (req, res) => {
        const { timerEnabled, timerEndDate, timerTitle } = req.body;
        
        const settings = await LandingPageSettings.getSettings();
        if (timerEnabled !== undefined) settings.timerEnabled = timerEnabled;
        if (timerEndDate !== undefined) settings.timerEndDate = timerEndDate;
        if (timerTitle) settings.timerTitle = timerTitle;
        await settings.save();

        res.status(200).json({
            success: true,
            data: settings,
            message: "Paramètres du timer mis à jour"
        });
    }),

    // Update pricing
    updatePricing: asyncHandler(async (req, res) => {
        const { 
            pricingTitle, 
            pricingSubtitle, 
            freePlanFeatures,
            premiumMonthlyPrice,
            premiumMonthlyFeatures,
            premiumAnnualPrice,
            premiumAnnualFeatures
        } = req.body;
        
        const settings = await LandingPageSettings.getSettings();
        
        if (pricingTitle) settings.pricingTitle = pricingTitle;
        if (pricingSubtitle) settings.pricingSubtitle = pricingSubtitle;
        if (freePlanFeatures) settings.freePlanFeatures = freePlanFeatures;
        if (premiumMonthlyPrice !== undefined) settings.premiumMonthlyPrice = premiumMonthlyPrice;
        if (premiumMonthlyFeatures) settings.premiumMonthlyFeatures = premiumMonthlyFeatures;
        if (premiumAnnualPrice !== undefined) settings.premiumAnnualPrice = premiumAnnualPrice;
        if (premiumAnnualFeatures) settings.premiumAnnualFeatures = premiumAnnualFeatures;
        
        await settings.save();

        res.status(200).json({
            success: true,
            data: settings,
            message: "Tarification mise à jour"
        });
    }),

    // Update FAQ
    updateFAQ: asyncHandler(async (req, res) => {
        const { faqTitle, faqItems } = req.body;
        
        const settings = await LandingPageSettings.getSettings();
        if (faqTitle) settings.faqTitle = faqTitle;
        if (faqItems) settings.faqItems = faqItems;
        await settings.save();

        res.status(200).json({
            success: true,
            data: settings,
            message: "FAQ mise à jour"
        });
    }),

    // Update contact info
    updateContact: asyncHandler(async (req, res) => {
        const { contactEmail, contactPhone, whatsappNumber, facebookUrl, instagramUrl, youtubeUrl } = req.body;
        
        const settings = await LandingPageSettings.getSettings();
        if (contactEmail) settings.contactEmail = contactEmail;
        if (contactPhone) settings.contactPhone = contactPhone;
        if (whatsappNumber) settings.whatsappNumber = whatsappNumber;
        if (facebookUrl !== undefined) settings.facebookUrl = facebookUrl;
        if (instagramUrl !== undefined) settings.instagramUrl = instagramUrl;
        if (youtubeUrl !== undefined) settings.youtubeUrl = youtubeUrl;
        await settings.save();

        res.status(200).json({
            success: true,
            data: settings,
            message: "Informations de contact mises à jour"
        });
    }),

    // Update promotion banner
    updatePromotion: asyncHandler(async (req, res) => {
        const { promotionEnabled, promotionText, promotionLink } = req.body;
        
        const settings = await LandingPageSettings.getSettings();
        if (promotionEnabled !== undefined) settings.promotionEnabled = promotionEnabled;
        if (promotionText) settings.promotionText = promotionText;
        if (promotionLink) settings.promotionLink = promotionLink;
        await settings.save();

        res.status(200).json({
            success: true,
            data: settings,
            message: "Bannière promotionnelle mise à jour"
        });
    }),
};
