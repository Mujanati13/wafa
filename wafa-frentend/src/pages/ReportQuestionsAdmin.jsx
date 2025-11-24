import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { FileQuestion, Trash2, Check, AlertCircle, FilePenLine, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader, StatCard } from "@/components/shared";
import { toast } from "sonner";
import { api } from "@/lib/utils";

const ReportQuestionsAdmin = () => {
  const { t } = useTranslation(['admin', 'common']);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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
        question: r?.questionTitle || r?.questionId?.text || "—",
        text: r?.details || "",
        date: (r?.createdAt || r?.updatedAt || "").slice(0, 10),
        status: r?.status || "pending",
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

  // Pagination calculations
  const totalPages = Math.ceil(reports.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReports = reports.slice(startIndex, endIndex);

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
            title="Traités"
            value={reports.filter(r => r.status !== "pending").length}
            icon={<FileQuestion className="w-6 h-6" />}
            variant="purple"
          />
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
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
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        Aucun rapport trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">
                          {report.username}
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
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleApprove(report.id)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <FilePenLine className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(report.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

            {reports.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t bg-slate-50/50 px-6 py-4">
                <div className="text-sm text-muted-foreground">
                  Affichage de {startIndex + 1} à {Math.min(endIndex, reports.length)} sur {reports.length} résultats
                </div>
                <div className="flex items-center gap-2">
                  {renderPaginationButtons()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportQuestionsAdmin;
