import { db } from "./firebase-config.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const form = document.getElementById("contactForm");
const status = document.getElementById("contactStatus");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("contactName").value.trim();
  const email = document.getElementById("contactEmail").value.trim();
  const message = document.getElementById("contactMessage").value.trim();

  try {
    await addDoc(collection(db, "contacts"), {
      name,
      email,
      message,
      createdAt: serverTimestamp()
    });

    status.textContent = "Message sent successfully.";
    form.reset();
  } catch (error) {
    console.error(error);
    status.textContent = "Message failed. Check Firebase.";
  }
});
