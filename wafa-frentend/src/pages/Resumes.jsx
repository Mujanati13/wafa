import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { FileText, Download, Check, X, Eye, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageHeader, StatCard } from "@/components/shared";
import { toast } from "sonner";
import { api } from "@/lib/utils";

const Resumes = () => {
  const { t } = useTranslation(['admin', 'common']);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get("/resumes");
        const list = Array.isArray(data?.data) ? data.data : [];
        const mapped = list.map((item) => ({
          id: item?._id,
          username: item?.userId?.email || "—",
          name: item?.userId?.name || "—",
          title: item?.title || "—",
          pdf: item?.pdfUrl || "",
          approved: String(item?.status || "").toLowerCase() === "approved",
          date: item?.createdAt
            ? new Date(item.createdAt).toLocaleDateString('fr-FR')
            : "—",
        }));
        setResumes(mapped);
      } catch (e) {
        setError(t('admin:failed_load_resumes'));
        toast.error(t('common:error_loading'));
      } finally {
        setLoading(false);
      }
    };
    fetchResumes();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(resumes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResumes = resumes.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/resumes/${id}/status`, { status: "approved" });
      setResumes((prev) =>
        prev.map((resume) =>
          resume.id === id ? { ...resume, approved: true } : resume
        )
      );
      toast.success(t('admin:resume_approved'));
    } catch (e) {
      toast.error(t('admin:failed_approval'));
    }
  };

  const handleReject = async (id) => {
    try {
      await api.delete(`/resumes/${id}`);
      setResumes((prev) => prev.filter((resume) => resume.id !== id));
      toast.success(t('admin:resume_deleted'));
    } catch (e) {
      toast.error(t('admin:failed_delete'));
    }
  };

  const handleSeePDF = (pdfUrl) => {
    if (!pdfUrl) {
      toast.error(t('admin:pdf_url_unavailable'));
      return;
    }
    window.open(pdfUrl, "_blank");
  };

  const approvedCount = resumes.filter(r => r.approved).length;
  const pendingCount = resumes.filter(r => !r.approved).length;

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
        {t('common:previous')}
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
        {t('common:next')}
      </Button>
    );
    
    return buttons;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
          <p className="text-muted-foreground">{t('admin:loading_resumes')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          title={t('admin:resume_management')}
          description={t('admin:manage_user_uploaded_resumes')}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title={t('admin:total_resumes')}
            value={resumes.length.toString()}
            icon={<BookOpen className="w-6 h-6" />}
          />
          <StatCard
            title={t('admin:approved')}
            value={approvedCount.toString()}
            icon={<Check className="w-6 h-6" />}
          />
          <StatCard
            title={t('admin:pending')}
            value={pendingCount.toString()}
            icon={<FileText className="w-6 h-6" />}
          />
        </div>

        {/* Resumes Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin:resume_list')}</CardTitle>
            <CardDescription>
              {resumes.length} résumé{resumes.length > 1 ? 's' : ''} au total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>PDF</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentResumes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Aucun résumé disponible
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentResumes.map((resume) => (
                      <TableRow key={resume.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{resume.name}</div>
                            <div className="text-xs text-muted-foreground">{resume.username}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{resume.title}</TableCell>
                        <TableCell>{resume.date}</TableCell>
                        <TableCell>
                          <Badge variant={resume.approved ? "default" : "secondary"}>
                            {resume.approved ? "Approuvé" : "En attente"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSeePDF(resume.pdf)}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Voir
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!resume.approved && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleApprove(resume.id)}
                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleReject(resume.id)}
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
                <div className="text-sm text-muted-foreground">
                  Affichage de {startIndex + 1} à {Math.min(endIndex, resumes.length)} sur{" "}
                  {resumes.length} résultats
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

export default Resumes;
