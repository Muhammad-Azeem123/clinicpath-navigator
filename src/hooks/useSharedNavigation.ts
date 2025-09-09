import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NavigationState {
  fromLocation: string;
  toLocation: string;
  activeRoute: any | null;
  setFromLocation: (locationId: string) => void;
  setToLocation: (locationId: string) => void;
  setActiveRoute: (route: any | null) => void;
  clearNavigation: () => void;
}

export const useSharedNavigation = create<NavigationState>()(
  persist(
    (set) => ({
      fromLocation: '',
      toLocation: '',
      activeRoute: null,
      setFromLocation: (locationId) => set({ fromLocation: locationId }),
      setToLocation: (locationId) => set({ toLocation: locationId }),
      setActiveRoute: (route) => set({ activeRoute: route }),
      clearNavigation: () => set({ 
        fromLocation: '', 
        toLocation: '', 
        activeRoute: null 
      }),
    }),
    {
      name: 'shared-navigation-storage',
    }
  )
);