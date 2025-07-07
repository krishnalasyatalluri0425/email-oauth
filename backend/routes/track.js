const express = require("express");
const Email = require("../models/Email");
const EmailEvent = require("../models/EmailEvent");
const { pollRepliesForEmail } = require("../utils/replyTracker");
const router = express.Router();

// 1. Open Tracking
router.get("/open/:trackingId", async (req, res) => {
  const { trackingId } = req.params;
  const ip = req.ip;
  const ua = req.headers["user-agent"];
  const email = await Email.findOne({ trackingId });
  if (email) {
    // create open event if not recorded for this UA/IP
    const exists = await EmailEvent.findOne({ emailId: email._id, eventType: "open", ip, userAgent: ua });
    if (!exists) await EmailEvent.create({ emailId: email._id, trackingId, eventType: "open", ip, userAgent: ua });
    // detect forward if multiple distinct UA/IP
    const opens = await EmailEvent.find({ emailId: email._id, eventType: "open" });
    const combos = new Set(opens.map(o => o.ip + '|' + o.userAgent));
    if (combos.size >= 2) {
      const hasForward = await EmailEvent.findOne({ emailId: email._id, eventType: "forward" });
      if (!hasForward) await EmailEvent.create({ emailId: email._id, trackingId, eventType: "forward", ip, userAgent: ua });
    }
  }
  const pixel = Buffer.from("R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==", "base64");
  res.set("Content-Type", "image/gif");
  res.send(pixel);
});

router.post("/poll-replies/:emailId", async (req, res) => {
  try {
    const replies = await pollRepliesForEmail(req.params.emailId);
    res.status(200).json({ success: true, replies });
  } catch (err) {
    console.error("Reply polling error:", err);
    res.status(500).json({ success: false, message: "Failed to poll replies" });
  }
});

// 2. Click Tracking
router.get("/click/:trackingId", async (req, res) => {
  const { trackingId } = req.params;
  const { url } = req.query;
  const ip = req.ip;
  const ua = req.headers["user-agent"];
  const email = await Email.findOne({ trackingId });
  if (email && url) {
    await EmailEvent.create({ emailId: email._id, trackingId, eventType: "click", ip, userAgent: ua });
    return res.redirect(decodeURIComponent(url));
  }
  return res.status(400).send("Invalid click");
});

// 3. Polling for Replies (cron or periodic endpoint)
// router.post("/poll-replies/:emailId", async (req, res) => {
//   const { emailId } = req.params;
//   try {
//     const events = await pollRepliesForEmail(emailId);
//     res.json({ message: "ok", eventsCount: events.length });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Polling failed' });
//   }
// });

// 4. Fetch tracking events
router.get("/email/:emailId", async (req, res) => {
  try {
    console.log("📥 Fetching events for:", req.params.emailId);
    const events = await EmailEvent.find({ emailId: req.params.emailId }).sort({ timestamp: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Fetch events failed" });
  }
});



module.exports = router;
