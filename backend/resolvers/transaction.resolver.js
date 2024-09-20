import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";

const transactionResolver = {
  Query: {
    transactions: async (_, __, context) => {
      try {
        const currentUser = await context.getUser();
        if (!currentUser) throw new Error("Unauthorized");
        const userId = currentUser._id;
        const transactions = await Transaction.find({ userId });
        return transactions;
      } catch (err) {
        console.log(`Error getting transactions: ${err}`);
        throw new Error("Error getting transactions");
      }
    },

    transaction: async (_, { transactionId }) => {
      try {
        const transaction = await Transaction.findById(transactionId);
        return transaction;
      } catch (err) {
        console.log(`Error getting transaction: ${err}`);
        throw new Error("Error getting transaction");
      }
    },

    categoryStatistics: async (_, __, context) => {
      const currentUser = await context.getUser();
      if (!currentUser) throw new Error("Unauthorized");
      const userId = currentUser._id;
      const transactions = await Transaction.find({ userId });
      const categoryMap = {};

      transactions.forEach((transaction) => {
        if (!categoryMap[transaction.category]) {
          categoryMap[transaction.category] = 0;
        }
        categoryMap[transaction.category] += transaction.amount;
      });

      return Object.entries(categoryMap).map(([category, totalAmount]) => ({
        category,
        totalAmount,
      }));
    },
  },

  Mutation: {
    createTransaction: async (_, { input }, context) => {
      try {
        const currentUser = await context.getUser();
        console.log("currentUser: ", currentUser);
        console.log("currentUser._id: ", currentUser._id);
        const newTransaction = new Transaction({
          ...input,
          userId: currentUser._id,
        });
        await newTransaction.save();
        return newTransaction;
      } catch (err) {
        console.log("Error creating transaction: ", err);
        throw new Error("Error creating transaction");
      }
    },

    updateTransaction: async (_, { input }) => {
      try {
        const updatedTransaction = await Transaction.findByIdAndUpdate(
          input.transactionId,
          input,
          { new: true }
        );
        return updatedTransaction;
      } catch (err) {
        console.log("Error updating transaction: ", err);
        throw new Error("Error updating transaction");
      }
    },

    deleteTransaction: async (_, { transactionId }) => {
      try {
        const deletedTransaction = await Transaction.findByIdAndDelete(
          transactionId
        );
        return deletedTransaction;
      } catch (err) {
        console.log("Error deleting transaction: ", err);
        throw new Error("Error deleting transaction");
      }
    },
  },
  Transaction: {
    user: async (parent) => {
      const userId = parent.userId;
      try {
        const user = await User.findById(userId);
        return user;
      } catch (error) {
        console.error("Error getting user: ", error);
        throw new Error("Error getting user");
      }
    },
  },
};

export default transactionResolver;
