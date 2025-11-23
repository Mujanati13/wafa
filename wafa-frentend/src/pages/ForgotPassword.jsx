import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { sendPasswordResetEmail } from '@/services/authService';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await sendPasswordResetEmail(email);

      if (result.success) {
        setIsSubmitted(true);
        toast.success('Email envoyé!', {
          description: 'Vérifiez votre boîte de réception pour réinitialiser votre mot de passe.',
          duration: 5000,
        });
      }
    } catch (err) {
      const errorMessage = err.message || 'Une erreur est survenue. Veuillez réessayer.';
      setError(errorMessage);
      toast.error('Erreur', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center px-4 py-8">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/90">
          {!isSubmitted ? (
            <>
              {/* Logo */}
              <div className="flex justify-center pt-8 pb-2">
                <img src={logo} alt="Logo" className="h-16 w-auto" />
              </div>

              <CardHeader className="text-center space-y-2 pb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="flex justify-center mb-2"
                >
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center">
                    <Mail className="h-8 w-8 text-blue-600" />
                  </div>
                </motion.div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                  Mot de passe oublié ?
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Entrez votre email et nous vous enverrons un lien Firebase pour réinitialiser votre mot de passe.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Adresse email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="votre@email.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:opacity-90 text-white font-medium"
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2"
                        >
                          <Mail className="h-4 w-4" />
                        </motion.div>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Envoyer le lien de réinitialisation
                      </>
                    )}
                  </Button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => window.location.href = '/login'}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    >
                      ← Retour à la connexion
                    </button>
                  </div>
                </form>

                <div className="pt-4 border-t">
                  <p className="text-xs text-center text-gray-500">
                    Vous recevrez un email avec un lien sécurisé pour réinitialiser votre mot de passe.
                  </p>
                </div>
              </CardContent>
            </>
          ) : (
            <>
              {/* Logo */}
              <div className="flex justify-center pt-8 pb-2">
                <img src={logo} alt="Logo" className="h-16 w-auto" />
              </div>

              <CardContent className="p-8 text-center space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                  className="flex justify-center"
                >
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-3"
                >
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Email envoyé avec succès ! 📧
                  </h2>
                  <p className="text-gray-600">
                    Un lien de réinitialisation Firebase a été envoyé à <span className="font-semibold text-gray-900">{email}</span>
                  </p>
                </motion.div>

                <Alert className="border-blue-200 bg-blue-50 text-left">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 ml-2">
                    <strong>Prochaines étapes :</strong>
                    <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                      <li>Consultez votre boîte de réception</li>
                      <li>Cliquez sur le lien dans l'email</li>
                      <li>Créez un nouveau mot de passe</li>
                    </ol>
                  </AlertDescription>
                </Alert>

                <p className="text-sm text-gray-500">
                  Vous n'avez pas reçu l'email ? Vérifiez votre dossier <strong>spam</strong> ou <strong>courrier indésirable</strong>.
                </p>

                <div className="space-y-2">
                  <Button 
                    asChild 
                    className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:opacity-90 text-white"
                  >
                    <Link to="/login">
                      Retour à la connexion
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setIsSubmitted(false);
                      setEmail('');
                    }}
                    className="w-full"
                  >
                    Envoyer à une autre adresse
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-sm text-gray-600"
        >
          <p>Besoin d'aide ? Contactez notre support</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
