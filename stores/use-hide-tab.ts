import { create } from "zustand";

interface UseHideTab {
  hideTab: boolean;
  toggleHideTab: () => void;
}

export const useHideTab = create<UseHideTab>()((set) => ({
  hideTab: false,
  toggleHideTab: () => set((state) => ({ hideTab: !state.hideTab })),
}));
