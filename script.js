let totalMiles = 0;
let totalSpent = 0;
const limitFor4Miles = 1000;

function addPurchase() {
    const purchaseAmount = parseFloat(document.getElementById('purchaseAmount').value);
    
    if (isNaN(purchaseAmount) || purchaseAmount <= 0) {
        alert("Please enter a valid purchase amount.");
        return;
    }

    totalSpent += purchaseAmount;
    let milesEarned = 0;

    // First $1000 gives 4 miles per dollar
    if (totalSpent <= limitFor4Miles) {
        milesEarned = purchaseAmount * 4;
    } else {
        // After $1000, 1 mile per dollar
        milesEarned = (purchaseAmount * 4) - ((totalSpent - limitFor4Miles) * 3);
    }

    totalMiles += milesEarned;
    updateUI();
}

function updateUI() {
    document.getElementById('totalMiles').textContent = totalMiles.toFixed(2);
    
    // Calculate remaining to get 4 miles per dollar
    const remainingForMaxMiles = Math.max(0, limitFor4Miles - totalSpent);
    document.getElementById('remainingToMax').textContent = remainingForMaxMiles.toFixed(2);
}

