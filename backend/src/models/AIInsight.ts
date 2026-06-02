import mongoose from "mongoose";

const aiInsightSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    insights: { type: mongoose.Schema.Types.Mixed, required: true }, // array of insight objects
    dataSnapshot: { type: mongoose.Schema.Types.Mixed }, 
  },
  { timestamps: true } 
);

export default mongoose.model("AIInsight", aiInsightSchema);