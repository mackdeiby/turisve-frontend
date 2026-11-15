"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  Building2, 
  Plus, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowLeft,
  MapPin 
} from "lucide-react"
import { getMyProperties, getMyProfile } from "@/services/api"

function HostDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const successParam = searchParams.get("success")

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [properties, setProperties] = useState<any[]>([])

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    // Cargar perfil y propiedades en paralelo de forma segura con manejo de excepciones
    Promise.all([
      getMyProfile().catch(() => ({ full_name: "Anfitrión", is_owner: true })),
      getMyProperties().catch(() => [])
    ])
      .then(([profileData, propertiesData]) => {
        if (isMounted) {
          setProfile(profileData)
          setProperties(Array.isArray(propertiesData) ? propertiesData : [])
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-neutral-500 gap-2 bg-white">
        <Loader2 className="w-5 h-5 animate-spin text-black"/>
        <span className="text-sm">Cargando panel de anfitrión...</span>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 bg-white min-h-screen">
      
      {/* Barra superior de navegación */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/perfil")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors"
          >
            <ArrowLeft className="w-4 h-4"/>
            Mi Perfil
          </button>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Panel de Anfitrión</h1>
        </div>

        <button
          onClick={() => router.push("/host/properties/new")}
          className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-xs"
        >
          <Plus className="w-4 h-4"/>
          Registrar Nueva Propiedad
        </button>
      </div>

      {/* Alerta de éxito si viene de registrar una propiedad */}
      {successParam === "pending" && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0"/>
          <div>
            <p className="font-bold">¡Propiedad enviada con éxito!</p>
            <p className="mt-0.5">Tu alojamiento se encuentra en estado <strong>Pendiente</strong> a la espera de revisión administrativa.</p>
          </div>
        </div>
      )}

      {/* Tarjeta de Resumen del Anfitrión */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-2">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Estado de la Cuenta</span>
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
            <ShieldCheck className="w-4 h-4"/>
            <span>Anfitrión Verificado</span>
          </div>
          <p className="text-xs text-neutral-500">{profile?.email || localStorage.getItem("user-email")}</p>
        </div>

        <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-2">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total de Alojamientos</span>
          <p className="text-2xl font-extrabold text-neutral-900">{properties.length}</p>
          <p className="text-xs text-neutral-500">Registrados en la plataforma</p>
        </div>

        <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-2">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Soporte y Ayuda</span>
          <p className="text-xs font-medium text-neutral-700 leading-relaxed">
            ¿Dudas con tus publicaciones? Contacta al equipo de administración de TurisVE.
          </p>
        </div>
      </div>

      {/* Listado de Propiedades del Anfitrión */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-neutral-900">Mis Alojamientos</h2>

        {properties.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-neutral-200 rounded-3xl space-y-4">
            <div className="w-12 h-12 bg-neutral-100 text-neutral-400 rounded-full flex items-center justify-center mx-auto">
              <Building2 className="w-6 h-6"/>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-neutral-800">No tienes alojamientos registrados</p>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Comienza a publicar posadas, hoteles o casas de playa para captar turistas en TurisVE.
              </p>
            </div>
            <button
              onClick={() => router.push("/host/properties/new")}
              className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
            >
              Registrar mi primera propiedad
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {properties.map((prop, idx) => (
              <div key={prop.id || idx} className="p-5 border border-neutral-200 rounded-2xl space-y-3 bg-white shadow-xs hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-block text-[10px] font-bold uppercase bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md mb-1">
                      {prop.category || "Posada"}
                    </span>
                    <h3 className="text-base font-bold text-neutral-900">{prop.name}</h3>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                    prop.status === "approved" 
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                      : "bg-amber-50 text-amber-800 border border-amber-200"
                  }`}>
                    <Clock className="w-3 h-3"/>
                    {prop.status === "approved" ? "Aprobada" : "Pendiente"}
                  </span>
                </div>

                <p className="text-xs text-neutral-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400"/>
                  <span>{prop.formatted_address || `${prop.municipality || ""}, ${prop.state || ""}`}</span>
                </p>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-semibold">
                  <span className="text-neutral-900">${prop.price_per_night || 0} USD <span className="text-neutral-400 font-normal">/ noche</span></span>
                  <span className="text-rose-600">ID: {prop.id}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default function HostDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-neutral-500 gap-2 bg-white">
        <Loader2 className="w-5 h-5 animate-spin text-black"/>
        <span className="text-sm">Cargando panel...</span>
      </div>
    }>
      <HostDashboardContent />
    </Suspense>
  )
}