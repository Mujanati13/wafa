import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, CreditCard, Shield, Eye, EyeOff } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const AdminPaypalSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [settings, setSettings] = useState({
    clientId: "",
    clientSecret: "",
    mode: "sandbox",
    currency: "MAD",
    isActive: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/paypal-settings`, {
        withCredentials: true,
      });
      if (response.data.success && response.data.data) {
        setSettings({
          clientId: response.data.data.clientId || "",
          clientSecret: response.data.data.clientSecret || "",
          mode: response.data.data.mode || "sandbox",
          currency: response.data.data.currency || "MAD",
          isActive: response.data.data.isActive || false,
        });
      }
    } catch (error) {
      console.error("Error fetching PayPal settings:", error);
      // If no settings exist yet, keep defaults
      if (error.response?.status !== 404) {
        toast.error("Erreur lors du chargement des paramètres PayPal");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings.clientId || !settings.clientSecret) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      setSaving(true);
      const response = await axios.put(
        `${API_URL}/paypal-settings`,
        settings,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Paramètres PayPal enregistrés avec succès");
        // Refresh to get masked secret
        fetchSettings();
      }
    } catch (error) {
      console.error("Error saving PayPal settings:", error);
      toast.error(error.response?.data?.error || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
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
        <CreditCard className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Paramètres PayPal</h1>
          <p className="text-muted-foreground">
            Configurez vos identifiants PayPal pour recevoir les paiements
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Credentials Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Identifiants API
            </CardTitle>
            <CardDescription>
              Entrez vos identifiants PayPal Developer. Vous pouvez les trouver sur{" "}
              <a
                href="https://developer.paypal.com/dashboard/applications"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                developer.paypal.com
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Client ID *</Label>
              <Input
                id="clientId"
                placeholder="AX..."
                value={settings.clientId}
                onChange={(e) => handleChange("clientId", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientSecret">Client Secret *</Label>
              <div className="relative">
                <Input
                  id="clientSecret"
                  type={showSecret ? "text" : "password"}
                  placeholder="••••••••••••••••"
                  value={settings.clientSecret}
                  onChange={(e) => handleChange("clientSecret", e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowSecret(!showSecret)}
                >
                  {showSecret ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Le secret est chiffré et sécurisé
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Card */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>
              Paramètres de fonctionnement de PayPal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="mode">Mode</Label>
              <Select
                value={settings.mode}
                onValueChange={(value) => handleChange("mode", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-yellow-500" />
                      Sandbox (Test)
                    </div>
                  </SelectItem>
                  <SelectItem value="production">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      Production (Live)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {settings.mode === "sandbox"
                  ? "Mode test - aucun paiement réel ne sera effectué"
                  : "Mode production - les paiements sont réels"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Devise</Label>
              <Select
                value={settings.currency}
                onValueChange={(value) => handleChange("currency", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la devise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MAD">MAD - Dirham Marocain</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="USD">USD - Dollar Américain</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Activer les paiements</Label>
                <p className="text-sm text-muted-foreground">
                  {settings.isActive
                    ? "Les utilisateurs peuvent effectuer des paiements"
                    : "Les paiements sont désactivés"}
                </p>
              </div>
              <Switch
                id="isActive"
                checked={settings.isActive}
                onCheckedChange={(checked) => handleChange("isActive", checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status & Save */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`h-3 w-3 rounded-full ${
                  settings.isActive && settings.clientId && settings.clientSecret
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              />
              <span className="text-sm">
                {settings.isActive && settings.clientId && settings.clientSecret
                  ? "PayPal est configuré et actif"
                  : "PayPal n'est pas configuré ou désactivé"}
              </span>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer les paramètres"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Comment obtenir vos identifiants PayPal ?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <ol className="list-decimal list-inside space-y-2">
            <li>
              Connectez-vous à{" "}
              <a
                href="https://developer.paypal.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                developer.paypal.com
              </a>
            </li>
            <li>Allez dans "Dashboard" → "My Apps & Credentials"</li>
            <li>Créez une nouvelle application ou sélectionnez une existante</li>
            <li>Copiez le "Client ID" et le "Secret" (cliquez sur "Show")</li>
            <li>Commencez en mode Sandbox pour tester, puis passez en Production</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPaypalSettings;
