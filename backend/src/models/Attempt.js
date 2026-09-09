const { Schema, model } = require("mongoose");

const submissionSchema = new Schema(
  {
    assumptions: { type: String, default: "" },
    requirements: { type: String, default: "" },
    classes: { type: String, default: "" },
    relationships: { type: String, default: "" },
    designPatterns: { type: String, default: "" },
    edgeCases: { type: String, default: "" },
    tradeOffs: { type: String, default: "" },
    pseudocode: { type: String, default: "" },
  },
  { _id: false }
);

const attemptSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  problemId: { type: Schema.Types.ObjectId, ref: "Problem", required: true },
  attemptNumber: { type: Number, required: true },
  status: {
    type: String,
    enum: ["IN_PROGRESS", "SUBMITTED", "EVALUATING", "COMPLETED", "FAILED"],
    default: "IN_PROGRESS",
  },
  submission: { type: submissionSchema, default: () => ({}) },
  evaluationId: { type: Schema.Types.ObjectId, ref: "Evaluation" },
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date },
  completedAt: { type: Date },
});

const Attempt = model("Attempt", attemptSchema);

module.exports = { Attempt };
