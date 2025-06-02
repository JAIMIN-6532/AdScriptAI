import AdScriptRepository from "../repository/adscript.repository.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { v4 as uuidv4 } from "uuid";
import { generateDummyScript } from "../utils/generateDummyScript.js";
import waitForTokenResponse from "../kafka/waitForTokenResponse.js";
import { publishAdRequest } from "../kafka/producer.js";

export default class AdScriptController {
  constructor() {
    this.adScriptRepository = new AdScriptRepository();
  }
  /**
   * POST /api/ad-scripts/generate
   * Generates a new ad script (dummy/AI) and responds with script text + token usage.
   * Expects JSON: { campaignName, productInfo, targetAudience, callToAction }
   */
  async generateScriptHandler(req, res, next) {
    const userId = req.userID; // set by authMiddleware
    console.log("Generating ad script for user:", userId);
    const {
      adType,
      platform,
      productName,
      productInfo,
      targetAudience,
      tone,
      budget,
      durationDays,
    } = req.body;

    try {
      //0. we Have to Check if the user has enough tokens to generate the script
      const requestId = uuidv4(); // Generate a unique request ID
      await publishAdRequest({
        requestId,
        userId,
        adType,
        source: "script_generation",
      });

      // Then wait for a matching reply on 'adscript.tokens'
      const tokenResponse = await waitForTokenResponse(
        requestId,
        /*timeoutMs=*/ 10000
      );
      // Expected shape: { requestId, userId, status, remainingBalance, tokensDeducted, timestamp }

      if (tokenResponse.status !== "ok") {
        // Insufficient tokens
        return next(
          new ErrorHandler(402, "Insufficient tokens. Please purchase more.")
        );
      }

      // 1. Generate the scriptText and tokensUsed
      // const { generatedAd , tokensUsed } =
      //   await this.adScriptRepository.generateAdScript({
      //     adType,
      //     platform,
      //     productName,
      //     productInfo,
      //     targetAudience,
      //     tone,
      //     budget,
      //     durationDays,
      //   });

      const generatedAd = generateDummyScript({
        adType,
        platform,
        productName,
        productInfo,
        targetAudience,
        tone,
        budget,
        durationDays,
      });

      // 2. Respond with the generated script and token cost
      return res.status(200).json({
        success: true,
        data: { generatedAd, tokensUsed: tokenResponse.tokensDeducted },
      });
    } catch (err) {
      return next(
        new ErrorHandler(500, err.message || "Failed to generate script")
      );
    }
  }

  /**
   * POST /api/ad-scripts
   * Saves a previously generated script into the database.
   * Expects JSON: { campaignName, productInfo, targetAudience, callToAction, scriptText, tokensUsed }
   */
  async saveScriptHandler(req, res, next) {
    const userId = req.userID;
    const {
      campaignName,
      productInfo,
      targetAudience,
      callToAction,
      scriptText,
      tokensUsed,
    } = req.body;

    try {
      const saved = await this.adScriptRepository.saveAdScript({
        userId,
        campaignName,
        productInfo,
        targetAudience,
        callToAction,
        scriptText,
        tokensUsed,
      });
      return res.status(201).json({ success: true, data: saved });
    } catch (err) {
      return next(
        new ErrorHandler(500, err.message || "Failed to save script")
      );
    }
  }

  /**
   * GET /api/ad-scripts
   * Returns all ad scripts for the logged-in user.
   */
  async getAllScriptsHandler(req, res, next) {
    const userId = req.userID;

    try {
      const scripts = await this.adScriptRepository.getAdScriptsByUser(userId);
      return res.status(200).json({ success: true, data: scripts });
    } catch (err) {
      return next(
        new ErrorHandler(500, err.message || "Failed to fetch scripts")
      );
    }
  }

  /**
   * GET /api/ad-scripts/:id
   * Returns a single script by ID if it belongs to the user.
   */
  async getSingleScriptHandler(req, res, next) {
    const userId = req.userID;
    const adScriptId = req.params.id;

    try {
      const script = await this.adScriptRepository.getAdScriptById(
        adScriptId,
        userId
      );
      if (!script) {
        return next(new ErrorHandler(404, "Script not found"));
      }
      return res.status(200).json({ success: true, data: script });
    } catch (err) {
      return next(
        new ErrorHandler(500, err.message || "Failed to fetch script")
      );
    }
  }

  /**
   * PUT /api/ad-scripts/:id
   * Updates an existing script (only if it belongs to the user).
   * Expects JSON with fields to update (e.g. scriptText).
   */
  async updateScriptHandler(req, res, next) {
    const userId = req.userID;
    const adScriptId = req.params.id;
    const updateData = req.body;

    try {
      const updated = await this.adScriptRepository.updateAdScript(
        adScriptId,
        userId,
        updateData
      );
      if (!updated) {
        return next(new ErrorHandler(404, "Script not found or not yours"));
      }
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      return next(
        new ErrorHandler(500, err.message || "Failed to update script")
      );
    }
  }

  /**
   * DELETE /api/ad-scripts/:id
   * Deletes one of the user’s scripts by ID.
   */
  async deleteScriptHandler(req, res, next) {
    const userId = req.userID;
    const adScriptId = req.params.id;

    try {
      const deleted = await this.adScriptRepository.deleteAdScript(
        adScriptId,
        userId
      );
      if (!deleted) {
        return next(new ErrorHandler(404, "Script not found or not yours"));
      }
      return res.status(200).json({ success: true, message: "Script deleted" });
    } catch (err) {
      return next(
        new ErrorHandler(500, err.message || "Failed to delete script")
      );
    }
  }
}
