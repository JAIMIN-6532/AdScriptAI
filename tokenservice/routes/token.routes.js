import express from 'express';
import TokenController from '../controller/token.controller.js';
import { jwtAuth } from '../middleware/jwtAuth.js';

const tokenRouter = express.Router();

const tokenController = new TokenController();

// Generate a new token
tokenRouter.post('/generate', jwtAuth, (req, res, next) => {
    tokenController.generateTokenHandler(req, res, next);
});



export default tokenRouter;