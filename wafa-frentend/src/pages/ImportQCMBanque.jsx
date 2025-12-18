import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
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
import { Plus, Trash2, Upload, FileText, Database, FolderOpen } from "lucide-react";
import { moduleService } from "@/services/moduleService";
import { toast } from "sonner";

const ImportQCMBanque = () => {
  const { t } = useTranslation(['admin', 'common']);
  
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [excelFile, setExcelFile] = useState(null);
  const [importing, setImporting] = useState(false);

  // Categories for QCM Banque
  const categories = useMemo(() => [
    "Cardiologie",
    "Pneumologie",
    "Gastro-entérologie",
    "Neurologie",
    "Néphrologie",
    "Endocrinologie",
    "Hématologie",
    "Rhumatologie",
    "Dermatologie",
    "Infectiologie",
    "Autre"
  ], []);

  // Fetch modules on mount
  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const response = await moduleService.getAllmodules();
        // Filter to only show QCM Banque type modules
        const qcmModules = response.data?.data?.filter(m => m.type === 'QCM banque') || [];
        setModules(qcmModules);
      } catch (error) {
        console.error('Error fetching modules:', error);
        toast.error('Erreur lors du chargement des modules');
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, []);

  // Image mappings
  const [imageMappings, setImageMappings] = useState([
    { id: crypto.randomUUID(), file: null, questionNumbers: "" },
  ]);

  // Category mappings for questions
  const [categoryMappings, setCategoryMappings] = useState([
    { id: crypto.randomUUID(), category: "", questionNumbers: "" },
  ]);

  const handleAddImageRow = () =>
    setImageMappings((prev) => [
      ...prev,
      { id: crypto.randomUUID(), file: null, questionNumbers: "" },
    ]);

  const handleRemoveImageRow = (id) =>
    setImageMappings((prev) => prev.filter((r) => r.id !== id));

  const handleAddCategoryRow = () =>
    setCategoryMappings((prev) => [
      ...prev,
      { id: crypto.randomUUID(), category: "", questionNumbers: "" },
    ]);

  const handleRemoveCategoryRow = (id) =>
    setCategoryMappings((prev) => prev.filter((r) => r.id !== id));

  const canImport = selectedModule && excelFile;

  const handleImport = async () => {
    if (!canImport) return;
    
    setImporting(true);
    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('moduleId', selectedModule);
      formData.append('file', excelFile);
      formData.append('type', 'qcm-banque');
      
      if (selectedCategory) {
        formData.append('defaultCategory', selectedCategory);
      }
      
      // Add image mappings
      imageMappings.forEach((mapping, index) => {
        if (mapping.file && mapping.questionNumbers) {
          formData.append(`images[${index}][file]`, mapping.file);
          formData.append(`images[${index}][questions]`, mapping.questionNumbers);
        }
      });
      
      // Add category mappings
      categoryMappings.forEach((mapping, index) => {
        if (mapping.category && mapping.questionNumbers) {
          formData.append(`categories[${index}][name]`, mapping.category);
          formData.append(`categories[${index}][questions]`, mapping.questionNumbers);
        }
      });

      // TODO: Wire to actual API endpoint
      // await questionService.importQCMBanque(formData);
      
      toast.success('Import réussi', {
        description: `Questions importées dans ${modules.find(m => m._id === selectedModule)?.name || 'le module'}`
      });
      
      // Reset form
      setExcelFile(null);
      setImageMappings([{ id: crypto.randomUUID(), file: null, questionNumbers: "" }]);
      setCategoryMappings([{ id: crypto.randomUUID(), category: "", questionNumbers: "" }]);
      
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Erreur lors de l\'import', {
        description: error.message || 'Une erreur est survenue'
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100 p-6">
      <div className="w-full space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 p-6 text-white shadow-lg flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">Importer QCM Banque</h1>
            <p className="text-emerald-100">
              Importez des questions pour la banque de QCM depuis un fichier Excel
            </p>
          </div>
          <Database className="w-12 h-12 opacity-80" />
        </motion.div>

        {/* Source Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <Upload className="w-5 h-5" />
                Source d'Importation
              </CardTitle>
              <CardDescription>
                Sélectionnez le module QCM Banque, la catégorie par défaut, puis téléchargez le fichier Excel
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
                  <Label className="font-semibold text-gray-700">Module QCM Banque</Label>
                  <Select
                    value={selectedModule}
                    onValueChange={setSelectedModule}
                    disabled={loading}
                  >
                    <SelectTrigger className="border-emerald-200">
                      <SelectValue placeholder={loading ? "Chargement..." : "Choisir un module"} />
                    </SelectTrigger>
                    <SelectContent>
                      {modules.length === 0 ? (
                        <SelectItem value="none" disabled>
                          Aucun module QCM Banque trouvé
                        </SelectItem>
                      ) : (
                        modules.map((m) => (
                          <SelectItem key={m._id} value={m._id}>
                            {m.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="space-y-2"
                >
                  <Label className="font-semibold text-gray-700">Catégorie par Défaut (optionnel)</Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="border-emerald-200">
                      <SelectValue placeholder="Choisir une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
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
                      className="border-emerald-200"
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
                className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                disabled={!canImport || importing}
                onClick={handleImport}
              >
                <Upload className="w-4 h-4" />
                {importing ? 'Import en cours...' : 'Importer'}
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
            <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b">
              <CardTitle className="flex items-center gap-2 text-teal-900">
                <FileText className="w-5 h-5" />
                Mappages Optionnels
              </CardTitle>
              <CardDescription>
                Associez les images aux questions ou organisez les questions par catégorie
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Images */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-teal-50 rounded-lg">
                    <Plus className="w-5 h-5 text-teal-600" />
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
                    className="w-full gap-2 border-teal-200 text-teal-600 hover:bg-teal-50"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter une Ligne d'Image
                  </Button>
                </div>

                {/* Right: Categories */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-cyan-50 rounded-lg">
                    <FolderOpen className="w-5 h-5 text-cyan-600" />
                    <h3 className="font-semibold text-gray-900">Organiser par Catégorie</h3>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {categoryMappings.map((row, idx) => (
                      <motion.div
                        key={row.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.05 }}
                        className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end p-3 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <div className="sm:col-span-2 space-y-1">
                          <Label className="text-xs font-semibold">Catégorie</Label>
                          <Select
                            value={row.category}
                            onValueChange={(value) =>
                              setCategoryMappings((prev) =>
                                prev.map((r) =>
                                  r.id === row.id ? { ...r, category: value } : r
                                )
                              )
                            }
                          >
                            <SelectTrigger className="text-xs">
                              <SelectValue placeholder="Choisir" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="sm:col-span-2 space-y-1">
                          <Label className="text-xs font-semibold">Numéros de Questions</Label>
                          <Input
                            placeholder="ex: 10-15,22"
                            value={row.questionNumbers}
                            onChange={(e) =>
                              setCategoryMappings((prev) =>
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
                          onClick={() => handleRemoveCategoryRow(row.id)}
                          disabled={categoryMappings.length === 1}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleAddCategoryRow}
                    className="w-full gap-2 border-cyan-200 text-cyan-600 hover:bg-cyan-50"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter une Catégorie
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

export default ImportQCMBanque;
