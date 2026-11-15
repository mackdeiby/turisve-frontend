"use client"

import { useState, useEffect } from "react"
import { BottomNav, NavTab } from "@/components/bottom-nav"
import { PropertyGrid } from "@/components/property-grid"
import { PropertyDetail } from "@/components/property-detail"
import { UserProfile } from "@/components/user-profile"
import { WelcomeAuth } from "@/components/welcome-auth"
import { getPropertyById } from "@/services/api"
import { RefreshCw } from "lucide-react"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true)

  const [activeTab, setActiveTab] = useState<NavTab>("explore")

  // Navegación a detalle
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null)
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false)

  useEffect(() => {
    const token = localStorage.getItem("sb-access-token")
    if (token) {
      setIsAuthenticated(true)
    }
    setCheckingAuth(false)
  }, [])

  const handleSelectProperty = async (id: string) => {
    setSelectedPropertyId(id)
    setLoadingDetail(true)
    try {
      const data = await getPropertyById(id)
      setSelectedProperty(data)
    } catch (err) {
      console.error("Error fetching property detail:", err)
      setSelectedProperty(null)
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleBackToList = () => {
    setSelectedPropertyId(null)
    setSelectedProperty(null)
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <RefreshCw className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <WelcomeAuth onSuccess={() => setIsAuthenticated(true)} />
  }

  if (activeTab === "profile") {
    return (
      <div className="min-h-screen bg-white pb-20">
        <UserProfile onBack={() => setActiveTab("explore")} />
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    )
  }

  if (selectedPropertyId) {
    if (loadingDetail && !selectedProperty) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-black" />
            <p className="text-sm font-medium text-neutral-600">Cargando posada...</p>
          </div>
        </div>
      )
    }

    if (selectedProperty) {
      return <PropertyDetail property={selectedProperty} onBack={handleBackToList} />
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-16">
      {/* Componente Grilla Unificado */}
      <PropertyGrid onSelectProperty={handleSelectProperty} />

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}