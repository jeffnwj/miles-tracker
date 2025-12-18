// ===============================
// --- MIGRATION for v1.0 to v1.1--------------
// ===============================
function migrateV1TransactionsIfNeeded() {
    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    let migrated = false;

    transactions = transactions.map(tx => {
        // Force type and spendAt4x for v1.0 transactions
        if (!("type" in tx) || !("spendAt4x" in tx)) {
            migrated = true;
            tx.type = "contactless";
            tx.spendAt4x = tx.amount;
        }

        // Force datetime to ISO string if missing or invalid
        let parsedDate = new Date(tx.datetime);
        if (!tx.datetime || !parsedDate.getTime()) {
            migrated = true;
            tx.datetime = new Date().toISOString();
        } else {
            // convert valid old string to ISO to make Safari happy
            tx.datetime = parsedDate.toISOString();
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
document.getElementById("resetButton").addEventListener("click", resetTracker);

// ===============================
// ----- LOAD SAVED DATA ON PAGE OPEN (v1.1) -----
// ===============================
window.onload = () => {
    migrateV1TransactionsIfNeeded();
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

    // Calculate remaining amounts
    const remainContactless = Math.max(0, CAP_CONTACTLESS - contactless4xUsed);
    const remainOnline = Math.max(0, CAP_ONLINE - online4xUsed);

    // Calculate percentages for the "Draw Down" effect (100% down to 0%)
    const pctContactless = (remainContactless / CAP_CONTACTLESS) * 100;
    const pctOnline = (remainOnline / CAP_ONLINE) * 100;

    // Update Text
    document.getElementById("totalMiles").innerText = Math.floor(totalMiles).toLocaleString();
    document.getElementById("remainingContactlessText").innerText = `$${remainContactless.toFixed(0)} left`;
    document.getElementById("remainingOnlineText").innerText = `$${remainOnline.toFixed(0)} left`;

    // Update Progress Bar Widths
    document.getElementById("barContactless").style.width = pctContactless + "%";
    document.getElementById("barOnline").style.width = pctOnline + "%";

    // UX: Change bar color to red if almost empty
    updateBarColor("barContactless", pctContactless);
    updateBarColor("barOnline", pctOnline);

    const input = document.getElementById("purchaseAmount");
    input.value = "";
}

// Helper to make it feel more "premium"
function updateBarColor(elementId, percentage) {
    const bar = document.getElementById(elementId);
    if (percentage < 15) {
        bar.style.background = "#ff4d4d"; // Alert red
        bar.style.boxShadow = "0 0 10px rgba(255, 77, 77, 0.5)";
    } else {
        bar.style.background = "linear-gradient(90deg, var(--color-accent), var(--color-accent-2))";
        bar.style.boxShadow = "0 0 10px rgba(0, 255, 240, 0.5)";
    }
}

// ===============================
// ----- CALCULATE MILES IN $5 BLOCKS -----
// ===============================
function calculateMilesInBlocks(amount, milesPerDollar) {
    const blocks = Math.floor(amount / 5);
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
        datetime: now.toISOString(), // Store ISO string for iOS-safe parsing
        type,
        amount: purchaseAmount,
        miles: milesEarned,
        spendAt4x
    });

    localStorage.setItem("transactions", JSON.stringify(transactions));

    updateUI();
    updateTransactionTable();
}

// ===============================
// ----- DATE TIME PARSE (Mobile-friendly) -----
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

    // Uppercase AM/PM & non-breaking space
    timePart = timePart.replace(/ /, "\u00A0").replace(/am|pm/i, match => match.toUpperCase());

    return `${datePart} • ${timePart}`;
}

// ===============================
// ----- UPDATE TRANSACTION TABLE -----
// ===============================
function updateTransactionTable() {
    const tableBody = document.querySelector("#transactionTable tbody");
    tableBody.innerHTML = "";

    const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    const reversedTransactions = transactions.slice().reverse();

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
    if (!confirm("Reset all data?")) return;

    localStorage.removeItem("transactions");

    console.log("[MilesTracker] Reset performed");

    updateUI();
    updateTransactionTable();
}
