import { db } from "./firebase-config.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getCart, clearCart, money } from "./shared.js";

const NJ_TAX_RATE = 0.06625;
const form = document.getElementById("checkoutForm");
const status = document.getElementById("checkoutStatus");
const totalEl = document.getElementById("checkoutTotal");

function getTotals(cart) {
  const subtotal = Object.values(cart).reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * NJ_TAX_RATE;
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

let cart = getCart();
let totals = getTotals(cart);
totalEl.textContent = `Total: ${money(totals.total)}`;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  cart = getCart();
  totals = getTotals(cart);

  if (Object.keys(cart).length === 0) {
    status.textContent = "Your cart is empty.";
    return;
  }

  const orderData = {
    customerName: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    address: document.getElementById("address").value.trim(),
    city: document.getElementById("city").value.trim(),
    state: document.getElementById("state").value.trim(),
    zip: document.getElementById("zip").value.trim(),
    cart: Object.values(cart),
    subtotal: Number(totals.subtotal.toFixed(2)),
    tax: Number(totals.tax.toFixed(2)),
    totalAmount: Number(totals.total.toFixed(2)),
    status: "In Progress",
    timestamp: serverTimestamp()
  };

  try {
    await addDoc(collection(db, "orders"), orderData);
    clearCart();
    status.textContent = "Order placed successfully.";
    setTimeout(() => window.location.href = "order.html", 900);
  } catch (error) {
    console.error(error);
    status.textContent = "Order failed. Check Firebase.";
  }
});
