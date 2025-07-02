import "./index.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./components/Dashboard";
import ExamPage from "./components/ExamPage";



export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route path="home" element={<Dashboard /> } />
          <Route path="exams" element={<p className="text-white">exams</p>} />
          <Route path="results" element={<p className="text-white">results</p>} />
          <Route path="progress" element={<p className="text-white">progress</p>} />
          <Route path="subjects" element={<p className="text-white">subjects</p>} />
          <Route path="calendar" element={<p className="text-white">calendar</p>} />
          <Route path="profile" element={<p className="text-white">profile</p>} />
          <Route path="settings" element={<p className="text-white">settings</p>} />
        </Route>
      </Routes>
    </Router>
  );
}
