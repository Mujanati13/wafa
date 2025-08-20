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
import { Save } from "lucide-react";

// Demo data used for options. Replace with real API data later.
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

const ImportExplications = () => {
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

  // Base selections
  const [selectedModule, setSelectedModule] = useState("");
  const [examType, setExamType] = useState(""); // years | courses | tp | qcm

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

  // common and payload inputs
  const [questionNumbers, setQuestionNumbers] = useState("");
  const [explicationText, setExplicationText] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [explicationName, setExplicationName] = useState("");

  // Derived lists
  const categoryOptions = selectedModule
    ? Object.keys(catalog[selectedModule]?.categories || {})
    : [];
  const courseOptions = selectedCategory
    ? Object.keys(
        catalog[selectedModule]?.categories[selectedCategory]?.courses || {}
      )
    : [];

  const hasContextSelected = (() => {
    if (!selectedModule || !examType) return false;
    if (examType === "years") return !!selectedExamNameYears;
    if (examType === "courses")
      return !!(selectedCategory && selectedCourse && selectedYearName);
    if (examType === "tp") return !!selectedTPName;
    if (examType === "qcm") return !!selectedQCMName;
    return false;
  })();

  const hasAnyContent =
    explicationText.trim().length > 0 || (imageFiles?.length || 0) > 0;

  const canSubmit =
    hasContextSelected &&
    questionNumbers.trim().length > 0 &&
    explicationName.trim().length > 0 &&
    hasAnyContent;

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
      name: explicationName,
      context,
      questionNumbers,
      text: explicationText.trim() || undefined,
      images: Array.from(imageFiles || []).map((f) => f.name),
    };

    alert("Import explications (demo)\n" + JSON.stringify(payload, null, 2));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Import explications
            </h1>
            <p className="text-gray-600 mt-1">
              Select module and exam context, then pick question numbers, add
              text and/or images, give it a name and submit.
            </p>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Context</CardTitle>
            <CardDescription>
              Choose the exam context: par years, par courses, TP or QCM.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Select module</Label>
                <Select
                  value={selectedModule}
                  onChange={(e) => {
                    setSelectedModule(e.target.value);
                    // reset downstream selections
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
            <CardTitle className="text-xl font-bold">Details</CardTitle>
            <CardDescription>
              Select question numbers, add text and/or upload images.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="space-y-2">
                <Label>select question number</Label>
                <Input
                  placeholder="e.g. 1-5,7,10"
                  value={questionNumbers}
                  onChange={(e) => setQuestionNumbers(e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>import text</Label>
                <textarea
                  className="w-full rounded-md border border-gray-300 bg-white p-2 text-sm"
                  rows={5}
                  placeholder="Enter explanation text..."
                  value={explicationText}
                  onChange={(e) => setExplicationText(e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-3">
                <Label>upload images</Label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) =>
                    setImageFiles(Array.from(e.target.files || []))
                  }
                />
                {imageFiles.length > 0 && (
                  <p className="text-sm text-gray-500">
                    Selected {imageFiles.length} file(s)
                  </p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col md:flex-row gap-3 md:gap-6 md:items-center md:justify-end">
            <div className="w-full md:w-1/2 space-y-2">
              <Label>make name</Label>
              <Input
                type="text"
                placeholder="e.g. Explication - ECG Q1"
                value={explicationName}
                onChange={(e) => setExplicationName(e.target.value)}
              />
            </div>
            <Button
              className="bg-black text-white hover:bg-gray-800 self-end"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              <Save className="w-4 h-4" /> Submit
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ImportExplications;
