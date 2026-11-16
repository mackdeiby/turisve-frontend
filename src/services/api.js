import axios from 'axios'
import { supabase } from '../lib/supabase'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://turisve-app.onrender.com'

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para incluir el JWT real de Supabase (con respaldo en localStorage)
api.interceptors.request.use(
  async (config) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const token =
        session?.access_token ||
        (typeof window !== 'undefined' ? localStorage.getItem('sb-access-token') : null)

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      console.error('Error al obtener token de Supabase:', error)
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ==========================================
// PROPIEDADES Y BUSQUEDA
// ==========================================

// 1. Obtener lista de propiedades con filtros
export const getProperties = async (params = {}) => {
  try {
    const response = await api.get('/properties/', { params })
    return response.data
  } catch (error) {
    console.error('Error fetching properties:', error)
    throw error
  }
}

// 2. Obtener detalle de una propiedad por ID
export const getPropertyById = async (id) => {
  try {
    const response = await api.get(`/properties/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching property ${id}:`, error)
    throw error
  }
}

// ==========================================
// DETALLE DE PROPIEDAD, DISPONIBILIDAD Y RESERVAS
// ==========================================

// 3. Consultar calendario y disponibilidad
export const getPropertyAvailability = async (propertyId) => {
  try {
    const response = await api.get(`/properties/${propertyId}/availability`, {
      timeout: 8000,
    })
    return response.data
  } catch (error) {
    console.warn(`Endpoint de disponibilidad no disponible para ID ${propertyId}:`, error.message)
    return { blocked_dates: [] }
  }
}

// 4. Crear una nueva reserva
export const createReservation = async (reservationData) => {
  try {
    const response = await api.post('/reservations', reservationData)
    return response.data
  } catch (error) {
    console.warn('Endpoint /reservations no disponible:', error?.message)
    if (error?.response?.status === 404) {
      return {
        id: `res_local_${Date.now()}`,
        status: 'confirmed',
        created_at: new Date().toISOString(),
        ...reservationData,
      }
    }
    throw error
  }
}

// Cotizar estadía en una posada (POST /bookings/quote)
export const quoteBooking = async (quoteData) => {
  try {
    const response = await api.post('/bookings/quote', quoteData)
    return response.data
  } catch (error) {
    console.warn('La API de cotización devolvió un error:', error?.response?.data || error.message)
    throw error
  }
}

// 5. Alternar estado de favoritos
export const toggleFavorite = async (propertyId, isCurrentlyFavorite) => {
  try {
    if (isCurrentlyFavorite) {
      const response = await api.delete(`/properties/${propertyId}/favorite`)
      return response.data
    } else {
      const response = await api.post(`/properties/${propertyId}/favorite`)
      return response.data
    }
  } catch (error) {
    console.warn(`No se pudo actualizar favorito para la propiedad ${propertyId}:`, error?.response?.data || error.message)
    return { success: false, is_favorite: !isCurrentlyFavorite }
  }
}

// ==========================================
// RESEÑAS (REVIEWS)
// ==========================================

// 6. Obtener las reseñas de una propiedad
export const getPropertyReviews = async (propertyId) => {
  try {
    const response = await api.get(`/properties/${propertyId}/reviews`, {
      timeout: 8000,
    })
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.warn(`No se pudieron obtener reseñas para ${propertyId}:`, error?.message || error)
    return []
  }
}

// 7. Crear una reseña de propiedad
export const createPropertyReview = async (propertyId, reviewData) => {
  try {
    const response = await api.post(`/properties/${propertyId}/reviews`, reviewData)
    return response.data
  } catch (error) {
    console.error('Error al crear reseña:', error)
    throw error
  }
}

// ==========================================
// PERFILES (PROFILES) Y ONBOARDING B2B
// ==========================================

// 8. Obtener el perfil real del usuario autenticado (/profiles/me)
export const getMyProfile = async () => {
  try {
    const response = await api.get('/profiles/me')
    return response.data
  } catch (error) {
    console.error('Error al obtener el perfil desde /profiles/me:', error?.response?.data || error.message)
    throw error
  }
}

// 9. Actualizar el perfil del usuario autenticado (/profiles/me)
export const updateMyProfile = async (profileData) => {
  try {
    // Usamos PUT con un timeout de 30s para soportar el encendido en frío de Render
    const response = await api.put('/profiles/me', profileData, {
      timeout: 30000, 
    })
    return response.data
  } catch (error) {
    console.error('Error al actualizar perfil en Render:', error?.response?.data || error.message)
    throw error
  }
}

// 10. Obtener el perfil de un usuario por su ID (/profiles/{id})
export const getProfileById = async (userId) => {
  try {
    const response = await api.get(`/profiles/${userId}`)
    return response.data
  } catch (error) {
    console.warn(`Error al obtener perfil del usuario ${userId}:`, error?.message)
    throw error
  }
}

// 11. Obtener métricas de anfitrión (/profiles/{owner_id}/host-metrics)
export const getHostMetrics = async (ownerId) => {
  try {
    const response = await api.get(`/profiles/${ownerId}/host-metrics`, { timeout: 8000 })
    return response.data
  } catch (error) {
    console.warn(`Error al obtener métricas del anfitrión ${ownerId}:`, error?.message)
    return null
  }
}

// 12. Completar registro de propietario/anfitrión con token de invitación (/profiles/me/completar-owner)
export const completeOwnerRegistration = async (ownerData) => {
  try {
    const response = await api.post('/profiles/me/completar-owner', ownerData)
    return response.data
  } catch (error) {
    console.error('Error al completar registro de posadero:', error?.response?.data || error.message)
    throw error
  }
}

// ==========================================
// MÓDULO: INVITACIONES B2B Y PROPIEDADES (HOST)
// ==========================================

// 13. Validar token de invitación privada antes del registro (GET /invitations/validate)
export const validateInvitationToken = async (token) => {
  try {
    const response = await api.get('/invitations/validate', {
      params: { token },
    })
    return response.data
  } catch (error) {
    console.error('Error al validar token de invitación:', error?.response?.data || error.message)
    throw error
  }
}

// 14. Crear una nueva propiedad / alojamiento (POST /properties/) [Nace en pending]
export const createProperty = async (propertyData) => {
  try {
    const response = await api.post('/properties/', propertyData)
    return response.data
  } catch (error) {
    console.error('Error al crear propiedad:', error?.response?.data || error.message)
    throw error
  }
}

// 15. Listar propiedades del anfitrión autenticado (GET /properties/me)
export const getMyProperties = async () => {
  try {
    const response = await api.get('/properties/me')
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.warn('Error al obtener propiedades del anfitrión (/properties/me):', error?.message)
    return []
  }
}

// ==========================================
// DISCOVERY FEED Y MÉTRICAS
// ==========================================

// Obtener Feed Dinámico con Paginación SEEK Bidireccional y Filtros (/discovery/feed)
export const getDiscoveryFeed = async (params = {}) => {
  try {
    const response = await api.get('/discovery/feed', { params })
    return response.data
  } catch (error) {
    console.warn('Error al obtener el discovery feed:', error?.response?.data || error.message)
    throw error
  }
}

// Buscar propiedades por texto / nombre o estado (GET /properties/)
export const searchProperties = async (searchQuery = '', extraParams = {}) => {
  try {
    const params = { ...extraParams }
    if (searchQuery.trim() !== '') {
      params.q = searchQuery.trim()
    }
    const response = await api.get('/properties/', { params })
    return response.data
  } catch (error) {
    console.warn('Error al buscar propiedades:', error?.response?.data || error.message)
    throw error
  }
}

// Registrar clic hacia WhatsApp
export const trackLeadClick = async (propertyId) => {
  try {
    const response = await api.post('/metrics/lead-click', {
      property_id: propertyId,
    })
    return response.data
  } catch (error) {
    console.warn('No se pudo registrar el clic de WhatsApp:', error)
    return null
  }
}

export default api