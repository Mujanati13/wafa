import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Save, Eye, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/shared";
import { toast } from "sonner";

const examNamesByModule = {
  "Anatomie 1": ["Session principale 2023", "Rattrapage 2022"],
  Biophysique: ["Quiz 1", "Final 2023"],
};

const tpNamesByModule = {
  "Anatomie 1": ["TP 1", "TP 2"],
  Biophysique: ["TP mécanique", "TP optique"],
};

const qcmNamesByModule = {
  "Anatomie 1": ["QCM 1", "QCM 2"],
  Biophysique: ["QCM Intro", "QCM Avancé"],
};

const yearNames = ["2021", "2022", "2023", "2024"];

const AddQuestions = () => {
  const { t } = useTranslation(['admin', 'common']);
  const modules = ["Anatomie 1", "Biophysique", "Embryologie", "Histologie", "Physiologie 1", "Biochimie 1"];

  const catalog = {
    "Anatomie 1": { categories: { Osteologie: { courses: { "Membre supérieur": {}, "Membre inférieur": {} } }, Neurologie: { courses: { Encéphale: {} } } } },
    Biophysique: { categories: { Mécanique: { courses: { Cinétiques: {} } } } },
    Embryologie: { categories: { Général: { courses: { Bases: {} } } } },
    Histologie: { categories: { Tissus: { courses: { Épithélium: {} } } } },
    "Physiologie 1": { categories: { Cardio: { courses: { ECG: {} } } } },
    "Biochimie 1": { categories: { Métabolisme: { courses: { Glucides: {} } } } },
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

  const categoryOptions = selectedModule ? Object.keys(catalog[selectedModule]?.categories || {}) : [];
  const courseOptions = selectedCategory ? Object.keys(catalog[selectedModule]?.categories[selectedCategory]?.courses || {}) : [];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
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
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('admin:choose_module')} />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
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
                      {(examNamesByModule[selectedModule] || []).map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
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
                      }}
                      disabled={!selectedModule}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('admin:choose_category')} />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((cat) => (
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
                        {courseOptions.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
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
                      {(tpNamesByModule[selectedModule] || []).map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
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
                      {(qcmNamesByModule[selectedModule] || []).map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
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
      </div>
    </div>
  );
};

export default AddQuestions;
