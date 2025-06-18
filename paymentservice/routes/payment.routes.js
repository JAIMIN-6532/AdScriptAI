import express from "express";
import PaymentController from "../controller/payment.controller.js";
import { jwtAuth } from "../middleware/jwtAuth.js";

const paymentRouter = express.Router();
const paymentController = new PaymentController();
paymentRouter.post("/create-order", jwtAuth, (req, res, next) => {
  paymentController.createOrder(req, res, next);
});
paymentRouter.post("/webhook", (req, res, next) => {
  paymentController.validateWebhook(req, res, next);
});

paymentRouter.post("/verify", (req, res, next) => {
  paymentController.verifyPayment(req, res, next);
});

export default paymentRouter;
