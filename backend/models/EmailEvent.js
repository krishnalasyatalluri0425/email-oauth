const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  emailId: { type: mongoose.Schema.Types.ObjectId, ref: "Email" },
  trackingId: String,
  eventType: { type: String, enum: ["open", "click", "reply", "forward"] },
  timestamp: { type: Date, default: Date.now },
  ip: String,
  userAgent: String,
});

module.exports = mongoose.model("EmailEvent", eventSchema);
