// ----- Variables -----
let totalSpent = 0;
let totalMiles = 0;

// Set how many dollars qualify for 4× miles
// Change this number to whatever you want (your HTML shows 1000 remaining initially)
const limitFor4Miles = 1500;


// ----- Update UI -----
function updateUI() {
    document.getElementById("totalMiles").innerText = totalMiles.toFixed(0);

    const remaining = Math.max(0, limitFor4Miles - totalSpent);
    document.getElementById("remainingToMax").innerText = remaining.toFixed(2);

    // Clear input
    document.getElementById("purchaseAmount").value = "";
}


// ----- Add purchase -----
function addPurchase() {
    const purchaseAmount = parseFloat(document.getElementById("purchaseAmount").value);

    if (isNaN(purchaseAmount) || purchaseAmount <= 0) {
        alert("Please enter a valid purchase amount.");
        return;
    }

    // How much can still earn 4×
    const remainingAt4x = Math.max(0, limitFor4Miles - totalSpent);

    // Split the purchase into 4× and 1× portions
    const spentAt4x = Math.min(remainingAt4x, purchaseAmount);
    const spentAt1x = purchaseAmount - spentAt4x;

    // Earn miles
    const milesEarned = (spentAt4x * 4) + (spentAt1x * 1);

    totalMiles += milesEarned;
    totalSpent += purchaseAmount;

    updateUI();
}
