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
    <div className="bg-white min-h-screen text-gray-900 font-sans">
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