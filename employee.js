import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const clockBtn = document.getElementById("clock-btn");
const nameInput = document.getElementById("employee-name");

let activeShift = null;

// CLOCK IN / OUT
clockBtn.addEventListener("click", async () => {
  const name = nameInput.value;

  if (!name) return alert("enter name");

  // CLOCK IN
  if (!activeShift) {
    const docRef = await addDoc(collection(db, "shifts"), {
      name,
      clockIn: Date.now(),
      active: true
    });

    activeShift = docRef.id;
    clockBtn.innerText = "Clock Out";

  } else {
    // CLOCK OUT
    const ref = doc(db, "shifts", activeShift);

    const snapshot = await getDocs(collection(db, "shifts"));
    snapshot.forEach(async (d) => {
      if (d.id === activeShift) {
        const shift = d.data();

        const hours = (Date.now() - shift.clockIn) / (1000 * 60 * 60);
        const pay = hours * 15;

        await updateDoc(ref, {
          clockOut: Date.now(),
          hours,
          pay,
          active: false
        });
      }
    });

    activeShift = null;
    clockBtn.innerText = "Clock In";
  }
});