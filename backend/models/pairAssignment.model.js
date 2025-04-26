// pair.assignment.model.js
const mongoose = require("mongoose");

const pairAssignmentSchema = new mongoose.Schema({
  branchId: { type: String, required: true },
  day: { 
    type: String, 
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    required: true 
  },
  members: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "BranchUser",
    required: true 
  }],
  lastNotified: { type: Date }
});

module.exports = mongoose.model("PairAssignment", pairAssignmentSchema);