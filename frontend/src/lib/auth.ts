// src/lib/auth.ts

export interface Usuario {
  id: number
  nome: string
  email: string
  cpf: string
  telefone: string
  role: 'admin' | 'user'
}

const USER_STORAGE_KEY = 'agendamento_usuario'

// Salvar usuário no localStorage
export function saveUser(usuario: Usuario): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(usuario))
  }
}

// Obter usuário do localStorage
export function getUser(): Usuario | null {
  if (typeof window !== 'undefined') {
    const userJson = localStorage.getItem(USER_STORAGE_KEY)
    if (userJson) {
      try {
        return JSON.parse(userJson)
      } catch {
        return null
      }
    }
  }
  return null
}

// Remover usuário (logout)
export function removeUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_STORAGE_KEY)
  }
}

// Verificar se está logado
export function isAuthenticated(): boolean {
  return getUser() !== null
}

// Obter ID do usuário logado
export function getUserId(): number | null {
  const user = getUser()
  return user ? user.id : null
}

// Verificar se é admin
export function isAdmin(): boolean {
  const user = getUser()
  return user?.role === 'admin'
}