"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp, type SkillMatch } from "@/lib/context"
import { Navbar, Footer } from "@/components/homepage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Search, Sparkles, ArrowRight, BookOpen, Share2, MessageCircle } from "lucide-react"
import { createClient } from "@/lib/supabase"

type Profile = { id: string; full_name: string; email: string; teaches: any; learns: any }
type ActiveChat = { partnerId: string; partnerName: string; lastMessage: string; timestamp: number }

const safeArray = (data: any): string[] => {
  if (!data) return [];
  let rawString = Array.isArray(data) ? data.join(",") : typeof data === "string" ? data : JSON.stringify(data);
  return rawString.replace(/[\[\]{}"']/g, "").split(",").map(s => s.trim()).filter(Boolean);
}

export default function BrowsePage() {
  const { setMatchedUser } = useApp()
  const router = useRouter()
  const supabase = createClient()
  
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [dbUsers, setDbUsers] = useState<Profile[]>([])
  const [activeChats, setActiveChats] = useState<ActiveChat[]>([]) // NEW INBOX STATE
  const [loading, setLoading] = useState(true)

  const [skillToShare, setSkillToShare] = useState("")
  const [skillToLearn, setSkillToLearn] = useState("")
  const [matchResult, setMatchResult] = useState<SkillMatch | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setCurrentUser(user)

      // Fetch Profiles
      const { data: profiles } = await supabase.from('profiles').select('*').neq('id', user.id)

      if (profiles) {
        setDbUsers(profiles)
        
        // NEW: Fetch Inbox Messages
        const { data: messages } = await supabase
          .from('messages')
          .select('*')
          .like('conversation_id', `%${user.id}%`)
          .order('timestamp', { ascending: false })
          
        if (messages && messages.length > 0) {
          const chatsMap = new Map<string, ActiveChat>()
          messages.forEach(msg => {
            if (!chatsMap.has(msg.conversation_id)) {
              const ids = msg.conversation_id.split('_')
              const pId = ids[0] === user.id ? ids[1] : ids[0]
              const pProfile = profiles.find(p => p.id === pId)
              chatsMap.set(msg.conversation_id, {
                partnerId: pId,
                partnerName: pProfile ? pProfile.full_name : msg.sender_name,
                lastMessage: msg.text,
                timestamp: msg.timestamp
              })
            }
          })
          setActiveChats(Array.from(chatsMap.values()))
        }
      }
      setLoading(false)
    }
    fetchInitialData()
  }, [router, supabase])

  // ... (Keep existing useMemo and handleSearch logic below)
  const allTeachableSkills = useMemo(() => {
    const set = new Set<string>(); dbUsers.forEach((u) => safeArray(u.teaches).forEach((s) => set.add(s)))
    return Array.from(set).sort()
  }, [dbUsers])

  const allLearnableSkills = useMemo(() => {
    const set = new Set<string>(); dbUsers.forEach((u) => safeArray(u.learns).forEach((s) => set.add(s)))
    return Array.from(set).sort()
  }, [dbUsers])

  const filteredTeach = skillToShare.trim() ? allTeachableSkills.filter((s) => s.toLowerCase().includes(skillToShare.toLowerCase())) : []
  const filteredLearn = skillToLearn.trim() ? allLearnableSkills.filter((s) => s.toLowerCase().includes(skillToLearn.toLowerCase())) : []

  const handleSearch = () => {
    if (!skillToShare.trim() || !skillToLearn.trim()) return
    setSearched(true)
    const searchTeach = skillToShare.trim().toLowerCase();
    const searchLearn = skillToLearn.trim().toLowerCase();
    const match = dbUsers.find((u) => {
      const userTeaches = safeArray(u.teaches);
      const userLearns = safeArray(u.learns);
      const canTeachMe = userTeaches.some((s) => s.toLowerCase().includes(searchLearn))
      const wantsToLearnFromMe = userLearns.some((s) => s.toLowerCase().includes(searchTeach))
      return canTeachMe && wantsToLearnFromMe
    })

    if (match) {
      setMatchResult({
        matchedUser: { id: match.id, name: match.full_name, email: match.email },
        skillToShare: skillToShare.trim(),
        skillToLearn: skillToLearn.trim(),
      })
      setShowDialog(true)
    } else {
      setMatchResult(null)
    }
  }

  const handleContinue = () => {
    if (matchResult) {
      setMatchedUser(matchResult)
      router.push(`/chat/${matchResult.matchedUser.id}`)
    }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          
          {/* ----- INBOX SECTION ----- */}
          {activeChats.length > 0 && (
            <div className="mb-12 rounded-2xl border border-primary/20 bg-primary/5 p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                <MessageCircle className="size-5 text-primary" /> 
                Your Messages & Matches
              </h2>
              <div className="flex flex-col gap-3">
                {activeChats.map(chat => (
                  <div 
                    key={chat.partnerId} 
                    onClick={() => {
                       setMatchedUser({
                         matchedUser: { id: chat.partnerId, name: chat.partnerName, email: "" },
                         skillToShare: "View Profile", skillToLearn: "Chatting"
                       })
                       router.push(`/chat/${chat.partnerId}`)
                    }}
                    className="flex items-center justify-between p-4 bg-card border rounded-xl shadow-sm cursor-pointer hover:border-primary transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                        {chat.partnerName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{chat.partnerName}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-[200px] sm:max-w-[400px]">
                          {chat.lastMessage}
                        </p>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm">Reply</Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ----- SEARCH SECTION ----- */}
          <div className="mb-12 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Find Your Skill Match</h1>
            <p className="mt-3 text-muted-foreground">Tell us what you can teach and what you want to learn.</p>
          </div>

          <div className="flex flex-col gap-8 rounded-2xl border bg-card p-8 shadow-sm">
            {/* Skill to Share */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-card-foreground">Skill You Can Teach</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="e.g. Guitar, Python, Cooking..." value={skillToShare} onChange={(e) => { setSkillToShare(e.target.value); setSearched(false) }} className="pl-10" />
              </div>
            </div>

            {/* Skill to Learn */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-card-foreground">Skill You Want to Learn</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="e.g. UI Design, Spanish, Yoga..." value={skillToLearn} onChange={(e) => { setSkillToLearn(e.target.value); setSearched(false) }} className="pl-10" />
              </div>
            </div>

            <Button onClick={handleSearch} className="gap-2" size="lg" disabled={!skillToShare.trim() || !skillToLearn.trim()}>
              <Sparkles className="size-4" /> Find a Match
            </Button>
          </div>
        </div>
      </main>
      <Footer />

      {/* Match Found Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-2xl">Match Found!</DialogTitle>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button onClick={handleContinue} className="gap-2 px-8" size="lg">Continue to Chat <ArrowRight className="size-4" /></Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}