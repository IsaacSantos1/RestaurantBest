import { db } from "./firebase-config.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const budgetAmount = document.getElementById("budgetAmount");
const payrollAmount = document.getElementById("payrollAmount");
const remainingBudget = document.getElementById("remainingBudget");

const STARTING_BUDGET = 1000;
const HOURLY_RATE = 15;

async function loadManagementData() {
  let totalInventoryExpenses = 0;
  let totalPayroll = 0;

  // inventory expenses
  const expensesSnapshot = await getDocs(collection(db, "expenses"));

  expensesSnapshot.forEach((docSnap) => {
    const expense = docSnap.data();

    // this accepts BOTH amount and cost, just in case
    const value = Number(expense.amount ?? expense.cost ?? 0);

    totalInventoryExpenses += value;
  });

  // worker payroll
  const shiftsSnapshot = await getDocs(collection(db, "shifts"));

  shiftsSnapshot.forEach((docSnap) => {
    const shift = docSnap.data();

    if (shift.pay) {
      totalPayroll += Number(shift.pay);
    }

    // live pay for workers still clocked in
    if (shift.active && shift.clockIn) {
      const hoursWorked = (Date.now() - Number(shift.clockIn)) / (1000 * 60 * 60);
      totalPayroll += hoursWorked * HOURLY_RATE;
    }
  });

  const totalSpent = totalInventoryExpenses + totalPayroll;
  const budgetLeft = STARTING_BUDGET - totalSpent;

  budgetAmount.textContent = "$" + totalInventoryExpenses.toFixed(2);
  payrollAmount.textContent = "$" + totalPayroll.toFixed(2);
  remainingBudget.textContent = "$" + budgetLeft.toFixed(2);
}

loadManagementData();

// updates every 5 seconds so clocked-in worker pay moves live
setInterval(loadManagementData, 5000);