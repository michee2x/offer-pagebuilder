import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  isSidebarOpen: boolean;
  activeWorkspaceId: string | null;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setActiveWorkspaceId: (id: string | null) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSidebarOpen: false,
      activeWorkspaceId: null,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      setActiveWorkspaceId: (id) => {
        if (typeof window !== 'undefined') {
          if (id) {
            document.cookie = `active_workspace_id=${id}; path=/; max-age=${60 * 60 * 24 * 365}`;
          } else {
            document.cookie = `active_workspace_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
          }
        }
        set({ activeWorkspaceId: id });
      },
    }),
    {
      name: 'offer-iq-ui-storage',
      partialize: (state) => ({ activeWorkspaceId: state.activeWorkspaceId }),
    }
  )
);
