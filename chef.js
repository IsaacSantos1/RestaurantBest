import { db } from "./firebase-config.js";
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { money, formatDate } from "./shared.js";

const ordersContainer = document.getElementById("ordersContainer");

onSnapshot(query(collection(db, "orders"), orderBy("timestamp", "desc")), (snapshot) => {
  const orders = snapshot.docs.map((orderDoc) => ({ id: orderDoc.id, ...orderDoc.data() }));
  const activeOrders = orders.filter((order) => order.status !== "Completed");

  if (activeOrders.length === 0) {
    ordersContainer.innerHTML = "<p>No active orders.</p>";
    return;
  }

  ordersContainer.innerHTML = activeOrders.map((order) => `
    <div class="card">
      <h3>Order ID: ${order.id}</h3>
      <p>Customer: ${order.customerName}</p>
      <p>Date: ${formatDate(order.timestamp)}</p>
      <p>Total: ${money(order.totalAmount)}</p>
      <ul>
        ${(order.cart || []).map((item) => `<li>${item.name} x ${item.quantity}</li>`).join("")}
      </ul>
      <button class="complete-order-btn" data-id="${order.id}">Mark as Completed</button>
    </div>
  `).join("");

  document.querySelectorAll(".complete-order-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      await updateDoc(doc(db, "orders", button.dataset.id), { status: "Completed" });
    });
  });
});
