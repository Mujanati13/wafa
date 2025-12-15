import React from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, FileQuestion, Trophy, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Circular Progress Bar Component
const CircularProgress = ({ progress = 0, size = 56, strokeWidth = 5 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  // Color based on progress
  const getProgressColor = (value) => {
    if (value >= 80) return '#22c55e'; // green
    if (value >= 50) return '#3b82f6'; // blue
    if (value >= 25) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg 
        className="transform -rotate-90" 
        width={size} 
        height={size}
      >
        {/* Background circle */}
        <circle
          className="text-gray-200"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          stroke={getProgressColor(progress)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold" style={{ color: getProgressColor(progress) }}>
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};

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

  // Calculate progress (default to 0 if not provided)
  const progress = exam.progress || exam.completionRate || 0;

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
              <h3 className="text-lg font-bold mb-1 line-clamp-2">{exam.subject || exam.name}</h3>
              <Badge variant="outline" className={getDifficultyColor(exam.difficulty)}>
                {exam.difficulty}
              </Badge>
            </div>
            {/* Circular Progress */}
            <CircularProgress progress={progress} size={56} />
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

export default ExamCard;
