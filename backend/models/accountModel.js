import mongoose, { Schema } from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    account_name: { type: String, required: true },
    account_number: { type: String, required: true },
    account_balance: { type: Number, default: 0.0, required: true },
  },
  { timestamps: true }
);

const Account = mongoose.model("Account", accountSchema);

export default Account;
