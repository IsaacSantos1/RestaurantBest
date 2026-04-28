import { auth, db } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const form = document.getElementById("loginForm");
const status = document.getElementById("loginStatus");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

    if (!userDoc.exists()) {
      status.textContent = "User data was not found.";
      return;
    }

    const userData = userDoc.data();

    if (userData.occupation === "waiter") window.location.href = "employee.html";
    else if (userData.occupation === "chef") window.location.href = "chef.html";
    else if (userData.occupation === "management") window.location.href = "management.html";
    else status.textContent = "Unknown occupation.";
  } catch (error) {
    console.error(error);
    status.textContent = error.message;
  }
});
