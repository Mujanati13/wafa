import "./index.css";
import React, { useState } from "react";
import Header from "./components/landingPage/Header";
import HeroSection from "./components/landingPage/HeroSection";
import SolutionsSection from "./components/landingPage/SolutionsSection";
import PricingSection from "./components/landingPage/PricingSection";
import TestimonialsSection from "./components/landingPage/TestimonialsSection";
import FAQSection from "./components/landingPage/FAQSection";
import FeedbackSection from "./components/landingPage/FeedbackSection";
import Footer from "./components/landingPage/Footer";







export default function App() {
  return (
    <div className="bg-gradient-to-br from-[#0A0A0F] via-[#111015] to-[#1A1625] min-h-screen text-white font-sans ">
      <Header />
      <HeroSection />
      <SolutionsSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <FeedbackSection />
      <Footer />
    </div>
  );
}
