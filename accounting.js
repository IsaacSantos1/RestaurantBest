import { db } from "./firebase-config.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const companyMoneyEl = document.getElementById("companyMoney");
const totalRevenueEl = document.getElementById("totalRevenue");
const inventoryExpensesEl = document.getElementById("inventoryExpenses");
const payrollExpensesEl = document.getElementById("payrollExpenses");
const totalExpensesEl = document.getElementById("totalExpenses");
const netProfitEl = document.getElementById("netProfit");

const orderHistoryEl = document.getElementById("orderHistory");
const expenseHistoryEl = document.getElementById("expenseHistory");
const payrollHistoryEl = document.getElementById("payrollHistory");

const STARTING_MONEY = 1000;
const HOURLY_RATE = 15;

function money(amount) {
  return "$" + Number(amount || 0).toFixed(2);
}

function hours(value) {
  return Number(value || 0).toFixed(2);
}

async function loadAccountingData() {
  let totalRevenue = 0;
  let inventoryExpenses = 0;
  let payrollExpenses = 0;

  orderHistoryEl.innerHTML = "";
  expenseHistoryEl.innerHTML = "";
  payrollHistoryEl.innerHTML = "";

  const ordersSnap = await getDocs(collection(db, "orders"));

  ordersSnap.forEach((docSnap) => {
    const order = docSnap.data();
    const orderTotal = Number(order.totalAmount || order.total || 0);

    totalRevenue += orderTotal;

    const div = document.createElement("div");
    div.className = "panel";

    div.innerHTML = `
      <h3>Order ID: ${docSnap.id}</h3>
      <p>Customer: ${order.customerName || "Unknown Customer"}</p>
      <p>Email: ${order.email || "No email"}</p>
      <p>Total: ${money(orderTotal)}</p>
    `;

    orderHistoryEl.appendChild(div);
  });

  const expensesSnap = await getDocs(collection(db, "expenses"));

  expensesSnap.forEach((docSnap) => {
    const expense = docSnap.data();
    const amount = Number(expense.amount ?? expense.cost ?? 0);

    inventoryExpenses += amount;

    const div = document.createElement("div");
    div.className = "panel";

    div.innerHTML = `
      <h3>${expense.description || expense.name || "Inventory Expense"}</h3>
      <p>Amount: ${money(amount)}</p>
    `;

    expenseHistoryEl.appendChild(div);
  });

  const shiftsSnap = await getDocs(collection(db, "shifts"));

  shiftsSnap.forEach((docSnap) => {
    const shift = docSnap.data();

    const name = shift.name || "Unnamed Worker";
    let shiftHours = 0;
    let shiftPay = 0;
    let status = "Clocked Out";

    if (shift.active && shift.clockIn) {
      shiftHours = (Date.now() - Number(shift.clockIn)) / (1000 * 60 * 60);
      shiftPay = shiftHours * HOURLY_RATE;
      status = "Clocked In";
    } else {
      shiftHours = Number(shift.hours || 0);
      shiftPay = Number(shift.pay || shiftHours * HOURLY_RATE || 0);
    }

    payrollExpenses += shiftPay;

    const div = document.createElement("div");
    div.className = "panel";

    div.innerHTML = `
      <h3>${name}</h3>
      <p>Status: ${status}</p>
      <p>Hours: ${hours(shiftHours)}</p>
      <p>Pay: ${money(shiftPay)}</p>
    `;

    payrollHistoryEl.appendChild(div);
  });

  const totalExpenses = inventoryExpenses + payrollExpenses;
  const netProfit = totalRevenue - totalExpenses;
  const companyMoney = STARTING_MONEY + netProfit;

  companyMoneyEl.textContent = money(companyMoney);
  totalRevenueEl.textContent = money(totalRevenue);
  inventoryExpensesEl.textContent = money(inventoryExpenses);
  payrollExpensesEl.textContent = money(payrollExpenses);
  totalExpensesEl.textContent = money(totalExpenses);
  netProfitEl.textContent = money(netProfit);

  if (orderHistoryEl.innerHTML === "") {
    orderHistoryEl.innerHTML = "<p>No orders yet.</p>";
  }

  if (expenseHistoryEl.innerHTML === "") {
    expenseHistoryEl.innerHTML = "<p>No inventory expenses yet.</p>";
  }

  if (payrollHistoryEl.innerHTML === "") {
    payrollHistoryEl.innerHTML = "<p>No payroll records yet.</p>";
  }
}

loadAccountingData();
setInterval(loadAccountingData, 5000);