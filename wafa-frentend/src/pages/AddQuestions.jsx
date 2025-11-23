import { useState } from "react";
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

    toast.success("Question soumise avec succès");
    console.log("Submit payload:", payload);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <PageHeader title="Ajouter des Questions" description="Sélectionner le contexte et ajouter le contenu de la question" />
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowPreview((p) => !p)}>
              <Eye className="h-4 w-4 mr-2" />
              Aperçu
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              <Save className="h-4 w-4 mr-2" />
              Soumettre
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contexte</CardTitle>
            <CardDescription>Sélectionner le module, le type d'examen et les détails spécifiques au contexte</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Module</Label>
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
                    <SelectValue placeholder="Choisir un module" />
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
                <Label>Type d'examen</Label>
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
                    <SelectValue placeholder="Choisir le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="years">Exam par years</SelectItem>
                    <SelectItem value="courses">Exam par courses</SelectItem>
                    <SelectItem value="tp">Exam TP</SelectItem>
                    <SelectItem value="qcm">Exam QCM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {examType === "years" && (
                <div className="space-y-2 md:col-span-2">
                  <Label>Nom de l'examen</Label>
                  <Select value={selectedExamNameYears} onValueChange={setSelectedExamNameYears} disabled={!selectedModule}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un examen" />
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
                    <Label>Catégorie</Label>
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
                        <SelectValue placeholder="Choisir une catégorie" />
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
                    <Label>Cours</Label>
                    <Select value={selectedCourse} onValueChange={setSelectedCourse} disabled={!selectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un cours" />
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
                    <Label>Année</Label>
                    <Select value={selectedYearName} onValueChange={setSelectedYearName} disabled={!selectedCourse}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une année" />
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
                  <Label>Nom du TP</Label>
                  <Select value={selectedTPName} onValueChange={setSelectedTPName} disabled={!selectedModule}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un TP" />
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
                  <Label>Nom du QCM</Label>
                  <Select value={selectedQCMName} onValueChange={setSelectedQCMName} disabled={!selectedModule}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un QCM" />
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
            <CardTitle>Question</CardTitle>
            <CardDescription>Ajouter le texte de la question, les options et les réponses correctes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Texte de la question</Label>
              <Textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="Tapez la question ici..." rows={4} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Options</Label>
                <Button variant="outline" size="sm" onClick={handleAddOption}>
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter option
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
                      placeholder={`Option ${index + 1}`}
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
              <p className="text-xs text-muted-foreground">Cocher toutes les réponses correctes. Minimum 2 options et 1 correcte requises.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Note (optionnel)</Label>
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note ou explication supplémentaire" rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Images (optionnel)</Label>
                <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                {imageFile && <p className="text-sm text-muted-foreground">Sélectionné: {imageFile.name}</p>}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowPreview((p) => !p)}>
              <Eye className="h-4 w-4 mr-2" />
              Aperçu
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              <Save className="h-4 w-4 mr-2" />
              Soumettre
            </Button>
          </CardFooter>
        </Card>

        {showPreview && (
          <Card>
            <CardHeader>
              <CardTitle>Aperçu</CardTitle>
              <CardDescription>Aperçu de l'affichage de la question pour les étudiants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="font-medium text-foreground">{questionText || "—"}</div>
              {imageFile && (
                <div className="border rounded-md p-3 bg-muted">
                  <span className="text-sm text-muted-foreground">Image jointe: {imageFile.name}</span>
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
                  <span className="font-semibold text-foreground">Note: </span>
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
