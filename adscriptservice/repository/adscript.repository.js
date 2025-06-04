import AdScriptModel from "../model/adscript.model.js";
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

export default class AdScriptRepository {


  /**
   * Persists a generated ad script in the database.
   **/
  
  async saveAdScript(data) {
    try {
      // Create a new document (do not use `new` with `.create()`)
      const newAdScript = new AdScriptModel({
        userId: new mongoose.Types.ObjectId(data.userId),
        adType: data.adType,
        platform: data.platform,
        productName: data.productName,
        productInfo: data.productInfo,
        targetAudience: data.targetAudience,
        tone: data.tone,
        budget: data.budget,
        durationDays: data.durationDays,
        timeToGenerate: data.timeToGenerate,
        callToAction: data.callToAction || "Learn More",
        generatedScript: data.generatedScript,
        tokensUsed: data.tokensUsed,
      });

      // Save it
      const savedDoc = await newAdScript.save();
      return savedDoc;
    } catch (error) {
      // If it’s a validation error, log each field
      // if (error.name === "ValidationError") {
      //   for (let field in error.errors) {
      //     console.error(
      //       `Validation error on '${field}': ${error.errors[field].message}`
      //     );
      //   }
      // } else {
      //   console.error("Unknown error saving ad script:", error);
      // }
      throw new Error("Failed to save ad script");
    }
  }

  /**
   * Fetches all ad scripts belonging to a single user.
   */
  async getAdScriptsByUser(userId) {
    try {
      return await AdScriptModel.find({ userId }).sort({ createdAt: -1 }); // sort by most recent first
    } catch (error) {
      throw new Error("Failed to fetch ad scripts");
    }
  }

  /**
   * Fetches a single ad script by its ID (and ensures it belongs to the user).
   */
  async getAdScriptById(adScriptId, userId) {
    try {
      return await AdScriptModel.findOne({ _id: adScriptId, userId });
    } catch (error) {
      throw new Error("Failed to fetch ad script by ID");
    }
  }

  /**
   * Updates an existing ad script (only if it belongs to the user).
   */
  async updateAdScript(adScriptId, userId, updateData) {
    try {
      const adScript = await AdScriptModel.findOneAndUpdate(
        { _id: adScriptId, userId },
        updateData,
        { new: true, runValidators: true }
      );
      return adScript;
    } catch (error) {
      throw new Error("Failed to update ad script");
    }
  }

  /**
   * Deletes an ad script (only if it belongs to the user).
   */
  async deleteAdScript(adScriptId, userId) {
    try{
    const result = await AdScriptModel.findOneAndDelete({
      _id: adScriptId,
      userId,
    });
    return result;
  }catch (error) {
      throw new Error("Failed to delete ad script");
    }
  }
}
