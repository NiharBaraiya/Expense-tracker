import Debt from "../models/Debt.js";

// ➕ Add a new debt
export const addDebt = async (req, res) => {
  try {
    const debt = new Debt(req.body);
    await debt.save();
    res.status(201).json(debt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📋 Get all debts
export const getDebts = async (req, res) => {
  try {
    const debts = await Debt.find().sort({ createdAt: -1 });
    res.status(200).json(debts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✏️ Update a debt
export const updateDebt = async (req, res) => {
  try {
    const debt = await Debt.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!debt) return res.status(404).json({ message: "Debt not found" });
    res.status(200).json(debt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🗑️ Delete a debt
export const deleteDebt = async (req, res) => {
  try {
    const debt = await Debt.findByIdAndDelete(req.params.id);
    if (!debt) return res.status(404).json({ message: "Debt not found" });
    res.status(200).json({ message: "Debt deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 💰 Add a payment to a debt
export const addPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const debt = await Debt.findById(id);
    if (!debt) return res.status(404).json({ message: "Debt not found" });

    // Deduct payment
    debt.remaining -= amount;
    debt.payments.push({ amount, date: new Date() });

    // Mark as fully paid if balance is zero or less
    if (debt.remaining <= 0) {
      debt.remaining = 0;
      debt.paid = true;
    }

    await debt.save();
    res.status(200).json(debt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
