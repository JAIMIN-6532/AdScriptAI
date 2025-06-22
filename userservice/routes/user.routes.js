import express from "express";
import UserController from "../controller/user.controller.js";
import { authByUserRole, jwtAuth } from "../middleware/jwtAuth.js";

const userRouter = express.Router();

const userController = new UserController();

userRouter.post("/register", (req, res, next) => {
  userController.register(req, res, next);
});

userRouter.post("/login", (req, res, next) => {
  userController.signIn(req, res, next);
});

userRouter.get("/me/:id", jwtAuth, (req, res, next) => {
  userController.getProfile(req, res, next);
});

userRouter.post("/logout", (req, res, next) => {
  userController.logout(req, res, next);
});

userRouter.get("", jwtAuth, authByUserRole("admin"), (req, res, next) => {
  userController.getAllUsers(req, res, next);
});

export default userRouter;
