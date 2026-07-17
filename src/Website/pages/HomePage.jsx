import React from 'react';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ImpactStrip from '../components/ImpactStrip';
import AboutSection from '../components/AboutSection';
import OurWork from '../components/OurWork';
import ImpactJourney from '../components/ImpactJourney';
import ProjectsSection from '../components/ProjectsSection';
import NewsSection from '../components/NewsSection';
import GallerySection from '../components/GallerySection';
import TestimonialsSection from '../components/TestimonialsSection';
import TransparencySection from '../components/TransparencySection';
import ContactSection from '../components/ContactSection';
import FloatingUtils from '../components/FloatingUtils';
import Footer from '../components/Footer';

export const HomePage = () => {
  return (
    <div className="relative bg-[#F8F7F4] overflow-x-hidden min-h-screen">
      {/* Dynamic SEO Tags */}
      <SEOHead 
        title="Transforming Lives, Building Futures" 
        description="SAVITRAM FOUNDATION is a leading humanitarian non-governmental organization in India focusing on healthcare, child welfare, girl scholarships, and rural infrastructure audits." 
      />

      {/* Main Global Header */}
      <Navbar />

      {/* Hero Banner Grid */}
      <HeroSection />

      {/* Stats Counter Band */}
      <ImpactStrip />

      {/* About Description Editorial */}
      <AboutSection />

      {/* Core Sectors & Causes */}
      <OurWork />

      {/* Chronological Timeline Impact Journey */}
      <ImpactJourney />

      {/* Featured Projects with Progress Meters */}
      <ProjectsSection />

      {/* Magazine Blog Stories & News */}
      <NewsSection />

      {/* Photo Gallery Masonry Grid */}
      <GallerySection />

      {/* Client Quotes Carousel / Grid */}
      <TestimonialsSection />

      {/* Financial Audit Transparency Progress Bars */}
      <TransparencySection />

      {/* Enquiry Form Split Section */}
      <ContactSection />

      {/* Global Utilities (WhatsApp and Scroll Top) */}
      <FloatingUtils />

      {/* Global Footer Grid */}
      <Footer />
    </div>
  );
};

export default HomePage;
