// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAhHBe6Qi0rgWTb9whwy17YvmMs-tUsIAE",
  authDomain: "chat-app-b8d34.firebaseapp.com",
  projectId: "chat-app-b8d34",
  storageBucket: "chat-app-b8d34.appspot.com",
  messagingSenderId: "942869784565",
  appId: "1:942869784565:web:4731fa4cedc7a1240d62bc"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore();
export const auth = getAuth();
export const storage = getStorage();