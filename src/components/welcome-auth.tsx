'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getMyProfile } from '@/services/api'
import { Mail, Lock, User, Phone, ArrowRight, Loader2, AlertCircle } from 'lucide-react'

interface WelcomeAuthProps {
  onSuccess?: (profile?: any) => void
}

export function WelcomeAuth({ onSuccess }: WelcomeAuthProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setLoading(true)

    try {
      let sessionToken: string | undefined

      if (isRegisterMode) {
        if (!fullName.trim() || !phone.trim()) {
          throw new Error('Por favor completa tu nombre y número de teléfono.')
        }

        // Registro directo con SDK oficial y metadatos para el trigger de Postgres
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              phone: phone.trim(),
            },
          },
        })

        if (error) throw error
        sessionToken = data.session?.access_token
      } else {
        // Inicio de sesión directo con Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

        if (error) throw error
        sessionToken = data.session?.access_token
      }

      if (!sessionToken) {
        throw new Error('No se recibió el token de sesión desde Supabase.')
      }

      // Guardamos el JWT como respaldo para services/api.js
      if (typeof window !== 'undefined') {
        localStorage.setItem('sb-access-token', sessionToken)
        localStorage.setItem('user-email', email.trim())
      }

      // Consultamos GET /profiles/me en FastAPI (ya creado por el trigger on_auth_user_created)
      let profile = null
      try {
        profile = await getMyProfile()
      } catch (profileErr) {
        console.warn('Perfil consultado con retraso inicial, continuando sesión:', profileErr)
      }

      if (onSuccess) {
        onSuccess(profile)
      } else if (typeof window !== 'undefined') {
        window.location.reload()
      }
    } catch (err: any) {
      // Usamos console.warn para evitar el overlay intrusivo de desarrollo en Next.js
      console.warn('Error de autenticación controlado:', err?.message || err)
      setErrorMsg(err?.message || 'Ocurrió un error al autenticar. Verifica tus datos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white px-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-rose-600 text-white font-bold text-xl mb-4">
            TV
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isRegisterMode ? 'Crea tu cuenta en TurisVe' : 'Accede a TurisVe'}
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            {isRegisterMode
              ? 'Regístrate para descubrir posadas y destinos únicos'
              : 'Ingresa tus credenciales para continuar'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-sm text-red-300">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegisterMode && (
            <>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Nombre completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej. Mack González"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Teléfono (WhatsApp)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+584121234567"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white font-medium py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <span>{isRegisterMode ? 'Registrarme y entrar' : 'Iniciar sesión'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-neutral-800 text-center">
          <p className="text-xs text-neutral-400">
            {isRegisterMode ? '¿Ya tienes una cuenta?' : '¿Aún no tienes cuenta en TurisVe?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode)
                setErrorMsg(null)
              }}
              className="text-rose-400 hover:text-rose-300 font-semibold ml-1 cursor-pointer"
            >
              {isRegisterMode ? 'Inicia sesión' : 'Regístrate aquí'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default WelcomeAuth