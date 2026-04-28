import { db } from "./firebase-config.js";
import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { money } from "./shared.js";

const availableItems = document.getElementById("availableItems");
const restockList = document.getElementById("restockList");
const status = document.getElementById("inventoryStatus");

document.getElementById("addItemBtn").addEventListener("click", async () => {
  const name = document.getElementById("itemName").value.trim();
  const quantity = Number(document.getElementById("itemQuantity").value);
  const cost = Number(document.getElementById("itemCost").value);
  const maxStock = Number(document.getElementById("itemMaxStock").value);

  if (!name || Number.isNaN(quantity) || Number.isNaN(cost) || Number.isNaN(maxStock)) {
    status.textContent = "Fill out every inventory field.";
    return;
  }

  await addDoc(collection(db, "inventory"), {
    name,
    quantity,
    cost,
    maxStock
  });

  status.textContent = "Item added.";
});

onSnapshot(query(collection(db, "inventory"), orderBy("name")), (snapshot) => {
  const items = snapshot.docs.map((itemDoc) => ({ id: itemDoc.id, ...itemDoc.data() }));

  const lowItems = items.filter((item) => Number(item.quantity) <= 2);

  restockList.innerHTML = lowItems.length
    ? lowItems.map((item) => `<div class="card"><strong>${item.name}</strong> needs restocking. Quantity: ${item.quantity}</div>`).join("")
    : "<p>No items need restocking.</p>";

  availableItems.innerHTML = items.length
    ? items.map((item) => {
      const quantity = Number(item.quantity || 0);
      const maxStock = Number(item.maxStock || 10);
      return `
        <div class="card">
          <h3>${item.name}</h3>
          <p>Status: ${quantity === 0 ? "Out of Stock" : quantity <= 2 ? "Low Stock" : "Available"}</p>
          <p>Quantity: ${quantity}</p>
          <p>Cost Per Item: ${money(item.cost)}</p>
          <p>Max Stock: ${maxStock}</p>
          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:10px;">
            <button class="gold-btn buy-btn" data-id="${item.id}" data-quantity="${quantity}" ${quantity <= 0 ? "disabled" : ""}>Buy 1</button>
            <button class="restock-btn" data-id="${item.id}" data-max="${maxStock}">Restock Item</button>
            <button class="danger-btn delete-btn" data-id="${item.id}">Delete</button>
          </div>
        </div>
      `;
    }).join("")
    : "<p>No inventory items yet.</p>";

  document.querySelectorAll(".buy-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const newQuantity = Number(button.dataset.quantity) - 1;
      await updateDoc(doc(db, "inventory", button.dataset.id), { quantity: newQuantity });
    });
  });

  document.querySelectorAll(".restock-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      await updateDoc(doc(db, "inventory", button.dataset.id), { quantity: Number(button.dataset.max) });
    });
  });

  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      await deleteDoc(doc(db, "inventory", button.dataset.id));
    });
  });
});
