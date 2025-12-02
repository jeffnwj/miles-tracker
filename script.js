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
    const savedSpent = localStorage.getItem("totalSpent");
    const savedMiles = localStorage.getItem("totalMiles");

    totalSpent = Number(savedSpent);
    totalMiles = Number(savedMiles);

    if (!Number.isFinite(totalSpent)) totalSpent = 0;
    if (!Number.isFinite(totalMiles)) totalMiles = 0;

    console.log("[MilesTracker] Loaded from storage:", { totalSpent, totalMiles });

    updateUI();
};

// ===============================
// ----- UPDATE UI FUNCTION -----
// ===============================
function updateUI() {
    document.getElementById("totalMiles").innerText = totalMiles.toFixed(0);

    const remaining = Math.max(0, limitFor4Miles - totalSpent);
    document.getElementById("remainingToMax").innerText = remaining.toFixed(0);

    document.getElementById("purchaseAmount").value = "";
    document.getElementById("purchaseAmount").focus();

    console.log("[MilesTracker] updateUI:", { totalSpent, totalMiles, remaining });
}

// ===============================
// ----- ADD PURCHASE -----------
// ===============================
function addPurchase() {
    const raw = document.getElementById("purchaseAmount").value;
    const purchaseAmount = Number(raw);

    console.log("[MilesTracker] addPurchase called with:", raw, "parsed:", purchaseAmount);

    if (!Number.isFinite(purchaseAmount) || purchaseAmount <= 0) {
        alert("Please enter a valid amount greater than 0.");
        return;
    }

    const remainingAt4x = Math.max(0, limitFor4Miles - totalSpent);
    const spentAt4x = Math.min(remainingAt4x, purchaseAmount);
    const spentAt1x = purchaseAmount - spentAt4x;

    const milesEarned = (spentAt4x * 4) + (spentAt1x * 1);

    totalSpent += purchaseAmount;
    totalMiles += milesEarned;

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

    updateUI();
}

// ===============================
// ----- RESET TRACKER ----------
// ===============================
function resetTracker() {
    if (!confirm("Reset all data?")) return;

    totalSpent = 0;
    totalMiles = 0;

    localStorage.removeItem("totalSpent");
    localStorage.removeItem("totalMiles");

    console.log("[MilesTracker] Reset performed");

    updateUI();
}
