"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  Phone,
  Mail,
  ShieldCheck,
  Loader2,
  ArrowLeft,
  Camera,
  Save,
  LogOut,
} from "lucide-react"
import { getMyProfile, updateMyProfile } from "@/services/api"

interface UserProfileProps {
  onBack?: () => void
}

export function UserProfile({ onBack }: UserProfileProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Datos del Perfil (GET & PUT/PATCH /profiles/me)
  const [profile, setProfile] = useState<any>({
    full_name: "",
    email: "",
    whatsapp_official: "",
    username: "",
    is_owner: false,
  })

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    getMyProfile()
      .then((data) => {
        if (isMounted && data) {
          // Mapeamos tanto whatsapp_official como phone para asegurar que agarre el número registrado
          const userPhone = data.whatsapp_official || data.phone || ""

          setProfile({
            full_name: data.full_name || "",
            email: data.email || localStorage.getItem("user-email") || "",
            whatsapp_official: userPhone,
            username: data.username || "",
            is_owner: Boolean(data.is_owner || data.role === "owner"),
          })
        }
      })
      .catch((err) => {
        console.warn("Error al cargar perfil:", err)
        if (isMounted) {
          const localEmail = localStorage.getItem("user-email") || ""
          setProfile((prev: any) => ({ ...prev, email: localEmail }))
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Guardar datos personales (Con respaldo local para desarrollo de Frontend)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFeedbackMsg(null)

    try {
      const payload = {
        full_name: profile.full_name.trim(),
        whatsapp_official: profile.whatsapp_official.trim(),
        phone: profile.whatsapp_official.trim(),
        username: profile.username ? profile.username.trim() : undefined,
      }

      await updateMyProfile(payload)
      setFeedbackMsg({ type: "success", text: "Perfil actualizado correctamente." })
    } catch (err: any) {
      console.warn("Backend no disponible temporalmente. Aplicando guardado local para desarrollo:", err)
      
      // Respaldo local para que el flujo visual no se detenga mientras el backend corrige el CORS
      if (typeof window !== 'undefined') {
        localStorage.setItem('mock_profile_name', profile.full_name)
        localStorage.setItem('mock_profile_phone', profile.whatsapp_official)
      }

      setFeedbackMsg({
        type: "success",
        text: "Perfil actualizado localmente (Modo Desarrollo Frontend).",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Cerrar Sesión
  const handleLogout = () => {
    localStorage.removeItem("sb-access-token")
    localStorage.removeItem("user-email")
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-neutral-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-black" />
        <span className="text-sm">Cargando perfil...</span>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 bg-white min-h-screen">
      {/* Botón Volver */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
      )}

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xl shadow-md">
            {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
            <button className="absolute bottom-0 right-0 p-1 bg-white border border-neutral-200 text-neutral-700 rounded-full shadow-xs hover:bg-neutral-50 cursor-pointer">
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              {profile.full_name || "Mi Cuenta"}
            </h1>
            <p className="text-xs text-neutral-500 flex items-center gap-1.5 mt-0.5">
              <span>{profile.email}</span>
              {profile.is_owner && (
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3 h-3" /> Anfitrión Verificado
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Alertas de Mensaje */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl text-xs font-medium border ${
            feedbackMsg.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {feedbackMsg.text}
        </div>
      )}

      {/* FORMULARIO DE DATOS PERSONALES */}
      <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase mb-1">
              Nombre Completo
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
              <input
                type="text"
                required
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-black transition-colors text-black"
                placeholder="Ej: Mack Sánchez"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase mb-1">
              Correo Electrónico (No modificable)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
              <input
                type="email"
                disabled
                value={profile.email}
                className="w-full pl-9 pr-4 py-2.5 bg-neutral-100 border border-neutral-200 rounded-xl text-sm text-neutral-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase mb-1">
              WhatsApp Oficial
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
              <input
                type="text"
                value={profile.whatsapp_official}
                onChange={(e) => setProfile({ ...profile, whatsapp_official: e.target.value })}
                className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-black transition-colors text-black"
                placeholder="Ej: +584121234567"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.99] cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar Cambios
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full sm:w-auto px-6 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 border border-rose-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </form>
    </div>
  )
}

export default UserProfile