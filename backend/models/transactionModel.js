import mongoose, { Schema } from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      required: true,
      default: "Pending",
      enum: ["Pending", "Completed", "Rejected"],
    },
    source: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, default: "income", enum: ["income", "expense"] },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
