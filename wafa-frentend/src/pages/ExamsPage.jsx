import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, FileQuestion, Trophy, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/shared';

const ExamCard = ({ exam, handleStartExam }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Facile': return 'bg-green-100 text-green-700 border-green-200';
      case 'Moyen': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Difficile': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Très Difficile': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getIcon = () => {
    if (exam.subject.toLowerCase().includes('anatomie')) return <BookOpen className="h-6 w-6" />;
    if (exam.subject.toLowerCase().includes('cardio')) return <Trophy className="h-6 w-6" />;
    return <FileQuestion className="h-6 w-6" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`hover:shadow-lg transition-all ${!exam.available && 'opacity-60'}`}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white flex-shrink-0">
              {getIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold mb-1 line-clamp-2">{exam.subject}</h3>
              <Badge variant="outline" className={getDifficultyColor(exam.difficulty)}>
                {exam.difficulty}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span className="flex items-center gap-1">
                <FileQuestion className="h-4 w-4" />
                Questions
              </span>
              <span className="font-medium text-foreground">{exam.questions}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Durée
              </span>
              <span className="font-medium text-foreground">{exam.duration}</span>
            </div>
            {exam.lastScore && (
              <div className="flex justify-between text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  Dernier score
                </span>
                <span className="font-semibold text-green-600">{exam.lastScore}</span>
              </div>
            )}
          </div>
          
          <Button 
            disabled={!exam.available}
            onClick={() => exam.available && handleStartExam(exam.id)}
            className="w-full gap-2"
            variant={exam.available ? "default" : "secondary"}
          >
            {exam.available ? (
              <>
                <Play className="h-4 w-4" />
                Commencer l'examen
              </>
            ) : (
              'Indisponible'
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ExamsPage = () => {
  const [selectedSemester, setSelectedSemester] = useState('S1');
  const navigate = useNavigate();
  
  const semesters = [
    { id: 'S1', name: 'Semestre 1', year: '1ère Année' },
    { id: 'S2', name: 'Semestre 2', year: '1ère Année' },
    { id: 'S3', name: 'Semestre 3', year: '2ème Année' },
    { id: 'S4', name: 'Semestre 4', year: '2ème Année' },
    { id: 'S5', name: 'Semestre 5', year: '3ème Année' },
    { id: 'S6', name: 'Semestre 6', year: '3ème Année' },
  ];

  const examsBySemester = {
    'S1': [
      { id: 1, subject: 'Anatomie Générale', questions: 50, duration: '90 min', difficulty: 'Moyen', lastScore: '16/20', available: true },
      { id: 2, subject: 'Biologie Cellulaire', questions: 40, duration: '75 min', difficulty: 'Facile', lastScore: '14/20', available: true },
      { id: 3, subject: 'Physiologie Humaine', questions: 45, duration: '80 min', difficulty: 'Difficile', lastScore: null, available: true },
      { id: 4, subject: 'Histologie', questions: 35, duration: '60 min', difficulty: 'Moyen', lastScore: '17/20', available: false },
    ],
    'S2': [
      { id: 5, subject: 'Anatomie Systémique', questions: 60, duration: '100 min', difficulty: 'Difficile', lastScore: '15/20', available: true },
      { id: 6, subject: 'Physiologie Cardio-Vasculaire', questions: 45, duration: '85 min', difficulty: 'Difficile', lastScore: null, available: true },
      { id: 7, subject: 'Neuroanatomie', questions: 50, duration: '90 min', difficulty: 'Très Difficile', lastScore: '13/20', available: true },
      { id: 8, subject: 'Embryologie', questions: 40, duration: '70 min', difficulty: 'Moyen', lastScore: '16/20', available: true },
    ],
    'S3': [
      { id: 9, subject: 'Pathologie Générale', questions: 55, duration: '95 min', difficulty: 'Difficile', lastScore: '14/20', available: true },
      { id: 10, subject: 'Pharmacologie', questions: 50, duration: '85 min', difficulty: 'Moyen', lastScore: null, available: true },
      { id: 11, subject: 'Microbiologie', questions: 45, duration: '80 min', difficulty: 'Moyen', lastScore: '15/20', available: false },
    ],
    'S4': [
      { id: 12, subject: 'Pathologie Systémique', questions: 60, duration: '100 min', difficulty: 'Très Difficile', lastScore: '16/20', available: true },
      { id: 13, subject: 'Sémiologie Médicale', questions: 40, duration: '75 min', difficulty: 'Difficile', lastScore: null, available: true },
      { id: 14, subject: 'Imagerie Médicale', questions: 35, duration: '65 min', difficulty: 'Moyen', lastScore: '17/20', available: true },
    ],
    'S5': [
      { id: 15, subject: 'Médecine Interne', questions: 70, duration: '120 min', difficulty: 'Très Difficile', lastScore: '15/20', available: true },
      { id: 16, subject: 'Chirurgie Générale', questions: 50, duration: '90 min', difficulty: 'Difficile', lastScore: null, available: true },
      { id: 17, subject: 'Pédiatrie', questions: 45, duration: '80 min', difficulty: 'Moyen', lastScore: '18/20', available: true },
    ],
    'S6': [
      { id: 18, subject: 'Gynécologie-Obstétrique', questions: 55, duration: '95 min', difficulty: 'Difficile', lastScore: '16/20', available: true },
      { id: 19, subject: 'Psychiatrie', questions: 40, duration: '75 min', difficulty: 'Moyen', lastScore: null, available: true },
      { id: 20, subject: 'Médecine Légale', questions: 35, duration: '60 min', difficulty: 'Facile', lastScore: '19/20', available: false },
    ],
  };

  const handleStartExam = (examId) => {
    navigate(`/dashboard/exam/${examId}`);
  };

  const currentExams = examsBySemester[selectedSemester] || [];
  const selectedSemesterInfo = semesters.find(s => s.id === selectedSemester);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <PageHeader
            title="Examens QCM"
            description="Sélectionnez un semestre et commencez vos examens"
          />
          
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-[240px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {semesters.map((semester) => (
                <SelectItem key={semester.id} value={semester.id}>
                  {semester.name} - {semester.year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedSemesterInfo && (
          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 border-none text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{selectedSemesterInfo.name}</h2>
                  <p className="text-white/90">{selectedSemesterInfo.year}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{currentExams.length}</div>
                  <div className="text-sm text-white/90">Examens</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentExams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} handleStartExam={handleStartExam} />
          ))}
        </div>

        {currentExams.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileQuestion className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun examen disponible</h3>
              <p className="text-muted-foreground">
                Il n'y a pas d'examens pour ce semestre pour le moment.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ExamsPage;
