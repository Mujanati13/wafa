import React, { useMemo, useState } from "react";
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
import { Save, Upload, FileText, ImageIcon, Type } from "lucide-react";

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
  const { t } = useTranslation(['admin', 'common']);
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

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (imageFiles.length > 0) {
      setImageFiles(prev => [...prev, ...imageFiles]);
    }
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 p-6">
      <div className="w-full space-y-6">
        {/* Header with gradient background */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 p-6 text-white shadow-lg"
        >
          <h1 className="text-3xl font-bold mb-2">Import Explications</h1>
          <p className="text-purple-100">
            Select module and exam context, then add question numbers, text and/or images, give it a name and submit.
          </p>
        </motion.div>

        {/* Main Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          {/* Context Card */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
              <CardTitle className="text-xl font-bold text-gray-900">
                Exam Context
              </CardTitle>
              <CardDescription>
                Choose the exam context: par years, par courses, TP or QCM
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Module Select */}
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-700">Module *</Label>
                  <Select value={selectedModule} onValueChange={(e) => {
                    setSelectedModule(e);
                    setExamType("");
                    setSelectedExamNameYears("");
                    setSelectedCategory("");
                    setSelectedCourse("");
                    setSelectedYearName("");
                    setSelectedTPName("");
                    setSelectedQCMName("");
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

                {/* Exam Type Select */}
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-700">Exam Type *</Label>
                  <Select value={examType} onValueChange={(e) => {
                    setExamType(e);
                    setSelectedExamNameYears("");
                    setSelectedCategory("");
                    setSelectedCourse("");
                    setSelectedYearName("");
                    setSelectedTPName("");
                    setSelectedQCMName("");
                  }} disabled={!selectedModule}>
                    <SelectTrigger className="border-gray-300 h-10 disabled:bg-gray-100">
                      <SelectValue placeholder={selectedModule ? "Choose exam type" : "Select module first"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="years">Exam Par Years</SelectItem>
                      <SelectItem value="courses">Exam Par Courses</SelectItem>
                      <SelectItem value="tp">Exam TP</SelectItem>
                      <SelectItem value="qcm">Exam QCM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Conditional renders based on exam type */}
                {examType === "years" && (
                  <div className="space-y-2 md:col-span-2">
                    <Label className="font-semibold text-gray-700">Exam Name *</Label>
                    <Select value={selectedExamNameYears} onValueChange={setSelectedExamNameYears}>
                      <SelectTrigger className="border-gray-300 h-10">
                        <SelectValue placeholder="Choose an exam name" />
                      </SelectTrigger>
                      <SelectContent>
                        {(selectedModule ? examNamesByModule[selectedModule] || [] : []).map((name) => (
                          <SelectItem key={name} value={name}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {examType === "courses" && (
                  <>
                    <div className="space-y-2">
                      <Label className="font-semibold text-gray-700">Category *</Label>
                      <Select value={selectedCategory} onValueChange={(e) => {
                        setSelectedCategory(e);
                        setSelectedCourse("");
                        setSelectedYearName("");
                      }}>
                        <SelectTrigger className="border-gray-300 h-10">
                          <SelectValue placeholder="Choose a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold text-gray-700">Course *</Label>
                      <Select value={selectedCourse} onValueChange={(e) => {
                        setSelectedCourse(e);
                        setSelectedYearName("");
                      }} disabled={!selectedCategory}>
                        <SelectTrigger className="border-gray-300 h-10 disabled:bg-gray-100">
                          <SelectValue placeholder="Choose a course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courseOptions.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold text-gray-700">Year *</Label>
                      <Select value={selectedYearName} onValueChange={setSelectedYearName} disabled={!selectedCourse}>
                        <SelectTrigger className="border-gray-300 h-10 disabled:bg-gray-100">
                          <SelectValue placeholder="Choose a year" />
                        </SelectTrigger>
                        <SelectContent>
                          {yearNames.map((y) => (
                            <SelectItem key={y} value={y}>{y}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {examType === "tp" && (
                  <div className="space-y-2 md:col-span-2">
                    <Label className="font-semibold text-gray-700">TP Name *</Label>
                    <Select value={selectedTPName} onValueChange={setSelectedTPName}>
                      <SelectTrigger className="border-gray-300 h-10">
                        <SelectValue placeholder="Choose a TP name" />
                      </SelectTrigger>
                      <SelectContent>
                        {(selectedModule ? tpNamesByModule[selectedModule] || [] : []).map((name) => (
                          <SelectItem key={name} value={name}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {examType === "qcm" && (
                  <div className="space-y-2 md:col-span-2">
                    <Label className="font-semibold text-gray-700">QCM Name *</Label>
                    <Select value={selectedQCMName} onValueChange={setSelectedQCMName}>
                      <SelectTrigger className="border-gray-300 h-10">
                        <SelectValue placeholder="Choose a QCM name" />
                      </SelectTrigger>
                      <SelectContent>
                        {(selectedModule ? qcmNamesByModule[selectedModule] || [] : []).map((name) => (
                          <SelectItem key={name} value={name}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
              <CardTitle className="text-xl font-bold text-gray-900">
                Content Details
              </CardTitle>
              <CardDescription>
                Add question numbers, text and/or upload images
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Question Numbers */}
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-700 flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Question Numbers *
                  </Label>
                  <Input
                    placeholder="e.g. 1-5,7,10"
                    value={questionNumbers}
                    onChange={(e) => setQuestionNumbers(e.target.value)}
                    className="h-10 border-gray-300"
                  />
                  <p className="text-xs text-gray-500">Specify which questions this explanation covers</p>
                </div>

                {/* Explication Text */}
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-700 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Explanation Text
                  </Label>
                  <textarea
                    className="w-full rounded-md border border-gray-300 bg-white p-3 text-sm font-mono"
                    rows={5}
                    placeholder="Enter explanation text..."
                    value={explicationText}
                    onChange={(e) => setExplicationText(e.target.value)}
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-700 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Upload Images
                  </Label>
                  <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <Upload className="w-8 h-8 text-purple-600" />
                      <div className="text-center">
                        <p className="font-semibold text-gray-800">Drop images here or click to browse</p>
                        <p className="text-sm text-gray-600">Supports JPG, PNG, GIF, WebP</p>
                      </div>
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                        className="hidden"
                        id="images"
                      />
                      <label htmlFor="images">
                        <Button variant="outline" className="bg-white hover:bg-purple-50" type="button">
                          Browse Files
                        </Button>
                      </label>
                    </div>
                  </div>

                  {/* Image Preview */}
                  {imageFiles.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3"
                    >
                      {imageFiles.map((file, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative group"
                        >
                          <div className="bg-gray-200 rounded-lg overflow-hidden aspect-square flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </Button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                  
                  {imageFiles.length > 0 && (
                    <Badge className="mt-2 bg-purple-100 text-purple-800">
                      {imageFiles.length} image{imageFiles.length !== 1 ? 's' : ''} selected
                    </Badge>
                  )}
                </div>

                {/* Explication Name */}
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-700">Explication Name *</Label>
                  <Input
                    type="text"
                    placeholder="e.g. Explication - ECG Q1"
                    value={explicationName}
                    onChange={(e) => setExplicationName(e.target.value)}
                    className="h-10 border-gray-300"
                  />
                  <p className="text-xs text-gray-500">This will be used to identify the imported explication</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 rounded-b-lg border-t flex justify-end gap-3">
              <Button variant="outline" className="border-gray-300">
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 shadow-md"
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                <Save className="w-4 h-4 mr-2" />
                Submit Explication
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ImportExplications;
