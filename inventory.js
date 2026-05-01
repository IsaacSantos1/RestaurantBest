import { db } from "./firebase-config.js";

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const itemName = document.getElementById("itemName");
const itemQuantity = document.getElementById("itemQuantity");
const itemCost = document.getElementById("itemCost");
const itemMaxStock = document.getElementById("itemMaxStock");
const addItemBtn = document.getElementById("addItemBtn");
const inventoryStatus = document.getElementById("inventoryStatus");

const restockList = document.getElementById("restockList");
const availableItems = document.getElementById("availableItems");

async function logExpense(description, amount) {
  await addDoc(collection(db, "expenses"), {
    description: description,
    amount: Number(amount),
    timestamp: serverTimestamp()
  });
}

async function loadInventory() {
  restockList.innerHTML = "";
  availableItems.innerHTML = "";

  const snapshot = await getDocs(collection(db, "inventory"));

  snapshot.forEach((docSnap) => {
    const item = docSnap.data();
    const itemId = docSnap.id;

    const name = item.name || "Unnamed Item";
    const quantity = Number(item.quantity) || 0;
    const cost = Number(item.cost) || 0;
    const maxStock = Number(item.maxStock) || 0;

    const itemCard = document.createElement("div");
    itemCard.className = "panel";

    itemCard.innerHTML = `
      <h3>${name}</h3>
      <p>Quantity: ${quantity}</p>
      <p>Cost Per Item: $${cost.toFixed(2)}</p>
      <p>Max Stock: ${maxStock}</p>

      <button class="use-btn" data-id="${itemId}">Use 1</button>
      <button class="restock-btn" data-id="${itemId}">Restock</button>
    `;

    availableItems.appendChild(itemCard);

    if (maxStock > 0 && quantity <= maxStock / 2) {
      const restockCard = document.createElement("div");
      restockCard.className = "panel";

      restockCard.innerHTML = `
        <h3>${name}</h3>
        <p>Low stock: ${quantity} left</p>
        <button class="restock-btn" data-id="${itemId}">Restock</button>
      `;

      restockList.appendChild(restockCard);
    }
  });

  addButtonEvents();
}

function addButtonEvents() {
  const useButtons = document.querySelectorAll(".use-btn");

  useButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const itemId = button.dataset.id;
      const snapshot = await getDocs(collection(db, "inventory"));

      snapshot.forEach(async (docSnap) => {
        if (docSnap.id === itemId) {
          const item = docSnap.data();

          const currentQuantity = Number(item.quantity) || 0;
          const cost = Number(item.cost) || 0;

          if (currentQuantity <= 0) {
            alert("This item is out of stock.");
            return;
          }

          await updateDoc(doc(db, "inventory", itemId), {
            quantity: currentQuantity - 1
          });

          await logExpense(`Used inventory item: ${item.name}`, cost);

          loadInventory();
        }
      });
    });
  });

  const restockButtons = document.querySelectorAll(".restock-btn");

  restockButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const itemId = button.dataset.id;
      const snapshot = await getDocs(collection(db, "inventory"));

      snapshot.forEach(async (docSnap) => {
        if (docSnap.id === itemId) {
          const item = docSnap.data();

          const currentQuantity = Number(item.quantity) || 0;
          const maxStock = Number(item.maxStock) || 0;
          const cost = Number(item.cost) || 0;

          if (maxStock <= currentQuantity) {
            alert("This item is already fully stocked.");
            return;
          }

          const amountToRestock = maxStock - currentQuantity;
          const restockCost = amountToRestock * cost;

          await updateDoc(doc(db, "inventory", itemId), {
            quantity: maxStock
          });

          await logExpense(`Restocked inventory item: ${item.name}`, restockCost);

          loadInventory();
        }
      });
    });
  });
}

addItemBtn.addEventListener("click", async () => {
  const name = itemName.value.trim();
  const quantity = Number(itemQuantity.value);
  const cost = Number(itemCost.value);
  const maxStock = Number(itemMaxStock.value);

  if (!name || isNaN(quantity) || isNaN(cost) || isNaN(maxStock)) {
    inventoryStatus.textContent = "Please fill out all fields correctly.";
    return;
  }

  await addDoc(collection(db, "inventory"), {
    name: name,
    quantity: quantity,
    cost: cost,
    maxStock: maxStock,
    timestamp: serverTimestamp()
  });

  inventoryStatus.textContent = "Item added successfully.";

  itemName.value = "";
  itemQuantity.value = "";
  itemCost.value = "";
  itemMaxStock.value = "";

  loadInventory();
});

loadInventory();