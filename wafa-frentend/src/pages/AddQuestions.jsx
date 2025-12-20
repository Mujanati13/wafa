import { useState, useEffect, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Save, Eye, HelpCircle, Download, FileSpreadsheet, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared";
import { toast } from "sonner";
import { api } from "@/lib/utils";

const yearNames = ["2021", "2022", "2023", "2024"];

const AddQuestions = () => {
  const { t } = useTranslation(['admin', 'common']);

  const [modules, setModules] = useState([]);
  const [exams, setExams] = useState([]);
  const [qcmBanques, setQcmBanques] = useState([]);
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    fetchAllQuestions();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [modulesRes, examsRes, qcmRes] = await Promise.all([
        api.get("/modules"),
        api.get("/exams/all"),
        api.get("/qcm-banque/all")
      ]);
      setModules(modulesRes.data?.data || []);
      setExams(examsRes.data?.data || []);
      setQcmBanques(qcmRes.data?.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  // Get exams/QCMs filtered by module
  const getExamsForModule = (moduleId) => {
    return exams.filter(e => (e.moduleId?._id || e.moduleId) === moduleId);
  };

  const getQCMsForModule = (moduleId) => {
    return qcmBanques.filter(q => (q.moduleId?._id || q.moduleId) === moduleId);
  };

  // Fetch categories when module changes
  const fetchCategoriesForModule = async (moduleId) => {
    if (!moduleId) {
      setCategories([]);
      return;
    }
    try {
      const response = await api.get(`/exam-courses/module/${moduleId}/categories`);
      setCategories(response.data?.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
    }
  };

  // Fetch courses when category changes
  const fetchCoursesForCategory = async (moduleId, category) => {
    if (!moduleId || !category) {
      setCourses([]);
      return;
    }
    try {
      const response = await api.get(`/exam-courses?moduleId=${moduleId}&category=${category}`);
      setCourses(response.data?.data || []);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setCourses([]);
    }
  };

  const [selectedModule, setSelectedModule] = useState("");
  const [examType, setExamType] = useState("");
  const [selectedExamNameYears, setSelectedExamNameYears] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYearName, setSelectedYearName] = useState("");
  const [selectedTPName, setSelectedTPName] = useState("");
  const [selectedQCMName, setSelectedQCMName] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState([
    { id: crypto.randomUUID(), text: "", isCorrect: false },
    { id: crypto.randomUUID(), text: "", isCorrect: false },
  ]);
  const [note, setNote] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [examQuestions, setExamQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const handleAddOption = () => {
    setOptions((prev) => [...prev, { id: crypto.randomUUID(), text: "", isCorrect: false }]);
  };

  const handleRemoveOption = (id) => {
    setOptions((prev) => prev.filter((o) => o.id !== id));
  };

  const hasValidOptions = options.filter((o) => o.text.trim()).length >= 2;
  const hasAtLeastOneCorrect = options.some((o) => o.isCorrect && o.text.trim());
  const hasBasicQuestion = questionText.trim().length > 0 && hasValidOptions;

  const hasContextSelected = (() => {
    if (!selectedModule || !examType) return false;
    if (examType === "years") return !!selectedExamNameYears;
    if (examType === "courses") return !!(selectedCategory && selectedCourse && selectedYearName);
    if (examType === "tp") return !!selectedTPName;
    if (examType === "qcm") return !!selectedQCMName;
    return false;
  })();

  const canSubmit = hasContextSelected && hasBasicQuestion && hasAtLeastOneCorrect;

  // Fetch all questions on mount
  const fetchAllQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const response = await api.get('/questions/all');
      setExamQuestions(response.data?.data || []);
    } catch (err) {
      console.error("Error fetching all questions:", err);
      setExamQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Load questions when exam context changes
  useEffect(() => {
    if (hasContextSelected) {
      fetchExamQuestions();
    } else {
      setExamQuestions([]);
    }
  }, [hasContextSelected, selectedExamNameYears, selectedQCMName, selectedTPName, selectedCourse, selectedYearName]);

  const fetchExamQuestions = async () => {
    try {
      setLoadingQuestions(true);
      let examId = null;
      
      // Determine exam ID based on exam type
      if (examType === "years" && selectedExamNameYears) {
        const exam = exams.find(e => e._id === selectedExamNameYears);
        examId = exam?._id;
      } else if (examType === "qcm" && selectedQCMName) {
        examId = selectedQCMName;
      } else if (examType === "tp" && selectedTPName) {
        examId = selectedTPName;
      } else if (examType === "courses" && selectedCourse) {
        // For courses, we might need different logic
        examId = selectedCourse;
      }

      if (!examId) {
        setExamQuestions([]);
        return;
      }

      const response = await api.get(`/questions/by-exam/${examId}`);
      setExamQuestions(response.data?.data || []);
    } catch (err) {
      console.error("Error fetching questions:", err);
      setExamQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleSubmit = () => {
    const context = {
      module: selectedModule,
      examType,
      yearsExamName: examType === "years" ? selectedExamNameYears : undefined,
      coursesCategory: examType === "courses" ? selectedCategory : undefined,
      courseName: examType === "courses" ? selectedCourse : undefined,
      yearName: examType === "courses" ? selectedYearName : undefined,
      tpName: examType === "tp" ? selectedTPName : undefined,
      qcmName: examType === "qcm" ? selectedQCMName : undefined,
    };

    const payload = {
      context,
      question: { text: questionText, imageAttached: !!imageFile, options, note },
    };

    toast.success(t('admin:question_submitted'));
    console.log("Submit payload:", payload);
  };

  // Handle Export to Excel
  const handleExportToExcel = () => {
    if (examQuestions.length === 0) {
      toast.error("Aucune question à exporter");
      return;
    }

    // Create CSV content
    const headers = ["ID", "Question", "Option A", "Option B", "Option C", "Option D", "Option E", "Correct Answer"];
    const rows = examQuestions.map(q => {
      const correctOption = q.options?.find(opt => opt.isCorrect);
      return [
        q._id || q.id,
        `"${q.text?.replace(/"/g, '""') || ''}"`,
        `"${q.options?.[0]?.text?.replace(/"/g, '""') || ''}"`,
        `"${q.options?.[1]?.text?.replace(/"/g, '""') || ''}"`,
        `"${q.options?.[2]?.text?.replace(/"/g, '""') || ''}"`,
        `"${q.options?.[3]?.text?.replace(/"/g, '""') || ''}"`,
        `"${q.options?.[4]?.text?.replace(/"/g, '""') || ''}"`,
        `"${correctOption?.text?.replace(/"/g, '""') || ''}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `questions_export_${Date.now()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`${examQuestions.length} questions exportées avec succès`);
  };

  // Handle Delete All Questions
  const handleDeleteAllQuestions = async () => {
    if (examQuestions.length === 0) {
      toast.error("Aucune question à supprimer");
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer les ${examQuestions.length} questions de cet examen ? Cette action est irréversible.`)) {
      return;
    }

    try {
      const questionIds = examQuestions.map(q => q._id || q.id);
      await api.post("/questions/bulk-delete", { questionIds });
      setExamQuestions([]);
      toast.success(`${questionIds.length} questions supprimées avec succès`);
      fetchExamQuestions(); // Refresh the list
    } catch (err) {
      console.error("Error deleting questions:", err);
      toast.error("Erreur lors de la suppression des questions");
    }
  };

  // Handle Delete Single Question
  const handleDeleteQuestion = async (questionId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette question ?")) {
      return;
    }

    try {
      await api.delete(`/questions/${questionId}`);
      setExamQuestions(prev => prev.filter(q => (q._id || q.id) !== questionId));
      toast.success("Question supprimée avec succès");
    } catch (err) {
      console.error("Error deleting question:", err);
      toast.error("Erreur lors de la suppression de la question");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <PageHeader title={t('admin:add_questions')} description={t('admin:select_context_add_content')} />
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowPreview((p) => !p)}>
              <Eye className="h-4 w-4 mr-2" />
              {t('admin:preview')}
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              <Save className="h-4 w-4 mr-2" />
              {t('admin:submit')}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('admin:context')}</CardTitle>
            <CardDescription>{t('admin:select_module_exam_type')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>{t('admin:module')}</Label>
                <Select
                  value={selectedModule}
                  onValueChange={(val) => {
                    setSelectedModule(val);
                    setExamType("");
                    setSelectedExamNameYears("");
                    setSelectedCategory("");
                    setSelectedCourse("");
                    setSelectedYearName("");
                    setSelectedTPName("");
                    setSelectedQCMName("");
                    fetchCategoriesForModule(val);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('admin:choose_module')} />
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
                <Label>{t('admin:exam_type')}</Label>
                <Select
                  value={examType}
                  onValueChange={(val) => {
                    setExamType(val);
                    setSelectedExamNameYears("");
                    setSelectedCategory("");
                    setSelectedCourse("");
                    setSelectedYearName("");
                    setSelectedTPName("");
                    setSelectedQCMName("");
                  }}
                  disabled={!selectedModule}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('admin:choose_type')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="years">{t('admin:exam_by_years')}</SelectItem>
                    <SelectItem value="courses">{t('admin:exam_by_courses')}</SelectItem>
                    <SelectItem value="tp">{t('admin:exam_tp')}</SelectItem>
                    <SelectItem value="qcm">{t('admin:exam_qcm')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {examType === "years" && (
                <div className="space-y-2 md:col-span-2">
                  <Label>{t('admin:exam_name')}</Label>
                  <Select value={selectedExamNameYears} onValueChange={setSelectedExamNameYears} disabled={!selectedModule}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('admin:choose_exam')} />
                    </SelectTrigger>
                    <SelectContent>
                      {getExamsForModule(selectedModule).map((exam) => (
                        <SelectItem key={exam._id} value={exam._id}>
                          {exam.name} ({exam.year})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {examType === "courses" && (
                <>
                  <div className="space-y-2">
                    <Label>{t('admin:category')}</Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={(val) => {
                        setSelectedCategory(val);
                        setSelectedCourse("");
                        setSelectedYearName("");
                        fetchCoursesForCategory(selectedModule, val);
                      }}
                      disabled={!selectedModule}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('admin:choose_category')} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('admin:course')}</Label>
                    <Select value={selectedCourse} onValueChange={setSelectedCourse} disabled={!selectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('admin:choose_course')} />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((c) => (
                          <SelectItem key={c._id} value={c._id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('admin:year')}</Label>
                    <Select value={selectedYearName} onValueChange={setSelectedYearName} disabled={!selectedCourse}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('admin:choose_year')} />
                      </SelectTrigger>
                      <SelectContent>
                        {yearNames.map((y) => (
                          <SelectItem key={y} value={y}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {examType === "tp" && (
                <div className="space-y-2 md:col-span-2">
                  <Label>{t('admin:tp_name')}</Label>
                  <Select value={selectedTPName} onValueChange={setSelectedTPName} disabled={!selectedModule}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('admin:choose_tp')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tp1">TP 1</SelectItem>
                      <SelectItem value="tp2">TP 2</SelectItem>
                      <SelectItem value="tp3">TP 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {examType === "qcm" && (
                <div className="space-y-2 md:col-span-2">
                  <Label>{t('admin:qcm_name')}</Label>
                  <Select value={selectedQCMName} onValueChange={setSelectedQCMName} disabled={!selectedModule}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('admin:choose_qcm')} />
                    </SelectTrigger>
                    <SelectContent>
                      {getQCMsForModule(selectedModule).map((qcm) => (
                        <SelectItem key={qcm._id} value={qcm._id}>
                          {qcm.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('admin:question')}</CardTitle>
            <CardDescription>{t('admin:add_question_text_options')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>{t('admin:question_text')}</Label>
              <Textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder={t('admin:type_question_here')} rows={4} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{t('admin:options')}</Label>
                <Button variant="outline" size="sm" onClick={handleAddOption}>
                  <Plus className="h-4 w-4 mr-1" />
                  {t('admin:add_option')}
                </Button>
              </div>
              <div className="space-y-3">
                {options.map((opt, index) => (
                  <div key={opt.id} className="flex items-center gap-3">
                    <Checkbox
                      checked={!!opt.isCorrect}
                      onCheckedChange={(checked) =>
                        setOptions((prev) =>
                          prev.map((o) =>
                            o.id === opt.id ? { ...o, isCorrect: checked } : o
                          )
                        )
                      }
                    />
                    <Input
                      placeholder={`${t('admin:option')} ${index + 1}`}
                      value={opt.text}
                      onChange={(e) =>
                        setOptions((prev) =>
                          prev.map((o) =>
                            o.id === opt.id ? { ...o, text: e.target.value } : o
                          )
                        )
                      }
                      className="flex-1"
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveOption(opt.id)} disabled={options.length <= 2}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{t('admin:check_correct_answers')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('admin:note_optional')}</Label>
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('admin:note_explanation')} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>{t('admin:images_optional')}</Label>
                <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                {imageFile && <p className="text-sm text-muted-foreground">{t('admin:selected')}: {imageFile.name}</p>}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowPreview((p) => !p)}>
              <Eye className="h-4 w-4 mr-2" />
              {t('admin:preview')}
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              <Save className="h-4 w-4 mr-2" />
              {t('admin:submit')}
            </Button>
          </CardFooter>
        </Card>

        {showPreview && (
          <Card>
            <CardHeader>
              <CardTitle>{t('admin:preview_title')}</CardTitle>
              <CardDescription>{t('admin:preview_description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="font-medium text-foreground">{questionText || "—"}</div>
              {imageFile && (
                <div className="border rounded-md p-3 bg-muted">
                  <span className="text-sm text-muted-foreground">{t('admin:image_attached')}: {imageFile.name}</span>
                </div>
              )}
              <ol className="space-y-2 list-decimal list-inside">
                {options
                  .filter((o) => o.text.trim())
                  .map((o) => (
                    <li key={o.id} className={o.isCorrect ? "font-medium text-green-700" : "text-foreground"}>
                      {o.text}
                    </li>
                  ))}
              </ol>
              {note && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{t('admin:note_optional')}: </span>
                  {note}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Questions List Table */}
        <Card>
            <CardHeader className="border-b">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {hasContextSelected ? "Questions de l'Examen" : "Toutes les Questions"}
                    <Badge variant="secondary">{examQuestions.length} Total</Badge>
                  </CardTitle>
                  <CardDescription>
                    {hasContextSelected ? "Toutes les questions de cet examen" : "Toutes les questions de tous les examens"}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportToExcel}
                    disabled={examQuestions.length === 0}
                    className="gap-2 text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Exporter Excel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteAllQuestions}
                    disabled={examQuestions.length === 0}
                    className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer Tout
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox />
                      </TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead>Option A</TableHead>
                      <TableHead>Option B</TableHead>
                      <TableHead>Option C</TableHead>
                      <TableHead>Option D</TableHead>
                      <TableHead>Option E</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead className="text-right">Operate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingQuestions ? (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
                          <p className="text-muted-foreground mt-2">Chargement des questions...</p>
                        </TableCell>
                      </TableRow>
                    ) : examQuestions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center py-12 text-muted-foreground">
                          Aucune question trouvée pour cet examen
                        </TableCell>
                      </TableRow>
                    ) : (
                      examQuestions.map((q, idx) => (
                        <TableRow key={q._id || q.id}>
                          <TableCell>
                            <Checkbox />
                          </TableCell>
                          <TableCell className="font-mono text-sm">{idx + 1}</TableCell>
                          <TableCell>
                            {q.images?.length > 0 ? (
                              <Badge variant="outline" className="text-xs">
                                {q.images.length} image(s)
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell className="max-w-xs truncate" title={q.text}>
                            {q.text}
                          </TableCell>
                          <TableCell className="text-sm">{q.options?.[0]?.text || "—"}</TableCell>
                          <TableCell className="text-sm">{q.options?.[1]?.text || "—"}</TableCell>
                          <TableCell className="text-sm">{q.options?.[2]?.text || "—"}</TableCell>
                          <TableCell className="text-sm">{q.options?.[3]?.text || "—"}</TableCell>
                          <TableCell className="text-sm">{q.options?.[4]?.text || "—"}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{q.sessionLabel || "—"}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                title="Voir"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteQuestion(q._id || q.id)}
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            {examQuestions.length > 0 && (
              <CardFooter className="border-t bg-slate-50/50">
                <div className="text-sm text-muted-foreground">
                  Affichage de {examQuestions.length} questions
                </div>
              </CardFooter>
            )}
          </Card>
      </div>
    </div>
  );
};

export default AddQuestions;
