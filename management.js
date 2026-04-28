import { db } from "./firebase-config.js";
import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { formatDate, money } from "./shared.js";

const activeEmployees = document.getElementById("activeEmployees");
const employeeHoursList = document.getElementById("employeeHoursList");
const orderStatusList = document.getElementById("orderStatusList");

onSnapshot(query(collection(db, "employeeHours"), orderBy("clockIn", "desc")), (snapshot) => {
  const records = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const active = records.filter((record) => !record.clockOut);

  activeEmployees.innerHTML = active.length
    ? active.map((record) => `<div class="card"><p><strong>${record.name}</strong> - ${record.position}</p><p>Clocked in: ${formatDate(record.clockIn)}</p></div>`).join("")
    : "<p>No employees are currently clocked in.</p>";

  employeeHoursList.innerHTML = records.length
    ? records.map((record) => `
      <div class="card">
        <p><strong>${record.name}</strong> - ${record.position}</p>
        <p>Status: ${record.status}</p>
        <p>Clock In: ${formatDate(record.clockIn)}</p>
        <p>Clock Out: ${formatDate(record.clockOut)}</p>
        <p>Total Hours: ${record.totalHours ?? "In progress"}</p>
        <p>Earnings: ${record.earnings ? money(record.earnings) : "In progress"}</p>
      </div>
    `).join("")
    : "<p>No employee hours logged yet.</p>";
});

onSnapshot(query(collection(db, "orders"), orderBy("timestamp", "desc")), (snapshot) => {
  const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  orderStatusList.innerHTML = orders.length
    ? orders.map((order) => `
      <div class="card">
        <p><strong>Order:</strong> ${order.id}</p>
        <p>Customer: ${order.customerName}</p>
        <p>Status: ${order.status || "In Progress"}</p>
        <p>Total: ${money(order.totalAmount)}</p>
      </div>
    `).join("")
    : "<p>No orders yet.</p>";
});
