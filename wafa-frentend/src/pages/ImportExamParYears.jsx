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
import { Plus, Trash2, Upload, FileText, Calendar } from "lucide-react";

const ImportExamParYears = () => {
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

  const examsByModule = useMemo(
    () => ({
      "Anatomie 1": [
        "Anatomie 1 - 2021",
        "Anatomie 1 - 2022",
        "Anatomie 1 - 2023",
      ],
      Biophysique: ["Biophysique - 2022", "Biophysique - 2023"],
      Embryologie: ["Embryologie - 2021", "Embryologie - 2024"],
      Histologie: ["Histologie - 2023"],
      "Physiologie 1": ["Physiologie 1 - 2022", "Physiologie 1 - 2023"],
      "Biochimie 1": ["Biochimie 1 - 2023"],
    }),
    []
  );

  const [selectedModule, setSelectedModule] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [excelFile, setExcelFile] = useState(null);

  // Left column: images attachment to question numbers
  const [imageMappings, setImageMappings] = useState([
    { id: crypto.randomUUID(), file: null, questionNumbers: "" },
  ]);

  // Right column: integrate questions into a sub module
  const [subModuleMappings, setSubModuleMappings] = useState([
    { id: crypto.randomUUID(), name: "", questionNumbers: "" },
  ]);

  const handleAddImageRow = () =>
    setImageMappings((prev) => [
      ...prev,
      { id: crypto.randomUUID(), file: null, questionNumbers: "" },
    ]);

  const handleRemoveImageRow = (id) =>
    setImageMappings((prev) => prev.filter((r) => r.id !== id));

  const handleAddSubModuleRow = () =>
    setSubModuleMappings((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: "", questionNumbers: "" },
    ]);

  const handleRemoveSubModuleRow = (id) =>
    setSubModuleMappings((prev) => prev.filter((r) => r.id !== id));

  const canImport = selectedModule && selectedExam && excelFile;

  const handleImport = () => {
    // Placeholder handler. Wire to API later.
    alert(
      `Import ready:\nModule: ${selectedModule}\nExam: ${selectedExam}\nExcel: ${excelFile?.name}\n` +
        `Images rows: ${imageMappings.length}\nSub-modules rows: ${subModuleMappings.length}`
    );
  };

  const examOptions = selectedModule ? examsByModule[selectedModule] || [] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 p-6">
      <div className="w-full space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-500 p-6 text-white shadow-lg flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">Importer Examens par Années</h1>
            <p className="text-indigo-100">
              Importez les questions depuis un fichier Excel
            </p>
          </div>
          <Calendar className="w-12 h-12 opacity-80" />
        </motion.div>

        {/* Source Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
              <CardTitle className="flex items-center gap-2 text-indigo-900">
                <Upload className="w-5 h-5" />
                Source d'Importation
              </CardTitle>
              <CardDescription>
                Sélectionnez le module, l'examen par année, puis téléchargez le fichier Excel
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.15 }}
                  className="space-y-2"
                >
                  <Label className="font-semibold text-gray-700">Module</Label>
                  <Select
                    value={selectedModule}
                    onValueChange={(value) => {
                      setSelectedModule(value);
                      setSelectedExam("");
                    }}
                  >
                    <SelectTrigger className="border-indigo-200">
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

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="space-y-2"
                >
                  <Label className="font-semibold text-gray-700">Examen par Année</Label>
                  <Select
                    value={selectedExam}
                    onValueChange={setSelectedExam}
                    disabled={!selectedModule}
                  >
                    <SelectTrigger className="border-indigo-200">
                      <SelectValue placeholder={selectedModule ? "Choisir un examen" : "Sélectionnez d'abord un module"} />
                    </SelectTrigger>
                    <SelectContent>
                      {examOptions.map((ex) => (
                        <SelectItem key={ex} value={ex}>
                          {ex}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.25 }}
                  className="space-y-2"
                >
                  <Label className="font-semibold text-gray-700">Fichier Excel</Label>
                  <div className="relative">
                    <Input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                      className="border-indigo-200"
                    />
                    {excelFile && (
                      <Badge className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-100 text-green-800 border-0">
                        <FileText className="w-3 h-3 mr-1" />
                        {excelFile.name}
                      </Badge>
                    )}
                  </div>
                </motion.div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t flex justify-end">
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                disabled={!canImport}
                onClick={handleImport}
              >
                <Upload className="w-4 h-4" />
                Importer
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Optional Mappings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <FileText className="w-5 h-5" />
                Mappages Optionnels
              </CardTitle>
              <CardDescription>
                Associez les images aux questions ou intégrez les questions dans des sous-modules
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Images */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                    <Plus className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">Ajouter des Images</h3>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {imageMappings.map((row, idx) => (
                      <motion.div
                        key={row.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.05 }}
                        className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end p-3 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <div className="sm:col-span-2 space-y-1">
                          <Label className="text-xs font-semibold">Image</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setImageMappings((prev) =>
                                prev.map((r) =>
                                  r.id === row.id ? { ...r, file } : r
                                )
                              );
                            }}
                            className="text-xs"
                          />
                        </div>
                        <div className="sm:col-span-2 space-y-1">
                          <Label className="text-xs font-semibold">Questions</Label>
                          <Input
                            placeholder="ex: 1,2,5-7"
                            value={row.questionNumbers}
                            onChange={(e) =>
                              setImageMappings((prev) =>
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
                          onClick={() => handleRemoveImageRow(row.id)}
                          disabled={imageMappings.length === 1}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleAddImageRow}
                    className="w-full gap-2 border-purple-200 text-purple-600 hover:bg-purple-50"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter une Ligne d'Image
                  </Button>
                </div>

                {/* Right: Sub-modules */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-pink-50 rounded-lg">
                    <Plus className="w-5 h-5 text-pink-600" />
                    <h3 className="font-semibold text-gray-900">Intégrer dans Sous-modules</h3>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {subModuleMappings.map((row, idx) => (
                      <motion.div
                        key={row.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.05 }}
                        className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end p-3 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <div className="sm:col-span-2 space-y-1">
                          <Label className="text-xs font-semibold">Nom du Sous-module</Label>
                          <Input
                            placeholder="ex: Cardiologie"
                            value={row.name}
                            onChange={(e) =>
                              setSubModuleMappings((prev) =>
                                prev.map((r) =>
                                  r.id === row.id
                                    ? { ...r, name: e.target.value }
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
                            placeholder="ex: 10-15,22"
                            value={row.questionNumbers}
                            onChange={(e) =>
                              setSubModuleMappings((prev) =>
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
                          onClick={() => handleRemoveSubModuleRow(row.id)}
                          disabled={subModuleMappings.length === 1}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleAddSubModuleRow}
                    className="w-full gap-2 border-pink-200 text-pink-600 hover:bg-pink-50"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter un Sous-module
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ImportExamParYears;
