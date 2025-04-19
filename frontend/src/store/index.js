import { create } from "zustand";
const user = {
  name: "Codewave",
  email: "codewave@gmail.com",
  accounts: ["Cash"],
  country: {
    name: "Ghana",
    code: "GHS",
    flag: "",
  },
};

const useStore = create((set) => ({
  theme: localStorage.getItem("theme") ?? "light",
  user: JSON.parse(localStorage.getItem("user")) ?? null,

  setTheme: (value) => set({ theme: value }),
  setCredentails: (user) => set({ user }),
  signOut: () => set({ user: null }),
}));

export default useStore;
