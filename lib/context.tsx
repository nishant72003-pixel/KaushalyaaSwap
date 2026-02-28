"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"

export interface User {
  id: string
  name: string
  email: string
}

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  text: string
  timestamp: number
}

export interface SkillMatch {
  matchedUser: User
  skillToShare: string
  skillToLearn: string
}

interface AppState {
  user: User | null
  matchedUser: SkillMatch | null
  conversations: Record<string, ChatMessage[]>
  hydrated: boolean
  login: (email: string, password: string, name: string) => void
  signup: (email: string, password: string, name: string) => void
  logout: () => void
  setMatchedUser: (match: SkillMatch | null) => void
  addMessage: (conversationId: string, message: ChatMessage) => void
  getConversation: (conversationId: string) => ChatMessage[]
}

const AppContext = createContext<AppState | undefined>(undefined)

const STORAGE_KEY_USER = "ks_user"
const STORAGE_KEY_CONVOS = "ks_conversations"

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [matchedUser, setMatchedUser] = useState<SkillMatch | null>(null)
  const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>({})
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEY_USER)
      const storedConvos = localStorage.getItem(STORAGE_KEY_CONVOS)
      if (storedUser) setUser(JSON.parse(storedUser))
      if (storedConvos) setConversations(JSON.parse(storedConvos))
    } catch {
      // ignore
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY_USER)
    }
  }, [user, hydrated])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY_CONVOS, JSON.stringify(conversations))
  }, [conversations, hydrated])

  const login = useCallback((email: string, _password: string, name: string) => {
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
    }
    setUser(newUser)
  }, [])

  const signup = useCallback((email: string, _password: string, name: string) => {
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
    }
    setUser(newUser)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setMatchedUser(null)
  }, [])

  const addMessage = useCallback((conversationId: string, message: ChatMessage) => {
    setConversations((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), message],
    }))
  }, [])

  const getConversation = useCallback(
    (conversationId: string) => {
      return conversations[conversationId] || []
    },
    [conversations]
  )

  return (
    <AppContext.Provider
      value={{
        user,
        matchedUser,
        conversations,
        hydrated,
        login,
        signup,
        logout,
        setMatchedUser,
        addMessage,
        getConversation,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
