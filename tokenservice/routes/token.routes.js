import express from 'express';
import TokenController from '../controller/token.controller.js';
import { authByUserRole, jwtAuth } from '../middleware/jwtAuth.js';

const tokenRouter = express.Router();

const tokenController = new TokenController();

// Get User TokensDetails
tokenRouter.get('/tokens', jwtAuth, (req, res, next) => {
  tokenController.getUserTokens(req, res, next);
});

//Get All UsersTokensDetails
tokenRouter.get('/tokens/all', jwtAuth, authByUserRole('admin') ,(req, res, next) => {
  tokenController.getAllUsersTokens(req, res, next);
});


export default tokenRouter;