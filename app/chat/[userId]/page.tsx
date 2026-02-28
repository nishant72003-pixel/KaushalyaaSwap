"use client"

import { useState, useRef, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Repeat2,
  Send,
  LogOut,
  ArrowLeft,
  Share2,
  BookOpen,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"

// Database Message Type
type DBMessage = {
  id: string
  conversation_id: string
  sender_id: string
  sender_name: string
  text: string
  timestamp: number
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function ChatPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = use(params)
  const { matchedUser } = useApp() // Context for the matched user's selected skills
  const router = useRouter()
  const supabase = createClient()
  
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [messages, setMessages] = useState<DBMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(true)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Generate a consistent conversation ID regardless of who started it
  const conversationId = currentUser 
    ? [currentUser.id, userId].sort().join("_") 
    : ""

  useEffect(() => {
    const initChat = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setCurrentUser(user)

      if (!matchedUser) {
        router.push("/browse")
        return
      }

      // Fetch existing messages
      const convId = [user.id, userId].sort().join("_")
      const { data: existingMessages } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('timestamp', { ascending: true })

      if (existingMessages) {
        setMessages(existingMessages as DBMessage[])
      }
      setLoading(false)

      // Subscribe to real-time new messages
      const channel = supabase
        .channel(`chat_${convId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${convId}`,
          },
          (payload) => {
            setMessages((prev) => {
              // Prevent duplicates (in case Optimistic UI already added it)
              const exists = prev.find(
                (m) => m.timestamp === payload.new.timestamp && m.text === payload.new.text
              );
              if (exists) return prev;
              return [...prev, payload.new as DBMessage]
            })
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    initChat()
  }, [router, supabase, matchedUser, userId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  if (loading || !currentUser || !matchedUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const partnerName = matchedUser.matchedUser.name
  const partnerInitial = partnerName.charAt(0)

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const newMsgObj = {
      conversation_id: conversationId,
      sender_id: currentUser.id,
      sender_name: currentUser.user_metadata?.full_name || "User",
      text: inputValue.trim(),
      timestamp: Date.now(),
    }

    setInputValue("") // Optimistically clear input instantly
    
    // OPTIMISTIC UPDATE: Show the message instantly on screen!
    const tempMessage = { ...newMsgObj, id: Math.random().toString() }
    setMessages((prev) => [...prev, tempMessage as DBMessage])

    // Send to database quietly in background
    const { error } = await supabase
      .from('messages')
      .insert([newMsgObj])

    if (error) {
      console.error("Error sending message:", error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleEndSession = () => {
    router.push("/thank-you")
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Chat Header */}
      <header className="flex items-center justify-between border-b bg-card px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/browse">
              <ArrowLeft className="size-4" />
              <span className="sr-only">Back to browse</span>
            </Link>
          </Button>
          <Avatar className="size-9">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
              {partnerInitial}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-card-foreground">
              {partnerName}
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Share2 className="size-3" />
                Teaching: {matchedUser.skillToLearn}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="size-3" />
                Learning: {matchedUser.skillToShare}
              </span>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleEndSession}
          className="gap-1.5 text-destructive hover:bg-destructive hover:text-white"
        >
          <LogOut className="size-3.5" />
          <span className="hidden sm:inline">End Session</span>
        </Button>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6 md:px-6">
          <div className="mx-auto mb-4 flex max-w-md flex-col items-center gap-2 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
              <Repeat2 className="size-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              You{"'"}re now connected with{" "}
              <span className="font-semibold text-foreground">{partnerName}</span>.
              Start sharing knowledge and learning together!
            </p>
          </div>

          {messages.map((msg) => {
            const isMe = msg.sender_id === currentUser.id
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex max-w-[80%] flex-col gap-1 ${
                    isMe ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      isMe
                        ? "rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-bl-md bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="px-1 text-[11px] text-muted-foreground">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-card px-4 py-3 md:px-6">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            size="icon"
            disabled={!inputValue.trim()}
            aria-label="Send message"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}