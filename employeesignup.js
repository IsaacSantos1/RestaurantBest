import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const form = document.getElementById("signupForm");
const status = document.getElementById("signupStatus");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const occupation = document.getElementById("occupation").value;

  if (!occupation) {
    status.textContent = "Please select an occupation.";
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      username,
      email,
      occupation,
      createdAt: serverTimestamp()
    });

    if (occupation === "waiter") window.location.href = "employee.html";
    if (occupation === "chef") window.location.href = "chef.html";
    if (occupation === "management") window.location.href = "management.html";
  } catch (error) {
    console.error(error);
    status.textContent = error.message;
  }
});
