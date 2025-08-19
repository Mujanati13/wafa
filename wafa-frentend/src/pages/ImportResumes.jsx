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

const ImportResumes = () => {
  // Demo catalog reused from course-based import: Module -> Categories -> Courses -> Exams
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
              "Membre supérieur": { exams: ["DS 1", "DS 2", "Rattrapage"] },
              "Membre inférieur": { exams: ["DS 1", "Final"] },
            },
          },
          Neurologie: {
            courses: { Encéphale: { exams: ["DS", "Final"] } },
          },
        },
      },
      Biophysique: {
        categories: {
          Mécanique: { courses: { Cinétiques: { exams: ["Quiz", "Final"] } } },
        },
      },
      Embryologie: {
        categories: { Général: { courses: { Bases: { exams: ["DS 1"] } } } },
      },
      Histologie: {
        categories: { Tissus: { courses: { Épithélium: { exams: ["DS"] } } } },
      },
      "Physiologie 1": {
        categories: {
          Cardio: { courses: { ECG: { exams: ["DS", "Final"] } } },
        },
      },
      "Biochimie 1": {
        categories: {
          Métabolisme: { courses: { Glucides: { exams: ["DS"] } } },
        },
      },
    }),
    []
  );

  const [selectedModule, setSelectedModule] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeName, setResumeName] = useState("");

  // Dependent options
  const categoryOptions = selectedModule
    ? Object.keys(catalog[selectedModule]?.categories || {})
    : [];
  const courseOptions = selectedCategory
    ? Object.keys(
        catalog[selectedModule]?.categories[selectedCategory]?.courses || {}
      )
    : [];
  const examOptions = selectedCourse
    ? catalog[selectedModule]?.categories[selectedCategory]?.courses[
        selectedCourse
      ]?.exams || []
    : [];

  const canImport =
    selectedModule &&
    selectedCategory &&
    selectedCourse &&
    selectedExam &&
    resumeFile &&
    resumeName.trim().length > 0;

  const handleImport = () => {
    // Placeholder handler. Wire to API later.
    alert(
      `Import resumes:\n` +
        `Module: ${selectedModule}\nCategory: ${selectedCategory}\nCourse: ${selectedCourse}\nExam: ${selectedExam}\n` +
        `Resume name: ${resumeName}\nFile: ${resumeFile?.name}`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Import resumes</h1>
            <p className="text-gray-600 mt-1">
              Select module, category, course, and exam (par course). Provide a
              resume name and upload the resumes Excel/CSV file.
            </p>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Source</CardTitle>
            <CardDescription>
              Choose the module hierarchy and exam, then upload the file that
              contains resumes/summaries to import.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="space-y-2">
                <Label>Select module</Label>
                <Select
                  value={selectedModule}
                  onChange={(e) => {
                    setSelectedModule(e.target.value);
                    setSelectedCategory("");
                    setSelectedCourse("");
                    setSelectedExam("");
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
                <Label>select categories</Label>
                <Select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedCourse("");
                    setSelectedExam("");
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
                <Label>select course name</Label>
                <Select
                  value={selectedCourse}
                  onChange={(e) => {
                    setSelectedCourse(e.target.value);
                    setSelectedExam("");
                  }}
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
                <Label>exam par courses</Label>
                <Select
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                  disabled={!selectedCourse}
                >
                  <option value="" disabled>
                    {selectedCourse
                      ? "Choose an exam"
                      : "Select a course first"}
                  </option>
                  {examOptions.map((ex) => (
                    <option key={ex} value={ex}>
                      {ex}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label>resumes file</Label>
                <Input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="space-y-2">
                <Label>make name</Label>
                <Input
                  type="text"
                  placeholder="e.g. Résumé - ECG DS 1"
                  value={resumeName}
                  onChange={(e) => setResumeName(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              className="bg-black text-white hover:bg-gray-800"
              disabled={!canImport}
              onClick={handleImport}
            >
              + Import
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ImportResumes;
