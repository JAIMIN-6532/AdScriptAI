import mongoose from 'mongoose';

const adScriptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // assuming your User microservice’s User _id is stored here
      required: true,
    },
    campaignName: {
      type: String,
      required: [true, 'Campaign name is required'],
      trim: true,
      maxlength: [100, 'Campaign name must be less than 100 characters'],
    },
    productInfo: {
      type: String,
      required: [true, 'Product information is required'],
      trim: true,
      maxlength: [1000, 'Product info must be under 1000 characters'],
    },
    targetAudience: {
      type: String,
      required: [true, 'Target audience is required'],
      trim: true,
      maxlength: [500, 'Target audience must be under 500 characters'],
    },
    callToAction: {
      type: String,
      required: [true, 'Call-to-action is required'],
      trim: true,
      maxlength: [200, 'Call-to-action must be under 200 characters'],
    },
    scriptText: {
      type: String,
      required: [true, 'Generated script text is required'],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('AdScript', adScriptSchema);
