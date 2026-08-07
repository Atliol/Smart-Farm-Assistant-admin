import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB0w-Cm8zq0wbt307EiyvE0OezGWxWLIts",
    authDomain: "smartfarmassistant.firebaseapp.com",
    projectId: "smartfarmassistant",
    storageBucket: "smartfarmassistant.firebasestorage.app",
    messagingSenderId: "764909508771",
    appId: "1:764909508771:web:eaa8cc97ae2500d7d88716",
    measurementId: "G-VVL825DPXB"
};

// 1. Firebase App ကို စတင်ပါ
const app = initializeApp(firebaseConfig);

// 2. Firestore ကို ရိုးရိုးရှင်းရှင်း စတင်ပါ
export const db = getFirestore(app);