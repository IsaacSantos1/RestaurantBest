import { db } from "./firebase-config.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const startingBudgetEl = document.getElementById("startingBudget");
const inventoryExpensesEl = document.getElementById("inventoryExpenses");
const payrollExpensesEl = document.getElementById("payrollExpenses");
const remainingBudgetEl = document.getElementById("remainingBudget");

const activeWorkersEl = document.getElementById("activeWorkers");
const completedShiftsEl = document.getElementById("completedShifts");
const expenseHistoryEl = document.getElementById("expenseHistory");

const STARTING_BUDGET = 1000;
const HOURLY_RATE = 15;

function money(amount) {
  return "$" + Number(amount || 0).toFixed(2);
}

function formatHours(hours) {
  return Number(hours || 0).toFixed(2);
}

async function loadManagementData() {
  let inventoryTotal = 0;
  let payrollTotal = 0;

  activeWorkersEl.innerHTML = "";
  completedShiftsEl.innerHTML = "";
  expenseHistoryEl.innerHTML = "";

  const expenseSnap = await getDocs(collection(db, "expenses"));

  expenseSnap.forEach((docSnap) => {
    const expense = docSnap.data();

    const amount = Number(expense.amount ?? expense.cost ?? 0);
    inventoryTotal += amount;

    const div = document.createElement("div");
    div.className = "panel";

    div.innerHTML = `
      <h3>${expense.description || expense.name || "Inventory Expense"}</h3>
      <p>Amount: ${money(amount)}</p>
    `;

    expenseHistoryEl.appendChild(div);
  });

  const shiftSnap = await getDocs(collection(db, "shifts"));

  shiftSnap.forEach((docSnap) => {
    const shift = docSnap.data();

    const name = shift.name || "Unnamed Worker";

    if (shift.active && shift.clockIn) {
      const hoursWorked = (Date.now() - Number(shift.clockIn)) / (1000 * 60 * 60);
      const livePay = hoursWorked * HOURLY_RATE;

      payrollTotal += livePay;

      const div = document.createElement("div");
      div.className = "panel";

      div.innerHTML = `
        <h3>${name}</h3>
        <p>Status: Clocked In</p>
        <p>Hours So Far: ${formatHours(hoursWorked)}</p>
        <p>Live Pay: ${money(livePay)}</p>
      `;

      activeWorkersEl.appendChild(div);
    } else {
      const hours = Number(shift.hours || 0);
      const pay = Number(shift.pay || hours * HOURLY_RATE || 0);

      payrollTotal += pay;

      const div = document.createElement("div");
      div.className = "panel";

      div.innerHTML = `
        <h3>${name}</h3>
        <p>Status: Clocked Out</p>
        <p>Total Hours: ${formatHours(hours)}</p>
        <p>Total Pay: ${money(pay)}</p>
      `;

      completedShiftsEl.appendChild(div);
    }
  });

  const remainingBudget = STARTING_BUDGET - inventoryTotal - payrollTotal;

  startingBudgetEl.textContent = money(STARTING_BUDGET);
  inventoryExpensesEl.textContent = money(inventoryTotal);
  payrollExpensesEl.textContent = money(payrollTotal);
  remainingBudgetEl.textContent = money(remainingBudget);

  if (activeWorkersEl.innerHTML === "") {
    activeWorkersEl.innerHTML = "<p>No workers are currently clocked in.</p>";
  }

  if (completedShiftsEl.innerHTML === "") {
    completedShiftsEl.innerHTML = "<p>No completed shifts yet.</p>";
  }

  if (expenseHistoryEl.innerHTML === "") {
    expenseHistoryEl.innerHTML = "<p>No inventory expenses yet.</p>";
  }
}

loadManagementData();
setInterval(loadManagementData, 5000);