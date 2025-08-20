import React, { useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { Select } from "../components/ui/select";
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
import { Plus, Trash2, Save, Eye } from "lucide-react";

// Demo datasets for names by module/type
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
  // Base module/category/course structure
  const modules = useMemo(
    () => [
      "Anatomie 1",
      "Biophysique",
      "Embryologie",
      "Histologie",
      "Physiologie 1",
      "Biochimie 1",
    ],
    []
  );

  const catalog = useMemo(
    () => ({
      "Anatomie 1": {
        categories: {
          Osteologie: {
            courses: {
              "Membre supérieur": {},
              "Membre inférieur": {},
            },
          },
          Neurologie: { courses: { Encéphale: {} } },
        },
      },
      Biophysique: {
        categories: {
          Mécanique: { courses: { Cinétiques: {} } },
        },
      },
      Embryologie: {
        categories: { Général: { courses: { Bases: {} } } },
      },
      Histologie: {
        categories: { Tissus: { courses: { Épithélium: {} } } },
      },
      "Physiologie 1": {
        categories: { Cardio: { courses: { ECG: {} } } },
      },
      "Biochimie 1": {
        categories: { Métabolisme: { courses: { Glucides: {} } } },
      },
    }),
    []
  );

  // Step 1: select module
  const [selectedModule, setSelectedModule] = useState("");

  // Step 2: select exam type
  // years | courses | tp | qcm
  const [examType, setExamType] = useState("");

  // Step 3: context depending on type
  // years
  const [selectedExamNameYears, setSelectedExamNameYears] = useState("");

  // courses flow
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYearName, setSelectedYearName] = useState("");

  // tp
  const [selectedTPName, setSelectedTPName] = useState("");
  // qcm
  const [selectedQCMName, setSelectedQCMName] = useState("");

  // Question fields
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState([
    { id: crypto.randomUUID(), text: "", isCorrect: false },
    { id: crypto.randomUUID(), text: "", isCorrect: false },
  ]);
  const [note, setNote] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Derived lists
  const categoryOptions = selectedModule
    ? Object.keys(catalog[selectedModule]?.categories || {})
    : [];
  const courseOptions = selectedCategory
    ? Object.keys(
        catalog[selectedModule]?.categories[selectedCategory]?.courses || {}
      )
    : [];

  // Option handlers
  const handleAddOption = () => {
    setOptions((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: "", isCorrect: false },
    ]);
  };
  const handleRemoveOption = (id) => {
    setOptions((prev) => prev.filter((o) => o.id !== id));
  };

  // Validation
  const hasValidOptions = options.filter((o) => o.text.trim()).length >= 2;
  const hasAtLeastOneCorrect = options.some(
    (o) => o.isCorrect && o.text.trim()
  );
  const hasBasicQuestion = questionText.trim().length > 0 && hasValidOptions;

  const hasContextSelected = (() => {
    if (!selectedModule || !examType) return false;
    if (examType === "years") return !!selectedExamNameYears;
    if (examType === "courses")
      return !!(selectedCategory && selectedCourse && selectedYearName);
    if (examType === "tp") return !!selectedTPName;
    if (examType === "qcm") return !!selectedQCMName;
    return false;
  })();

  const canSubmit =
    hasContextSelected && hasBasicQuestion && hasAtLeastOneCorrect;

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
      question: {
        text: questionText,
        imageAttached: !!imageFile,
        options,
        note,
      },
    };
    alert("Submit (demo)\n" + JSON.stringify(payload, null, 2));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add Questions</h1>
            <p className="text-gray-600 mt-1">
              Select context then add question content, options and correct
              answers.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button
              variant="outline"
              onClick={() => setShowPreview((p) => !p)}
              className="sm:w-auto"
            >
              <Eye className="w-4 h-4" /> Preview
            </Button>
            <Button
              className="bg-black text-white hover:bg-gray-800 sm:w-auto"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              <Save className="w-4 h-4" /> Submit
            </Button>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Context</CardTitle>
            <CardDescription>
              Select module, exam type, and context-specific details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Module</Label>
                <Select
                  value={selectedModule}
                  onChange={(e) => {
                    setSelectedModule(e.target.value);
                    // reset downstream
                    setExamType("");
                    setSelectedExamNameYears("");
                    setSelectedCategory("");
                    setSelectedCourse("");
                    setSelectedYearName("");
                    setSelectedTPName("");
                    setSelectedQCMName("");
                  }}
                >
                  <option value="" disabled>
                    Choose a module
                  </option>
                  {modules.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Exam type</Label>
                <Select
                  value={examType}
                  onChange={(e) => {
                    setExamType(e.target.value);
                    setSelectedExamNameYears("");
                    setSelectedCategory("");
                    setSelectedCourse("");
                    setSelectedYearName("");
                    setSelectedTPName("");
                    setSelectedQCMName("");
                  }}
                  disabled={!selectedModule}
                >
                  <option value="" disabled>
                    {selectedModule
                      ? "Choose exam type"
                      : "Select a module first"}
                  </option>
                  <option value="years">exam par years</option>
                  <option value="courses">exam par courses</option>
                  <option value="tp">exam TP</option>
                  <option value="qcm">exam QCM</option>
                </Select>
              </div>

              {examType === "years" && (
                <div className="space-y-2 md:col-span-2">
                  <Label>Exam name</Label>
                  <Select
                    value={selectedExamNameYears}
                    onChange={(e) => setSelectedExamNameYears(e.target.value)}
                    disabled={!selectedModule}
                  >
                    <option value="" disabled>
                      Choose an exam name
                    </option>
                    {(selectedModule
                      ? examNamesByModule[selectedModule] || []
                      : []
                    ).map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </Select>
                </div>
              )}

              {examType === "courses" && (
                <>
                  <div className="space-y-2">
                    <Label>Exam par courses category</Label>
                    <Select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setSelectedCourse("");
                        setSelectedYearName("");
                      }}
                      disabled={!selectedModule}
                    >
                      <option value="" disabled>
                        {selectedModule
                          ? "Choose a category"
                          : "Select a module first"}
                      </option>
                      {categoryOptions.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Course name</Label>
                    <Select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      disabled={!selectedCategory}
                    >
                      <option value="" disabled>
                        {selectedCategory
                          ? "Choose a course"
                          : "Select a category first"}
                      </option>
                      {courseOptions.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Year name</Label>
                    <Select
                      value={selectedYearName}
                      onChange={(e) => setSelectedYearName(e.target.value)}
                      disabled={!selectedCourse}
                    >
                      <option value="" disabled>
                        {selectedCourse
                          ? "Choose a year"
                          : "Select a course first"}
                      </option>
                      {yearNames.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </Select>
                  </div>
                </>
              )}

              {examType === "tp" && (
                <div className="space-y-2 md:col-span-2">
                  <Label>Exam TP name</Label>
                  <Select
                    value={selectedTPName}
                    onChange={(e) => setSelectedTPName(e.target.value)}
                    disabled={!selectedModule}
                  >
                    <option value="" disabled>
                      Choose a TP name
                    </option>
                    {(selectedModule
                      ? tpNamesByModule[selectedModule] || []
                      : []
                    ).map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </Select>
                </div>
              )}

              {examType === "qcm" && (
                <div className="space-y-2 md:col-span-2">
                  <Label>Exam QCM name</Label>
                  <Select
                    value={selectedQCMName}
                    onChange={(e) => setSelectedQCMName(e.target.value)}
                    disabled={!selectedModule}
                  >
                    <option value="" disabled>
                      Choose a QCM name
                    </option>
                    {(selectedModule
                      ? qcmNamesByModule[selectedModule] || []
                      : []
                    ).map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Question</CardTitle>
            <CardDescription>
              Add the question text, optional image, options and correct
              answers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Question text</Label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Type the question here..."
                rows={4}
                className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Options</Label>
                <Button variant="outline" onClick={handleAddOption}>
                  <Plus className="w-4 h-4 mr-1" /> Add option
                </Button>
              </div>
              <div className="space-y-3">
                {options.map((opt, index) => (
                  <div
                    key={opt.id}
                    className="grid grid-cols-12 items-center gap-3"
                  >
                    <div className="col-span-1 flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={!!opt.isCorrect}
                        onChange={(e) =>
                          setOptions((prev) =>
                            prev.map((o) =>
                              o.id === opt.id
                                ? { ...o, isCorrect: e.target.checked }
                                : o
                            )
                          )
                        }
                        className="h-4 w-4 accent-blue-600"
                      />
                    </div>
                    <div className="col-span-10">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={opt.text}
                        onChange={(e) =>
                          setOptions((prev) =>
                            prev.map((o) =>
                              o.id === opt.id
                                ? { ...o, text: e.target.value }
                                : o
                            )
                          )
                        }
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button
                        variant="outline"
                        className="px-2"
                        onClick={() => handleRemoveOption(opt.id)}
                        disabled={options.length <= 2}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Mark all correct answers. Minimum 2 options and 1 correct
                required.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Note (optional)</Label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Additional note or explanation"
                  rows={3}
                  className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Images (optional)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
                {imageFile && (
                  <p className="text-sm text-gray-500">
                    Selected: {imageFile.name}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowPreview((p) => !p)}>
              <Eye className="w-4 h-4" /> Preview
            </Button>
            <Button
              className="bg-black text-white hover:bg-gray-800"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              <Save className="w-4 h-4" /> Submit
            </Button>
          </CardFooter>
        </Card>

        {showPreview && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Preview</CardTitle>
              <CardDescription>
                This is how the question will look for students.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-gray-900 font-medium">
                {questionText || "—"}
              </div>
              {imageFile && (
                <div className="border rounded-md p-3 bg-white">
                  <span className="text-sm text-gray-600">
                    Image attached: {imageFile.name}
                  </span>
                </div>
              )}
              <ol className="space-y-2 list-decimal list-inside">
                {options
                  .filter((o) => o.text.trim())
                  .map((o) => (
                    <li
                      key={o.id}
                      className={
                        o.isCorrect
                          ? "font-medium text-green-700"
                          : "text-gray-800"
                      }
                    >
                      {o.text}
                    </li>
                  ))}
              </ol>
              {note && (
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-800">Note: </span>
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
