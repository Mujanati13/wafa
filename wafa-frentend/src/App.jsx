import "./index.css";
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
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
import Users from "./components/admin/Users";
import SubscriptionPage from "./pages/SubscriptionPage";
import ReportQuestionsAdmin from "./pages/ReportQuestionsAdmin";
import Explications from "./pages/Explications";
import Resumes from "./pages/Resumes";
import DemandesDePayements from "./pages/DemandesDePayements";
import Leaderboard from "./pages/Leaderboard";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route path="home" element={<Dashboard />} />
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
          <Route path="users" element={<Users />} />
          <Route path="usersFree" element={<Users />} />
          <Route path="usersPaying" element={<Users />} />
          <Route path="subscription" element={<SubscriptionPage />} />
          <Route path="exams" element={<p>exams</p>} />
          <Route path="report-questions" element={<ReportQuestionsAdmin />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="explications" element={<Explications />} />
          <Route path="resumes" element={<Resumes />} />
          <Route
            path="demandes-de-paiements"
            element={<DemandesDePayements />}
          />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="/exam/:examId" element={<ExamPage />} />
      </Routes>
    </Router>
  );
}
