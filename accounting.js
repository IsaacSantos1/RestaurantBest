import { db } from "./firebase-config.js";
import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { money, formatDate } from "./shared.js";

const totalRevenue = document.getElementById("totalRevenue");
const purchaseHistory = document.getElementById("purchaseHistory");

onSnapshot(query(collection(db, "orders"), orderBy("timestamp", "desc")), (snapshot) => {
  const orders = snapshot.docs.map((orderDoc) => ({ id: orderDoc.id, ...orderDoc.data() }));
  const revenue = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

  totalRevenue.textContent = money(revenue);

  purchaseHistory.innerHTML = orders.length
    ? orders.map((order) => `
      <div class="card">
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Customer:</strong> ${order.customerName || "Unknown"}</p>
        <p><strong>Total:</strong> ${money(order.totalAmount)}</p>
        <p><strong>Status:</strong> ${order.status || "In Progress"}</p>
        <p><strong>Date:</strong> ${formatDate(order.timestamp)}</p>
      </div>
    `).join("")
    : "<p>No purchases yet.</p>";
});
