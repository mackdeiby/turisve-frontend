"use client"

import { Flame, Home, Palmtree, Mountain, Tent, Hotel, Building, SlidersHorizontal } from "lucide-react"

export interface CategoryOption {
  id: string
  label: string
  icon: any
}

// Slugs en minúsculas exigidos por la documentación del backend
const CATEGORIES: CategoryOption[] = [
  { id: "", label: "Todas", icon: Flame },
  { id: "posada", label: "Posadas", icon: Home },
  { id: "casa_playa", label: "Casa Playa", icon: Palmtree },
  { id: "cabana", label: "Cabañas", icon: Mountain },
  { id: "glamping", label: "Glamping", icon: Tent },
  { id: "hotel", label: "Hoteles", icon: Hotel },
  { id: "apartamento", label: "Apartamentos", icon: Building },
]

interface FilterBarProps {
  selectedCategory?: string
  onSelectCategory?: (categorySlug: string) => void
  onOpenAdvancedFilters?: () => void
  hasActiveAdvancedFilters?: boolean
}

export function FilterBar({
  selectedCategory = "",
  onSelectCategory,
  onOpenAdvancedFilters,
  hasActiveAdvancedFilters = false,
}: FilterBarProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-3 px-4 scrollbar-none bg-white border-b border-neutral-100 sticky top-0 z-30">
      
      {/* Botón flotante de Filtros Avanzados */}
      {onOpenAdvancedFilters && (
        <button
          type="button"
          onClick={onOpenAdvancedFilters}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold transition-all border shrink-0 cursor-pointer ${
            hasActiveAdvancedFilters
              ? "bg-rose-50 text-rose-600 border-rose-300 shadow-xs font-bold"
              : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100"
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-rose-500" />
          <span>Filtros</span>
          {hasActiveAdvancedFilters && (
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          )}
        </button>
      )}

      {/* Separador visual */}
      {onOpenAdvancedFilters && <div className="h-5 w-[1px] bg-neutral-200 shrink-0" />}

      {/* Categorías */}
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon
        const isActive = selectedCategory === cat.id

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              if (onSelectCategory) {
                onSelectCategory(cat.id)
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer select-none ${
              isActive
                ? "bg-black text-white shadow-sm scale-[0.98]"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-neutral-500"}`} />
            <span>{cat.label}</span>
          </button>
        )
      })}
    </div>
  )
}