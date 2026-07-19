import { create } from 'zustand';

const useToastStore = create((set, get) => ({
  toasts: [],
  showToast: (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }]
    }));
    
    // Automatically dismiss after 3 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter(t => t.id !== id)
      }));
    }, 3000);
  }
}));

export default useToastStore;
