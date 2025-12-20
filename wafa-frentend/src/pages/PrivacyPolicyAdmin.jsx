import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Shield, Save, Loader2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const PrivacyPolicyAdmin = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    fetchPolicy();
  }, []);

  const fetchPolicy = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/settings/privacy-policy`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setContent(response.data.data?.content || '');
        setLastSaved(response.data.data?.updatedAt);
      }
    } catch (error) {
      console.error('Error fetching privacy policy:', error);
      // If no policy exists yet, start with default content
      setContent(getDefaultContent());
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await axios.put(
        `${API_URL}/settings/privacy-policy`,
        { content },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Politique de confidentialité enregistrée avec succès');
        setLastSaved(new Date().toISOString());
      }
    } catch (error) {
      console.error('Error saving privacy policy:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const getDefaultContent = () => {
    return `# Politique de Confidentialité - WAFA

Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}

## 1. Introduction

Bienvenue sur WAFA. Nous nous engageons à protéger votre vie privée et vos données personnelles.

## 2. Collecte de Données

Nous collectons les informations suivantes :
- Nom et prénom
- Adresse e-mail
- Informations d'authentification
- Données d'utilisation de la plateforme

## 3. Utilisation des Données

Vos données sont utilisées pour :
- Fournir et améliorer nos services
- Personnaliser votre expérience
- Communiquer avec vous
- Assurer la sécurité de la plateforme

## 4. Conditions de l'Utilisation

En utilisant la plateforme WAFA, vous acceptez les conditions suivantes :

### Utilisation Acceptable
- Utiliser la plateforme uniquement à des fins éducatives personnelles
- Respecter les droits de propriété intellectuelle
- Maintenir un comportement respectueux envers les autres utilisateurs
- Signaler tout contenu inapproprié ou erreur
- Respecter les règles du système de points et du classement

### Utilisations Interdites
- Partager, revendre ou distribuer le contenu de la plateforme
- Copier ou reproduire les questions, explications ou résumés
- Utiliser des scripts, bots ou outils automatisés
- Tenter de contourner les mesures de sécurité
- Créer plusieurs comptes pour manipuler le classement
- Publier du contenu offensant, diffamatoire ou illégal

### Compte Utilisateur
- Un compte est strictement personnel et ne peut être partagé
- Vous êtes responsable de la confidentialité de vos identifiants
- Toute violation peut entraîner la suspension de votre compte

## 5. Sécurité

Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données.

## 6. Vos Droits

Vous avez le droit de :
- Accéder à vos données
- Rectifier vos données
- Supprimer vos données
- Vous opposer au traitement

## 7. Cookies

Nous utilisons des cookies pour améliorer votre expérience.

## 8. Abonnements et Paiements

- Les paiements sont traités de manière sécurisée via PayPal
- Les abonnements sont facturés selon la période choisie
- Le renouvellement est automatique sauf annulation préalable
- Remboursement possible dans les 14 jours suivant l'achat

## 9. Contact

Pour toute question concernant cette politique, contactez-nous à : contact@wafa.ma
`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Politique de Confidentialité</h1>
          <p className="text-muted-foreground">
            Gérez le contenu de votre politique de confidentialité
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contenu de la Politique</CardTitle>
          <CardDescription>
            Rédigez votre politique de confidentialité en format Markdown.
            {lastSaved && (
              <span className="block mt-2 text-xs text-green-600">
                Dernière sauvegarde : {new Date(lastSaved).toLocaleString('fr-FR')}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Contenu (Markdown supporté)</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              className="font-mono text-sm"
              placeholder="Rédigez votre politique de confidentialité..."
            />
            <p className="text-xs text-muted-foreground">
              Utilisez Markdown pour formater le texte (# pour les titres, ** pour le gras, etc.)
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Enregistrer
            </Button>
            <Button variant="outline" asChild>
              <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                <Eye className="h-4 w-4 mr-2" />
                Prévisualiser
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">Aide Markdown</CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-1 font-mono">
          <p># Titre niveau 1</p>
          <p>## Titre niveau 2</p>
          <p>**Texte en gras**</p>
          <p>*Texte en italique*</p>
          <p>- Liste à puces</p>
          <p>[Lien](https://example.com)</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyPolicyAdmin;
