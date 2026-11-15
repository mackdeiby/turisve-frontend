export type Zone = "playas" | "montanas" | "selva" | "llanos"

export interface Review {
  name: string
  date: string
  rating: number
  comment: string
}

export interface Property {
  id: string
  title: string
  location: string
  zone: Zone
  price_per_night: number
  rating: number
  images: string[]
  subtitle: string
  has_water: boolean
  has_power: boolean
  has_internet: boolean
  has_starlink: boolean
  // Detail fields (optional — sensible fallbacks used when absent)
  guests?: number
  bedrooms?: number
  beds?: number
  bathrooms?: number
  has_pool?: boolean
  has_ac?: boolean
  has_parking?: boolean
  pet_friendly?: boolean
  description?: string
  host?: {
    name: string
    avatar: string
    verified: boolean
    response_time: string
  }
  reviews_count?: number
  reviews?: Review[]
}

export const ZONES: { id: Zone | "todas"; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "playas", label: "Playas" },
  { id: "montanas", label: "Montañas" },
  { id: "selva", label: "Selva" },
  { id: "llanos", label: "Llanos" },
]

export const properties: Property[] = [
  {
    id: "1",
    title: "Posada Las Olas",
    location: "Paparo, Barlovento",
    zone: "playas",
    price_per_night: 50,
    rating: 4.9,
    subtitle: "A 5 min de la playa • Tanque de agua propio",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
    ],
    has_water: true,
    has_power: true,
    has_internet: true,
    has_starlink: true,
  },
  {
    id: "2",
    title: "Cabaña El Ávila",
    location: "Galipán, Caracas",
    zone: "montanas",
    price_per_night: 65,
    rating: 4.95,
    subtitle: "Vista al valle • Planta eléctrica 24h",
    images: [
      "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800",
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800",
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800",
    ],
    has_water: true,
    has_power: true,
    has_internet: true,
    has_starlink: false,
  },
  {
    id: "3",
    title: "Campamento Río Orinoco",
    location: "Puerto Ayacucho, Amazonas",
    zone: "selva",
    price_per_night: 80,
    rating: 4.87,
    subtitle: "Rodeado de selva • Starlink de alta velocidad",
    images: [
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800",
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800",
    ],
    has_water: true,
    has_power: true,
    has_internet: true,
    has_starlink: true,
  },
  {
    id: "4",
    title: "Hato Los Llaneros",
    location: "San Fernando, Apure",
    zone: "llanos",
    price_per_night: 45,
    rating: 4.78,
    subtitle: "Amanecer en el llano • Pozo de agua propio",
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800",
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800",
    ],
    has_water: true,
    has_power: true,
    has_internet: false,
    has_starlink: false,
  },
  {
    id: "5",
    title: "Villa Mar Caribe",
    location: "Lechería, Anzoátegui",
    zone: "playas",
    price_per_night: 120,
    rating: 4.94,
    subtitle: "Frente al mar • Piscina y planta eléctrica",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    ],
    has_water: true,
    has_power: true,
    has_internet: true,
    has_starlink: true,
  },
  {
    id: "6",
    title: "Refugio Pico Bolívar",
    location: "Mérida, Los Andes",
    zone: "montanas",
    price_per_night: 70,
    rating: 4.99,
    subtitle: "Clima de montaña • Agua continua todo el año",
    images: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800",
      "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800",
    ],
    has_water: true,
    has_power: true,
    has_internet: true,
    has_starlink: false,
  },
  {
    id: "7",
    title: "Eco Lodge Canaima",
    location: "Canaima, Bolívar",
    zone: "selva",
    price_per_night: 95,
    rating: 4.92,
    subtitle: "Cerca de los tepuyes • Energía solar y planta",
    images: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
      "https://images.unsplash.com/photo-1510797215324-95aa89f43c33?w=800",
    ],
    has_water: true,
    has_power: true,
    has_internet: true,
    has_starlink: true,
  },
  {
    id: "8",
    title: "Finca Los Samanes",
    location: "Guanare, Portuguesa",
    zone: "llanos",
    price_per_night: 55,
    rating: 4.85,
    subtitle: "Naturaleza y calma • WiFi de fibra óptica",
    images: [
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800",
    ],
    has_water: true,
    has_power: false,
    has_internet: true,
    has_starlink: false,
  },
]
