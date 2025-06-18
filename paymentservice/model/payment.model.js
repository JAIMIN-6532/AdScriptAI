// import express from "express";
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: { type: String, ref: "User", required: true },

  paymentId: { type: String },
  orderId: { type: String, required: true },
  status: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  receipt: { type: String, required: true },
  notes: {
    tokens: { type: Number },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const PaymentModel = mongoose.model("Payment", paymentSchema);

export default PaymentModel;
