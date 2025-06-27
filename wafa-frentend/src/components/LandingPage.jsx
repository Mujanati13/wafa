import React from "react";
import Header from "./landingPage/Header";
import HeroSection from "./landingPage/HeroSection";
import SolutionsSection from "./landingPage/SolutionsSection";
import PricingSection from "./landingPage/PricingSection";
import TestimonialsSection from "./landingPage/TestimonialsSection";
import FAQSection from "./landingPage/FAQSection";
import FeedbackSection from "./landingPage/FeedbackSection";
import Footer from "./landingPage/Footer";

const LandingPage = () => {
  return (
    <div className="bg-gradient-to-br from-[#0A0A0F] via-[#111015] to-[#1A1625] min-h-screen text-white font-sans">
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
};

export default LandingPage; 