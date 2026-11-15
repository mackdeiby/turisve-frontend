"use client"

import { Search, Car, MessageSquare, User } from "lucide-react"

export type NavTab = "explore" | "trips" | "messages" | "profile"

interface BottomNavProps {
  activeTab: NavTab
  onTabChange: (tab: NavTab) => void
}

const items: { id: NavTab; label: string; icon: any }[] = [
  { id: "explore", label: "Explorar", icon: Search },
  { id: "trips", label: "Viajes", icon: Car },
  { id: "messages", label: "Mensajería", icon: MessageSquare },
  { id: "profile", label: "Perfil", icon: User },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-neutral-100 bg-white px-4 py-2.5 shadow-lg"
    >
      {items.map((item) => {
        const Icon = item.icon
        const isActive = activeTab === item.id

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange(item.id)}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-col items-center gap-1 text-xs font-medium transition-all cursor-pointer ${
              isActive ? "text-rose-500 font-semibold" : "text-neutral-400 hover:text-neutral-700"
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive ? "text-rose-500" : "text-neutral-500"}`} />
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}