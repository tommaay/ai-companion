import { create } from 'zustand';

type SidebarStore = {
  isOpen: boolean;
  toggle: () => void;
  setIsOpen: (open: boolean) => void;
};

const getDefaultState = () => {
  if (typeof window === 'undefined') return true;
  return window.innerWidth >= 1024; // 1024px is the 'lg' breakpoint in Tailwind
};

export const useSidebarStore = create<SidebarStore>(set => ({
  isOpen: getDefaultState(),
  toggle: () => set(state => ({ isOpen: !state.isOpen })),
  setIsOpen: (open: boolean) => set({ isOpen: open }),
}));
