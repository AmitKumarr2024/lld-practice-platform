const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["LEARNER", "ADMIN"], default: "LEARNER" },
  createdAt: { type: Date, default: Date.now },
});

const User = model("User", userSchema);

module.exports = { User };
