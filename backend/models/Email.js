const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  recipients: [String],
  cc: [String],
  subject: String,
  body: String,
  platform: { type: String, default: "Gmail" },
  status: { type: String, default: "sent" },
  trackingId: { type: String, unique: true },
  sentAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Email", emailSchema);
