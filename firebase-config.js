// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";




// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAGD8eJEM8WE6_Ta40-DWlk3FpXZiNRfrI",
    authDomain: "restaurant-c45c0.firebaseapp.com",
    projectId: "restaurant-c45c0",
    storageBucket: "restaurant-c45c0.firebasestorage.app",
    messagingSenderId: "895124573391",
    appId: "1:895124573391:web:cfb2b4065f6038279abbba"
  };
 


 
// Initialize Firebase outside the event listener
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Ensure auth is initialized from the app
const db = getFirestore(app);


export {app, auth, db};