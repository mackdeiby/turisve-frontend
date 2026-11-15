"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { SearchX, Loader2 } from "lucide-react"
import { getDiscoveryFeed, getProperties } from "@/services/api"
import { SearchHeader } from "./search-header"
import { PropertyCard } from "./property-card"
import { FilterBar } from "./filter-bar"
import { AdvancedFiltersModal, FilterOptions } from "./advanced-filters-modal"

interface PropertyGridProps {
  onSelectProperty?: (id: string) => void
}

// Utilidad para normalizar textos (quita tildes, espacios y pasa a minúsculas)
const normalizeText = (val: string = "") =>
  val
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

export function PropertyGrid({ onSelectProperty }: PropertyGridProps) {
  const [rawProperties, setRawProperties] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState<string>("")

  // Estado del Modal de Filtros Avanzados
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false)
  const [advancedFilters, setAdvancedFilters] = useState<FilterOptions>({
    state: "",
    minPrice: 0,
    maxPrice: 500,
    guests: 1,
    amenities: [],
  })

  // 1. Consulta a los endpoints oficiales de la documentación
  const fetchBaseData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const queryText = searchTerm.trim()
      let fetchedItems: any[] = []

      if (queryText !== "") {
        // Documentación: GET /properties/?q=...
        const data = await getProperties({ q: queryText })
        fetchedItems = Array.isArray(data) ? data : data.items || data.results || []
      } else {
        // Documentación: GET /discovery/feed
        const data = await getDiscoveryFeed({ limit: 50 })
        fetchedItems = data.items || data.results || (Array.isArray(data) ? data : [])
      }

      // Deduplicación estricta por ID único del backend y normalización estructural
      const uniqueMap = new Map<string, any>()
      fetchedItems.forEach((p) => {
        const id = p.property_id || p.id
        if (!id || uniqueMap.has(id)) return

        const img =
          p.image_url ||
          p.image ||
          (Array.isArray(p.images) && p.images[0]?.image_url) ||
          ""
        const price = p.price_per_night ?? p.price ?? 0

        uniqueMap.set(id, {
          ...p,
          id,
          property_id: id,
          image_url: img,
          image: img,
          price_per_night: price,
          price: price,
        })
      })

      setRawProperties(Array.from(uniqueMap.values()))
    } catch (err) {
      console.error("Error al consultar alojamientos:", err)
      setError("No se pudieron obtener los resultados.")
    } finally {
      setLoading(false)
    }
  }, [searchTerm])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBaseData()
    }, searchTerm.trim() ? 300 : 0)

    return () => clearTimeout(timer)
  }, [fetchBaseData, searchTerm])

  // 2. Filtrado optimizado e instantáneo en memoria
  const filteredItems = useMemo(() => {
    const cleanQuery = normalizeText(searchTerm)
    const cleanSelectedCat = normalizeText(selectedCategory)
    const cleanSelectedState = normalizeText(advancedFilters.state)

    return rawProperties.filter((p) => {
      // Filtro por botones de categoría de la barra
      if (cleanSelectedCat !== "") {
        const itemCategory = normalizeText(p.category || "")
        if (itemCategory !== cleanSelectedCat) return false
      }

      // BÚSQUEDA INTELIGENTE POR TEXTO (Evaluando los 5 campos clave del JSON)
      if (cleanQuery !== "") {
        const name = normalizeText(p.name || "")
        const category = normalizeText(p.category || "")
        const state = normalizeText(p.state || "")
        const municipality = normalizeText(p.municipality || "")
        const environment = normalizeText(p.environment_type || "")

        const matchesSearch =
          name.includes(cleanQuery) ||
          category.includes(cleanQuery) ||
          state.includes(cleanQuery) ||
          municipality.includes(cleanQuery) ||
          environment.includes(cleanQuery)

        if (!matchesSearch) return false
      }

      // Filtro avanzado por Estado
      if (cleanSelectedState !== "") {
        const itemState = normalizeText(p.state || "")
        if (itemState !== cleanSelectedState) return false
      }

      // Filtro avanzado por Rango de Precios
      const priceVal = Number(p.price_per_night ?? p.price ?? 0)
      if (priceVal < advancedFilters.minPrice || priceVal > advancedFilters.maxPrice) {
        return false
      }

      // Filtro avanzado por Huéspedes
      const maxGuests = p.max_guests ?? p.guests
      if (typeof maxGuests === "number" && maxGuests < advancedFilters.guests) {
        return false
      }

      // Filtro avanzado por Amenidades
      if (advancedFilters.amenities.length > 0) {
        const propertyAmenities = p.amenities || {}
        const hasAll = advancedFilters.amenities.every((key) =>
          Boolean(propertyAmenities[key])
        )
        if (!hasAll) return false
      }

      return true
    })
  }, [rawProperties, selectedCategory, searchTerm, advancedFilters])

  const hasActiveAdvancedFilters = Boolean(
    advancedFilters.state ||
      advancedFilters.maxPrice < 500 ||
      advancedFilters.guests > 1 ||
      advancedFilters.amenities.length > 0
  )

  return (
    <div className="min-h-screen bg-neutral-50 pb-12">
      {/* 1. Cabecera Rosa */}
      <SearchHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClearSearch={() => setSearchTerm("")}
      />

      {/* 2. Barra de Categorías + Filtros Avanzados */}
      <FilterBar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenAdvancedFilters={() => setIsFilterModalOpen(true)}
        hasActiveAdvancedFilters={hasActiveAdvancedFilters}
      />

      {/* 3. Listado de Alojamientos */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
          <p className="text-sm text-neutral-500">Buscando destinos...</p>
        </div>
      ) : error ? (
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-24 text-center text-rose-700">
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-24 text-center">
          <SearchX className="h-10 w-10 text-neutral-400" />
          <p className="text-lg font-semibold text-neutral-800">No se encontraron alojamientos</p>
          <p className="text-sm text-neutral-500">
            Intenta buscando con otro nombre, cambiando de categoría o ajustando los filtros.
          </p>
        </div>
      ) : (
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((p) => {
            const id = p.property_id || p.id
            return (
              <div
                key={id}
                onClick={() => onSelectProperty && onSelectProperty(id)}
                className="cursor-pointer transition-transform duration-200 hover:-translate-y-1"
              >
                <PropertyCard property={p} />
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Emergente de Filtros */}
      <AdvancedFiltersModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={advancedFilters}
        onApplyFilters={setAdvancedFilters}
        onResetFilters={() =>
          setAdvancedFilters({
            state: "",
            minPrice: 0,
            maxPrice: 500,
            guests: 1,
            amenities: [],
          })
        }
      />
    </div>
  )
}   