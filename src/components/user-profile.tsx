"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  Phone,
  Mail,
  ShieldCheck,
  Building2,
  FileText,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Camera,
  Save,
  LogOut,
  PlusCircle,
  LayoutDashboard,
} from "lucide-react"
import { getMyProfile, updateMyProfile, completeOwnerRegistration } from "@/services/api"

interface UserProfileProps {
  onBack?: () => void
}

export function UserProfile({ onBack }: UserProfileProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"personal" | "owner">("personal")
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Datos del Perfil (GET & PUT /profiles/me)
  const [profile, setProfile] = useState<any>({
    full_name: "",
    email: "",
    whatsapp_official: "",
    username: "",
    is_owner: false,
  })

  // Datos para Convertirse en Anfitrión (POST /profiles/me/completar-owner)
  const [ownerData, setOwnerData] = useState({
    full_name: "",
    document_type: "V", // V, E, J, P
    document_number: "",
    whatsapp_official: "",
    document_file_url: "",
  })

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    getMyProfile()
      .then((data) => {
        if (isMounted && data) {
          setProfile({
            full_name: data.full_name || "",
            email: data.email || localStorage.getItem("user-email") || "",
            whatsapp_official: data.whatsapp_official || "",
            username: data.username || "",
            is_owner: Boolean(data.is_owner || data.role === "owner"),
          })

          setOwnerData((prev) => ({
            ...prev,
            full_name: data.full_name || "",
            whatsapp_official: data.whatsapp_official || "",
          }))
        }
      })
      .catch((err) => {
        console.warn("Error al cargar perfil:", err)
        // Carga el correo almacenado en local storage si la petición falla
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

  // Guardar datos personales
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFeedbackMsg(null)

    try {
      await updateMyProfile({
        full_name: profile.full_name,
        whatsapp_official: profile.whatsapp_official,
        username: profile.username,
      })
      setFeedbackMsg({ type: "success", text: "Perfil actualizado correctamente." })
    } catch (err: any) {
      setFeedbackMsg({
        type: "error",
        text: err?.response?.data?.detail || "No se pudo actualizar el perfil.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Registrarse como Anfitrión
  const handleRegisterOwner = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFeedbackMsg(null)

    try {
      await completeOwnerRegistration(ownerData)
      setProfile((prev: any) => ({ ...prev, is_owner: true }))
      setFeedbackMsg({
        type: "success",
        text: "¡Felicidades! Ahora estás verificado como Anfitrión en TurisVe. Redirigiendo...",
      })
      
      // Redirección automática al panel del anfitrión tras un breve instante
      setTimeout(() => {
        router.push("/host/dashboard")
      }, 1200)

    } catch (err: any) {
      setFeedbackMsg({
        type: "error",
        text: err?.response?.data?.detail || "Error al completar el registro de anfitrión.",
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
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors"
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
            <button className="absolute bottom-0 right-0 p-1 bg-white border border-neutral-200 text-neutral-700 rounded-full shadow-xs hover:bg-neutral-50">
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

        {/* Pestañas / Tabs */}
        <div className="flex bg-neutral-100 p-1 rounded-xl text-xs font-semibold w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("personal")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all ${
              activeTab === "personal"
                ? "bg-white text-neutral-900 shadow-xs"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            Datos Personales
          </button>
          <button
            onClick={() => setActiveTab("owner")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "owner"
                ? "bg-white text-neutral-900 shadow-xs"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Modo Anfitrión
          </button>
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

      {/* TAB 1: DATOS PERSONALES */}
      {activeTab === "personal" && (
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
                  className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
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
                  className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
                  placeholder="Ej: 584121234567"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.99]"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar Cambios
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full sm:w-auto px-6 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 border border-rose-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: VERIFICACIÓN Y MODO ANFITRIÓN */}
      {activeTab === "owner" && (
        <div className="space-y-6 max-w-2xl">
          {profile.is_owner ? (
            <div className="p-6 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Perfil de Anfitrión Activo</span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Tu cuenta está verificada para publicar y gestionar posadas en la plataforma TurisVe. Puedes comenzar a publicar o administrar tus propiedades.
              </p>

              {/* Botones de acción rápida para el anfitrión */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.push("/host/dashboard")}
                  className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-xs"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Ir al Panel de Anfitrión
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/host/properties/new")}
                  className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  Registrar Nueva Propiedad
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegisterOwner} className="space-y-6">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                <p className="font-semibold">¿Quieres publicar tus alojamientos?</p>
                <p className="mt-0.5">Completa este formulario oficial para verificar tu identidad y convertirte en anfitrión.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase mb-1">
                    Nombre Completo del Propietario
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerData.full_name}
                    onChange={(e) => setOwnerData({ ...ownerData, full_name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 uppercase mb-1">
                      Tipo Doc.
                    </label>
                    <select
                      value={ownerData.document_type}
                      onChange={(e) => setOwnerData({ ...ownerData, document_type: e.target.value })}
                      className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
                    >
                      <option value="V">V - Venezolano</option>
                      <option value="E">E - Extranjero</option>
                      <option value="J">J - Jurídico</option>
                      <option value="P">P - Pasaporte</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-neutral-700 uppercase mb-1">
                      Número de Documento / C.I.
                    </label>
                    <input
                      type="text"
                      required
                      value={ownerData.document_number}
                      onChange={(e) => setOwnerData({ ...ownerData, document_number: e.target.value })}
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
                      placeholder="Ej: 18234567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase mb-1">
                    WhatsApp Oficial para Leads
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerData.whatsapp_official}
                    onChange={(e) => setOwnerData({ ...ownerData, whatsapp_official: e.target.value })}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
                    placeholder="Ej: 584121234567"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase mb-1">
                    URL del Documento de Identidad (Digital / RIF)
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
                    <input
                      type="url"
                      required
                      value={ownerData.document_file_url}
                      onChange={(e) => setOwnerData({ ...ownerData, document_file_url: e.target.value })}
                      className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
                      placeholder="https://ejemplo.com/documento.pdf"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-black hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.99]"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Completar Registro de Anfitrión
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}