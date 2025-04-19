import { comparePassword, hashPassword } from "../libs/index.js";
import User from "../models/userModel.js";

export const getUser = async (req, res) => {
  try {
    const { userId } = req.body.user;

    const user = await User.findById(userId);

    if (!user) {
      return next("User not found.");
    }

    user.password = undefined;

    res.status(201).json({
      status: "success",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ status: "failed", message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { userId } = req.body.user;
    const { firstName, lastName, countryName, currency, flag, contact } =
      req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ status: "failed", message: "User not found." });
    }

    const userData = {
      firstName,
      lastName,
      country: {
        name: countryName,
        currency,
        flag,
      },
      contact,
    };
    console.log(userData);
    const updatedUser = await User.findByIdAndUpdate(userId, userData, {
      new: true,
    });

    user.password = undefined;

    res.status(201).json({
      status: "success",
      message: "User information updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ status: "failed", message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { userId } = req.body.user;
    const { newPassword, currentPassword, confirmPassword } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ status: "failed", message: "User not found." });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(404)
        .json({ status: "failed", message: "New Passwords does not match." });
    }
    // compare password
    const isMatch = await comparePassword(currentPassword, user?.password);

    if (!isMatch) {
      return res
        .status(404)
        .json({ status: "failed", message: "Invalid current password." });
    }

    const hashedPassword = await hashPassword(newPassword);

    await User.findByIdAndUpdate(
      userId,
      {
        password: hashedPassword,
      },
      { new: true }
    );

    res.status(201).json({
      status: "success",
      message: "Password changed successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ status: "failed", message: error.message });
  }
};
