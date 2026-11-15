"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react"
import { createProperty } from "@/services/api"

export default function CreatePropertyWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  // Estado del formulario mapeado exactamente al JSON de la API de TurisVE
  const [form, setForm] = useState({
    name: "",
    category: "posada",
    state: "",
    municipality: "",
    price_per_night: 50,
    currency: "USD",
    max_guests: 2,
    bedrooms_count: 1,
    beds_count: 1,
    baths_count: 1,
    whatsapp_number: "",
    description: "",
    latitude: 10.4806,
    longitude: -66.9036,
    formatted_address: "",
    image_urls: [""],
    amenities: {
      wifi: false,
      swimming_pool: false,
      power_generator: false,
      water_tank: false,
      air_conditioning: false,
    },
    policies: {
      min_nights: 1,
      no_smoking: true,
      no_parties: true,
      pet_friendly: false,
    },
  })

  const handleInputChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleNestedChange = (category: "amenities" | "policies", field: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [category]: { ...prev[category], [field]: value },
    }))
  }

  // Envío final del formulario usando el servicio unificado de api.js
  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await createProperty(form)
      // Redirigir al panel de anfitrión indicando éxito
      router.push("/host/dashboard?success=pending")
    } catch (err: any) {
      console.error(err)
      alert(err?.response?.data?.detail || "Error al registrar la propiedad.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h1 className="text-xl font-bold text-neutral-800">Registrar Nuevo Alojamiento</h1>
          <span className="text-xs font-semibold bg-rose-100 text-rose-600 px-3 py-1 rounded-full">
            Paso {step} de 3
          </span>
        </div>

        {/* PASO 1: Información Básica y Ubicación */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase text-neutral-500">1. Datos Principales y Ubicación</h2>
            <div>
              <label className="block text-xs font-medium text-neutral-700">Nombre del Alojamiento</label>
              <input
                type="text"
                className="w-full mt-1 p-3 border rounded-xl text-sm focus:outline-rose-500"
                placeholder="Ej: Posada TurisVE Morrocoy"
                value={form.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700">Categoría</label>
                <select
                  className="w-full mt-1 p-3 border rounded-xl text-sm focus:outline-rose-500"
                  value={form.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                >
                  <option value="posada">Posada</option>
                  <option value="hotel">Hotel</option>
                  <option value="cabana">Cabaña</option>
                  <option value="apartamento">Apartamento</option>
                  <option value="casa_playa">Casa de Playa</option>
                  <option value="glamping">Glamping</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700">Estado (Venezuela)</label>
                <input
                  type="text"
                  className="w-full mt-1 p-3 border rounded-xl text-sm focus:outline-rose-500"
                  placeholder="Ej: Falcón"
                  value={form.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700">Municipio</label>
                <input
                  type="text"
                  className="w-full mt-1 p-3 border rounded-xl text-sm focus:outline-rose-500"
                  placeholder="Ej: Silva"
                  value={form.municipality}
                  onChange={(e) => handleInputChange("municipality", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700">WhatsApp de Contacto</label>
                <input
                  type="text"
                  className="w-full mt-1 p-3 border rounded-xl text-sm focus:outline-rose-500"
                  placeholder="+584121234567"
                  value={form.whatsapp_number}
                  onChange={(e) => handleInputChange("whatsapp_number", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700">Dirección Exacta (Obligatoria)</label>
              <input
                type="text"
                className="w-full mt-1 p-3 border rounded-xl text-sm focus:outline-rose-500"
                placeholder="Sector El Tuque, Tucacas, Estado Falcón"
                value={form.formatted_address}
                onChange={(e) => handleInputChange("formatted_address", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* PASO 2: Capacidades y Tarifas */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase text-neutral-500">2. Tarifas y Capacidades</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700">Precio por Noche (USD)</label>
                <input
                  type="number"
                  className="w-full mt-1 p-3 border rounded-xl text-sm focus:outline-rose-500"
                  value={form.price_per_night}
                  onChange={(e) => handleInputChange("price_per_night", parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700">Huéspedes Máximos</label>
                <input
                  type="number"
                  className="w-full mt-1 p-3 border rounded-xl text-sm focus:outline-rose-500"
                  value={form.max_guests}
                  onChange={(e) => handleInputChange("max_guests", parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700">Habitaciones</label>
                <input
                  type="number"
                  className="w-full mt-1 p-3 border rounded-xl text-sm focus:outline-rose-500"
                  value={form.bedrooms_count}
                  onChange={(e) => handleInputChange("bedrooms_count", parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700">Camas</label>
                <input
                  type="number"
                  className="w-full mt-1 p-3 border rounded-xl text-sm focus:outline-rose-500"
                  value={form.beds_count}
                  onChange={(e) => handleInputChange("beds_count", parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700">Baños</label>
                <input
                  type="number"
                  className="w-full mt-1 p-3 border rounded-xl text-sm focus:outline-rose-500"
                  value={form.baths_count}
                  onChange={(e) => handleInputChange("baths_count", parseInt(e.target.value))}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700">Descripción General</label>
              <textarea
                rows={3}
                className="w-full mt-1 p-3 border rounded-xl text-sm focus:outline-rose-500"
                placeholder="Hermosa posada familiar..."
                value={form.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* PASO 3: Amenidades, Fotos y Envío */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase text-neutral-500">3. Comodidades e Imágenes</h2>
            
            <div className="grid grid-cols-2 gap-3 p-4 bg-neutral-50 rounded-xl">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.amenities.wifi}
                  onChange={(e) => handleNestedChange("amenities", "wifi", e.target.checked)}
                />
                <span>Wi-Fi</span>
              </label>
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.amenities.swimming_pool}
                  onChange={(e) => handleNestedChange("amenities", "swimming_pool", e.target.checked)}
                />
                <span>Piscina</span>
              </label>
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.amenities.power_generator}
                  onChange={(e) => handleNestedChange("amenities", "power_generator", e.target.checked)}
                />
                <span>Planta Eléctrica</span>
              </label>
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.amenities.water_tank}
                  onChange={(e) => handleNestedChange("amenities", "water_tank", e.target.checked)}
                />
                <span>Tanque de Agua</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700">URL de la Imagen Principal</label>
              <input
                type="url"
                className="w-full mt-1 p-3 border rounded-xl text-sm focus:outline-rose-500"
                placeholder="https://images.supabase.co/.../posada1.webp"
                value={form.image_urls[0]}
                onChange={(e) => {
                  const urls = [e.target.value]
                  handleInputChange("image_urls", urls)
                }}
              />
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
              ⚠️ Nota: Al enviar este formulario, tu propiedad quedará en estado <strong>Pendiente</strong> y pasará a revisión por el equipo de administración antes de ser publicada.
            </div>
          </div>
        )}

        {/* Botones de Navegación del Wizard */}
        <div className="flex justify-between pt-4 border-t">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-5 py-2.5 border rounded-xl text-sm font-medium hover:bg-neutral-50 flex items-center space-x-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>
          ) : <div />}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 flex items-center space-x-1"
            >
              <span>Siguiente</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 flex items-center space-x-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Enviar a Revisión</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}