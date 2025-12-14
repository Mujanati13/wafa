import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { FileQuestion, Trash2, Check, AlertCircle, FilePenLine, Loader2, Eye, X, BookOpen, Calendar, Hash, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PageHeader, StatCard, TableFilters } from "@/components/shared";
import { toast } from "sonner";
import { api } from "@/lib/utils";

const ReportQuestionsAdmin = () => {
  const { t } = useTranslation(['admin', 'common']);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  
  // Dialog states
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/report-questions/all");
      console.log("Full response:", response);
      console.log("Response data:", response.data);
      
      const list = (response.data?.data || []).map((r) => ({
        id: r?._id,
        name: r?.username || r?.userId?.username || "—",
        username: r?.username || r?.userId?.username || "—",
        userEmail: r?.userEmail || r?.userId?.email || "—",
        question: r?.questionTitle || r?.questionId?.text || "—",
        text: r?.details || "",
        date: (r?.createdAt || r?.updatedAt || "").slice(0, 10),
        status: r?.status || "pending",
        // Question reference data
        moduleName: r?.moduleName || "—",
        moduleCategory: r?.moduleCategory || "—",
        examName: r?.examName || "—",
        examYear: r?.examYear || "—",
        sessionLabel: r?.questionSessionLabel || "—",
        questionId: r?.questionId?._id || r?.questionId,
      }));
      console.log("Processed list:", list);
      setReports(list);
    } catch (e) {
      console.error("Error fetching reports:", e);
      console.error("Error response:", e.response);
      setError(t('admin:failed_load_reports'));
      toast.error(t('common:error_loading'));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/report-questions/${id}/approve`);
      toast.success(t('admin:report_approved'));
      fetchReports();
    } catch (error) {
      console.error("Error approving report:", error);
      toast.error(t('admin:failed_approval'));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('admin:confirm_delete_report'))) return;
    
    try {
      await api.delete(`/report-questions/${id}`);
      toast.success(t('admin:report_deleted'));
      fetchReports();
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error(t('admin:failed_delete'));
    }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/report-questions/${id}/reject`);
      toast.success("Rapport rejeté");
      fetchReports();
    } catch (error) {
      console.error("Error rejecting report:", error);
      toast.error("Échec du rejet");
    }
  };

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setDetailsOpen(true);
  };

  const handleEditQuestion = (questionId) => {
    // Navigate to question edit page or open edit modal
    window.open(`/admin/questions/edit/${questionId}`, '_blank');
  };

  // Filter reports based on search and date
  const filteredReports = reports.filter((report) => {
    const matchesSearch = 
      report.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.moduleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.text?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    if (dateFrom) {
      matchesDate = matchesDate && report.date >= dateFrom;
    }
    if (dateTo) {
      matchesDate = matchesDate && report.date <= dateTo;
    }
    
    return matchesSearch && matchesDate;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReports = filteredReports.slice(startIndex, endIndex);

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

    buttons.push(
      <Button
        key="prev"
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        &#8592;
      </Button>
    );

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

    buttons.push(
      <Button
        key="next"
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        &#8594;
      </Button>
    );

    return buttons;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Gestion des Rapports"
          description="Gérer les questions signalées par les utilisateurs"
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Rapports"
            value={reports.length}
            icon={<FileQuestion className="w-6 h-6" />}
            variant="blue"
          />
          <StatCard
            title="En Attente"
            value={reports.filter(r => r.status === "pending").length}
            icon={<AlertCircle className="w-6 h-6" />}
            variant="orange"
          />
          <StatCard
            title="Approuvés"
            value={reports.filter(r => r.status === "approved").length}
            icon={<Check className="w-6 h-6" />}
            variant="green"
          />
          <StatCard
            title="Rejetés"
            value={reports.filter(r => r.status === "rejected").length}
            icon={<X className="w-6 h-6" />}
            variant="red"
          />
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <TableFilters
              onSearch={setSearchTerm}
              onDateChange={(from, to) => {
                setDateFrom(from);
                setDateTo(to);
              }}
              placeholder="Rechercher par utilisateur, question, module..."
              showYearFilter={false}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Détails</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        Aucun rapport trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">
                          {report.username}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">{report.moduleName}</span>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {report.question}
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          {report.text || "—"}
                        </TableCell>
                        <TableCell>{report.date || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={
                            report.status === "approved" ? "success" :
                            report.status === "rejected" ? "destructive" :
                            "secondary"
                          }>
                            {report.status === "approved" ? "Approuvé" :
                             report.status === "rejected" ? "Rejeté" :
                             "En attente"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(report)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="Voir les détails"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {report.status === "pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleApprove(report.id)}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  title="Approuver"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleReject(report.id)}
                                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                  title="Rejeter"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditQuestion(report.questionId)}
                              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                              title="Modifier la question"
                            >
                              <FilePenLine className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(report.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Supprimer"
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

            {filteredReports.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t bg-slate-50/50 px-6 py-4">
                <div className="text-sm text-muted-foreground">
                  Affichage de {startIndex + 1} à {Math.min(endIndex, filteredReports.length)} sur {filteredReports.length} résultats
                </div>
                <div className="flex items-center gap-2">
                  {renderPaginationButtons()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileQuestion className="h-5 w-5 text-blue-500" />
              Détails du Rapport
            </DialogTitle>
            <DialogDescription>
              Informations complètes sur le rapport de question
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-6 mt-4">
              {/* Question Reference */}
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-sm text-slate-700 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Référence de la Question
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Module:</span>
                    <span className="font-medium">{selectedReport.moduleName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Catégorie:</span>
                    <span className="font-medium">{selectedReport.moduleCategory}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Examen:</span>
                    <span className="font-medium">{selectedReport.examName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Année:</span>
                    <span className="font-medium">{selectedReport.examYear}</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Session:</span>
                    <span className="font-medium">{selectedReport.sessionLabel}</span>
                  </div>
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-slate-700">Question Signalée</h4>
                <p className="text-sm bg-white border rounded-lg p-3">{selectedReport.question}</p>
              </div>

              {/* Report Details */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-slate-700">Détails du Signalement</h4>
                <p className="text-sm bg-white border rounded-lg p-3">{selectedReport.text || "Aucun détail fourni"}</p>
              </div>

              {/* Reporter Info */}
              <div className="flex justify-between items-center text-sm text-muted-foreground border-t pt-4">
                <div>
                  <span>Signalé par: </span>
                  <span className="font-medium text-foreground">{selectedReport.username}</span>
                  {selectedReport.userEmail && selectedReport.userEmail !== "—" && (
                    <span className="ml-2">({selectedReport.userEmail})</span>
                  )}
                </div>
                <div>
                  <span>Date: </span>
                  <span className="font-medium text-foreground">{selectedReport.date}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                {selectedReport.status === "pending" && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleReject(selectedReport.id);
                        setDetailsOpen(false);
                      }}
                      className="text-orange-600 border-orange-200 hover:bg-orange-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Rejeter
                    </Button>
                    <Button
                      onClick={() => {
                        handleApprove(selectedReport.id);
                        setDetailsOpen(false);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approuver
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  onClick={() => handleEditQuestion(selectedReport.questionId)}
                  className="text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                  <FilePenLine className="h-4 w-4 mr-2" />
                  Modifier la Question
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportQuestionsAdmin;
