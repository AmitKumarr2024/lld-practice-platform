const { Schema, model } = require("mongoose");

const problemSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ["EASY", "MEDIUM", "HARD"], required: true },
  problemStatement: { type: String, required: true },
  requirements: { type: [String], default: [] },
  constraints: { type: [String], default: [] },
  active: { type: Boolean, default: true },
});

const Problem = model("Problem", problemSchema);

module.exports = { Problem };
