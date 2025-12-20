import { useMemo, useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { BookOpen, Search, Plus, Edit, Trash2, Eye, ChevronLeft, ChevronRight, Loader2, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/shared";
import { toast } from "sonner";
import { api } from "@/lib/utils";

const QCMBanque = () => {
    const { t } = useTranslation(['admin', 'common']);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddQCMForm, setShowAddQCMForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const [moduleFilter, setModuleFilter] = useState("all");
    const [qcmList, setQcmList] = useState([]);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        moduleId: "",
        imageUrl: "",
        infoText: "",
    });

    const placeholderImage = "https://via.placeholder.com/150x100/10B981/FFFFFF?text=QCM";

    useEffect(() => {
        fetchQCMList();
        fetchModules();
    }, []);

    const fetchModules = async () => {
        try {
            const { data } = await api.get("/modules");
            setModules(data?.data || []);
        } catch (err) {
            console.error("Error fetching modules:", err);
        }
    };

    const fetchQCMList = async () => {
        try {
            setLoading(true);
            setError(null);
            const { data } = await api.get("/qcm-banque/all");
            const list = (data?.data || []).map((q) => ({
                id: q?._id,
                moduleName: q?.moduleName || q?.moduleId?.name || "",
                moduleId: q?.moduleId?._id || q?.moduleId || "",
                name: q?.name || "",
                imageUrl: q?.imageUrl || placeholderImage,
                totalQuestions: q?.totalQuestions || 0,
                infoText: q?.infoText || "",
            }));
            setQcmList(list);
        } catch (err) {
            console.error("Error fetching QCM Banque:", err);
            setError("Erreur lors du chargement des QCM Banque");
            toast.error("Erreur de chargement");
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.moduleId) {
            toast.error("Veuillez remplir les champs obligatoires");
            return;
        }

        try {
            await api.post("/qcm-banque", formData);
            toast.success("QCM Banque créé avec succès");
            setShowAddQCMForm(false);
            setFormData({ name: "", moduleId: "", imageUrl: "", infoText: "" });
            fetchQCMList();
        } catch (err) {
            console.error("Error creating QCM Banque:", err);
            toast.error("Erreur lors de la création");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce QCM Banque ?")) return;

        try {
            await api.delete(`/qcm-banque/${id}`);
            toast.success("QCM Banque supprimé");
            fetchQCMList();
        } catch (err) {
            console.error("Error deleting QCM Banque:", err);
            toast.error("Erreur lors de la suppression");
        }
    };

    const filteredQCMs = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return qcmList.filter((qcm) => {
            const passesModule = moduleFilter === "all" || qcm.moduleId === moduleFilter;
            const passesSearch =
                qcm.name.toLowerCase().includes(term) ||
                qcm.moduleName.toLowerCase().includes(term) ||
                String(qcm.id).includes(term);
            return passesModule && passesSearch;
        });
    }, [searchTerm, moduleFilter, qcmList]);

    const totalPages = Math.ceil(filteredQCMs.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentQCMs = filteredQCMs.slice(startIndex, endIndex);

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, moduleFilter]);

    const renderPagination = () => {
        if (totalPages <= 1) return null;
        const buttons = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

        buttons.push(
            <Button key="prev" variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="gap-1">
                <ChevronLeft className="h-4 w-4" />
                Précédent
            </Button>
        );

        for (let i = start; i <= end; i++) {
            buttons.push(
                <Button key={i} variant={i === currentPage ? "default" : "outline"} size="sm" onClick={() => goToPage(i)} className="min-w-[40px]">
                    {i}
                </Button>
            );
        }

        buttons.push(
            <Button key="next" variant="outline" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="gap-1">
                Suivant
                <ChevronRight className="h-4 w-4" />
            </Button>
        );

        return <div className="flex items-center gap-2">{buttons}</div>;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">Chargement des QCM Banque...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
                {/* Action Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                    <div>
                        <h2 className="text-2xl font-bold text-black mb-1">QCM Banque</h2>
                        <p className="text-gray-600">Total: <span className="font-semibold text-black">{filteredQCMs.length}</span> QCM Banque</p>
                    </div>
                    <Button
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
                        onClick={() => setShowAddQCMForm(true)}
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Créer QCM Banque
                    </Button>
                </motion.div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Répertoire des QCM Banque
                        </CardTitle>
                        <CardDescription>Gérer les banques de QCM par module</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input type="text" placeholder="Rechercher par nom ou module..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                            </div>
                            <Select value={moduleFilter} onValueChange={setModuleFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Tous les modules" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les modules</SelectItem>
                                    {modules.map((m) => (
                                        <SelectItem key={m._id} value={m._id}>
                                            {m.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {error && <div className="text-sm text-red-600 p-3 bg-red-50 rounded-md">{error}</div>}

                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Module</TableHead>
                                        <TableHead>Nom du QCM</TableHead>
                                        <TableHead>Image</TableHead>
                                        <TableHead>
                                            <div className="flex items-center gap-1">
                                                <HelpCircle className="h-4 w-4" />
                                                Info
                                            </div>
                                        </TableHead>
                                        <TableHead>Questions</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentQCMs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                                Aucun QCM Banque trouvé
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        currentQCMs.map((qcm) => (
                                            <TableRow key={qcm.id}>
                                                <TableCell className="font-mono text-sm">{qcm.id?.slice(-6)}</TableCell>
                                                <TableCell className="font-medium">{qcm.moduleName}</TableCell>
                                                <TableCell className="font-medium">{qcm.name}</TableCell>
                                                <TableCell>
                                                    <div className="w-16 h-12 rounded-md overflow-hidden bg-slate-100 border">
                                                        <img src={qcm.imageUrl} alt={qcm.name} className="w-full h-full object-cover" />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate" title={qcm.infoText}>
                                                    {qcm.infoText || "—"}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{qcm.totalQuestions}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleDelete(qcm.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t bg-slate-50/50">
                        <div className="text-sm text-muted-foreground">
                            Affichage de {filteredQCMs.length === 0 ? 0 : startIndex + 1} à {Math.min(endIndex, filteredQCMs.length)} sur {filteredQCMs.length} résultats
                        </div>
                        {renderPagination()}
                    </CardFooter>
                </Card>
            </div>

            {/* Add QCM Banque Dialog */}
            <AnimatePresence>
                {showAddQCMForm && (
                    <Dialog open={showAddQCMForm} onOpenChange={setShowAddQCMForm}>
                        <DialogContent className="bg-white border-gray-200 text-black sm:max-w-md">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                            >
                                <DialogHeader>
                                    <DialogTitle className="text-black text-xl">Créer un QCM Banque</DialogTitle>
                                    <DialogDescription className="text-gray-600">
                                        Ajouter un nouveau QCM Banque avec les détails nécessaires
                                    </DialogDescription>
                                </DialogHeader>

                                <form className="space-y-4 py-4" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                                    <div className="space-y-2">
                                        <Label className="text-black font-medium">Nom du QCM *</Label>
                                        <Input
                                            placeholder="Ex: Banque QCM Anatomie"
                                            value={formData.name}
                                            onChange={(e) => handleFormChange("name", e.target.value)}
                                            className="bg-gray-50 border-gray-300 text-black placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-black font-medium">Module *</Label>
                                        <Select value={formData.moduleId} onValueChange={(value) => handleFormChange("moduleId", value)}>
                                            <SelectTrigger className="bg-gray-50 border-gray-300 text-black">
                                                <SelectValue placeholder="Sélectionner un module" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border-gray-200">
                                                {modules.map((m) => (
                                                    <SelectItem key={m._id} value={m._id} className="text-black">
                                                        {m.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-black font-medium">URL de l'image</Label>
                                        <Input
                                            placeholder="https://..."
                                            value={formData.imageUrl}
                                            onChange={(e) => handleFormChange("imageUrl", e.target.value)}
                                            className="bg-gray-50 border-gray-300 text-black placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-black font-medium">Texte d'aide (optionnel)</Label>
                                        <textarea
                                            placeholder="Entrez une description ou des informations supplémentaires..."
                                            value={formData.infoText}
                                            onChange={(e) => handleFormChange("infoText", e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500 min-h-[80px] resize-none"
                                        />
                                    </div>

                                    <DialogFooter className="gap-2 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="border-gray-300 text-black hover:bg-gray-100 hover:text-black"
                                            onClick={() => setShowAddQCMForm(false)}
                                        >
                                            Annuler
                                        </Button>
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Button
                                                type="submit"
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                Créer QCM Banque
                                            </Button>
                                        </motion.div>
                                    </DialogFooter>
                                </form>
                            </motion.div>
                        </DialogContent>
                    </Dialog>
                )}
            </AnimatePresence>
        </div>
    );
};

export default QCMBanque;
