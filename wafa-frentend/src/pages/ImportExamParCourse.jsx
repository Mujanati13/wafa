import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Upload, BookOpen, ChevronRight } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50 to-slate-100 p-6">
      <div className="w-full space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-lg bg-gradient-to-r from-rose-600 to-orange-500 p-6 text-white shadow-lg flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">Importer Examens par Cours</h1>
            <p className="text-rose-100">
              Importez les questions par catégories de cours
            </p>
          </div>
          <BookOpen className="w-12 h-12 opacity-80" />
        </motion.div>

        {/* Source Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-rose-50 to-orange-50 border-b">
              <CardTitle className="flex items-center gap-2 text-rose-900">
                <Upload className="w-5 h-5" />
                Hiérarchie des Cours
              </CardTitle>
              <CardDescription>
                Sélectionnez le module, la catégorie, le cours et l'examen, puis téléchargez le fichier Excel
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Module Select */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.15 }}
                  className="space-y-2"
                >
                  <Label className="font-semibold text-gray-700 flex items-center gap-1">
                    <span className="text-rose-600">●</span> Module
                  </Label>
                  <Select
                    value={selectedModule}
                    onValueChange={(value) => {
                      setSelectedModule(value);
                      setSelectedCategory("");
                      setSelectedCourse("");
                      setSelectedExam("");
                    }}
                  >
                    <SelectTrigger className="border-rose-200">
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
                </motion.div>

                {/* Category Select */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="space-y-2"
                >
                  <Label className="font-semibold text-gray-700 flex items-center gap-1">
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-orange-600">●</span> Catégorie
                  </Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={(value) => {
                      setSelectedCategory(value);
                      setSelectedCourse("");
                      setSelectedExam("");
                    }}
                    disabled={!selectedModule}
                  >
                    <SelectTrigger className="border-rose-200">
                      <SelectValue placeholder={selectedModule ? "Choisir une catégorie" : "Sélectionnez d'abord un module"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>

                {/* Course Select */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.25 }}
                  className="space-y-2"
                >
                  <Label className="font-semibold text-gray-700 flex items-center gap-1">
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-amber-600">●</span> Cours
                  </Label>
                  <Select
                    value={selectedCourse}
                    onValueChange={(value) => {
                      setSelectedCourse(value);
                      setSelectedExam("");
                    }}
                    disabled={!selectedCategory}
                  >
                    <SelectTrigger className="border-rose-200">
                      <SelectValue placeholder={selectedCategory ? "Choisir un cours" : "Sélectionnez d'abord une catégorie"} />
                    </SelectTrigger>
                    <SelectContent>
                      {courseOptions.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>

                {/* File Upload */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="space-y-2"
                >
                  <Label className="font-semibold text-gray-700">Fichier Excel</Label>
                  <div className="relative">
                    <Input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                      className="border-rose-200"
                    />
                    {excelFile && (
                      <Badge className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-100 text-green-800 border-0 text-xs">
                        ✓ Prêt
                      </Badge>
                    )}
                  </div>
                </motion.div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t flex justify-end">
              <Button
                className="bg-rose-600 hover:bg-rose-700 gap-2"
                disabled={!canImport}
                onClick={handleImport}
              >
                <Upload className="w-4 h-4" />
                Importer
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Exam Year Integration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <BookOpen className="w-5 h-5" />
                Intégrer Questions d'Examens par Années
              </CardTitle>
              <CardDescription>
                Mappez les questions des examens par années existants vers cet examen par cours
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {yearMappings.map((row, idx) => (
                  <motion.div
                    key={row.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                    className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="sm:col-span-2 space-y-1">
                      <Label className="text-xs font-semibold">Nom de l'Année</Label>
                      <Input
                        placeholder="ex: 2023 - Principal"
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
                        className="text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <Label className="text-xs font-semibold">Numéros de Questions</Label>
                      <Input
                        placeholder="ex: 1-5,7,10-12"
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
                        className="text-xs"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveYearRow(row.id)}
                      disabled={yearMappings.length === 1}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={handleAddYearRow}
                className="w-full mt-4 gap-2 border-orange-200 text-orange-600 hover:bg-orange-50"
              >
                <Plus className="w-4 h-4" />
                Ajouter une Intégration d'Année
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ImportExamParCourse;
