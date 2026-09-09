const { Schema, model } = require("mongoose");

const criterionSchema = new Schema(
  {
    criterion: { type: String, required: true },
    score: { type: Number, required: true },
    maxScore: { type: Number, required: true },
    evidence: { type: String, default: "" },
    concern: { type: String, default: "" },
    suggestion: { type: String, default: "" },
  },
  { _id: false }
);

const evaluationSchema = new Schema({
  attemptId: { type: Schema.Types.ObjectId, ref: "Attempt", required: true },
  evaluatorId: { type: Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "FAILED"], default: "PENDING" },
  totalScore: { type: Number, default: 0 },
  criteria: { type: [criterionSchema], default: [] },
  strengths: { type: [String], default: [] },
  improvements: { type: [String], default: [] },
  nextAttemptFocus: { type: [String], default: [] },
  generalFeedback: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

const Evaluation = model("Evaluation", evaluationSchema);

module.exports = { Evaluation };
