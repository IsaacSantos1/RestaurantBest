import { db } from "./firebase-config.js";
import { collection, addDoc, query, where, orderBy, limit, getDocs, updateDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const employeeName = document.getElementById("employeeName");
const employeePosition = document.getElementById("employeePosition");
const employeeStatus = document.getElementById("employeeStatus");

document.getElementById("clockInBtn").addEventListener("click", async () => {
  const name = employeeName.value.trim();
  const position = employeePosition.value;

  if (!name || !position) {
    employeeStatus.textContent = "Enter your name and position.";
    return;
  }

  try {
    await addDoc(collection(db, "employeeHours"), {
      name,
      position,
      clockIn: serverTimestamp(),
      clockOut: null,
      totalHours: null,
      earnings: null,
      hourlyRate: 15,
      status: "Clocked In"
    });

    employeeStatus.textContent = `${name} clocked in as ${position}.`;
  } catch (error) {
    console.error(error);
    employeeStatus.textContent = "Clock in failed. Check Firebase.";
  }
});

document.getElementById("clockOutBtn").addEventListener("click", async () => {
  const name = employeeName.value.trim();

  if (!name) {
    employeeStatus.textContent = "Enter your name to clock out.";
    return;
  }

  try {
    const q = query(
      collection(db, "employeeHours"),
      where("name", "==", name),
      where("clockOut", "==", null),
      orderBy("clockIn", "desc"),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      employeeStatus.textContent = "No active clock-in found.";
      return;
    }

    const record = snapshot.docs[0];
    const data = record.data();
    const clockInTime = data.clockIn.toDate();
    const clockOutTime = new Date();
    const totalHours = Number(((clockOutTime - clockInTime) / (1000 * 60 * 60)).toFixed(2));
    const earnings = Number((totalHours * 15).toFixed(2));

    await updateDoc(doc(db, "employeeHours", record.id), {
      clockOut: clockOutTime,
      totalHours,
      earnings,
      status: "Clocked Out"
    });

    employeeStatus.textContent = `${name} clocked out. Total hours: ${totalHours}.`;
  } catch (error) {
    console.error(error);
    employeeStatus.textContent = "Clock out failed. You may need a Firestore index.";
  }
});
