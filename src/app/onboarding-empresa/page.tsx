'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { validateInvitationToken, completeOwnerRegistration } from '@/services/api'
import {
  Building2,
  FileText,
  Phone,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Link as LinkIcon,
  ArrowLeft,
} from 'lucide-react'

function OnboardingEmpresaForm() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const urlToken = searchParams.get('token') || ''

  const [invitationToken, setInvitationToken] = useState(urlToken)
  const [tokenValidated, setTokenValidated] = useState(false)
  const [invitedEmail, setInvitedEmail] = useState<string | null>(null)
  const [validatingToken, setValidatingToken] = useState(false)

  const [businessName, setBusinessName] = useState('')
  const [documentType, setDocumentType] = useState<'J' | 'V' | 'E' | 'G'>('J')
  const [documentNumber, setDocumentNumber] = useState('')
  const [whatsappOfficial, setWhatsappOfficial] = useState('')
  const [documentFileUrl, setDocumentFileUrl] = useState('')

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // 1. Verificar sesión activa de Supabase
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setIsAuthenticated(Boolean(session?.access_token))
    }
    checkSession()
  }, [])

  // 2. Si viene ?token=... en la URL, validarlo automáticamente
  useEffect(() => {
    if (urlToken) {
      setInvitationToken(urlToken)
      handleValidateToken(urlToken)
    }
  }, [urlToken])

  const handleValidateToken = async (tokenToCheck: string) => {
    const cleanToken = tokenToCheck.trim()
    if (!cleanToken) {
      setErrorMsg('Por favor ingresa un código de invitación válido.')
      return
    }

    setValidatingToken(true)
    setErrorMsg(null)

    // MOCK DE PRUEBA PARA FRONTEND: Si usas este token, pasa la validación localmente
    if (cleanToken === 'TEST-HOST-2026') {
      setTimeout(() => {
        setTokenValidated(true)
        setInvitedEmail('desarrollo.frontend@turisve.com')
        setValidatingToken(false)
      }, 500)
      return
    }

    try {
      const res = await validateInvitationToken(cleanToken)
      setTokenValidated(true)
      setInvitedEmail(res?.email || null)
    } catch (err: any) {
      setTokenValidated(false)
      setInvitedEmail(null)
      setErrorMsg(
        err?.response?.data?.detail ||
          'El código de invitación no es válido o ya expiró.'
      )
    } finally {
      setValidatingToken(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!invitationToken.trim()) {
      setErrorMsg('El código de invitación es obligatorio.')
      return
    }

    setSubmitting(true)

    // Si estás usando el token de prueba mock, simulamos el éxito del envío localmente
    if (invitationToken.trim() === 'TEST-HOST-2026') {
      setTimeout(() => {
        setSuccessMsg(
          '¡Felicidades! Tu cuenta ha sido ascendida a Posadero / Anfitrión verificable (Modo Mock Front).'
        )
        setSubmitting(false)
        setTimeout(() => {
          router.push('/')
        }, 2000)
      }, 1000)
      return
    }

    try {
      await completeOwnerRegistration({
        invitation_token: invitationToken.trim(),
        business_name: businessName.trim(),
        document_type: documentType,
        document_number: documentNumber.trim(),
        whatsapp_official: whatsappOfficial.trim(),
        document_file_url: documentFileUrl.trim() || 'https://turisve.com/docs/rif-pendiente.pdf',
      })

      setSuccessMsg(
        '¡Felicidades! Tu cuenta ha sido ascendida a Posadero / Anfitrión verificable.'
      )

      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (err: any) {
      console.error('Error al completar onboarding:', err)

      // Procesamiento seguro del error para evitar objetos directos en React
      const serverDetail = err?.response?.data?.detail
      let errorMessage = 'No se pudo completar el registro comercial. Verifica los datos.'

      if (typeof serverDetail === 'string') {
        errorMessage = serverDetail
      } else if (Array.isArray(serverDetail)) {
        errorMessage = serverDetail.map((item: any) => `${item.loc?.join('.')}: ${item.msg}`).join(', ')
      }

      setErrorMsg(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white py-10 px-4 flex items-center justify-center">
      <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </button>

        <div className="mb-6">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-3">
            Club Exclusivo de Anfitriones
          </span>
          <h1 className="text-2xl font-bold tracking-tight">
            Registro Comercial de Posada / Empresa
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Completa los datos legales de tu alojamiento para activar tu panel de anfitrión en TurisVe.
          </p>
        </div>

        {isAuthenticated === false && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-sm text-amber-200">
            <p className="font-semibold mb-1">Aún no has iniciado sesión</p>
            <p className="text-xs text-amber-300/90 mb-3">
              Primero debes crear tu cuenta o iniciar sesión como usuario para vincular esta invitación a tu perfil.
            </p>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-4 py-2 rounded-lg bg-amber-500 text-neutral-950 font-semibold text-xs hover:bg-amber-400 cursor-pointer"
            >
              Ir a Iniciar Sesión / Registrarme
            </button>
          </div>
        )}

        {invitedEmail && tokenValidated && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-sm text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>
              ¡Bienvenido! Invitación verificada para <strong>{invitedEmail}</strong>
            </span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-sm text-red-300">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-sm text-emerald-300">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!urlToken && (
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Código de invitación (Token) <span className="text-neutral-500 font-normal">(Usa: TEST-HOST-2026 para probar)</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={invitationToken}
                    onChange={(e) => {
                      setInvitationToken(e.target.value)
                      setTokenValidated(false)
                    }}
                    placeholder="Pega aquí tu código de invitación"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <button
                  type="button"
                  disabled={validatingToken || !invitationToken.trim()}
                  onClick={() => handleValidateToken(invitationToken)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-xs font-medium text-white cursor-pointer"
                >
                  {validatingToken ? 'Validando...' : 'Validar'}
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Nombre comercial de la posada o empresa
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Ej. Posada Náutica Los Canales"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Tipo RIF / Doc
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as any)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
              >
                <option value="J">J (Jurídico)</option>
                <option value="V">V (Venezolano)</option>
                <option value="E">E (Extranjero)</option>
                <option value="G">G (Gubernamental)</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Número de RIF o Cédula
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="Ej. 123456789"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              WhatsApp oficial de atención al turista
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={whatsappOfficial}
                onChange={(e) => setWhatsappOfficial(e.target.value)}
                placeholder="+584121234567"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Enlace al documento RIF (PDF o imagen)
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                required
                value={documentFileUrl}
                onChange={(e) => setDocumentFileUrl(e.target.value)}
                placeholder="https://.../rif.pdf"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || isAuthenticated === false}
            className="w-full mt-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registrando empresa...</span>
              </>
            ) : (
              <span>Completar registro de anfitrión</span>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function OnboardingEmpresaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
          <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
        </div>
      }
    >
      <OnboardingEmpresaForm />
    </Suspense>
  )
}