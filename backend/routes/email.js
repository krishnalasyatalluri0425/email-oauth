const express = require("express");
const { google } = require("googleapis");
const router = express.Router();
const Email = require("../models/Email");
const User = require("../models/User");
const { checkRepliesForUser } = require("../utils/checkReplies");
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const requireAuth=require("../middlewares/requireAuth")
const cheerio=require("cheerio")
const { pollRepliesForEmail } = require("../utils/replyTracker");
// router.post("/send", async (req, res) => {
//   const { to, cc, subject, message, trackLinks } = req.body;
//   const user = req.user;

//   if (!user) return res.status(401).json({ message: "Not authenticated" });

//   const toArray = Array.isArray(to)
//     ? to
//     : (to || "").split(",").map(e => e.trim()).filter(Boolean);
//   const ccArray = Array.isArray(cc)
//     ? cc
//     : (cc || "").split(",").map(e => e.trim()).filter(Boolean);

//   const allEmails = [...toArray, ...ccArray];
//   const invalidEmails = allEmails.filter(email => !isValidEmail(email));
//   if (invalidEmails.length > 0) {
//     return res.status(400).json({ message: `Invalid emails: ${invalidEmails.join(", ")}` });
//   }

//   // 🔁 Generate unique tracking ID
//   const trackingId = `${user._id}_${Date.now()}`;

//   // 🖊️ Add tracking pixel + link wrapping
//   let htmlWithTracking = message;
//   if (trackLinks) {
//     const $ = cheerio.load(htmlWithTracking);
//     $("a[href]").each(function () {
//       const originalUrl = $(this).attr("href");
//       const encodedUrl = encodeURIComponent(originalUrl);
//       $(this).attr("href", `http://localhost:5000/track/click/${trackingId}?url=${encodedUrl}`);
//     });
//     htmlWithTracking = $.html();
//   }

//   htmlWithTracking += `<img src="http://localhost:5000/track/open/${trackingId}" width="1" height="1" style="display:none"/>`;

//   // 📨 Encode message
//   const rawMessage = Buffer.from(
//     `To: ${toArray.join(",")}\r\n` +
//     (ccArray.length ? `Cc: ${ccArray.join(",")}\r\n` : "") +
//     `Subject: ${subject}\r\n` +
//     `Content-Type: text/html; charset=UTF-8\r\n\r\n` +
//     htmlWithTracking
//   )
//     .toString("base64")
//     .replace(/\+/g, "-")
//     .replace(/\//g, "_")
//     .replace(/=+$/, "");

//   // 📩 Gmail API Setup
//   const oauth2Client = new google.auth.OAuth2(
//     process.env.GOOGLE_CLIENT_ID,
//     process.env.GOOGLE_CLIENT_SECRET,
//     process.env.GOOGLE_REDIRECT_URI
//   );

//   oauth2Client.setCredentials({
//     access_token: user.accessToken,
//     refresh_token: user.refreshToken,
//   });

//   oauth2Client.on("tokens", async (tokens) => {
//     const updated = await User.findById(user._id);
//     if (tokens.access_token) updated.accessToken = tokens.access_token;
//     if (tokens.refresh_token) updated.refreshToken = tokens.refresh_token;
//     await updated.save();
//   });

//   const gmail = google.gmail({ version: "v1", auth: oauth2Client });

//   // 🔁 Retry logic
//   const sendEmailWithRetry = async (attempt = 1) => {
//     try {
//       return await gmail.users.messages.send({
//         userId: "me",
//         requestBody: { raw: rawMessage },
//       });
//     } catch (err) {
//       if (err.code === 429 && attempt <= 3) {
//         const wait = attempt * 1000;
//         await new Promise((r) => setTimeout(r, wait));
//         return sendEmailWithRetry(attempt + 1);
//       }
//       throw err;
//     }
//   };

//   try {
//     const sent = await sendEmailWithRetry();
//     const threadId = sent.data.threadId;

//     const saved = await Email.create({
//       sender: user.email,
//       recipients: toArray,
//       cc: ccArray,
//       subject,
//       body: message,
//       trackingId,
//       platform: "Gmail",
//       threadId,
//     });

//     res.status(200).json({ message: "✅ Email sent", emailId: saved._id });
//   } catch (err) {
//     console.error("Email send failed:", err.message);
//     res.status(500).json({ message: "❌ Failed to send email" });
//   }
// });
router.post("/send", async (req, res) => {
  const { to, cc, subject, message, trackLinks } = req.body;
  const user = req.user;

  if (!user) return res.status(401).json({ message: "Not authenticated" });

  const toArray = Array.isArray(to)
    ? to
    : (to || "").split(",").map(e => e.trim()).filter(Boolean);
  const ccArray = Array.isArray(cc)
    ? cc
    : (cc || "").split(",").map(e => e.trim()).filter(Boolean);

  const allEmails = [...toArray, ...ccArray];
  const invalidEmails = allEmails.filter(email => !isValidEmail(email));
  if (invalidEmails.length > 0) {
    return res.status(400).json({ message: `Invalid emails: ${invalidEmails.join(", ")}` });
  }
// 🔎 Check if same email (to + subject) was sent within last 2 minutes
const recentDuplicate = await Email.findOne({
  sender: user.email,
  recipients: toArray,
  subject,
  sentAt: { $gte: new Date(Date.now() - 2 * 60 * 1000) }
});
if (recentDuplicate) {
  return res.status(200).json({ message: "Email already sent recently", emailId: recentDuplicate._id });
}


const trackingId = `${user._id}_${Date.now()}`;



  let htmlWithTracking = message;
  if (trackLinks) {
    const $ = cheerio.load(htmlWithTracking);
    $("a[href]").each(function () {
      const originalUrl = $(this).attr("href");
      const encodedUrl = encodeURIComponent(originalUrl);
      $(this).attr("href", `http://localhost:5000/track/click/${trackingId}?url=${encodedUrl}`);
    });
    htmlWithTracking = $.html();
  }

  htmlWithTracking += `<img src="http://localhost:5000/track/open/${trackingId}" width="1" height="1" style="display:none"/>`;

  // 📨 Encode message
  const rawMessage = Buffer.from(
    `To: ${toArray.join(",")}\r\n` +
    (ccArray.length ? `Cc: ${ccArray.join(",")}\r\n` : "") +
    `Subject: ${subject}\r\n` +
    `Content-Type: text/html; charset=UTF-8\r\n\r\n` +
    htmlWithTracking
  )
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  // 📩 Gmail API Setup
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: user.accessToken,
    refresh_token: user.refreshToken,
  });

  oauth2Client.on("tokens", async (tokens) => {
    const updated = await User.findById(user._id);
    if (tokens.access_token) updated.accessToken = tokens.access_token;
    if (tokens.refresh_token) updated.refreshToken = tokens.refresh_token;
    await updated.save();
  });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  const sendEmailWithRetry = async (attempt = 1) => {
    try {
      console.log(`📤 Attempt ${attempt}: Sending email...`);
      return await gmail.users.messages.send({
        userId: "me",
        requestBody: { raw: rawMessage },
      });
    } catch (err) {
      if (err.code === 429 && attempt <= 3) {
        const wait = attempt * 1000;
        console.warn(`⏳ Rate limited. Retrying in ${wait}ms...`);
        await new Promise((r) => setTimeout(r, wait));
        return sendEmailWithRetry(attempt + 1);
      }
      throw err;
    }
  };

  try {
    const sent = await sendEmailWithRetry();
    console.log("✅ Email sent. Gmail thread ID:", sent.data.threadId);

    const saved = await Email.create({
      sender: user.email,
      recipients: toArray,
      cc: ccArray,
      subject,
      body: message,
      trackingId,
      platform: "Gmail",
      threadId: sent.data.threadId,
      status: "sent",
      sentAt: new Date()
    });

    res.status(200).json({ message: "✅ Email sent", emailId: saved._id });
  } catch (err) {
    console.error("❌ Email send failed:", err.message);
    res.status(500).json({ message: "❌ Failed to send email" });
  }
});

router.get("/sent", requireAuth, async (req, res) => {
  try {
    const emails = await Email.find({ sender: req.user.email, status: "sent" }).sort({ sentAt: -1 });
    res.json(emails);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sent emails" });
  }
});

router.get("/pending", requireAuth, async (req, res) => {
  try {
    const emails = await Email.find({ sender: req.user.email, status: "pending" }).sort({ createdAt: -1 });
    res.json(emails);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pending emails" });
  }
});
router.get("/check-replies", requireAuth, async (req, res) => {
  try {
    await checkRepliesForUser(req.user);
    res.json({ message: "Replies checked" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Reply check failed" });
  }
});

router.post("/poll-replies/:emailId", async (req, res) => {
  try {
    const { emailId } = req.params;
    const replies = await pollRepliesForEmail(emailId);
    res.status(200).json({ success: true, replies });
  } catch (err) {
    console.error("Reply polling error:", err);
    res.status(500).json({ success: false, message: "Failed to poll replies" });
  }
});
module.exports = router;

