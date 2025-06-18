import PaymentModel from "../model/payment.model.js";
import razorpayInstace from "../utils/rezorpay.js";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils.js";
import dotenv from "dotenv";
dotenv.config();

export default class PaymentRepository {
  createOrder = async (req, res, next) => {
    try {
      const order = await razorpayInstace.orders.create({
        amount: req.body.amount * 100,
        currency: "INR",
        receipt: "reciept#1",
        notes: {
          tokens: req.body.tokens, // Assuming tokens is passed in the request body
        },
      });
      const payment = new PaymentModel({
        userId: req.user._id, // Assuming user ID is available in req.user
        orderId: order.id,
        status: order.status,
        amount: order.amount / 100,
        currency: order.currency,
        receipt: order.receipt,
        notes: order.notes,
      });
      const savedPayment = await payment.save();
      return savedPayment.toJSON();
    } catch (error) {
      // console.log(error);
      throw error;
    }
  };

  validateWebhook = async (req, res, next) => {
    try {
      const webhookSignature = req.get("x-razorpay-signature");
      const isvalidWebhook = validateWebhookSignature(
        JSON.stringify(req.body),
        webhookSignature,
        process.env.RAZORPAY_WEBHOOK_SECRET
      );
      if (!isvalidWebhook) {
        return res.status(400).json({ message: "Invalid Webhook Signature" });
      }
      const paymentDetails = req.body.payload.payment.entity;
      const payment = await PaymentModel.findOne({
        orderId: paymentDetails.order_id,
      });
      payment.status = paymentDetails.status;
      const savedpayment = await payment.save();
      // if(req.body.event === "payment.failed"){}
      // if(req.body.event === "payment.captured"){
      // }
      return savedpayment;
    } catch (error) {
      // console.log(error);
      throw error;
    }
  };

  verifyPayment = async (req, res, next) => {
    // const payment = await PaymentModel.findOne({_id: req.params.lsid});
    const { orderId } = req.body;

    const payment = await PaymentModel.findOne({ orderId: orderId });
    if (payment.status) {
      return true;
    }
    return false;
  };
}
