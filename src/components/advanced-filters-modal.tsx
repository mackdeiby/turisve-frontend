"use client"

import { useState } from "react"
import { X, SlidersHorizontal, Zap, Droplet, Wifi, Waves } from "lucide-react"

export interface FilterOptions {
  state: string
  minPrice: number
  maxPrice: number
  guests: number
  amenities: string[]
}

interface AdvancedFiltersModalProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterOptions
  onApplyFilters: (filters: FilterOptions) => void
  onResetFilters: () => void
}

const VENEZUELA_STATES = [
  "Todos",
  "Anzoátegui",
  "Aragua",
  "Carabobo",
  "Falcón",
  "Mérida",
  "Miranda",
  "Nueva Esparta",
  "Táchira",
  "Vargas (La Guaira)",
]

const AMENITIES_LIST = [
  { id: "power_generator", label: "Planta Eléctrica", icon: Zap },
  { id: "water_tank", label: "Tanque de Agua", icon: Droplet },
  { id: "wifi", label: "Starlink / Wi-Fi", icon: Wifi },
  { id: "pool", label: "Piscina", icon: Waves },
]

export function AdvancedFiltersModal({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}: AdvancedFiltersModalProps) {
  const [localState, setLocalState] = useState<string>(filters.state || "Todos")
  const [minPrice, setMinPrice] = useState<number>(filters.minPrice || 0)
  const [maxPrice, setMaxPrice] = useState<number>(filters.maxPrice || 300)
  const [guests, setGuests] = useState<number>(filters.guests || 1)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(filters.amenities || [])

  if (!isOpen) return null

  const toggleAmenity = (id: string) => {
    if (selectedAmenities.includes(id)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== id))
    } else {
      setSelectedAmenities([...selectedAmenities, id])
    }
  }

  const handleApply = () => {
    onApplyFilters({
      state: localState === "Todos" ? "" : localState,
      minPrice,
      maxPrice,
      guests,
      amenities: selectedAmenities,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Cabecera Modal */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-rose-500" />
            <h2 className="text-lg font-bold text-neutral-900">Filtros Avanzados</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Estado / Región */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
            Estado / Región
          </label>
          <select
            value={localState}
            onChange={(e) => setLocalState(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm font-medium text-neutral-800 outline-none focus:border-rose-400 transition-colors"
          >
            {VENEZUELA_STATES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Rango de Precios */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
            Rango de Precio por Noche (USD)
          </label>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 text-center">
              <span className="block text-[10px] font-semibold text-neutral-400 uppercase">Mínimo</span>
              <span className="text-sm font-bold text-neutral-900">${minPrice}</span>
            </div>
            <span className="text-neutral-400 font-bold">-</span>
            <div className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 text-center">
              <span className="block text-[10px] font-semibold text-neutral-400 uppercase">Máximo</span>
              <span className="text-sm font-bold text-neutral-900">${maxPrice}+</span>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={500}
            step={10}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full accent-rose-500 cursor-pointer"
          />
        </div>

        {/* 3. Cantidad de Huéspedes */}
        <div className="flex items-center justify-between py-2 border-y border-neutral-100">
          <div>
            <span className="block text-sm font-bold text-neutral-900">Huéspedes</span>
            <span className="text-xs text-neutral-500">¿Para cuántas personas buscas?</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setGuests(Math.max(1, guests - 1))}
              className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center font-bold text-neutral-600 hover:bg-neutral-100 active:scale-95 transition-all"
            >
              -
            </button>
            <span className="w-6 text-center text-sm font-bold text-neutral-900">{guests}</span>
            <button
              type="button"
              onClick={() => setGuests(guests + 1)}
              className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center font-bold text-neutral-600 hover:bg-neutral-100 active:scale-95 transition-all"
            >
              +
            </button>
          </div>
        </div>

        {/* 4. Servicios / Amenidades */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
            Servicios Indispensables
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {AMENITIES_LIST.map((item) => {
              const Icon = item.icon
              const isSelected = selectedAmenities.includes(item.id)

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleAmenity(item.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all text-left ${
                    isSelected
                      ? "border-rose-500 bg-rose-50 text-rose-600 shadow-xs"
                      : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? "text-rose-500" : "text-neutral-400"}`} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setLocalState("Todos")
              setMinPrice(0)
              setMaxPrice(300)
              setGuests(1)
              setSelectedAmenities([])
              onResetFilters()
              onClose()
            }}
            className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 underline px-2 py-1"
          >
            Limpiar filtros
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-6 py-3 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-98"
          >
            Mostrar Resultados
          </button>
        </div>

      </div>
    </div>
  )
}