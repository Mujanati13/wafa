import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
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
import { Sparkles, Loader2, CheckCircle, XCircle, AlertCircle, Zap, FileText, Upload, X, ChevronDown, ChevronUp, Copy, Download } from "lucide-react";
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

  // Advanced options
  const [customPrompt, setCustomPrompt] = useState("");
  const [pdfContext, setPdfContext] = useState("");
  const [uploadedPdf, setUploadedPdf] = useState(null);
  const [extractingPdf, setExtractingPdf] = useState(false);
  const pdfInputRef = useRef(null);

  // Module context files management
  const [moduleContextFiles, setModuleContextFiles] = useState([]);
  const [loadingModuleContext, setLoadingModuleContext] = useState(false);
  const [uploadingToModule, setUploadingToModule] = useState(false);
  const [showModuleContextSection, setShowModuleContextSection] = useState(false);
  const moduleContextInputRef = useRef(null);

  // Results state
  const [results, setResults] = useState(null);
  const [expandedResults, setExpandedResults] = useState(new Set());
  const [detailedResults, setDetailedResults] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch module context files when module is selected
  useEffect(() => {
    if (selectedModule) {
      fetchModuleContextFiles(selectedModule);
    } else {
      setModuleContextFiles([]);
    }
  }, [selectedModule]);

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

  const fetchModuleContextFiles = async (moduleId) => {
    if (!moduleId) return;
    
    try {
      setLoadingModuleContext(true);
      const { data } = await api.get(`/modules/${moduleId}/ai-context`);
      if (data.success) {
        setModuleContextFiles(data.data.aiContextFiles || []);
      }
    } catch (error) {
      console.error('Error fetching module context files:', error);
      setModuleContextFiles([]);
    } finally {
      setLoadingModuleContext(false);
    }
  };

  const handleModuleContextUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate all files are PDFs
    const invalidFiles = files.filter(f => f.type !== 'application/pdf');
    if (invalidFiles.length > 0) {
      toast.error("Tous les fichiers doivent être des PDFs");
      return;
    }

    // Validate file sizes (max 20MB each)
    const oversizedFiles = files.filter(f => f.size > 20 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error("Chaque PDF ne doit pas dépasser 20 Mo");
      return;
    }

    if (!selectedModule) {
      toast.error("Veuillez sélectionner un module d'abord");
      return;
    }

    setUploadingToModule(true);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('contextFiles', file);
      });

      const { data } = await api.post(`/modules/${selectedModule}/ai-context`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.success) {
        setModuleContextFiles(data.data.aiContextFiles || []);
        toast.success(`✓ ${files.length} fichier(s) ajouté(s) au module`);
      }
    } catch (error) {
      console.error("Module context upload error:", error);
      toast.error(error.response?.data?.message || "Erreur lors de l'upload");
    } finally {
      setUploadingToModule(false);
      if (moduleContextInputRef.current) {
        moduleContextInputRef.current.value = '';
      }
    }
  };

  const handleDeleteModuleContextFile = async (fileId) => {
    if (!selectedModule || !fileId) return;

    try {
      const { data } = await api.delete(`/modules/${selectedModule}/ai-context/${fileId}`);
      
      if (data.success) {
        setModuleContextFiles(data.data.remainingFiles || []);
        toast.success("✓ Fichier supprimé du module");
      }
    } catch (error) {
      console.error("Error deleting module context file:", error);
      toast.error("Erreur lors de la suppression");
    }
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

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error("Seuls les fichiers PDF sont acceptés");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error("Le PDF ne doit pas dépasser 20 Mo");
      return;
    }

    setUploadedPdf(file);
    setExtractingPdf(true);

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const { data } = await api.post('/explanations/upload-pdf-context', formData);

      if (data.success) {
        setPdfContext(data.data.text);
        toast.success(`✓ Texte extrait: ${data.data.length} caractères`);
      }
    } catch (error) {
      console.error("PDF extraction error:", error);
      toast.error("Erreur lors de l'extraction du PDF");
      setUploadedPdf(null);
    } finally {
      setExtractingPdf(false);
      if (pdfInputRef.current) {
        pdfInputRef.current.value = '';
      }
    }
  };

  const removePdfContext = () => {
    setUploadedPdf(null);
    setPdfContext("");
    if (pdfInputRef.current) {
      pdfInputRef.current.value = '';
    }
    toast.info("Contexte PDF supprimé");
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
          language,
          customPrompt: customPrompt.trim() || undefined,
          pdfContext: (pdfContext && typeof pdfContext === 'string' ? pdfContext.trim() : '') || undefined
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
          language,
          customPrompt: customPrompt.trim() || undefined,
          pdfContext: (pdfContext && typeof pdfContext === 'string' ? pdfContext.trim() : '') || undefined
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

  const toggleExpandResult = (index) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedResults(newExpanded);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copié dans le presse-papiers");
  };

  const downloadResults = () => {
    if (!results) return;
    
    let content = "Résultats de la Génération d'Explications IA\n";
    content += "=" .repeat(50) + "\n\n";
    
    if (results.mode === 'single' && results.explanation) {
      content += `Question: ${results.explanation.questionId}\n`;
      content += `Explication:\n${results.explanation.contentText}\n`;
    } else if (results.mode === 'batch' && detailedResults.length > 0) {
      detailedResults.forEach((result, idx) => {
        content += `\nQuestion ${idx + 1}:\n`;
        content += `${result.explanation || 'Erreur: ' + result.error}\n`;
        content += "-".repeat(40) + "\n";
      });
    }
    
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', 'explanations_ai.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast.success("Téléchargement commencé");
  };

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

              {/* Divider */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Options avancées (optionnel)
                </h3>

                {/* Module Context Files Section */}
                {selectedModule && (
                  <div className="space-y-3 mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-600" />
                        <h4 className="font-semibold text-gray-800">
                          Fichiers de contexte du module ({moduleContextFiles.length})
                        </h4>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowModuleContextSection(!showModuleContextSection)}
                        className="text-purple-600"
                      >
                        {showModuleContextSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </div>

                    <p className="text-xs text-gray-600">
                      📚 Ces fichiers sont sauvegardés dans le module et seront automatiquement utilisés pour toutes les générations futures
                    </p>

                    <AnimatePresence>
                      {showModuleContextSection && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3"
                        >
                          {/* Upload button */}
                          <div className="flex gap-2">
                            <input
                              type="file"
                              ref={moduleContextInputRef}
                              onChange={handleModuleContextUpload}
                              accept=".pdf"
                              multiple
                              className="hidden"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => moduleContextInputRef.current?.click()}
                              disabled={uploadingToModule || loadingModuleContext}
                              className="gap-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                            >
                              {uploadingToModule ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Upload...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4" />
                                  Ajouter des PDFs au module
                                </>
                              )}
                            </Button>
                          </div>

                          {/* List of module context files */}
                          {loadingModuleContext ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                            </div>
                          ) : moduleContextFiles.length > 0 ? (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {moduleContextFiles.map((file, idx) => (
                                <div
                                  key={file._id || idx}
                                  className="flex items-center justify-between bg-white border border-purple-200 rounded-lg px-3 py-2"
                                >
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <FileText className="w-4 h-4 text-purple-600 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-gray-700 truncate">{file.filename}</p>
                                      <p className="text-xs text-gray-500">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                        {file.uploadedAt && ` • ${new Date(file.uploadedAt).toLocaleDateString('fr-FR')}`}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteModuleContextFile(file._id)}
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 text-center py-3">
                              Aucun fichier de contexte. Ajoutez des PDFs pour améliorer les explications IA.
                            </p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Custom Prompt */}
                <div className="space-y-2 mb-4">
                  <Label className="font-semibold text-gray-700">Prompt personnalisé</Label>
                  <Textarea
                    placeholder="Entrez votre propre prompt pour personnaliser les explications. Utilisez {questionText}, {options}, {correctAnswers} comme variables."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="min-h-[100px] font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    💡 Variables disponibles: {"{questionText}"}, {"{options}"}, {"{correctAnswers}"}
                  </p>
                </div>

                {/* PDF Context Upload */}
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-700">Contexte PDF temporaire</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={pdfInputRef}
                      onChange={handlePdfUpload}
                      accept=".pdf"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => pdfInputRef.current?.click()}
                      disabled={extractingPdf || !!uploadedPdf}
                      className="gap-2"
                    >
                      {extractingPdf ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Extraction...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Télécharger PDF
                        </>
                      )}
                    </Button>
                    {uploadedPdf && (
                      <div className="flex items-center gap-2 flex-1 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                        <FileText className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700 flex-1 truncate">
                          {uploadedPdf.name} ({pdfContext.length} caractères)
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={removePdfContext}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    📄 Contexte temporaire pour cette génération uniquement (non sauvegardé dans le module)
                  </p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="bg-gray-50 border-t flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedModule("");
                  setSelectedExam("");
                  setQuestionNumbers("");
                  setCustomPrompt("");
                  removePdfContext();
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
                  <div className="space-y-6">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="text-2xl font-bold text-blue-600">{results.saved + (results.failed || 0)}</div>
                        <div className="text-sm text-gray-600">Total traité</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <div className="text-2xl font-bold text-green-600">{results.saved}</div>
                        <div className="text-sm text-gray-600">Réussi</div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                        <div className="text-2xl font-bold text-red-600">{results.failed || 0}</div>
                        <div className="text-sm text-gray-600">Échoué</div>
                      </div>
                    </div>

                    {/* Download and Copy All Buttons */}
                    {results.saved > 0 && (
                      <div className="flex gap-2">
                        <Button
                          onClick={downloadResults}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Download className="w-4 h-4" />
                          Télécharger tous les résultats
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const allText = results.explanations?.map(exp => 
                              `Question: ${exp.questionNumber}\n${exp.contentText || exp.title}\n\n`
                            ).join('---\n\n') || '';
                            copyToClipboard(allText);
                          }}
                          className="flex items-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          Copier tout
                        </Button>
                      </div>
                    )}

                    {/* Detailed Results */}
                    {results.explanations && results.explanations.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          Explications générées
                        </h4>
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                          {results.explanations.map((explanation, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.1 }}
                            >
                              <div
                                className={`rounded-lg border-2 transition-all cursor-pointer ${
                                  expandedResults.has(idx)
                                    ? 'border-purple-400 bg-purple-50'
                                    : 'border-gray-200 bg-white hover:border-purple-300'
                                }`}
                              >
                                {/* Result Header */}
                                <div
                                  className="p-4 flex items-center justify-between"
                                  onClick={() => toggleExpandResult(idx)}
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 font-bold text-purple-700">
                                      {idx + 1}
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="font-semibold text-gray-800">
                                        Question {explanation.questionNumber || `${idx + 1}`}
                                      </h3>
                                      <p className="text-sm text-gray-600 line-clamp-1">
                                        {explanation.title || explanation.contentText?.substring(0, 80) + '...'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge className="bg-green-100 text-green-800">
                                      Approuvé
                                    </Badge>
                                    {expandedResults.has(idx) ? (
                                      <ChevronUp className="w-5 h-5 text-purple-600" />
                                    ) : (
                                      <ChevronDown className="w-5 h-5 text-gray-400" />
                                    )}
                                  </div>
                                </div>

                                {/* Expanded Content */}
                                <AnimatePresence>
                                  {expandedResults.has(idx) && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="border-t border-purple-200"
                                    >
                                      <CardContent className="pt-4 space-y-4">
                                        {/* Explanation Content */}
                                        <div>
                                          <h4 className="font-medium text-gray-800 mb-2">Explication générée</h4>
                                          <div className="bg-white rounded border border-purple-100 p-4">
                                            <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                              {explanation.contentText || explanation.title}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Metadata */}
                                        <div className="flex flex-wrap gap-2">
                                          <Badge variant="outline" className="text-xs">
                                            ID: {explanation.questionId || explanation._id}
                                          </Badge>
                                          <Badge variant="outline" className="text-xs">
                                            Provider: {explanation.aiProvider || 'Gemini'}
                                          </Badge>
                                          {explanation.language && (
                                            <Badge variant="outline" className="text-xs">
                                              {explanation.language}
                                            </Badge>
                                          )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 pt-2">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => copyToClipboard(explanation.contentText || explanation.title)}
                                            className="flex items-center gap-2"
                                          >
                                            <Copy className="w-4 h-4" />
                                            Copier
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                              const text = `Question ${explanation.questionNumber}:\n${explanation.contentText || explanation.title}`;
                                              const element = document.createElement('a');
                                              element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                                              element.setAttribute('download', `explication_q${explanation.questionNumber}.txt`);
                                              element.style.display = 'none';
                                              document.body.appendChild(element);
                                              element.click();
                                              document.body.removeChild(element);
                                              toast.success('Fichier téléchargé');
                                            }}
                                            className="flex items-center gap-2"
                                          >
                                            <Download className="w-4 h-4" />
                                            Télécharger
                                          </Button>
                                        </div>
                                      </CardContent>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Error Details */}
                    {results.errors && results.errors.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-orange-500" />
                          Erreurs détaillées ({results.errors.length})
                        </h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {results.errors.map((err, idx) => (
                            <div key={idx} className="bg-red-50 rounded p-3 text-sm border border-red-200">
                              <div className="font-medium text-red-700">Question #{err.questionId || idx + 1}</div>
                              <div className="text-red-600 text-xs mt-1">{err.reason || err.message}</div>
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
                    <li>Les explications sont générées automatiquement en se connectant à MongoDB</li>
                    <li>Les explications générées par AI sont automatiquement approuvées</li>
                    <li>Le mode batch respecte les limites de l'API (délai de 1s entre chaque génération)</li>
                    <li>Si une explication AI existe déjà pour une question, elle ne sera pas régénérée</li>
                    <li className="font-semibold text-blue-700">📚 Les fichiers de contexte ajoutés au module sont sauvegardés et utilisés automatiquement pour toutes les futures générations</li>
                    <li>Vous pouvez aussi télécharger un PDF temporaire pour fournir du contexte supplémentaire</li>
                    <li>Les prompts personnalisés permettent de contrôler le style des explications</li>
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
