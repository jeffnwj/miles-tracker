// ===============================
// ----- VARIABLES --------------
// ===============================

// how much the user has spent so far
let totalSpent = 0;

// how many miles earned so far
let totalMiles = 0;

// $$ limit where purchases earn 4× miles (kept at $1000 per your request)
const limitFor4Miles = 1000;


// ===============================
// ----- BUTTON EVENT LISTENERS ---
// ===============================

// notes: This connects the Reset button in HTML to the resetTracker() function.
// notes: If your HTML uses a different ID, this will NOT work.
document.getElementById("resetButton").addEventListener("click", resetTracker);



// ===============================
// ----- LOAD SAVED DATA ON PAGE OPEN -----
// ===============================

// notes: This runs automatically when the page opens.
window.onload = () => {

    // load saved values from browser storage
    const savedSpent = localStorage.getItem("totalSpent");
    const savedMiles = localStorage.getItem("totalMiles");

    // convert stored values to numbers
    totalSpent = Number(savedSpent);
    totalMiles = Number(savedMiles);

    // if conversion failed, fallback to 0
    if (!Number.isFinite(totalSpent)) totalSpent = 0;
    if (!Number.isFinite(totalMiles)) totalMiles = 0;

    console.log("[MilesTracker] Loaded from storage:", { totalSpent, totalMiles });

    // update screen with loaded numbers
    updateUI();
};



// ===============================
// ----- UPDATE UI FUNCTION -----
// ===============================

function updateUI() {

    // show total miles earned (no decimals)
    document.getElementById("totalMiles").innerText = totalMiles.toFixed(0);

    // calculate remaining dollars that still qualify for 4× miles
    const remaining = Math.max(0, limitFor4Miles - totalSpent);
    document.getElementById("remainingToMax").innerText = remaining.toFixed(0);

    // clear the input text field
    document.getElementById("purchaseAmount").value = "";

    // put cursor back in the input box
    document.getElementById("purchaseAmount").focus();

    console.log("[MilesTracker] updateUI:", { totalSpent, totalMiles, remaining });
}



// ===============================
// ----- ADD PURCHASE -----------
// ===============================

// notes: This runs whenever you press the Add button
function addPurchase() {

    // get the user’s input as text
    const raw = document.getElementById("purchaseAmount").value;

    // convert to number
    const purchaseAmount = Number(raw);

    console.log("[MilesTracker] addPurchase called with:", raw, "parsed:", purchaseAmount);

    // validate number
    if (!Number.isFinite(purchaseAmount) || purchaseAmount <= 0) {
        alert("Please enter a valid amount greater than 0.");
        return;
    }

    // find remaining money that still earns 4×
    const remainingAt4x = Math.max(0, limitFor4Miles - totalSpent);

    // portion of this purchase that still gets 4×
    const spentAt4x = Math.min(remainingAt4x, purchaseAmount);

    // rest earns 1×
    const spentAt1x = purchaseAmount - spentAt4x;

    // miles earned math
    const milesEarned = (spentAt4x * 4) + (spentAt1x * 1);

    // update totals
    totalSpent += purchaseAmount;
    totalMiles += milesEarned;

    // save values so it persists after refresh
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

    // refresh the UI with new numbers
    updateUI();
}



// ===============================
// ----- RESET TRACKER ----------
// ===============================

// notes: Clears everything and resets tracker to 0
function resetTracker() {

    // ask user to confirm
    if (!confirm("Reset all data?")) return;

    // reset values
    totalSpent = 0;
    totalMiles = 0;

    // clear the saved values
    localStorage.removeItem("totalSpent");
    localStorage.removeItem("totalMiles");

    console.log("[MilesTracker] Reset performed");

    // refresh UI
    updateUI();
}
