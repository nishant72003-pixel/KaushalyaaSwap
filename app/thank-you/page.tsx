"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Repeat2, ArrowRight, Home } from "lucide-react"

export default function ThankYouPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto flex max-w-lg flex-col items-center text-center">
        <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-primary/10">
          <Repeat2 className="size-10 text-primary" />
        </div>

        <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Thank You for Choosing
          <br />
          <span className="text-primary">Kaushalya Swap</span>
        </h1>

        <p className="mt-4 max-w-md text-pretty leading-relaxed text-muted-foreground">
          We hope you had a wonderful skill-sharing experience. Your
          conversation has been saved -- you can pick up right where you left
          off next time.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" asChild className="gap-2 px-8">
            <Link href="/browse">
              Swap Another Skill
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="gap-2 px-8">
            <Link href="/">
              <Home className="size-4" />
              Go Home
            </Link>
          </Button>
        </div>

        <p className="mt-12 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Kaushalya Swap. All rights reserved.
        </p>
      </div>
    </div>
  )
}
