import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SubscriptionPlan from './models/subscriptionPlanModel.js';

dotenv.config();

const seedSubscriptionPlans = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URL);
        console.log('✓ Connected to MongoDB');

        // Clear existing subscription plans
        await SubscriptionPlan.deleteMany({});
        console.log('✓ Cleared existing subscription plans');

        // Create 3 basic subscription plans
        const plans = await SubscriptionPlan.insertMany([
            {
                name: 'Plan Gratuit',
                description: 'Accès limité aux ressources d\'apprentissage',
                price: 0,
                oldPrice: null,
                features: [
                    'Accès à 5 examens',
                    'Accès à 3 modules',
                    '1 résumé par mois',
                    'Support communautaire'
                ],
                status: 'Active',
                order: 1
            },
            {
                name: 'Plan Étudiant',
                description: 'Accès complet aux ressources pour étudiants',
                price: 49,
                oldPrice: 99,
                features: [
                    'Accès illimité aux examens',
                    'Accès illimité aux modules',
                    'Résumés illimités',
                    'Explications détaillées',
                    'Playlists d\'étude personnalisées',
                    'Support prioritaire par email',
                    'Statistiques d\'apprentissage avancées',
                    'Téléchargement hors ligne'
                ],
                status: 'Active',
                order: 2
            },
            {
                name: 'Plan Premium',
                description: 'Accès premium avec support personnel',
                price: 99,
                oldPrice: 199,
                features: [
                    'Accès illimité à toutes les ressources',
                    'Support personnalisé 24/7',
                    'Mentorat avec les meilleurs étudiants',
                    'Accès aux webinaires exclusifs',
                    'Plans d\'étude sur mesure',
                    'Suivi de progression détaillé',
                    'Accès prioritaire aux nouveaux contenus',
                    'Certificat de réussite',
                    'Garantie de satisfaction 30 jours'
                ],
                status: 'Active',
                order: 3
            }
        ]);

        console.log(`✓ Created ${plans.length} subscription plans:`);
        plans.forEach((plan, index) => {
            console.log(`  ${index + 1}. ${plan.name} - ${plan.price}DH (${plan.features.length} features)`);
        });

        await mongoose.disconnect();
        console.log('✓ Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('✗ Error seeding subscription plans:', error);
        process.exit(1);
    }
};

seedSubscriptionPlans();
