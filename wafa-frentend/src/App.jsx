import "./index.css";
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import LandingPage from "./components/LandingPage";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import ExamsPage from "./pages/ExamsPage";
import ExamPage from "./pages/ExamPage";
import ResultsPage from "./pages/ResultsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import ProgressPage from "./pages/ProgressPage";
import SubjectsPage from "./pages/SubjectsPage";
import AdminLayout from "./components/layout/AdminLayout";
import AdminPage from "./pages/AdminPage";
import AnayticsPage from "./pages/AnayticsPage";
import UsersWithTabs from "./components/admin/UsersWithTabs";
import SubscriptionPage from "./pages/SubscriptionPage";
import ReportQuestionsAdmin from "./pages/ReportQuestionsAdmin";
import Explications from "./pages/Explications";
import Resumes from "./pages/Resumes";
import DemandesDePayements from "./pages/DemandesDePayements";
import Leaderboard from "./pages/Leaderboard";
import Semesters from "./pages/Semesters";
import Module from "./pages/Module";
import CategoriesOfModules from "./pages/CategoriesOfModules";
import ExamParYears from "./pages/ExamParYears";
import ExamCourses from "./pages/ExamCourses";
import ImportExamParYears from "./pages/ImportExamParYears";
import ImportExamParCourse from "./pages/ImportExamParCourse";
import ImportResumes from "./pages/ImportResumes";
import AddQuestions from "./pages/AddQuestions";
import ImportImages from "./pages/ImportImages";
import ImportExplications from "./pages/ImportExplications";
import CreateCategoriesForCourses from "./pages/CreateCategoriesForCourses";
import Myplaylist from "./pages/Myplaylist";
import LeaderboardClient from "./pages/LeaderboardClient";
import VerifyEmail from "./pages/VerifyEmail";
import VerifyEmailFirebase from "./pages/VerifyEmailFirebase";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ContactPage from "./pages/ContactPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import PlaylistsPage from "./pages/PlaylistsPage";
import NotesPage from "./pages/NotesPage";

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-email-firebase" element={<VerifyEmailFirebase />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route path="home" element={<Dashboard />} />
          <Route path="playlist" element={<Myplaylist />} />
          <Route path="playlists" element={<PlaylistsPage />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="note" element={<NotesPage />} />
          <Route path="analytics" element={<AnayticsPage />} />
          <Route path="leaderboard" element={<LeaderboardClient />} />
          <Route path="subscription" element={<SubscriptionPage />} />
          <Route path="exams" element={<ExamsPage />} />
          {/* <Route path="exam/:examId" element={<ExamPage />} /> */}
          <Route path="results" element={<ResultsPage />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="subjects" element={<SubjectsPage />} />
          <Route path="subjects/:courseId" element={<SubjectsPage />} />
          <Route
            path="calendar"
            element={<p className="text-white">calendar</p>}
          />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="analytics" element={<AnayticsPage />} />
          <Route path="users" element={<UsersWithTabs />} />

          <Route path="subscription" element={<SubscriptionPage />} />
          <Route path="exams" element={<p>exams</p>} />
          <Route path="report-questions" element={<ReportQuestionsAdmin />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="explications" element={<Explications />} />
          <Route path="semesters" element={<Semesters />} />
          <Route path="module" element={<Module />} />
          <Route path="categoriesOfModules" element={<CategoriesOfModules />} />
          <Route path="examParYears" element={<ExamParYears />} />
          <Route path="importExamParCourse" element={<ImportExamParCourse />} />
          <Route path="examCourses" element={<ExamCourses />} />
          <Route path="resumes" element={<Resumes />} />
          <Route path="importResumes" element={<ImportResumes />} />
          <Route path="importImages" element={<ImportImages />} />
          <Route
            path="demandes-de-paiements"
            element={<DemandesDePayements />}
          />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="importExamParYears" element={<ImportExamParYears />} />
          <Route path="addQuestions" element={<AddQuestions />} />
          <Route path="importExplications" element={<ImportExplications />} />
          <Route
            path="createCategoriesForCourses"
            element={<CreateCategoriesForCourses />}
          />
        </Route>
        <Route path="/exam/:examId" element={<ExamPage />} />
      </Routes>
    </Router>
  );
}
