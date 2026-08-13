import React from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import TrustMetrics from '../components/landing/TrustMetrics';
import HowItWorks from '../components/landing/HowItWorks';
import FeaturedStores from '../components/landing/FeaturedStores';
import CustomerValueSection from '../components/landing/CustomerValueSection';
import StoreOwnerSection from '../components/landing/StoreOwnerSection';
import BusinessValueSection from '../components/landing/BusinessValueSection';
import FinalCTA from '../components/landing/FinalCTA';
import LandingFooter from '../components/landing/LandingFooter';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#F7F7F2] font-sans text-stone-900 selection:bg-emerald-500 selection:text-white">
      <LandingNavbar />
      <main>
        <HeroSection />
        <TrustMetrics />
        <HowItWorks />
        <FeaturedStores />
        <CustomerValueSection />
        <StoreOwnerSection />
        <BusinessValueSection />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
