// ===============================
// ----- VARIABLES --------------
// ===============================

// total amount spent so far
let totalSpent = 0;

// total miles earned
let totalMiles = 0;

// $$ limit where purchases earn 4× miles
const limitFor4Miles = 1500;

// ===============================
// ----- BUTTON EVENT LISTENERS ---
// ===============================

// attach reset button to resetTracker function
document.getElementById("resetButton").addEventListener("click", resetTracker);

// ===============================
// ----- LOAD SAVED DATA ON PAGE OPEN -----
// ===============================
window.onload = () => {
    // Load saved totals from localStorage
    const savedSpent = localStorage.getItem("totalSpent");
    const savedMiles = localStorage.getItem("totalMiles");

    totalSpent = Number(savedSpent);
    totalMiles = Number(savedMiles);

    // If values are not valid numbers, fallback to 0
    if (!Number.isFinite(totalSpent)) totalSpent = 0;
    if (!Number.isFinite(totalMiles)) totalMiles = 0;

    console.log("[MilesTracker] Loaded from storage:", { totalSpent, totalMiles });

    // Update summary UI
    updateUI();

    // Load and render transaction table
    updateTransactionTable();
};

// ===============================
// ----- UPDATE UI FUNCTION -----
// ===============================
function updateUI() {
    // Update total miles display
    document.getElementById("totalMiles").innerText = totalMiles.toFixed(0);

    // Calculate remaining to earn 4× miles
    const remaining = Math.max(0, limitFor4Miles - totalSpent);
    document.getElementById("remainingToMax").innerText = remaining.toFixed(0);

    // Clear input box and focus it
    document.getElementById("purchaseAmount").value = "";
    document.getElementById("purchaseAmount").focus();

    console.log("[MilesTracker] updateUI:", { totalSpent, totalMiles, remaining });
}

// ===============================
// ----- ADD PURCHASE -----------
// ===============================
function addPurchase() {
    // Get number from input
    const raw = document.getElementById("purchaseAmount").value;
    const purchaseAmount = Number(raw);

    console.log("[MilesTracker] addPurchase called with:", raw, "parsed:", purchaseAmount);

    // Validation: must be positive number
    if (!Number.isFinite(purchaseAmount) || purchaseAmount <= 0) {
        alert("Please enter a valid amount greater than 0.");
        return;
    }

    // Calculate how much still earns 4× miles
    const remainingAt4x = Math.max(0, limitFor4Miles - totalSpent);

    // Split purchase into 4× portion and 1× portion
    const spentAt4x = Math.min(remainingAt4x, purchaseAmount);
    const spentAt1x = purchaseAmount - spentAt4x;

    // Calculate miles earned
    const milesEarned = (spentAt4x * 4) + (spentAt1x * 1);

    // Update totals
    totalSpent += purchaseAmount;
    totalMiles += milesEarned;

    // Save totals to localStorage
    localStorage.setItem("totalSpent", String(totalSpent));
    localStorage.setItem("totalMiles", String(totalMiles));

    console.log("[MilesTracker] after add:", {
        purchaseAmount,
        spentAt4x,
        spentAt1x,
        milesEarned,
        totalSpent,
        totalMiles
    });

    // ===== NEW: Store transaction =====
    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    const now = new Date();
    transactions.push({
        datetime: now.toLocaleString(),
        amount: purchaseAmount,
        miles: milesEarned
    });

    localStorage.setItem("transactions", JSON.stringify(transactions));

    // Refresh UI and transaction table
    updateUI();
    updateTransactionTable();
}

// ===============================
// ----- UPDATE TRANSACTION TABLE -----
// ===============================
function updateTransactionTable() {
    const tableBody = document.querySelector("#transactionTable tbody");
    tableBody.innerHTML = ""; // clear previous rows

    // Load transactions from localStorage
    const transactions = JSON.parse(localStorage.getItem("transactions")) || [];

    // Add each transaction as a new row
    transactions.forEach(tx => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${tx.datetime}</td>
            <td>${tx.amount.toFixed(2)}</td>
            <td>${tx.miles.toFixed(0)}</td>
        `;
        tableBody.appendChild(row);
    });
}

// ===============================
// ----- RESET TRACKER ----------
// ===============================
function resetTracker() {
    // Ask user to confirm
    if (!confirm("Reset all data?")) return;

    // Reset totals
    totalSpent = 0;
    totalMiles = 0;

    // Clear totals from localStorage
    localStorage.removeItem("totalSpent");
    localStorage.removeItem("totalMiles");

    // Clear transactions from localStorage
    localStorage.removeItem("transactions");

    console.log("[MilesTracker] Reset performed");

    // Refresh UI and clear table
    updateUI();
    updateTransactionTable();
}
