"use client"

import {
  Navbar,
  HeroSection,
  HowItWorks,
  StatsSection,
  CTASection,
  Footer,
} from "@/components/homepage"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <StatsSection />
        <HowItWorks />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
