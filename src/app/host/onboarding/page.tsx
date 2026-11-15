"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, Building2 } from "lucide-react"
import { completeOwnerRegistration } from "@/services/api"

export default function HostOnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || "token_bypass_desarrollo"

  // Bypass temporal: arrancamos con el token validado en true para probar la UI
  const [isValidToken, setIsValidToken] = useState(true)
  
  const [formData, setFormData] = useState({
    business_name: "",
    document_type: "J",
    document_number: "",
    whatsapp_official: "",
    document_file_url: "",
  })
  const [submitting, setSubmitting] = useState(false)

  // Enviar datos para completar registro fiscal (POST /profiles/me/completar-business)
  const handleSubmitBusiness = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await completeOwnerRegistration({
        ...formData,
        invitation_token: token,
      })
      // Redirigir al panel del anfitrión una vez completado
      router.push("/host/dashboard")
    } catch (err: any) {
      const backendError = err?.response?.data?.detail
      alert(backendError || "Error al completar el registro empresarial.")
    } finally {
      setSubmitting(false)
    }
  }

  if (!isValidToken) {
    return null
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <Building2 className="w-10 h-10 text-rose-500 mx-auto" />
          <h1 className="text-2xl font-bold text-neutral-900">Registro de Posadero / Empresa</h1>
          <p className="text-sm text-neutral-500">
            Completa tus datos fiscales para activar tu cuenta de anfitrión en TurisVE.
          </p>
          <div className="inline-block bg-amber-50 text-amber-800 text-xs px-3 py-1 rounded-full border border-amber-200 mt-2">
            ⚠️ Modo de prueba (Bypass de invitación activo)
          </div>
        </div>

        <form onSubmit={handleSubmitBusiness} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase">
              Razón Social / Nombre de la Posada
            </label>
            <input
              type="text"
              required
              className="mt-1 w-full rounded-lg border border-neutral-300 p-3 text-sm focus:border-rose-500 focus:outline-none"
              placeholder="Ej: Inversiones Turísticas Morrocoy C.A."
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase">
                Tipo RIF
              </label>
              <select
                className="mt-1 w-full rounded-lg border border-neutral-300 p-3 text-sm focus:border-rose-500 focus:outline-none"
                value={formData.document_type}
                onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
              >
                <option value="J">J</option>
                <option value="V">V</option>
                <option value="E">E</option>
                <option value="G">G</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-neutral-700 uppercase">
                Nro. de Documento / RIF
              </label>
              <input
                type="text"
                required
                className="mt-1 w-full rounded-lg border border-neutral-300 p-3 text-sm focus:border-rose-500 focus:outline-none"
                placeholder="401234567"
                value={formData.document_number}
                onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase">
              WhatsApp Oficial de Reservas
            </label>
            <input
              type="text"
              required
              className="mt-1 w-full rounded-lg border border-neutral-300 p-3 text-sm focus:border-rose-500 focus:outline-none"
              placeholder="+584121234567"
              value={formData.whatsapp_official}
              onChange={(e) => setFormData({ ...formData, whatsapp_official: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase">
              URL del Documento Fiscal (PDF o Imagen)
            </label>
            <input
              type="url"
              required
              className="mt-1 w-full rounded-lg border border-neutral-300 p-3 text-sm focus:border-rose-500 focus:outline-none"
              placeholder="https://.../rif.pdf"
              value={formData.document_file_url}
              onChange={(e) => setFormData({ ...formData, document_file_url: e.target.value })}
            />
            <p className="text-xs text-neutral-400 mt-1">
              Debe ser un enlace HTTPS seguro con extensión .pdf, .jpg o .png[cite: 13]
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-rose-500 text-white font-medium p-3 rounded-xl hover:bg-rose-600 transition flex items-center justify-center space-x-2"
          >
            {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
            <span>Completar Registro y Acceder</span>
          </button>
        </form>
      </div>
    </div>
  )
}