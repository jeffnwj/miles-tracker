// your code goes here
// ===============================
// ----- MIGRATION --------------
// ===============================
function migrateV1TransactionsIfNeeded() {
    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    let migrated = false;

    transactions = transactions.map(tx => {
        // Detect v1.0 transaction
        if (!("type" in tx) || !("spendAt4x" in tx)) {
            migrated = true;

            return {
                ...tx,
                type: "contactless",
                spendAt4x: tx.amount // assume full amount consumed 4mpd bucket
            };
        }
        return tx;
    });

    if (migrated) {
        console.log("[MilesTracker] v1.0 → v1.1 migration completed");
        localStorage.setItem("transactions", JSON.stringify(transactions));
    }
}


// ===============================
// ----- VARIABLES --------------
// ===============================
const CAP_CONTACTLESS = 540;
const CAP_ONLINE = 540;

function getSelectedPurchaseType() {
    return document.querySelector('input[name="purchaseType"]:checked').value;
}



// ===============================
// ----- BUTTON EVENT LISTENERS ---
// ===============================

// attach reset button to resetTracker function
document.getElementById("resetButton").addEventListener("click", resetTracker);

// ===============================
// ----- LOAD SAVED DATA ON PAGE OPEN (v1.1) -----
// ===============================
window.onload = () => {
    // 🔁 One-time migration for v1.0 users
    migrateV1TransactionsIfNeeded();

    // 🔄 Render UI from transactions (source of truth)
    updateUI();
    updateTransactionTable();
};


// ===============================
// ----- UPDATE UI FUNCTION -----
// ===============================
function updateUI() {
    const transactions = JSON.parse(localStorage.getItem("transactions")) || [];

    let totalMiles = 0;
    let contactless4xUsed = 0;
    let online4xUsed = 0;

    transactions.forEach(tx => {
        totalMiles += tx.miles;

        if (tx.type === "contactless") {
            contactless4xUsed += tx.spendAt4x;
        } else if (tx.type === "online") {
            online4xUsed += tx.spendAt4x;
        }
    });

    const remainingContactless = Math.max(0, CAP_CONTACTLESS - contactless4xUsed);
    const remainingOnline = Math.max(0, CAP_ONLINE - online4xUsed);

    document.getElementById("totalMiles").innerText = totalMiles.toFixed(0);
    document.getElementById("remainingContactless").innerText = remainingContactless.toFixed(0);
    document.getElementById("remainingOnline").innerText = remainingOnline.toFixed(0);

    document.getElementById("purchaseAmount").value = "";
    document.getElementById("purchaseAmount").focus();
}


// ===============================
// ----- CALCULATE MILES IN $5 BLOCKS -----
// ===============================
function calculateMilesInBlocks(amount, milesPerDollar) {
    // Floor to nearest $5 block
    const blocks = Math.floor(amount / 5);
    // Each block of $5 earns (5 * milesPerDollar) miles
    return blocks * 5 * milesPerDollar;
}

// ===============================
// ----- ADD PURCHASE -----------
// ===============================
function addPurchase() {
    const raw = document.getElementById("purchaseAmount").value;
    const purchaseAmount = Number(raw);
    const type = getSelectedPurchaseType();

    if (!Number.isFinite(purchaseAmount) || purchaseAmount <= 0) {
        alert("Please enter a valid amount greater than 0.");
        return;
    }

    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

    // Calculate used cap by type
    let used4x = transactions
        .filter(tx => tx.type === type)
        .reduce((sum, tx) => sum + tx.spendAt4x, 0);

    const cap = type === "contactless" ? CAP_CONTACTLESS : CAP_ONLINE;
    const remaining4x = Math.max(0, cap - used4x);

    const spendAt4x = Math.min(remaining4x, purchaseAmount);
    const spendAt0_4x = purchaseAmount - spendAt4x;

    const milesFrom4x = calculateMilesInBlocks(spendAt4x, 4);
    const milesFrom0_4x = calculateMilesInBlocks(spendAt0_4x, 0.4);
    const milesEarned = milesFrom4x + milesFrom0_4x;

    const now = new Date();

    transactions.push({
        datetime: now.toLocaleString(),
        type,              // contactless / online
        amount: purchaseAmount,
        miles: milesEarned,
        spendAt4x          // 🔑 per-type cap tracking
    });

    localStorage.setItem("transactions", JSON.stringify(transactions));

    updateUI();
    updateTransactionTable();
}


// ===============================
// ----- DATE TIME PARSE  ----- V1.1 
// ===============================
function formatTransactionDate(datetimeString) {
    const date = new Date(datetimeString);

    const datePart = date.toLocaleDateString("en-SG", {
        day: "2-digit",
        month: "short"
    });

    let timePart = date.toLocaleTimeString("en-SG", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });

    // Uppercase AM/PM and prevent line break
    timePart = timePart.replace(/ /, "\u00A0").replace(/am|pm/i, match => match.toUpperCase());

    return `${datePart}  ${timePart}`;
}




// ===============================
// ----- UPDATE TRANSACTION TABLE -----
// ===============================
function updateTransactionTable() {
    const tableBody = document.querySelector("#transactionTable tbody");
    tableBody.innerHTML = ""; // clear previous rows

    // Load transactions from localStorage
    const transactions = JSON.parse(localStorage.getItem("transactions")) || [];

    // Reverse the array to show newest transactions first (DESC order)
    const reversedTransactions = transactions.slice().reverse();

    // Add each transaction as a new row
    reversedTransactions.forEach(tx => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${formatTransactionDate(tx.datetime)}</td>
            <td>${tx.type}</td>
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
