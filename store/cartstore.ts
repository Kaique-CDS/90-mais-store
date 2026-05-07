import { create } from 'zustand'

export interface CartItem {
  id: string
  nome: string
  preco: number
  imagem_url: string
  quantidade: number
}

interface CartState {
  items: CartItem[]
  isOpen: boolean // <- Novo controle da gaveta
  addItem: (item: Omit<CartItem, 'quantidade'>) => void
  removeItem: (id: string) => void
  clearCart: () => void
  openCart: () => void // <- Comando de abrir
  closeCart: () => void // <- Comando de fechar
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  isOpen: false, // Começa fechada
  
  addItem: (newItem) => set((state) => {
    const itemExistente = state.items.find(item => item.id === newItem.id)
    if (itemExistente) {
      return {
        items: state.items.map(item => 
          item.id === newItem.id ? { ...item, quantidade: item.quantidade + 1 } : item
        )
      }
    }
    return { items: [...state.items, { ...newItem, quantidade: 1 }] }
  }),

  removeItem: (id) => set((state) => ({ items: state.items.filter(item => item.id !== id) })),
  clearCart: () => set({ items: [] }),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false })
}))