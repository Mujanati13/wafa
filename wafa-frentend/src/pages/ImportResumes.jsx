import React, { useMemo, useState } from "react";
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
import { Upload, FileText, CheckCircle2 } from "lucide-react";

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

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setResumeFile(files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="w-full space-y-6">
        {/* Header with gradient background */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 p-6 text-white shadow-lg"
        >
          <h1 className="text-3xl font-bold mb-2">Import Resumes</h1>
          <p className="text-blue-100">
            Select module, category, course, and exam. Provide a resume name and upload the Excel/CSV file.
          </p>
        </motion.div>

        {/* Selection Stats */}
        {(selectedModule || selectedCategory || selectedCourse || selectedExam) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-3"
          >
            {selectedModule && (
              <div className="bg-white rounded-lg p-3 border-l-4 border-blue-500 shadow-sm">
                <p className="text-xs text-gray-500 font-medium uppercase">Module</p>
                <p className="text-sm font-semibold text-gray-800">{selectedModule}</p>
              </div>
            )}
            {selectedCategory && (
              <div className="bg-white rounded-lg p-3 border-l-4 border-purple-500 shadow-sm">
                <p className="text-xs text-gray-500 font-medium uppercase">Category</p>
                <p className="text-sm font-semibold text-gray-800">{selectedCategory}</p>
              </div>
            )}
            {selectedCourse && (
              <div className="bg-white rounded-lg p-3 border-l-4 border-indigo-500 shadow-sm">
                <p className="text-xs text-gray-500 font-medium uppercase">Course</p>
                <p className="text-sm font-semibold text-gray-800">{selectedCourse}</p>
              </div>
            )}
            {selectedExam && (
              <div className="bg-white rounded-lg p-3 border-l-4 border-cyan-500 shadow-sm">
                <p className="text-xs text-gray-500 font-medium uppercase">Exam</p>
                <p className="text-sm font-semibold text-gray-800">{selectedExam}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50 rounded-t-lg">
              <CardTitle className="text-xl font-bold text-gray-900">
                Configuration
              </CardTitle>
              <CardDescription>
                Select your module hierarchy and provide the file details
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Selection Dropdowns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Module Select */}
                  <div className="space-y-2">
                    <Label className="font-semibold text-gray-700">Module *</Label>
                    <Select value={selectedModule} onValueChange={(val) => {
                      setSelectedModule(val);
                      setSelectedCategory("");
                      setSelectedCourse("");
                      setSelectedExam("");
                    }}>
                      <SelectTrigger className="border-gray-300 h-10">
                        <SelectValue placeholder="Choose a module" />
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

                  {/* Category Select */}
                  <div className="space-y-2">
                    <Label className="font-semibold text-gray-700">Category *</Label>
                    <Select value={selectedCategory} onValueChange={(val) => {
                      setSelectedCategory(val);
                      setSelectedCourse("");
                      setSelectedExam("");
                    }} disabled={!selectedModule}>
                      <SelectTrigger className="border-gray-300 h-10 disabled:bg-gray-100">
                        <SelectValue placeholder={selectedModule ? "Choose a category" : "Select module first"} />
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

                  {/* Course Select */}
                  <div className="space-y-2">
                    <Label className="font-semibold text-gray-700">Course *</Label>
                    <Select value={selectedCourse} onValueChange={(val) => {
                      setSelectedCourse(val);
                      setSelectedExam("");
                    }} disabled={!selectedCategory}>
                      <SelectTrigger className="border-gray-300 h-10 disabled:bg-gray-100">
                        <SelectValue placeholder={selectedCategory ? "Choose a course" : "Select category first"} />
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

                  {/* Exam Select */}
                  <div className="space-y-2">
                    <Label className="font-semibold text-gray-700">Exam (Par Course) *</Label>
                    <Select value={selectedExam} onValueChange={setSelectedExam} disabled={!selectedCourse}>
                      <SelectTrigger className="border-gray-300 h-10 disabled:bg-gray-100">
                        <SelectValue placeholder={selectedCourse ? "Choose an exam" : "Select course first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {examOptions.map((ex) => (
                          <SelectItem key={ex} value={ex}>
                            {ex}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* File Upload Section */}
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="w-8 h-8 text-blue-600" />
                    <div className="text-center">
                      <p className="font-semibold text-gray-800">Drop your file here or click to browse</p>
                      <p className="text-sm text-gray-600">Supports Excel (.xlsx, .xls) and CSV files</p>
                    </div>
                    <Input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="resume-file"
                    />
                    <label htmlFor="resume-file">
                      <Button variant="outline" className="bg-white hover:bg-blue-50" type="button">
                        Browse Files
                      </Button>
                    </label>
                  </div>
                </div>

                {/* File Preview */}
                {resumeFile && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-green-900">File selected</p>
                      <p className="text-sm text-green-700">{resumeFile.name}</p>
                    </div>
                    <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                  </motion.div>
                )}

                {/* Name Input */}
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-700">Resume Name *</Label>
                  <Input
                    type="text"
                    placeholder="e.g. Résumé - ECG DS 1"
                    value={resumeName}
                    onChange={(e) => setResumeName(e.target.value)}
                    className="h-10 border-gray-300"
                  />
                  <p className="text-xs text-gray-500">This will be used to identify the imported resume</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 rounded-b-lg border-t flex justify-end gap-3">
              <Button variant="outline" className="border-gray-300">
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 shadow-md"
                disabled={!canImport}
                onClick={handleImport}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Resumes
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ImportResumes;
