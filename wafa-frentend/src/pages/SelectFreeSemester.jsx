import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, Sparkles, ChevronRight, Loader2, Check, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { userService } from '@/services/userService';
import logo from '@/assets/logo.png';

// Free plan semesters only: S1, S3, S5, S7, S9
const semesters = [
  { id: 'S1', name: 'Semestre 1', year: '1ère année', description: 'Anatomie 1', module: 'Anatomie 1' },
  { id: 'S3', name: 'Semestre 3', year: '2ème année', description: 'Anatomie 3', module: 'Anatomie 3' },
  { id: 'S5', name: 'Semestre 5', year: '3ème année', description: 'Parasitologie / Infection', module: 'Parasitologie' },
  { id: 'S7', name: 'Semestre 7', year: '4ème année', description: 'Maladies de l\'enfant', module: 'Maladies de l\'enfant' },
  { id: 'S9', name: 'Semestre 9', year: '5ème année', description: 'Réanimation urgence douleur / Soins palliatifs', module: 'Réanimation' },
];

const SelectFreeSemester = () => {
  const navigate = useNavigate();
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user needs to select semester
    const checkStatus = async () => {
      try {
        const response = await userService.checkFreeSemesterStatus();
        if (!response.data.needsToSelectSemester) {
          // User already has a semester or has used their free selection
          navigate('/dashboard/home');
        }
      } catch (error) {
        console.error('Error checking semester status:', error);
        // If error, still allow selection (fallback)
      } finally {
        setIsChecking(false);
      }
    };

    checkStatus();
  }, [navigate]);

  const handleSelectSemester = async () => {
    if (!selectedSemester) {
      toast.error('Veuillez sélectionner un semestre');
      return;
    }

    setIsLoading(true);

    try {
      const response = await userService.selectFreeSemester(selectedSemester);

      if (response.success) {
        toast.success('Semestre activé !', {
          description: `Vous avez maintenant accès au ${selectedSemester}`,
          duration: 5000,
        });

        // Clear and refresh user profile cache
        userService.clearProfileCache();

        // Redirect to dashboard after short delay
        setTimeout(() => {
          navigate('/dashboard/home');
        }, 1500);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Une erreur est survenue';
      
      if (error.response?.data?.alreadyUsed) {
        toast.error('Semestre déjà utilisé', {
          description: 'Vous avez déjà sélectionné votre semestre gratuit. Passez à Premium pour plus d\'accès.',
          action: {
            label: 'Voir les abonnements',
            onClick: () => navigate('/dashboard/subscription')
          }
        });
        navigate('/dashboard/home');
      } else {
        toast.error('Erreur', { description: message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-8 px-4">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-100 rounded-full opacity-30 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-teal-100 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <img
            src={logo}
            alt="Imrs-Qcma Logo"
            className="h-16 w-auto mx-auto mb-6"
          />
          
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-4 py-2 rounded-full mb-4">
            <Gift className="h-5 w-5" />
            <span className="font-medium">Offre de bienvenue</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
            Choisissez votre semestre gratuit
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            En tant que nouvel utilisateur, vous bénéficiez d'un accès gratuit à <span className="font-semibold text-blue-600">un semestre de votre choix</span> avec un module dédié. 
            Sélectionnez celui qui correspond à votre niveau actuel.
          </p>
        </motion.div>

        {/* Semester Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8"
        >
          {semesters.map((semester, index) => (
            <motion.div
              key={semester.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Card
                onClick={() => setSelectedSemester(semester.id)}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                  selectedSemester === semester.id
                    ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-300'
                    : 'hover:border-blue-200'
                }`}
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${
                    selectedSemester === semester.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {selectedSemester === semester.id ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <BookOpen className="h-6 w-6" />
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-slate-800">{semester.id}</h3>
                  <p className="text-xs text-slate-500 mt-1">{semester.year}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Selected Semester Details */}
        {selectedSemester && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-xl">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <GraduationCap className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      {semesters.find(s => s.id === selectedSemester)?.name}
                    </h3>
                    <p className="text-blue-100">
                      {semesters.find(s => s.id === selectedSemester)?.year} • {semesters.find(s => s.id === selectedSemester)?.description}
                    </p>
                  </div>
                </div>
                <Sparkles className="h-8 w-8 text-amber-300" />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Button
            onClick={handleSelectSemester}
            disabled={!selectedSemester || isLoading}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Activation en cours...
              </>
            ) : (
              <>
                Activer mon semestre gratuit
                <ChevronRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>

          <p className="text-sm text-slate-500 mt-4">
            💡 Vous pourrez accéder à d'autres semestres en passant à Premium
          </p>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="p-6">
              <h4 className="font-semibold text-slate-800 mb-3">Ce que vous obtenez avec votre compte gratuit :</h4>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Accès complet à un module du semestre choisi
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  QCM et exercices illimités pour ce module
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Suivi de votre progression
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Accès au classement (Leaderboard)
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default SelectFreeSemester;
