import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const clockInBtn = document.getElementById("clockInBtn");
const clockOutBtn = document.getElementById("clockOutBtn");
const nameInput = document.getElementById("employeeName");
const positionSelect = document.getElementById("employeePosition");
const statusMessage = document.getElementById("employeeStatus");

let activeShiftId = null;

// CLOCK IN
clockInBtn.addEventListener("click", async () => {
  const name = nameInput.value.trim();
  const position = positionSelect.value;

  if (!name || !position) {
    alert("Please enter your name and select a position.");
    return;
  }

  try {
    // Add a new shift document to Firestore
    const docRef = await addDoc(collection(db, "shifts"), {
      name,
      position,
      clockIn: Date.now(),
      active: true,
      createdAt: serverTimestamp()
    });

    activeShiftId = docRef.id;
    statusMessage.textContent = `Status: Clocked In as ${position}.`;
    clockInBtn.disabled = true;
    clockOutBtn.disabled = false;
  } catch (error) {
    console.error("Error clocking in:", error);
    statusMessage.textContent = "Error: Unable to clock in. Please try again.";
  }
});

// CLOCK OUT
clockOutBtn.addEventListener("click", async () => {
  if (!activeShiftId) {
    alert("You are not currently clocked in.");
    return;
  }

  try {
    const shiftRef = doc(db, "shifts", activeShiftId);
    const shiftSnap = await getDoc(shiftRef);

    if (!shiftSnap.exists()) {
      alert("Shift not found. Please contact an administrator.");
      return;
    }

    const shiftData = shiftSnap.data();
    const hoursWorked = (Date.now() - shiftData.clockIn) / (1000 * 60 * 60); // Calculate hours worked
    const pay = hoursWorked * 15; // Assuming $15/hour pay rate

    // Update the shift document in Firestore
    await updateDoc(shiftRef, {
      clockOut: Date.now(),
      hours: hoursWorked,
      pay,
      active: false
    });

    statusMessage.textContent = `Status: Clocked Out. Total Hours: ${hoursWorked.toFixed(2)}, Pay: $${pay.toFixed(2)}.`;
    clockInBtn.disabled = false;
    clockOutBtn.disabled = true;
    activeShiftId = null;
  } catch (error) {
    console.error("Error clocking out:", error);
    statusMessage.textContent = "Error: Unable to clock out. Please try again.";
  }
});