import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Sparkles, Loader2, CheckCircle, XCircle, AlertCircle, Zap } from "lucide-react";
import { api } from "@/lib/utils";
import { toast } from "sonner";

const GenerateExplanationsAI = () => {
  const { t } = useTranslation(['admin', 'common']);

  const [modules, setModules] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);

  // Form state
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [questionNumbers, setQuestionNumbers] = useState("");
  const [language, setLanguage] = useState("fr");
  const [mode, setMode] = useState("single"); // single or batch

  // Results state
  const [results, setResults] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [modulesRes, examsRes] = await Promise.all([
        api.get("/modules"),
        api.get("/exams/all")
      ]);
      setModules(modulesRes.data?.data || []);
      setExams(examsRes.data?.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const getExamsForModule = (moduleId) => {
    return exams.filter(e => (e.moduleId?._id || e.moduleId) === moduleId);
  };

  const testConnection = async () => {
    try {
      setTestingConnection(true);
      const { data } = await api.get("/explanations/test-gemini");
      
      if (data.success) {
        setConnectionStatus("success");
        toast.success("✓ Connexion à Gemini AI réussie");
      } else {
        setConnectionStatus("error");
        toast.error("✗ Échec de connexion à Gemini AI");
      }
    } catch (error) {
      setConnectionStatus("error");
      toast.error("✗ Erreur de connexion: " + (error.response?.data?.message || error.message));
    } finally {
      setTestingConnection(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedExam || !questionNumbers.trim()) {
      toast.error("Veuillez sélectionner un examen et spécifier les numéros de questions");
      return;
    }

    try {
      setGenerating(true);
      setResults(null);

      if (mode === "single") {
        // Parse first question number for single mode
        const firstNum = questionNumbers.split(',')[0].trim();
        const questionNum = firstNum.includes('-') ? firstNum.split('-')[0] : firstNum;

        // Get the question ID
        const questionsRes = await api.get(`/questions/exam/${selectedExam}`);
        const questions = questionsRes.data?.data || [];
        
        const targetQuestion = questions.find((q, idx) => {
          const qNum = q.questionNumber || (idx + 1);
          return qNum === parseInt(questionNum);
        });

        if (!targetQuestion) {
          toast.error(`Question ${questionNum} non trouvée`);
          return;
        }

        // Generate single explanation
        const { data } = await api.post("/explanations/generate-gemini", {
          questionId: targetQuestion._id,
          language
        });

        if (data.success) {
          setResults({
            mode: 'single',
            success: true,
            explanation: data.data
          });
          toast.success("✓ Explication générée avec succès!");
        }
      } else {
        // Batch generation
        const { data } = await api.post("/explanations/batch-generate-gemini", {
          examId: selectedExam,
          questionNumbers,
          language
        });

        if (data.success) {
          setResults({
            mode: 'batch',
            ...data.data
          });
          toast.success(`✓ ${data.data.saved} explication(s) générée(s) avec succès!`);
          
          if (data.data.failed > 0) {
            toast.warning(`⚠ ${data.data.failed} explication(s) ont échoué`);
          }
        }
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(error.response?.data?.message || "Erreur lors de la génération");
      setResults({
        mode,
        success: false,
        error: error.response?.data?.message || error.message
      });
    } finally {
      setGenerating(false);
    }
  };

  const examsForModule = selectedModule ? getExamsForModule(selectedModule) : [];

  const canGenerate = selectedExam && questionNumbers.trim() && !generating;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Génération AI d'Explications
              </h1>
            </div>
            <p className="text-gray-600 mt-2">Utilisez Google Gemini pour générer automatiquement des explications pour vos questions</p>
          </div>
          
          <Button
            variant="outline"
            onClick={testConnection}
            disabled={testingConnection}
            className={`
              ${connectionStatus === 'success' ? 'border-green-500 text-green-600' : ''}
              ${connectionStatus === 'error' ? 'border-red-500 text-red-600' : ''}
            `}
          >
            {testingConnection ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Test en cours...
              </>
            ) : connectionStatus === 'success' ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Connexion OK
              </>
            ) : connectionStatus === 'error' ? (
              <>
                <XCircle className="w-4 h-4 mr-2" />
                Échec
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Tester la connexion
              </>
            )}
          </Button>
        </motion.div>

        {/* Configuration Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100">
              <CardTitle className="text-xl">Configuration</CardTitle>
              <CardDescription>Sélectionnez l'examen et les questions à générer</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Mode Selection */}
              <div className="space-y-2">
                <Label className="font-semibold text-gray-700">Mode de génération</Label>
                <Select value={mode} onValueChange={setMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Simple - Une question</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="batch">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        <span>Batch - Plusieurs questions</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  {mode === "single" 
                    ? "Génère une explication pour la première question spécifiée"
                    : "Génère des explications pour plusieurs questions (ex: 1-5,10,15)"}
                </p>
              </div>

              {/* Module Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-700">Module *</Label>
                  <Select 
                    value={selectedModule} 
                    onValueChange={(val) => {
                      setSelectedModule(val);
                      setSelectedExam("");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un module" />
                    </SelectTrigger>
                    <SelectContent>
                      {modules.map((m) => (
                        <SelectItem key={m._id} value={m._id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold text-gray-700">Examen *</Label>
                  <Select 
                    value={selectedExam} 
                    onValueChange={setSelectedExam}
                    disabled={!selectedModule}
                  >
                    <SelectTrigger className="disabled:bg-gray-100">
                      <SelectValue placeholder={selectedModule ? "Sélectionner un examen" : "Sélectionner un module d'abord"} />
                    </SelectTrigger>
                    <SelectContent>
                      {examsForModule.map((exam) => (
                        <SelectItem key={exam._id} value={exam._id}>
                          {exam.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Question Numbers */}
              <div className="space-y-2">
                <Label className="font-semibold text-gray-700">Numéros de questions *</Label>
                <Input
                  placeholder={mode === "single" ? "ex: 1" : "ex: 1-5,7,10-15"}
                  value={questionNumbers}
                  onChange={(e) => setQuestionNumbers(e.target.value)}
                  className="h-10"
                />
                <p className="text-xs text-gray-500">
                  {mode === "single" 
                    ? "Spécifier le numéro d'une question"
                    : "Utilisez des virgules et des tirets pour spécifier plusieurs questions"}
                </p>
              </div>

              {/* Language Selection */}
              <div className="space-y-2">
                <Label className="font-semibold text-gray-700">Langue</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">🇫🇷 Français</SelectItem>
                    <SelectItem value="en">🇬🇧 English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>

            <CardFooter className="bg-gray-50 border-t flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedModule("");
                  setSelectedExam("");
                  setQuestionNumbers("");
                  setResults(null);
                }}
              >
                Réinitialiser
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Générer {mode === "batch" ? "les explications" : "l'explication"}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Results Card */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-xl border-0">
              <CardHeader className={`${
                results.success || results.saved > 0
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50'
                  : 'bg-gradient-to-r from-red-50 to-orange-50'
              }`}>
                <CardTitle className="flex items-center gap-2">
                  {results.success || results.saved > 0 ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Résultats de la génération</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span>Erreur de génération</span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {results.mode === 'single' && results.success && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Explication créée avec succès</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <h3 className="font-semibold mb-2">{results.explanation.title}</h3>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        {results.explanation.contentText}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Badge className="bg-purple-100 text-purple-800">
                          Question ID: {results.explanation.questionId}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800">
                          {results.explanation.aiProvider}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {results.mode === 'batch' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <div className="text-2xl font-bold text-green-600">{results.saved}</div>
                        <div className="text-sm text-gray-600">Réussi</div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                        <div className="text-2xl font-bold text-red-600">{results.failed}</div>
                        <div className="text-sm text-gray-600">Échoué</div>
                      </div>
                    </div>

                    {results.errors && results.errors.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-orange-500" />
                          Erreurs détaillées
                        </h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {results.errors.map((err, idx) => (
                            <div key={idx} className="bg-red-50 rounded p-3 text-sm border border-red-200">
                              <div className="font-medium text-red-700">Question: {err.questionId}</div>
                              <div className="text-red-600">{err.reason}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {results.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-red-700">{results.error}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900 space-y-1">
                  <p className="font-medium">Note importante:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Les explications générées par AI sont automatiquement approuvées</li>
                    <li>Le mode batch respecte les limites de l'API (délai de 1s entre chaque génération)</li>
                    <li>Si une explication AI existe déjà pour une question, elle ne sera pas régénérée</li>
                    <li>Assurez-vous que votre clé API Gemini est configurée dans le fichier .env</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default GenerateExplanationsAI;
