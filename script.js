function addPurchase() {
    const purchaseAmount = parseFloat(document.getElementById("purchaseAmount").value);

    if (isNaN(purchaseAmount) || purchaseAmount <= 0) {
        alert("Please enter a valid purchase amount.");
        return;
    }

    let milesEarned = 0;

    const remainingAt4x = Math.max(0, limitFor4Miles - totalSpent);
    const spentAt4x = Math.min(remainingAt4x, purchaseAmount);
    const spentAt1x = purchaseAmount - spentAt4x;

    milesEarned = (spentAt4x * 4) + (spentAt1x * 1);

    totalMiles += milesEarned;
    totalSpent += purchaseAmount;

    updateUI();
}
