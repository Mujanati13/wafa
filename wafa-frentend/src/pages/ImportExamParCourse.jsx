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
import { Plus, Trash } from "lucide-react";

const ImportExamParCourse = () => {
  // Demo catalog: Module -> Categories -> Courses -> Exams
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
              "Membre supérieur": {
                exams: ["DS 1", "DS 2", "Rattrapage"],
              },
              "Membre inférieur": {
                exams: ["DS 1", "Final"],
              },
            },
          },
          Neurologie: {
            courses: {
              Encéphale: { exams: ["DS", "Final"] },
            },
          },
        },
      },
      Biophysique: {
        categories: {
          Mécanique: { courses: { Cinétiques: { exams: ["Quiz", "Final"] } } },
        },
      },
      Embryologie: {
        categories: {
          Général: { courses: { Bases: { exams: ["DS 1"] } } },
        },
      },
      Histologie: {
        categories: {
          Tissus: { courses: { Épithélium: { exams: ["DS"] } } },
        },
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
  const [excelFile, setExcelFile] = useState(null);

  // Integrate exam year questions mapping (right section in mockup)
  const [yearMappings, setYearMappings] = useState([
    { id: crypto.randomUUID(), yearName: "", questionNumbers: "" },
  ]);

  const handleAddYearRow = () =>
    setYearMappings((prev) => [
      ...prev,
      { id: crypto.randomUUID(), yearName: "", questionNumbers: "" },
    ]);

  const handleRemoveYearRow = (id) =>
    setYearMappings((prev) => prev.filter((r) => r.id !== id));

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
    excelFile;

  const handleImport = () => {
    // Placeholder handler. Wire to API later.
    alert(
      `Import ready:\nModule: ${selectedModule}\nCategory: ${selectedCategory}\nCourse: ${selectedCourse}\nExam: ${selectedExam}\nExcel: ${excelFile?.name}\n` +
        `Integrations (exam year): ${yearMappings.length}`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Import exam par courses questions
            </h1>
            <p className="text-gray-600 mt-1">
              Select module, category, course, and the exam; upload the Excel
              file. Optionally integrate questions from a specific exam year.
            </p>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Source</CardTitle>
            <CardDescription>
              Select the module and category, then the course and exam (par
              course). Finally upload the questions Excel file.
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
                <Label>Excel file of questions</Label>
                <Input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
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

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              integrate exam year questions
            </CardTitle>
            <CardDescription>
              Map questions from a specific exam year into this exam by
              providing the year name and the question numbers range/list.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {yearMappings.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end"
                >
                  <div className="sm:col-span-2 space-y-2">
                    <Label>exam year name</Label>
                    <Input
                      placeholder="e.g. 2023 - Session principale"
                      value={row.yearName}
                      onChange={(e) =>
                        setYearMappings((prev) =>
                          prev.map((r) =>
                            r.id === row.id
                              ? { ...r, yearName: e.target.value }
                              : r
                          )
                        )
                      }
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label>questions numbers in</Label>
                    <Input
                      placeholder="e.g. 1-5,7,10-12"
                      value={row.questionNumbers}
                      onChange={(e) =>
                        setYearMappings((prev) =>
                          prev.map((r) =>
                            r.id === row.id
                              ? { ...r, questionNumbers: e.target.value }
                              : r
                          )
                        )
                      }
                    />
                  </div>
                  <div className="sm:col-span-1 flex gap-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleRemoveYearRow(row.id)}
                      disabled={yearMappings.length === 1}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <div>
                <Button variant="outline" onClick={handleAddYearRow}>
                  <Plus className="w-4 h-4 mr-1" /> Add row
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImportExamParCourse;
