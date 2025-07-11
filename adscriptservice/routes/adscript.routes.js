import express from 'express';
import AdScriptController from '../controller/adscript.controller.js';
import { jwtAuth } from '../middleware/jwtAuth.js';


const adScriptRouter = express.Router();

const adScriptController = new AdScriptController();

// Generate (dummy) ad script
adScriptRouter.post('/generate', jwtAuth, (req, res, next) => {
    adScriptController.generateScriptHandler(req, res, next);
});

//Generate Ad Image 
adScriptRouter.post('/generate-image', jwtAuth, (req, res, next) => {
    adScriptController.generateImageHandler(req, res, next);
});

// Save a generated ad script
adScriptRouter.post('/', jwtAuth ,(req, res, next) => {
    adScriptController.saveScriptHandler(req, res, next);
});



// Fetch all scripts for the authenticated user
adScriptRouter.get('/', jwtAuth ,(req, res, next) => {
    adScriptController.getAllScriptsHandler(req, res, next);
});

// Fetch one script by ID
adScriptRouter.get('/:id', jwtAuth ,(req, res, next) => {
    adScriptController.getScriptByIdHandler(req, res, next);
});

// Update a script
adScriptRouter.put('/:id', jwtAuth ,(req, res, next) => {
    adScriptController.updateScriptHandler(req, res, next);
});

// Delete a script
adScriptRouter.delete('/:id', jwtAuth ,(req, res, next) => {
    adScriptController.deleteScriptHandler(req, res, next);
});

export default adScriptRouter;
