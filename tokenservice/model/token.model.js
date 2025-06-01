import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // assuming your User microservice’s User _id is stored here
      required: true,
    },
    transaction: [
      {
        type: {
          type: String,
          enum: ["deduction", "addition","initial"], // "initial" for system-generated tokens, "deduction" for script generation, "addition" for purchases
          // required: true,
        },
        amount: {
          type: Number,
          // required: true,
          min: 1,
        },
        source: {
          type: String,
          enum: ["script_generation", "purchase","system"], // "system" for initial tokens, "purchase" for user purchases
          // required: true,
        },

      },

    ],
    remainingBalance: {
      type: Number,
      
      min: 0,
    },
    //   // Optional metadata
    //   metadata: {
    //     // E.g., { correlationId: '...', scriptId: '...' }
    //     type: mongoose.Schema.Types.Mixed,
    //     default: {},
    //   },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Token", tokenSchema);
