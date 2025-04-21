// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration, this is the connection key connect
// to your firebase.
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDSR3ZYyaqbyZkueutr8dHI7j33BcnpaNI",
  authDomain: "azure-rfid-dapp.firebaseapp.com",
  databaseURL: "https://azure-rfid-dapp-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "azure-rfid-dapp",
  storageBucket: "azure-rfid-dapp.firebasestorage.app",
  messagingSenderId: "200469991804",
  appId: "1:200469991804:web:aa4066eceee691d94ed4f9",
  measurementId: "G-MRN49GCQ8P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const database = getDatabase(app);
// test 3