"use client"

import { Search, X } from "lucide-react"

interface SearchHeaderProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  onClearSearch: () => void
}

export function SearchHeader({
  searchTerm,
  onSearchChange,
  onClearSearch,
}: SearchHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white pt-6 pb-6 px-4 rounded-b-3xl shadow-md">
      <div className="max-w-7xl mx-auto space-y-3">
        <h1 className="text-xl font-bold tracking-tight text-white">
          ¡Descubre tu próximo destino!
        </h1>

        <div className="relative flex items-center">
          <Search className="absolute left-4 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar destino"
            className="w-full bg-white text-neutral-800 placeholder-neutral-400 text-sm font-medium rounded-full pl-10 pr-10 py-3 outline-none shadow-inner transition-all focus:ring-2 focus:ring-rose-300"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={onClearSearch}
              className="absolute right-3 p-1 rounded-full text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}