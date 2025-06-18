import rezorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config();

const razorpayInstance = new rezorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
export default razorpayInstance;
