import React, { useState } from "react";
import "./App.css";

export default function App() {
  const [purchaseDate, setPurchaseDate] = useState("");
  const [requestDate, setRequestDate] = useState("");
  const [annualPrice, setAnnualPrice] = useState("");
  const [monthlyNoCommitment, setMonthlyNoCommitment] = useState("");
  const [isMedical, setIsMedical] = useState(false);

  // New fields for early cancellation (within 14 days)
  const [dailyMembership, setDailyMembership] = useState("");
  const [numDailyMembership, setNumDailyMembership] = useState("");

  const [result, setResult] = useState(null);

  const handleCalculate = () => {
    if (!purchaseDate || !requestDate || !annualPrice || !monthlyNoCommitment) {
      alert("Please fill all fields");
      return;
    }

    const purchase = new Date(purchaseDate);
    const request = new Date(requestDate);

    const totalDays = 365;
    const dailyRate = Number(annualPrice) / totalDays;

    // Cancellation effective date depends on medical or not
    const cancellationDate = new Date(request);
    if (!isMedical) {
      cancellationDate.setMonth(cancellationDate.getMonth() + 1);
    }

    // Days actually used
    const usedDays = Math.floor(
      (cancellationDate - purchase) / (1000 * 60 * 60 * 24)
    );

    if (usedDays >= totalDays) {
      setResult("Membership already complete, no refund possible.");
      return;
    }

    // Special case: cancellation within 14 days
    const diffDays = Math.floor(
      (request - purchase) / (1000 * 60 * 60 * 24)
    );
    if (diffDays <= 14) {
      // If user provided daily membership fields → use them
      let dailyCost = 0;
      if (dailyMembership && numDailyMembership) {
        dailyCost = Number(dailyMembership) * Number(numDailyMembership);
      } else {
        // fallback to daily rate calculation
        const daysUsed = diffDays > 0 ? diffDays : 0;
        dailyCost = daysUsed * dailyRate;
      }

      const cancelFee = Math.min(Number(annualPrice) * 0.05, 100);
      const refund = Number(annualPrice) - dailyCost - cancelFee;

      setResult(
        `Early cancellation: Refund = ₪${refund.toFixed(
          2
        )} (minus daily usage ₪${dailyCost.toFixed(
          2
        )}, cancel fee ₪${cancelFee.toFixed(2)})`
      );
      return;
    }

    // Membership usage charge by days
    const membershipCharge = dailyRate * usedDays;

    // Cancellation fee = (monthly no commitment - monthly commitment) * (used months)
    const monthlyCommitment = Number(annualPrice) / 12;
    const diff = Number(monthlyNoCommitment) - monthlyCommitment;
    const usedMonths = usedDays / 30; // approx months
    const cancellationFee = diff * usedMonths;

    // Max cancellation fee by percentage of annual price
    let maxPercent = 0.25;
    if (usedDays > totalDays / 3 && usedDays <= (2 * totalDays) / 3) {
      maxPercent = 0.2;
    } else if (usedDays > (2 * totalDays) / 3) {
      maxPercent = 0.17;
    }
    const maxAllowed = Number(annualPrice) * maxPercent;
    const finalCancellationFee = Math.min(cancellationFee, maxAllowed);

    // Refund = Annual - (usage + cancellation fee)
    const refund =
      Number(annualPrice) - (membershipCharge + finalCancellationFee);

    setResult(
      `${isMedical ? "Medical " : ""}Cancellation → Membership charge until cancellation: ₪${membershipCharge.toFixed(
        2
      )}, Cancellation fee: ₪${finalCancellationFee.toFixed(
        2
      )}, Refund due: ₪${refund.toFixed(2)}`
    );
  };

  // Helper: check if within 14 days
  const isWithin14Days =
    purchaseDate && requestDate
      ? Math.floor(
          (new Date(requestDate) - new Date(purchaseDate)) /
            (1000 * 60 * 60 * 24)
        ) <= 14
      : false;

  return (
     <div className="page">
    <div className="container">
      <div className="card">
        <h2>Membership Cancellation Fee Calculator</h2>

        <label>
          Purchase Date:
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
          />
        </label>

        <label>
          Cancellation Request Date:
          <input
            type="date"
            value={requestDate}
            onChange={(e) => setRequestDate(e.target.value)}
          />
        </label>

        <label>
          Annual Price (₪):
          <input
            type="number"
            value={annualPrice}
            onChange={(e) => setAnnualPrice(e.target.value)}
          />
        </label>

        <label>
          Monthly Price (No Commitment) (₪):
          <input
            type="number"
            value={monthlyNoCommitment}
            onChange={(e) => setMonthlyNoCommitment(e.target.value)}
          />
        </label>

        {/* Medical / Non-medical toggle */}
        <div className="toggle-group">
          <label>
            <input
              type="radio"
              name="cancellationType"
              checked={!isMedical}
              onChange={() => setIsMedical(false)}
            />
            Non-Medical
          </label>
          <label>
            <input
              type="radio"
              name="cancellationType"
              checked={isMedical}
              onChange={() => setIsMedical(true)}
            />
            Medical
          </label>
        </div>

        {/* Extra fields appear if within 14 days */}
        {isWithin14Days && (
          <div className="extra-fields">
            <label>
              Daily Membership Price (₪):
              <input
                type="number"
                value={dailyMembership}
                onChange={(e) => setDailyMembership(e.target.value)}
              />
            </label>
            <label>
              Number of Daily Memberships Used:
              <input
                type="number"
                value={numDailyMembership}
                onChange={(e) => setNumDailyMembership(e.target.value)}
              />
            </label>
          </div>
        )}

        <button onClick={handleCalculate}>Calculate</button>

        {result && <div className="result">{result}</div>}
      </div>
    </div>
  <footer className="footer">
  <p>© 2025 Amir Ghareeb </p>
</footer>

  </div>
  );
}
