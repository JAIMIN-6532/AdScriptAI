import PaymentRepository from "../repository/payment.repository.js";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import publishTokensAfterPayment from "../kafka/producer.js";
dotenv.config();
export default class PaymentController {
  constructor() {
    this.paymentRepository = new PaymentRepository();
  }
  createOrder = async (req, res, next) => {
    try {
      const order = await this.paymentRepository.createOrder(req, res, next);
      res.status(200).json({ ...order, key: process.env.RAZORPAY_KEY_ID });
    } catch (error) {
      // console.log(error);
      next(error);
    }
  };

  validateWebhook = async (req, res, next) => {
    try {
      const response = await this.paymentRepository.validateWebhook(
        req,
        res,
        next
      );
      const userId = req.userID;
      if (req.body.event === "payment.captured") {
        const paymentDetails = req.body.payload.payment.entity;
        const userId = req.userID;
        const requestId = uuidv4();

        await publishTokensAfterPayment({
          requestId,
          userId,
          orderId: paymentDetails.order_id,
          paymentId: paymentDetails.id,
          amount: paymentDetails.amount, // in paise by Razorpay’s default
          currency: paymentDetails.currency, // e.g. "INR"
        });
      }

      return res
        .status(200)
        .json({ message: "Webhook validated successfully" });
      // }
    } catch (error) {
      // console.log(error);
      next(error);
    }
  };

  verifyPayment = async (req, res, next) => {
    try {
      const response = await this.paymentRepository.verifyPayment(
        req,
        res,
        next
      );
      if (response) {
        return res.status(200).json({ success: true });
      }
      return res.status(400).json({ success: false });
    } catch (error) {
      // console.log(error);
      next(error);
    }
  };
}
