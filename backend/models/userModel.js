import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, select: true },
    lastName: { type: String },
    contact: { type: String },
    accounts: [{ type: String }],
    country: {
      name: String,
      currency: String,
      flag: String,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
