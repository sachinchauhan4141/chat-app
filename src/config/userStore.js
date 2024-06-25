import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "./firebase";

export const useUserStore = create((set) => ({
  currentUser: JSON.parse(localStorage.getItem("currentUser")),
  isLoading: true,
  fetchUserInfo: async (uid) => {
    if (!uid) return set({ currentUser: null, isLoading: false });
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        set({ currentUser: docSnap.data(), isLoading: false });
        localStorage.setItem("currentuser", JSON.stringify(docSnap.data()));
      } else {
        set({ currentUser: null, isLoading: false });
        localStorage.removeItem("currentuser");
        localStorage.removeItem("chats");
      }
    } catch (err) {
      console.log(err);
      localStorage.removeItem("currentuser");
      localStorage.removeItem("chats");
      return set({ currentUser: null, isLoading: false });
    }
  },
}));
