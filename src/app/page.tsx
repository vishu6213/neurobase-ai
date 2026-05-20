"use client";

import { LandingNav } from "@/components/landing/landing-nav";
import { SplineSceneBasic } from "@/components/spline-scene-basic";
import { HeroSection } from "@/components/landing/hero-section";
import { TickerBar } from "@/components/landing/ticker-bar";
import { FeaturesSection } from "@/components/landing/features-section";
import { EcosystemSection } from "@/components/landing/ecosystem-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { FAQSection } from "@/components/landing/faq-section";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";
import { SplineRobotBackground } from "@/components/spline-robot-background";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <LandingNav />
      <SplineSceneBasic />
      <HeroSection />

      {/*
        SplineRobotBackground is ALWAYS in the DOM (pre-loads immediately).
        It fades in via opacity once scrolled past first slide.
        Content sits at z-10 above the fixed z-0 robot.
        Sections are fully transparent so the robot bleeds through —
        glass cards use backdrop-filter for frosted depth.
      */}
      <div className="relative">
        <SplineRobotBackground />

        {/* Neural grid overlay adds subtle depth texture over robot */}
        <div
          className="fixed inset-0 pointer-events-none neural-grid-overlay"
          style={{ zIndex: 1, opacity: 0.6 }}
        />

        {/*
          translateZ(0) promotes this to its own GPU compositor layer.
          Browser composites scroll independently of the WebGL layer —
          key fix for scroll lag. Background is transparent so robot shows through.
        */}
        <div
          className="relative z-10"
          style={{ transform: "translateZ(0)", willChange: "transform", background: "transparent" }}
        >
          <TickerBar />
          <div id="features">
            <FeaturesSection />
          </div>
          <div className="section-divider" />
          <div id="ecosystem">
            <EcosystemSection />
          </div>
          <div className="section-divider" />
          <PricingSection />
          <div className="section-divider" />
          <TestimonialsSection />
          <div className="section-divider" />
          <FAQSection />
          <div className="section-divider" />
          <CTASection />
          <Footer />
        </div>
      </div>
    </div>
  );
}

