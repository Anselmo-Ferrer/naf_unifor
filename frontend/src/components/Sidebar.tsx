'use client'

import { removeUser } from "@/lib/auth"
import { Calendar, LayoutDashboard, LogOut, Users, Settings } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

export default function SidebarDashboard() {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    if (confirm('Deseja realmente sair?')) {
      removeUser()
      router.push('/entrar')
    }
  }

  const items = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20}/> },
    { path: '/dashboard/agendamentos', label: 'Agendamentos', icon: <Calendar size={20}/> },
    { path: '/dashboard/clientes', label: 'Clientes', icon: <Users size={20}/> },
    { path: '/dashboard/servicos', label: 'Serviços', icon: <Settings size={20}/> }
  ]

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <div className="w-60 bg-white border-r border-gray-200 p-5 flex flex-col justify-between">
      <div>
        <h2 className="text-blue-600 text-2xl mb-10 font-semibold">NAF Unifor</h2>
        <ul className="list-none p-0">
          {items.map((item) => (
            <li key={item.path} className="mb-2">
              <button
                onClick={() => router.push(item.path)}
                className={`
                  text-left w-full px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-3 cursor-pointer
                  ${isActive(item.path) 
                    ? 'bg-[#E8EAF6] text-blue-600 font-semibold' 
                    : 'text-gray-800 hover:bg-[#E8EAF6] hover:text-blue-600'
                  }
                `}
              >
                {item.icon} {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={handleLogout}
        className="text-blue-600 hover:bg-[#E8EAF6] border-1 font-bold text-left px-3 py-2 flex gap-3 items-center transition-colors cursor-pointer 0 rounded-lg"
      >
        <LogOut size={20}/> Sair
      </button>
    </div>
  )
}