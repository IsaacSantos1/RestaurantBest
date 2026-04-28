export function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || {};
}

export function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

export function clearCart() {
  localStorage.removeItem("cart");
}

export function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export function formatDate(timestamp) {
  if (!timestamp) return "N/A";
  if (timestamp.toDate) return timestamp.toDate().toLocaleString();
  return new Date(timestamp).toLocaleString();
}

export function requireElement(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element: #${id}`);
  return el;
}
