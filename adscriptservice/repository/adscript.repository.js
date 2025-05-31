import AdScriptModel from "../model/adscript.model.js";
import axios from "axios";
import { generateDummyScript } from "../utils/generateDummyScript.js";
import dotenv from "dotenv";
dotenv.config();

export default class AdScriptRepository {
  /**
   * Calls external AI endpoint to generate an ad script.
   * For now, this uses dummy logic. To integrate real AI:
   *  - Uncomment the Axios portion and configure AI_API_URL + AI_API_KEY.
   */
  async callAIService({
    campaignName,
    productInfo,
    targetAudience,
    callToAction,
  }) {
    // ----- Dummy Implementation -----
    const dummy = generateDummyScript({
      campaignName,
      productInfo,
      targetAudience,
      callToAction,
    });
    return dummy;

    /* ----- Real AI Integration (commented) -----
  const response = await axios.post(
    process.env.AI_API_URL,
    {
      campaignName,
      productInfo,
      targetAudience,
      callToAction,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.AI_API_KEY}`,
      },
    }
  );
  return response.data.scriptText; // assuming AI returns { scriptText: '...' }
  */
  }

  /**
   * Generates a new ad script (via AI or dummy) and returns the text.
   */
  async generateAdScript(inputData) {
    const { campaignName, productInfo, targetAudience, callToAction } =
      inputData;

    // 1. Generate the script (dummy or real AI)
    const scriptText = await callAIService({
      campaignName,
      productInfo,
      targetAudience,
      callToAction,
    });

    // 2. Calculate tokensUsed (e.g., 1 for basic). You can expand logic here.
    const tokensUsed = 1;

    return { scriptText, tokensUsed };
  }

  /**
   * Persists a generated ad script in the database.
   */
  async saveAdScript({
    userId,
    campaignName,
    productInfo,
    targetAudience,
    callToAction,
    scriptText,
    tokensUsed,
  }) {
    const newAdScript = new AdScriptModel({
      userId,
      campaignName,
      productInfo,
      targetAudience,
      callToAction,
      scriptText,
      tokensUsed,
    });
    return await newAdScript.save();
  }

  /**
   * Fetches all ad scripts belonging to a single user.
   */
  async getAdScriptsByUser(userId) {
    return await AdScriptModel.find({ userId }).sort({ createdAt: -1 });
  }

  /**
   * Fetches a single ad script by its ID (and ensures it belongs to the user).
   */
  async getAdScriptById(adScriptId, userId) {
    return await AdScriptModel.findOne({ _id: adScriptId, userId });
  }

  /**
   * Updates an existing ad script (only if it belongs to the user).
   */
  async updateAdScript(adScriptId, userId, updateData) {
    const adScript = await AdScriptModel.findOneAndUpdate(
      { _id: adScriptId, userId },
      updateData,
      { new: true, runValidators: true }
    );
    return adScript;
  }

  /**
   * Deletes an ad script (only if it belongs to the user).
   */
  async deleteAdScript(adScriptId, userId) {
    const result = await AdScriptModel.findOneAndDelete({
      _id: adScriptId,
      userId,
    });
    return result;
  }
}
