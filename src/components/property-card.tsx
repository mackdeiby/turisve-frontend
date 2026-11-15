"use client"

import Image from "next/image"
import { ShieldCheck, Star } from "lucide-react"

interface PropertyCardProps {
  property: {
    id?: string
    property_id?: string
    name?: string
    title?: string
    state?: string
    municipality?: string
    category?: string
    price_per_night?: number
    price?: number
    currency?: string
    image_url?: string
    image?: string
    images?: Array<{ image_url: string }>
    is_verified?: boolean
    effective_score?: number
  }
}

export function PropertyCard({ property }: PropertyCardProps) {
  // Resolución robusta de la imagen para evitar el cuadro gris
  const imageUrl =
    property.image_url ||
    property.image ||
    (Array.isArray(property.images) && property.images[0]?.image_url) ||
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80" // Imagen por defecto de respaldo

  const title = property.name || property.title || "Alojamiento TurisVe"
  const price = property.price_per_night ?? property.price ?? 0
  const currency = property.currency || "USD"
  const stateName = property.state || property.location?.state || "Venezuela"
  const muniName = property.municipality || property.location?.municipality || ""
  const locationDisplay = muniName ? `${muniName}, ${stateName}` : stateName

  return (
    <div className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-xs hover:shadow-md transition-all duration-300">
      {/* Contenedor de Imagen */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          unoptimized
        />

        {/* Badge de Verificado */}
        {property.is_verified && (
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-rose-400" />
            <span>Verificado</span>
          </div>
        )}

        {/* Píldora de Precio Flotante */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
          <span className="text-xs font-extrabold text-neutral-900">
            ${price}
          </span>
          <span className="text-[10px] font-medium text-neutral-500"> / noche</span>
        </div>
      </div>

      {/* Información de la Tarjeta */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
            <span className="truncate">{locationDisplay}</span>
            {property.effective_score && (
              <div className="flex items-center gap-1 text-neutral-900 font-bold shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{Number(property.effective_score).toFixed(1)}</span>
              </div>
            )}
          </div>

          <h3 className="text-sm font-bold text-neutral-900 line-clamp-1 group-hover:text-rose-600 transition-colors">
            {title}
          </h3>
        </div>
      </div>
    </div>
  )
}