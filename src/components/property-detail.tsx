"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Share2,
  Heart,
  Users,
  Bed,
  Bath,
  ShieldCheck,
  MapPin,
  Loader2,
  Compass,
  MessageCircle,
  CheckCircle2,
  Zap,
  Droplet,
  Wifi,
  Waves,
  CigaretteOff,
  PawPrint,
  CalendarDays,
  Utensils,
  Car,
  Flame,
  Wind,
  PartyPopper,
} from "lucide-react"
import {
  getPropertyAvailability,
  createReservation,
  toggleFavorite,
  getPropertyReviews,
  trackLeadClick,
  quoteBooking,
} from "@/services/api"

interface PropertyDetailProps {
  property: any
  onBack: () => void
}

export function PropertyDetail({ property, onBack }: PropertyDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // Estados de reserva y fechas
  const [checkIn, setCheckIn] = useState<string>("")
  const [checkOut, setCheckOut] = useState<string>("")
  const [guests, setGuests] = useState<number>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)

  // Estados de Cotización Financiera
  const [quoteData, setQuoteData] = useState<any>(null)
  const [loadingQuote, setLoadingQuote] = useState(false)
  const [quoteError, setQuoteError] = useState<string | null>(null)

  // Estado de Favoritos
  const [isFavorite, setIsFavorite] = useState<boolean>(property?.is_favorite || false)
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)

  // Estado de Reseñas
  const [reviews, setReviews] = useState<any[]>([])
  const [loadingReviews, setLoadingReviews] = useState<boolean>(true)

  // Estado para el clic de WhatsApp
  const [isTrackingClick, setIsTrackingClick] = useState(false)

  const fallbackImage =
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"

  const propertyId = property?.id || property?.property_id

  // ==========================================
  // EXTRACCIÓN ESTRICTA SEGÚN EL NUEVO JSON
  // ==========================================
  const title = property?.title || property?.name || "Alojamiento TurisVe"
  const category = property?.category || "posada"
  
  // Ubicación basada en el objeto `location` del JSON
  const fullAddress = 
    property?.location?.full_address || 
    property?.formatted_address || 
    "Venezuela"
  const shortName = property?.location?.short_name || property?.state || ""

  // Precios
  const price = property?.pricing?.price_per_night ?? property?.price_per_night ?? property?.price ?? 50
  const currency = property?.pricing?.currency || property?.currency || "USD"

  // Capacidades y métricas (`metrics`)
  const maxGuests = property?.metrics?.max_guests ?? property?.capacities?.max_guests ?? 4
  const bedroomsCount = property?.metrics?.bedrooms_count ?? property?.capacities?.bedrooms_count ?? 2
  const bedsCount = property?.metrics?.beds_count ?? property?.capacities?.beds_count ?? 2
  const bathsCount = property?.metrics?.baths_count ?? property?.capacities?.baths_count ?? 1

  // Amenidades completas del nuevo JSON
  const amenities = property?.amenities || {
    wifi: true,
    kitchen: true,
    parking: true,
    hot_water: true,
    water_tank: true,
    swimming_pool: true,
    power_generator: true,
    air_conditioning: true,
  }

  // Políticas completas del nuevo JSON
  const policies = property?.policies || {
    min_nights: 2,
    no_parties: true,
    no_smoking: true,
    pet_friendly: false,
  }

  // Objeto Host / Anfitrión del JSON
  const host = property?.host || {}
  const hostName = host?.full_name || "TurisVE"
  const hostAvatar = host?.avatar_url || ""
  const isHostVerified = host?.is_verified ?? false
  const responseTimeText = host?.response_time_text || "en menos de 1 hora"

  // Datos de contacto y descripción
  const whatsappNumber = property?.whatsapp_number || "+584121234567"
  const cleanPhone = String(whatsappNumber).replace(/\D/g, "")
  const description = property?.description || "Hermosa propiedad equipada con excelentes comodidades para una estancia placentera."
  const isVerified = property?.is_verified ?? true

  // Coordenadas geográficas
  const latitude = property?.location?.latitude ?? property?.latitude ?? 10.788
  const longitude = property?.location?.longitude ?? property?.longitude ?? -68.328

  // Extracción limpia de imágenes del array `images`
  const rawImages = property?.images || property?.photos || []
  const images: string[] =
    Array.isArray(rawImages) && rawImages.length > 0
      ? rawImages.map((img: any) => (typeof img === "string" ? img : img?.image_url || img?.url || fallbackImage))
      : [property?.image_url || fallbackImage]

  useEffect(() => {
    if (!propertyId || typeof window === 'undefined') return
    const userEmail = localStorage.getItem("user-email") || "guest"
    const reservationKey = `turisve_reservation_${userEmail}_${propertyId}`
    const savedReservation = localStorage.getItem(reservationKey)

    if (savedReservation) {
      try {
        const parsed = JSON.parse(savedReservation)
        setBookingSuccess(true)
        if (parsed.checkIn) setCheckIn(parsed.checkIn)
        if (parsed.checkOut) setCheckOut(parsed.checkOut)
        if (parsed.guests) setGuests(parsed.guests)
      } catch (e) {}
    }
  }, [propertyId])

  useEffect(() => {
    if (!propertyId) return
    let isMounted = true

    getPropertyAvailability(propertyId).catch(() => {})

    setLoadingReviews(true)
    getPropertyReviews(propertyId)
      .then((data) => {
        if (isMounted) setReviews(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (isMounted) setReviews([])
      })
      .finally(() => {
        if (isMounted) setLoadingReviews(false)
      })

    return () => {
      isMounted = false
    }
  }, [propertyId])

  // Cotizador en tiempo real
  useEffect(() => {
    if (!propertyId || !checkIn || !checkOut || bookingSuccess) {
      if (!bookingSuccess) setQuoteData(null)
      setQuoteError(null)
      return
    }

    const fetchQuote = async () => {
      setLoadingQuote(true)
      setQuoteError(null)
      try {
        const data = await quoteBooking({
          property_id: propertyId,
          check_in: checkIn,
          check_out: checkOut,
          guests_count: guests,
        })
        setQuoteData(data)
      } catch (err: any) {
        const start = new Date(`${checkIn}T00:00:00`)
        const end = new Date(`${checkOut}T00:00:00`)
        const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        const minNightsReq = policies?.min_nights || 1
        
        if (diffDays >= minNightsReq) {
          const subtotal = diffDays * price
          const serviceFee = Number((subtotal * 0.10).toFixed(2))
          setQuoteData({
            price_per_night: price,
            nights_count: diffDays,
            subtotal: subtotal,
            service_fee: serviceFee,
            total_amount: subtotal + serviceFee,
            currency: currency
          })
        } else {
          setQuoteError(`La estancia mínima requerida es de ${minNightsReq} noches.`)
          setQuoteData(null)
        }
      } finally {
        setLoadingQuote(false)
      }
    }

    fetchQuote()
  }, [propertyId, checkIn, checkOut, guests, price, currency, bookingSuccess])

  const today = new Date().toISOString().split("T")[0]
  const nights = quoteData?.nights_count || 0
  const totalPrice = quoteData?.total_amount || nights * price

  const handleToggleFavorite = async () => {
    if (!propertyId || isTogglingFavorite) return
    setIsTogglingFavorite(true)
    const previousState = isFavorite
    setIsFavorite(!previousState)

    try {
      await toggleFavorite(propertyId, previousState)
    } catch (err) {
      setIsFavorite(previousState)
    } finally {
      setIsTogglingFavorite(false)
    }
  }

  const handleWhatsAppClick = async () => {
    setIsTrackingClick(true)
    if (propertyId) {
      await trackLeadClick(propertyId)
    }
    setIsTrackingClick(false)

    const message = encodeURIComponent(
      `Hola, me gustaría obtener información del alojamiento "${title}" (${shortName}).`
    )
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank")
  }

  const handleBooking = async () => {
    if (nights <= 0 || bookingSuccess) return
    setIsSubmitting(true)
    setBookingError(null)

    try {
      await createReservation({
        property_id: propertyId,
        check_in: checkIn,
        check_out: checkOut,
        guests_count: guests,
        total_price: totalPrice,
      })
      setBookingSuccess(true)

      const userEmail = localStorage.getItem("user-email") || "guest"
      localStorage.setItem(
        `turisve_reservation_${userEmail}_${propertyId}`,
        JSON.stringify({ checkIn, checkOut, guests, totalPrice, date: new Date().toISOString() })
      )
    } catch (err: any) {
      setBookingError(err?.response?.data?.detail || "No se pudo procesar la reserva.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8 bg-white min-h-screen">
      {/* Navegación Superior */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        <div className="flex items-center gap-2">
          <button className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleToggleFavorite}
            disabled={isTogglingFavorite}
            className={`p-2 rounded-full transition-colors ${
              isFavorite ? "text-rose-600 bg-rose-50" : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-rose-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Encabezado sincronizado con el nuevo JSON */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-900 text-white px-2.5 py-0.5 rounded-md">
            {category}
          </span>
          {isVerified && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              <ShieldCheck className="w-3.5 h-3.5" /> Verificado
            </span>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
          {title}
        </h1>
        <p className="text-sm text-neutral-500 mt-1 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 inline text-neutral-400" />
          <span className="underline">{fullAddress}</span>
        </p>
      </div>

      {/* Galería de Imágenes */}
      <div className="space-y-3">
        <div className="relative w-full h-[320px] sm:h-[450px] bg-neutral-100 rounded-2xl overflow-hidden border border-neutral-200 shadow-inner">
          <img
            src={images[selectedImageIndex] || fallbackImage}
            alt={title}
            className="w-full h-full object-cover transition-all duration-300"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = fallbackImage
            }}
          />
        </div>

        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {images.map((imgUrl: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                  selectedImageIndex === idx ? "border-black scale-95 shadow-md" : "border-transparent opacity-70"
                }`}
              >
                <img src={imgUrl} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Contenido principal & Panel Lateral */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        <div className="lg:col-span-2 space-y-8">
          {/* Capacidades / Métricas del JSON */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs text-neutral-700">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-neutral-900" />
              <span>{maxGuests} Huéspedes</span>
            </div>
            <div className="flex items-center gap-2">
              <Bed className="w-4 h-4 text-neutral-900" />
              <span>{bedroomsCount} Habitaciones</span>
            </div>
            <div className="flex items-center gap-2">
              <Bed className="w-4 h-4 text-neutral-900" />
              <span>{bedsCount} Camas</span>
            </div>
            <div className="flex items-center gap-2">
              <Bath className="w-4 h-4 text-neutral-900" />
              <span>{bathsCount} Baños</span>
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-neutral-900">Acerca de este alojamiento</h2>
            <p className="text-sm text-neutral-600 leading-relaxed">{description}</p>
          </div>

          {/* Amenidades actualizadas según el JSON */}
          <div className="space-y-3 pt-4 border-t border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900">Comodidades y servicios</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
              {amenities.wifi && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-800">
                  <Wifi className="w-4 h-4 text-rose-500" />
                  <span>Wi-Fi / Internet</span>
                </div>
              )}
              {amenities.air_conditioning && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-800">
                  <Wind className="w-4 h-4 text-sky-500" />
                  <span>Aire acondicionado</span>
                </div>
              )}
              {amenities.kitchen && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-800">
                  <Utensils className="w-4 h-4 text-orange-500" />
                  <span>Cocina equipada</span>
                </div>
              )}
              {amenities.parking && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-800">
                  <Car className="w-4 h-4 text-indigo-500" />
                  <span>Estacionamiento</span>
                </div>
              )}
              {amenities.hot_water && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-800">
                  <Flame className="w-4 h-4 text-red-500" />
                  <span>Agua caliente</span>
                </div>
              )}
              {amenities.power_generator && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-800">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Planta eléctrica</span>
                </div>
              )}
              {amenities.water_tank && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-800">
                  <Droplet className="w-4 h-4 text-blue-500" />
                  <span>Tanque de agua</span>
                </div>
              )}
              {amenities.swimming_pool && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-800">
                  <Waves className="w-4 h-4 text-cyan-500" />
                  <span>Piscina</span>
                </div>
              )}
            </div>
          </div>

          {/* Políticas actualizadas según el JSON */}
          <div className="space-y-3 pt-4 border-t border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900">Políticas de la Posada</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-neutral-700" />
                <span>Estancia mín: {policies.min_nights} noches</span>
              </div>
              {policies.no_parties && (
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center gap-2">
                  <PartyPopper className="w-4 h-4 text-neutral-700" />
                  <span>No se permiten fiestas</span>
                </div>
              )}
              {policies.no_smoking && (
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center gap-2">
                  <CigaretteOff className="w-4 h-4 text-neutral-700" />
                  <span>No fumar</span>
                </div>
              )}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center gap-2">
                <PawPrint className="w-4 h-4 text-neutral-700" />
                <span>{policies.pet_friendly ? "Pet Friendly" : "No se aceptan mascotas"}</span>
              </div>
            </div>
          </div>

          {/* Anfitrión / Host del JSON */}
          <div className="pt-6 border-t border-neutral-200 space-y-4">
            <h2 className="text-xl font-bold text-neutral-900">Anfitrión del alojamiento</h2>
            <div className="p-5 border border-neutral-200 rounded-2xl bg-neutral-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {hostAvatar ? (
                  <img src={hostAvatar} alt={hostName} className="w-12 h-12 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-base shrink-0">
                    {hostName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                    {hostName}
                    {isHostVerified && <ShieldCheck className="w-4 h-4 text-blue-600" />}
                  </h3>
                  <p className="text-xs text-neutral-500">Responde {responseTimeText}</p>
                </div>
              </div>

              <button
                onClick={handleWhatsAppClick}
                disabled={isTrackingClick}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                {isTrackingClick ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4 fill-white" />}
                <span>Contactar por WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Ubicación GPS exacta del JSON */}
          <div className="pt-6 border-t border-neutral-200 space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-600" />
              <h2 className="text-xl font-bold text-neutral-900">Ubicación del alojamiento</h2>
            </div>
            <p className="text-sm text-neutral-600">{fullAddress}</p>

            <div className="relative w-full h-64 bg-neutral-100 rounded-2xl border border-neutral-200 overflow-hidden flex flex-col items-center justify-center p-4 text-center">
              <Compass className="w-8 h-8 text-rose-500 mb-2 animate-pulse" />
              <p className="text-xs font-semibold text-neutral-800">{fullAddress}</p>
              <span className="mt-2 text-[10px] text-neutral-400 font-mono">
                GPS: {latitude}, {longitude}
              </span>
            </div>
          </div>
        </div>

        {/* Tarjeta lateral de reserva */}
        <div className="lg:col-span-1">
          <div className="p-6 border border-neutral-200 rounded-2xl shadow-sm space-y-4 bg-white sticky top-6">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-neutral-900">${price}</span>
              <span className="text-xs text-neutral-500">/ noche ({currency})</span>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-500 uppercase">Llegada</label>
                  <input
                    type="date"
                    min={today}
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    disabled={bookingSuccess}
                    className="w-full bg-transparent font-medium text-neutral-800 outline-none"
                  />
                </div>
                <div className="border-l border-neutral-200 pl-2">
                  <label className="block text-[10px] font-semibold text-neutral-500 uppercase">Salida</label>
                  <input
                    type="date"
                    min={checkIn || today}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    disabled={bookingSuccess}
                    className="w-full bg-transparent font-medium text-neutral-800 outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
                <label className="block text-[10px] font-semibold text-neutral-500 uppercase">Huéspedes</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  disabled={bookingSuccess}
                  className="w-full bg-transparent font-medium text-neutral-800 outline-none"
                >
                  {Array.from({ length: maxGuests }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? "huésped" : "huéspedes"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loadingQuote && !bookingSuccess && (
              <div className="flex items-center justify-center gap-2 py-2 text-xs text-neutral-500">
                <Loader2 className="w-4 h-4 animate-spin text-neutral-800" />
                Calculando cotización...
              </div>
            )}

            {quoteError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl text-center">
                {quoteError}
              </div>
            )}

            {bookingSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl text-center font-medium flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>¡Solicitud enviada con éxito!</span>
              </div>
            )}

            <button
              disabled={nights < policies.min_nights || isSubmitting || loadingQuote || bookingSuccess}
              onClick={handleBooking}
              className={`w-full py-3 text-sm font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 ${
                bookingSuccess
                  ? "bg-emerald-600 text-white cursor-default"
                  : nights >= policies.min_nights && !isSubmitting && !loadingQuote
                  ? "bg-black text-white hover:bg-neutral-800"
                  : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
              }`}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {bookingSuccess
                ? "¡Reserva Confirmada!"
                : nights >= policies.min_nights
                ? `Reservar ($${totalPrice} ${currency})`
                : `Mínimo ${policies.min_nights} noches`}
            </button>

            {quoteData && !loadingQuote && (
              <div className="pt-4 border-t border-neutral-100 space-y-2 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>${price} x {nights} {nights === 1 ? "noche" : "noches"}</span>
                  <span>${quoteData.subtotal || (nights * price)}</span>
                </div>
                {quoteData.service_fee > 0 && (
                  <div className="flex justify-between">
                    <span>Tarifa TurisVe</span>
                    <span>${quoteData.service_fee}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-neutral-900 pt-2 border-t border-neutral-100 text-sm">
                  <span>Total a pagar</span>
                  <span>${quoteData.total_amount || totalPrice} {currency}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}