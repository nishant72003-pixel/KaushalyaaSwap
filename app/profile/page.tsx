"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ArrowLeft, UserCircle, Save } from "lucide-react"
import { createClient } from "@/lib/supabase"

export default function ProfilePage() {
  const [name, setName] = useState("")
  const [teaches, setTeaches] = useState("")
  const [learns, setLearns] = useState("")
  const [message, setMessage] = useState({ text: "", type: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  // Fetch the user's current profile data when the page loads
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/login")
        return
      }
      
      setUserId(user.id)

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, teaches, learns")
        .eq("id", user.id)
        .single()

      if (data) {
        setName(data.full_name || "")
        // Convert arrays to comma-separated strings for easy editing
        setTeaches(Array.isArray(data.teaches) ? data.teaches.join(", ") : data.teaches || "")
        setLearns(Array.isArray(data.learns) ? data.learns.join(", ") : data.learns || "")
      }
      setLoading(false)
    }

    fetchProfile()
  }, [router, supabase])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ text: "", type: "" })

    if (!userId) return

    // Clean up the input (split by comma, trim whitespace, remove empty items)
    const teachesArray = teaches.split(",").map(s => s.trim()).filter(Boolean)
    const learnsArray = learns.split(",").map(s => s.trim()).filter(Boolean)

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: name,
        teaches: teachesArray,
        learns: learnsArray
      })
      .eq("id", userId)

    if (error) {
      setMessage({ text: "Failed to update profile. Please try again.", type: "error" })
    } else {
      setMessage({ text: "Profile updated successfully!", type: "success" })
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <Link
        href="/browse"
        className="mb-8 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Browse
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-primary">
            <UserCircle className="size-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Your Profile</CardTitle>
          <CardDescription>
            Update your skills so others can match with you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="flex flex-col gap-5">
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="teaches">Skills I Can Teach</Label>
              <Input
                id="teaches"
                type="text"
                value={teaches}
                onChange={(e) => setTeaches(e.target.value)}
                placeholder="e.g. Coding, Guitar, Cooking (comma separated)"
              />
              <p className="text-[11px] text-muted-foreground">Separate multiple skills with commas.</p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="learns">Skills I Want To Learn</Label>
              <Input
                id="learns"
                type="text"
                value={learns}
                onChange={(e) => setLearns(e.target.value)}
                placeholder="e.g. Singing, Yoga, Spanish (comma separated)"
              />
              <p className="text-[11px] text-muted-foreground">Separate multiple skills with commas.</p>
            </div>

            {message.text && (
              <p className={`text-sm font-medium ${message.type === 'error' ? 'text-destructive' : 'text-green-600'}`}>
                {message.text}
              </p>
            )}

            <Button type="submit" className="w-full gap-2" disabled={saving}>
              <Save className="size-4" />
              {saving ? "Saving..." : "Save Profile"}
            </Button>
            
          </form>
        </CardContent>
      </Card>
    </div>
  )
}