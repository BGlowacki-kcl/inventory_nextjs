// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDEIqnNdZMpRp10VMsV3I6IRE6vQ1xN8Pc",
  authDomain: "inventory-mangament-14c6e.firebaseapp.com",
  projectId: "inventory-mangament-14c6e",
  storageBucket: "inventory-mangament-14c6e.appspot.com",
  messagingSenderId: "667179849235",
  appId: "1:667179849235:web:d58646cca955a331d991e6",
  measurementId: "G-RZ28LDENZC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);

export {firestore, auth}