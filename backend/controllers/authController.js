import { comparePassword, createJWT, hashPassword } from "../libs/index.js";
import User from "../models/userModel.js";

export const signupUser = async (req, res, next) => {
  try {
    const { firstName, email, password } = req.body;

    //validate fileds
    if (!(firstName || email || password)) {
      return res.status(404).json({
        status: "failed",
        message: "Provide Required Fields!",
      });
    }

    const userExist = await User.findOne({ email });

    if (userExist) {
      return res.status(404).json({
        status: "failed",
        message: "Email Address already exists. Try Login",
      });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      firstName,
      email,
      password: hashedPassword,
    });

    user.password = undefined;

    res.status(201).json({
      status: "success",
      message: "User account created successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ status: "failed", message: error.message });
  }
};

export const signinUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ status: "failed", message: "Invalid email or password." });
    }

    // compare password
    const isMatch = await comparePassword(password, user?.password);

    if (!isMatch) {
      return res.status(404).json({
        status: "failed",
        message: "Invalid email or password",
      });
    }

    const token = createJWT(user._id);

    user.password = undefined;

    res
      .status(200)
      .json({ status: "success", message: "Login successfully", user, token });
  } catch (error) {
    console.log(error);
    res.status(404).json({ status: "failed", message: error.message });
  }
};
