// ----- VARIABLES -----
// how much the user has spent so far
let totalSpent = 0;

// how many miles earned so far
let totalMiles = 0;

// $$ limit where purchases earn 4× miles (kept at $1000 per your request)
const limitFor4Miles = 1000;


// ----- LOAD SAVED DATA ON PAGE OPEN -----
// (This makes progress stay after refresh)
window.onload = () => {
    // load saved totals. If the stored value is null or not a valid number, keep 0.
    const savedSpent = localStorage.getItem("totalSpent");
    const savedMiles = localStorage.getItem("totalMiles");

    // //notes: Number(...) converts strings to numbers; if conversion fails it returns NaN.
    totalSpent = Number(savedSpent);
    totalMiles = Number(savedMiles);

    // if not finite, fallback to 0
    if (!Number.isFinite(totalSpent)) totalSpent = 0;
    if (!Number.isFinite(totalMiles)) totalMiles = 0;

    console.log("[MilesTracker] Loaded from storage:", { totalSpent, totalMiles });

    // update screen with loaded values
    updateUI();
};



// ----- UPDATE UI ELEMENTS -----
function updateUI() {
    // show total miles earned so far (no decimals)
    document.getElementById("totalMiles").innerText = totalMiles.toFixed(0);

    // calculate how much more can earn 4× miles (no decimals shown)
    const remaining = Math.max(0, limitFor4Miles - totalSpent);
    document.getElementById("remainingToMax").innerText = remaining.toFixed(0);

    // clear the input box
    document.getElementById("purchaseAmount").value = "";

    // auto-focus the input again (nice UX)
    document.getElementById("purchaseAmount").focus();

    // helpful log for debugging
    console.log("[MilesTracker] updateUI:", { totalSpent, totalMiles, remaining });
}



// ----- ADD PURCHASE FUNCTION -----
// runs when user clicks "Add"
function addPurchase() {

    // get number from input box
    const raw = document.getElementById("purchaseAmount").value;
    const purchaseAmount = Number(raw);

    console.log("[MilesTracker] addPurchase called with input:", raw, "parsed:", purchaseAmount);

    // validation check
    // ensures it's a real number and greater than 0
    if (!Number.isFinite(purchaseAmount) || purchaseAmount <= 0) {
        alert("Please enter a valid amount greater than 0.");
        return;
    }

    // how much of the purchase still qualifies for 4× miles
    const remainingAt4x = Math.max(0, limitFor4Miles - totalSpent);

    // split the purchase:
    // part that gets 4×
    const spentAt4x = Math.min(remainingAt4x, purchaseAmount);

    // part that gets only 1×
    const spentAt1x = purchaseAmount - spentAt4x;

    // calculate miles earned
    // 4× for the first portion, 1× for the rest
    const milesEarned = (spentAt4x * 4) + (spentAt1x * 1);

    // update totals
    totalMiles += milesEarned;
    totalSpent += purchaseAmount;

    // save to localStorage so progress persists
    localStorage.setItem("totalSpent", String(totalSpent));
    localStorage.setItem("totalMiles", String(totalMiles));

    console.log("[MilesTracker] after add:", { purchaseAmount, spentAt4x, spentAt1x, milesEarned, totalSpent, totalMiles });

    // refresh screen
    updateUI();
}



// ----- RESET TRACKER -----
function resetTracker() {

    // ask user to confirm
    if (!confirm("Reset all data?")) return;

    // reset values
    totalSpent = 0;
    totalMiles = 0;

    // clear saved data (only our keys would be better, but this is simple)
    localStorage.clear();

    console.log("[MilesTracker] Reset performed");

    // update UI
    updateUI();
}
