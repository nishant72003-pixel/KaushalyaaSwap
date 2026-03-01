"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  Repeat2,
  MessageCircle,
  Search,
  Sparkles,
  Users,
  GraduationCap,
  UserCircle
} from "lucide-react"

export function Navbar() {
  const pathname = usePathname()

  // We don't want to show the full navbar on the login or signup pages
  if (pathname === "/login" || pathname === "/signup") return null

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary hover:opacity-80 transition-opacity">
          <Image src="/logo.jpeg" alt="Logo" width={32} height={32} className="rounded-md" />
          <span>SkillSwap</span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/browse">
              <Search className="size-4 hidden sm:inline" />
              Browse
            </Link>
          </Button>

          {/* New Profile Button */}
          <Button variant="default" asChild className="gap-2 rounded-full px-5">
            <Link href="/profile">
              <UserCircle className="size-4.5" />
              <span className="hidden sm:inline">My Profile</span>
            </Link>
          </Button>
        </nav>
        
      </div>
    </header>
  )
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 py-24 md:py-36">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,oklch(0.55_0.18_160/0.12),transparent)]" />
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
          <Sparkles className="size-4" />
          Peer-to-Peer Skill Exchange
        </div>
        <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl">
          Share what you know.
          <br />
          <span className="text-primary">Learn what you love.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
          Kaushalya Swap connects you with people who have the skills you want
          to learn -- and want to learn what you already know. A fair, free, and
          fulfilling exchange.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" asChild className="gap-2 px-8 text-base">
            <Link href="/signup">
              Get Started Free
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="gap-2 px-8 text-base"
          >
            <Link href="/login">I Have an Account</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

const steps = [
  {
    icon: Search,
    title: "Tell Us Your Skills",
    description:
      "Enter the skill you can teach and the one you wish to learn. Our smart matcher does the rest.",
  },
  {
    icon: Users,
    title: "Get Matched Instantly",
    description:
      "When someone wants what you offer and offers what you want, we connect you both immediately.",
  },
  {
    icon: MessageCircle,
    title: "Chat & Exchange",
    description:
      "Jump into a private conversation and start sharing knowledge. Your chats are saved so you never lose progress.",
  },
  {
    icon: GraduationCap,
    title: "Grow Together",
    description:
      "Complete your session and walk away with a new skill. Come back anytime to learn something else.",
  },
]

export function HowItWorks() {
  return (
    <section className="border-t bg-card px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-card-foreground md:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
            Four simple steps to start exchanging skills with someone new.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.title} className="group relative flex flex-col items-center text-center">
              <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <step.icon className="size-7 text-primary" />
              </div>
              <span className="mb-2 font-mono text-xs font-bold uppercase tracking-widest text-primary">
                Step {i + 1}
              </span>
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const stats = [
  { value: "10K+", label: "Skills Shared" },
  { value: "5K+", label: "Active Learners" },
  { value: "98%", label: "Satisfaction" },
  { value: "120+", label: "Categories" },
]

export function StatsSection() {
  return (
    <section className="border-t px-6 py-20">
      <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-4xl font-bold text-primary">{stat.value}</div>
            <div className="mt-1 text-sm font-medium text-muted-foreground">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function CTASection() {
  return (
    <section className="border-t bg-primary px-6 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl">
          Ready to swap your first skill?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-primary-foreground/80">
          Join the Kaushalya Swap community and discover how knowledge flows
          freely when people come together.
        </p>
        <Button
          size="lg"
          variant="secondary"
          asChild
          className="mt-8 gap-2 px-8 text-base"
        >
          <Link href="/signup">
            Join Now -- It{"'"}s Free
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="border-t px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <Repeat2 className="size-5 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            Kaushalya Swap
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Kaushalya Swap. All rights reserved.
        </p>
      </div>
    </footer>
  )
}