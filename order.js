import { getCart, saveCart, money } from "./shared.js";

const NJ_TAX_RATE = 0.06625;

const menuItems = [
  { name: "Larvae Chips", price: 5, image: "Assets/pic.png", description: "Crunchy roasted larvae with sea salt, lime, and house dip." },
  { name: "Chips and Guac", price: 5, image: "Assets/pic1.jpg", description: "Corn tortilla chips with fresh guacamole, lime, onion, and cilantro." },
  { name: "Chips and Queso", price: 5, image: "Assets/pic2.png", description: "Warm melted cheese with roasted green chilies and tortilla chips." },
  { name: "Chips and Pico", price: 5, image: "Assets/pic3.png", description: "Fresh pico de gallo with tomatoes, onions, jalapeños, and cilantro." },
  { name: "Tacos Authenticos", price: 16, image: "Assets/pic4.png", description: "Double-stacked corn tortillas with your choice of protein." },
  { name: "The Big Burrito", price: 15, image: "Assets/pic5.png", description: "Flour tortilla packed with rice, beans, meat, cheese, pico, and sour cream." },
  { name: "Crispy Tostadas", price: 17, image: "Assets/pic6.png", description: "Crunchy tostadas with beans, meat, lettuce, tomato, queso, and avocado." },
  { name: "Mexican Tortas", price: 19, image: "Assets/pic7.png", description: "Toasted bolillo roll with beans, mayo, protein, jalapeños, tomatoes, and avocado." },
  { name: "Classic Enchiladas", price: 17, image: "Assets/pic8.png", description: "Three corn tortillas with filling, sauce, melted cheese, and sour cream." },
  { name: "Platillo Platter", price: 20, image: "Assets/pic9.png", description: "Protein platter with rice, refried beans, salad, and warm tortillas." },
  { name: "Horchata", price: 4, image: "Assets/pic10.png", description: "Creamy rice drink with cinnamon and vanilla." },
  { name: "Jamaica", price: 3, image: "Assets/pic11.png", description: "Tart hibiscus iced tea with a cranberry-like flavor." },
  { name: "Artisan Churros", price: 10, image: "Assets/pic12.png", description: "Fresh churros with cinnamon sugar and dipping sauce." },
  { name: "Churro Bites", price: 7, image: "Assets/pic13.png", description: "Bite-sized cinnamon sugar churro pieces." }
];

let cart = getCart();

const menuList = document.getElementById("menu-list");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartSubtotal = document.getElementById("cart-subtotal");
const cartTax = document.getElementById("cart-tax");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");

function renderMenu() {
  menuList.innerHTML = menuItems.map((item) => `
    <article class="menu-card">
      <div>
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <div class="price-row">
          <strong>${money(item.price)}</strong>
          <button class="add-btn" data-name="${item.name}">+</button>
        </div>
      </div>
      <img src="${item.image}" alt="${item.name}">
    </article>
  `).join("");

  document.querySelectorAll(".add-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const item = menuItems.find((menuItem) => menuItem.name === button.dataset.name);
      if (!cart[item.name]) {
        cart[item.name] = { name: item.name, price: item.price, quantity: 1 };
      } else {
        cart[item.name].quantity++;
      }
      saveCart(cart);
      renderCart();
    });
  });
}

function renderCart() {
  const items = Object.values(cart);
  let count = 0;
  let subtotal = 0;

  items.forEach((item) => {
    count += item.quantity;
    subtotal += item.price * item.quantity;
  });

  const tax = subtotal * NJ_TAX_RATE;
  const total = subtotal + tax;

  cartCount.textContent = count;
  cartSubtotal.textContent = subtotal.toFixed(2);
  cartTax.textContent = tax.toFixed(2);
  cartTotal.textContent = total.toFixed(2);
  checkoutBtn.disabled = count === 0;

  if (count === 0) {
    cartItems.innerHTML = `<p>Your cart is empty.</p>`;
    return;
  }

  cartItems.innerHTML = items.map((item) => `
    <div class="cart-item">
      <strong>${item.name}</strong>
      <p>${item.quantity} x ${money(item.price)} = ${money(item.quantity * item.price)}</p>
      <div class="cart-actions">
        <button data-action="minus" data-name="${item.name}">-1</button>
        <button class="danger-btn" data-action="remove" data-name="${item.name}">Remove</button>
      </div>
    </div>
  `).join("");

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const name = button.dataset.name;
      if (button.dataset.action === "minus") {
        cart[name].quantity--;
        if (cart[name].quantity <= 0) delete cart[name];
      }
      if (button.dataset.action === "remove") {
        delete cart[name];
      }
      saveCart(cart);
      renderCart();
    });
  });
}

checkoutBtn.addEventListener("click", () => {
  saveCart(cart);
  window.location.href = "checkout.html";
});

renderMenu();
renderCart();
