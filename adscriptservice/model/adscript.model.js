import mongoose from "mongoose";

const adScriptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // assuming your User microservice’s User _id is stored here
      required: true,
    },
    adType: {
      type: String,
      enum: ["video", "image", "script"],
      required: [true, "Ad type is required"],
    },
    platform: {
      type: String,
      enum: ["facebook", "instagram", "google"],
      required: [true, "Platform is required"],
    },
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Product name must be less than 100 characters"],
    },
    productInfo: {
      type: String,
      required: [true, "Product information is required"],
      trim: true,
      maxlength: [1000, "Product info must be under 1000 characters"],
    },
    targetAudience: {
      type: String,
      required: [true, "Target audience is required"],
      trim: true,
      maxlength: [500, "Target audience must be under 500 characters"],
    },
    tone: {
      type: String,
      enum: ["casual", "professional", "friendly", "urgent"],
      // required: [true, "Tone is required"],
    },
    budget: {
      type: Number,
      // required: [true, "Budget is required"],
      min: [0, "Budget must be at least 0"],
    },
    durationDays: {
      type: Number,
      // required: [true, "Duration is required"],
      min: [7, "Duration must be at least 1 second"],
    },
    callToAction: {
      type: String,
      // required: [true, "Call-to-action is required"],
      trim: true,
      maxlength: [200, "Call-to-action must be under 200 characters"],
    },
    generatedScript: {
      type: String,
      // required: [true, "Generated script is required"],
      trim: true,
    },
    timeToGenerate: {
      type: Number,
      // required: [true, "Time to generate is required"],
      min: [0, "Time to generate must be at least 0 milliseconds"],
    },
    tokensUsed: {
      type: Number,
      required: [true, "Tokens used is required"],
      min: [5, "Tokens used must be at least 5"],
    },
    // If you want the ad to expire automatically after durationDays:
    expiryDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// If you use durationDays + createdAt to auto-calc expiryDate:
adScriptSchema.pre("save", function (next) {
  if (this.durationDays && this.isNew) {
    const created = this.createdAt || new Date();
    this.expiryDate = new Date(
      created.getTime() + this.durationDays * 24 * 60 * 60 * 1000
    );
  }
  next();
});

export default mongoose.model("AdScript", adScriptSchema);
