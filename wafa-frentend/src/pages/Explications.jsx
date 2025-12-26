import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { FileQuestion, Loader2, ChevronLeft, ChevronRight, CheckCircle2, Trash, MoreVertical, Eye, Edit, ImageIcon, AlertCircle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader, StatCard } from "@/components/shared";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { api } from "@/lib/utils";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const Explications = () => {
  const { t } = useTranslation(['admin', 'common']);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [explanations, setExplanations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Popup state for question viewing
  const [questionPopup, setQuestionPopup] = useState({ open: false, text: '' });

  // Action dialog states
  const [selectedExplanation, setSelectedExplanation] = useState(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const openQuestionPopup = (questionText) => {
    setQuestionPopup({ open: true, text: questionText });
  };

  // Fetch explanations
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/explanations");
      const list = Array.isArray(data?.data) ? data.data : [];
      const mapped = list.map((item) => ({
        id: item?._id,
        username: item?.userId?.email || "—",
        name: item?.userId?.name || "—",
        question: item?.questionId?.text || "—",
        explicationTitle: item?.title || "—",
        date: item?.createdAt
          ? new Date(item.createdAt).toISOString().slice(0, 10)
          : "—",
        // Support both legacy imageUrl and new imageUrls array
        images: item?.imageUrls?.length > 0
          ? item.imageUrls
          : (item?.imageUrl ? [item.imageUrl] : []),
        pdfUrl: item?.pdfUrl || null,
        text: item?.contentText || "",
        status: item?.status || "pending",
        // New module and exam fields
        moduleName: item?.moduleName || "—",
        moduleCategory: item?.moduleCategory || "—",
        examName: item?.examName || "—",
        examYear: item?.examYear || "—",
        courseCategory: item?.courseCategory || "—",
        courseName: item?.courseName || "—",
        numberOfQuestions: item?.numberOfQuestions || "—",
      }));
      setExplanations(mapped);
    } catch (e) {
      setError(t('admin:failed_load_explanations'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handler functions
  const handleViewDetails = (explanation) => {
    setSelectedExplanation(explanation);
    setShowViewDialog(true);
  };

  const handleApprove = async (explanation) => {
    setActionLoading(true);
    try {
      await api.patch(`/explanations/${explanation.id}/status`, { status: 'approved' });
      toast.success("Explication approuvée avec succès");
      fetchData(); // Refresh list
    } catch (error) {
      toast.error("Erreur lors de l'approbation");
      console.error("Approve error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClick = (explanation) => {
    setSelectedExplanation(explanation);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedExplanation) return;
    setActionLoading(true);
    try {
      await api.delete(`/explanations/${selectedExplanation.id}`);
      toast.success("Explication supprimée avec succès");
      setShowDeleteDialog(false);
      setSelectedExplanation(null);
      fetchData(); // Refresh list
    } catch (error) {
      toast.error("Erreur lors de la suppression");
      console.error("Delete error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(explanations.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReports = explanations.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    buttons.push(
      <Button
        key="prev"
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1"
      >
        <span className="sr-only">Previous</span>
        &#8592;
      </Button>
    );

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className="min-w-[40px]"
        >
          {i}
        </Button>
      );
    }

    // Next button
    buttons.push(
      <Button
        key="next"
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1"
      >
        <span className="sr-only">Next</span>
        &#8594;
      </Button>
    );

    return buttons;
  };
  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-slate-900">Explications Management</h1>
        <p className="text-slate-500">Manage user-submitted explanation questions and verify content</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Explanations</p>
                  <p className="text-3xl font-bold text-blue-900 mt-2">{explanations.length}</p>
                </div>
                <div className="p-3 bg-blue-200 rounded-lg">
                  <FileQuestion className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Approved</p>
                  <p className="text-3xl font-bold text-green-900 mt-2">0</p>
                </div>
                <div className="p-3 bg-green-200 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600">Pending Review</p>
                  <p className="text-3xl font-bold text-amber-900 mt-2">{explanations.length}</p>
                </div>
                <div className="p-3 bg-amber-200 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Table Card */}
      <Card className="shadow-lg border-slate-200">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
          <CardTitle>All Explanations</CardTitle>
          <CardDescription>View and manage all user-submitted explanations</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-3" />
                <p className="text-slate-600">Loading explanations...</p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Error loading data</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && explanations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <FileQuestion className="h-12 w-12 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">No explanations found</p>
            </div>
          )}

          {!loading && !error && explanations.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50 border-slate-200">
                      <TableHead className="font-semibold text-slate-700">User</TableHead>
                      <TableHead className="font-semibold text-slate-700">Module</TableHead>
                      <TableHead className="font-semibold text-slate-700">Type d'Examen</TableHead>
                      <TableHead className="font-semibold text-slate-700">Examen / Cours</TableHead>
                      <TableHead className="font-semibold text-slate-700">Nb Questions</TableHead>
                      <TableHead className="font-semibold text-slate-700">Question</TableHead>
                      <TableHead className="font-semibold text-slate-700">Title</TableHead>
                      <TableHead className="font-semibold text-slate-700">Date</TableHead>
                      <TableHead className="font-semibold text-slate-700">Media</TableHead>
                      <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentReports.map((report, idx) => (
                      <motion.tr
                        key={report.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.05 }}
                        className="border-b border-slate-200 hover:bg-slate-50/50 transition-colors"
                      >
                        <TableCell className="py-3">
                          <div className="flex flex-col">
                            <p className="font-medium text-slate-900">{report.name}</p>
                            <p className="text-xs text-slate-500">{report.username}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-slate-700">{report.moduleName}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            report.moduleCategory === "Exam par years" ? "default" :
                              report.moduleCategory === "Exam par courses" ? "secondary" :
                                report.moduleCategory === "QCM banque" ? "outline" :
                                  "secondary"
                          } className="whitespace-nowrap">
                            {report.moduleCategory}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          {report.moduleCategory === "Exam par years" && (
                            <div className="text-sm">
                              <span className="font-medium">{report.examName}</span>
                              {report.examYear && report.examYear !== "—" && (
                                <span className="text-slate-500 ml-1">({report.examYear})</span>
                              )}
                            </div>
                          )}
                          {report.moduleCategory === "Exam par courses" && (
                            <div className="text-sm">
                              {report.courseCategory && report.courseCategory !== "—" && (
                                <span className="text-slate-500">{report.courseCategory} → </span>
                              )}
                              <span className="font-medium">{report.courseName || report.examName}</span>
                            </div>
                          )}
                          {report.moduleCategory === "QCM banque" && (
                            <div className="text-sm">
                              <span className="font-medium">{report.examName}</span>
                            </div>
                          )}
                          {report.moduleCategory === "—" && (
                            <span className="text-slate-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium text-slate-600">
                            {report.numberOfQuestions}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="cursor-pointer bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors"
                            onClick={() => openQuestionPopup(report.question)}
                          >
                            Voir la question
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-slate-700 border-slate-300">
                            {report.explicationTitle || "—"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">{report.date}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {report.images?.length > 0 && (
                              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                                <ImageIcon className="h-3 w-3 mr-1" />
                                {report.images.length}
                              </Badge>
                            )}
                            {report.pdfUrl && (
                              <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                                PDF
                              </Badge>
                            )}
                            {report.text && (
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                Text
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="cursor-pointer gap-2"
                                onClick={() => handleViewDetails(report)}
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer gap-2"
                                onClick={() => handleViewDetails(report)}
                              >
                                <Edit className="h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="cursor-pointer gap-2 text-green-600 focus:text-green-700 focus:bg-green-50"
                                onClick={() => handleApprove(report)}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer gap-2 text-red-600 focus:text-red-700 focus:bg-red-50"
                                onClick={() => handleDeleteClick(report)}
                              >
                                <Trash className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-200">
                  <p className="text-sm text-slate-600">
                    Showing <span className="font-semibold">{startIndex + 1}</span> to{" "}
                    <span className="font-semibold">{Math.min(endIndex, explanations.length)}</span> of{" "}
                    <span className="font-semibold">{explanations.length}</span> results
                  </p>
                  <div className="flex items-center gap-2">
                    {renderPaginationButtons()}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Question Popup Dialog */}
      <Dialog open={questionPopup.open} onOpenChange={(open) => setQuestionPopup({ ...questionPopup, open })}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Question
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <p className="text-base leading-relaxed text-slate-800 whitespace-pre-wrap break-words">
                  {questionPopup.text || '—'}
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setQuestionPopup({ open: false, text: '' })}
            >
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Détails de l'explication
            </DialogTitle>
          </DialogHeader>
          {selectedExplanation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Utilisateur</p>
                  <p className="font-medium">{selectedExplanation.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedExplanation.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Module</p>
                  <p className="font-medium">{selectedExplanation.moduleName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{selectedExplanation.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Statut</p>
                  <Badge className={selectedExplanation.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                    {selectedExplanation.status}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Question</p>
                <p className="font-medium mt-1">{selectedExplanation.question}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Titre</p>
                <p className="font-medium mt-1">{selectedExplanation.explicationTitle}</p>
              </div>
              {selectedExplanation.text && (
                <div>
                  <p className="text-sm text-gray-500">Contenu</p>
                  <p className="mt-1 whitespace-pre-wrap">{selectedExplanation.text}</p>
                </div>
              )}
              {/* Display Images */}
              {selectedExplanation.images?.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Images ({selectedExplanation.images.length})</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedExplanation.images.map((imgUrl, idx) => (
                      <a
                        key={idx}
                        href={imgUrl.startsWith('http') ? imgUrl : `${import.meta.env.VITE_API_URL || ''}${imgUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block aspect-video overflow-hidden rounded-lg border border-gray-200 hover:border-blue-400 transition-colors"
                      >
                        <img
                          src={imgUrl.startsWith('http') ? imgUrl : `${import.meta.env.VITE_API_URL || ''}${imgUrl}`}
                          alt={`Image ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {/* Display PDF */}
              {selectedExplanation.pdfUrl && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Document PDF</p>
                  <a
                    href={selectedExplanation.pdfUrl.startsWith('http') ? selectedExplanation.pdfUrl : `${import.meta.env.VITE_API_URL || ''}${selectedExplanation.pdfUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    Voir le PDF
                  </a>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash className="h-5 w-5" />
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette explication de <strong>{selectedExplanation?.name}</strong> ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={actionLoading}>
              {actionLoading ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Explications;

// dummy data removed; using API data
