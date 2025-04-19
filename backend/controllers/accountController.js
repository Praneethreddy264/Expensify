import Account from "../models/accountModel.js";
import Transaction from "../models/transactionModel.js";
import User from "../models/userModel.js";

export const getAccounts = async (req, res, next) => {
  try {
    const { userId } = req.body.user;

    const accounts = await Account.find({
      user: userId,
    });

    res.status(200).json({
      status: "success",
      data: accounts,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ status: "failed", message: error.message });
  }
};

export const createAccount = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { name, amount, account_number } = req.body;

    const accountExist = await Account.find({
      user: userId,
      account_name: name,
    });

    if (accountExist[0]) {
      return res
        .status(404)
        .json({ status: "failed", message: "Account already created." });
    }

    const accountData = {
      user: userId,
      account_name: name,
      account_number,
      account_balance: amount,
    };

    const account = await Account.create(accountData);

    const userAccount = await User.findById(userId);

    userAccount.accounts.push(name);

    await userAccount.save();

    const transactionData = {
      user: userId,
      description: account.account_name + " (Initial Deposit)",
      source: account.account_name,
      amount,
      type: "income",
      status: "Completed",
    };

    await Transaction.create(transactionData);

    res.status(201).json({
      status: "success",
      message: account.account_name + " Account created successfully",
      data: account,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ status: "failed", message: error.message });
  }
};

export const addMoneyToAccount = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { id } = req.params;
    const { amount } = req.body;

    const accountInformation = await Account.findById(id);

    if (!accountInformation) {
      return next("Invalid account information.");
    }

    accountInformation.account_balance =
      accountInformation.account_balance + Number(amount);

    await accountInformation.save();

    const transactionData = {
      user: userId,
      description: accountInformation.account_name + " (Deposit)",
      source: accountInformation.account_name,
      amount,
      type: "income",
      status: "Completed",
    };

    await Transaction.create(transactionData);

    res.status(201).json({
      status: "success",
      message: "Operation completed successfully",
      data: accountInformation,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ status: "failed", message: error.message });
  }
};
