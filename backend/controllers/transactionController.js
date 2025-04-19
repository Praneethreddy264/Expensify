import mongoose from "mongoose";
import { getMonthName } from "../libs/index.js";
import Account from "../models/accountModel.js";
import Transaction from "../models/transactionModel.js";

export const getTransactions = async (req, res, next) => {
  try {
    const today = new Date();

    const _sevenDaysAgo = new Date(today);
    _sevenDaysAgo.setDate(today.getDate() - 8);

    const sevenDaysAgo = _sevenDaysAgo.toISOString().split("T")[0];

    const { df, dt, s } = req.query;
    const { userId } = req.body.user;

    const startDate = new Date(df || sevenDaysAgo);
    const endDate = new Date(dt || new Date());

    let query = {
      user: userId,
      createdAt: { $gte: startDate, $lte: endDate },
    };

    if (s) {
      const searchQuery = {
        $or: [
          { description: { $regex: s, $options: "i" } },
          { status: { $regex: s, $options: "i" } },
          { source: { $regex: s, $options: "i" } },
        ],
      };
      query = { ...query, ...searchQuery };
    }

    let queryResult = Transaction.find(query).sort({ _id: -1 });

    // pagination
    const page = Number(req.query.p) || 1;
    const limit = Number(req.query.l) || 10;
    const skip = (page - 1) * limit;

    //records count
    const totalTransactions = await Transaction.countDocuments(queryResult);

    const numOfPage = Math.ceil(totalTransactions / limit);

    queryResult = queryResult.skip(skip).limit(limit);

    const transactions = await queryResult;

    res.status(201).json({
      status: "success",
      data: transactions,
      // totalTransactions,
      // numOfPage,
      // page,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ status: "failed", message: error.message });
  }
};

export const addTransaction = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { account_id } = req.params;
    const { description, source, amount } = req.body;

    if (!(description || source || amount)) {
      return res
        .status(404)
        .json({ status: "failed", message: "Provide Required Fields!" });
    }

    if (Number(amount) <= 0)
      return res.status(404).json({
        status: "failed",
        message: "Amount should be grater than 0.00",
      });

    const accountInformation = await Account.findById(account_id);

    if (!accountInformation) {
      return res
        .status(404)
        .json({ status: "failed", message: "Invalid account information." });
    }

    if (
      accountInformation.account_balance <= 0 ||
      accountInformation.account_balance < Number(amount)
    ) {
      return res.status(404).json({
        status: "failed",
        message: "Insufficient account balance. Try again.",
      });
    }

    const transactionData = {
      user: userId,
      description,
      source,
      amount,
      type: "expense",
    };

    const transaction = await Transaction.create(transactionData);

    if (transaction) {
      const accountData = {
        account_balance:
          accountInformation.account_balance - transaction.amount,
      };
      await Account.findByIdAndUpdate(account_id, accountData);

      transaction.status = "Completed";
      await transaction.save();
    }

    res.status(201).json({
      status: "success",
      message: "Transaction completed successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ status: "failed", message: error.message });
  }
};

export const transferMoneyToAccount = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { from_account, to_account, amount } = req.body;

    if (!(from_account || to_account || amount)) {
      return res.status(404).json({
        status: "failed",
        message: "Provide Required Fields!",
      });
    }

    if (Number(amount) <= 0)
      return res
        .status(404)
        .json({ status: "failed", message: "Amount should be grater than 0." });

    const accountInformation = await Account.findById(from_account);
    const toAccountInformation = await Account.findById(to_account);

    if (!accountInformation) {
      return res
        .status(404)
        .json({ status: "failed", message: "Invalid account information." });
    }

    if (
      accountInformation.account_balance <= 0 ||
      accountInformation.account_balance < Number(amount)
    ) {
      return res.status(404).json({
        status: "failed",
        message: "Insufficient account balance. Try again.",
      });
    }

    // tranfer to account
    await Account.findByIdAndUpdate(to_account, {
      account_balance: toAccountInformation.account_balance + parseInt(amount),
    });

    // tranfer from account/deduct amount
    await Account.findByIdAndUpdate(from_account, {
      account_balance: accountInformation.account_balance - parseInt(amount),
    });

    const transferData = {
      user: userId,
      description: `Transfer (${accountInformation.account_name} - ${toAccountInformation.account_name})`,
      source: accountInformation.account_name,
      amount,
      type: "expense",
      status: "Completed",
    };

    await Transaction.create(transferData);

    const receiveData = {
      user: userId,
      description: `Received (${accountInformation.account_name} - ${toAccountInformation.account_name})`,
      source: toAccountInformation.account_name,
      amount,
      type: "income",
      status: "Completed",
    };

    await Transaction.create(receiveData);

    res.status(201).json({
      status: "success",
      message: "Transfer completed successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ status: "failed", message: error.message });
  }
};

export const getDashboardInformation = async (req, res, next) => {
  try {
    const { userId } = req.body.user;

    const user = new mongoose.Types.ObjectId(userId);

    const transactions = await Transaction.find({ user });

    // Calculate total income and total expense
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === "income") {
        totalIncome += transaction.amount;
      } else {
        totalExpense += transaction.amount;
      }
    });

    // Calculate available balance
    const availableBalance = totalIncome - totalExpense;

    // Aggregate transactions to sum by type and group by month
    const year = new Date().getFullYear();
    const start_Date = new Date(year, 0, 1); // January 1st of the year
    const end_Date = new Date(year, 11, 31, 23, 59, 59); // December 31st of the year

    const result = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: start_Date, $lte: end_Date },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            type: "$type",
          },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    // Organize the result into the specified format
    const data = new Array(12).fill().map((_, index) => {
      const monthData = result.filter((item) => item._id.month === index + 1);
      const income =
        monthData.find((item) => item._id.type === "income")?.totalAmount || 0;
      const expense =
        monthData.find((item) => item._id.type === "expense")?.totalAmount || 0;

      return {
        label: getMonthName(index),
        income,
        expense,
      };
    });

    // Fetch last transactions
    const lastTransactions = await Transaction.find({ user })
      .limit(5)
      .sort({ _id: -1 });

    // Fetch last accounts
    const lastAccount = await Account.find({ user }).limit(4).sort({ _id: -1 });

    res.status(201).json({
      status: "success",
      availableBalance,
      totalIncome,
      totalExpense,
      chartData: data,
      lastTransactions,
      lastAccount,
    });
  } catch (error) {
    console.error(error);
    res.status(404).json({ status: "failed", message: error.message });
  }
};
