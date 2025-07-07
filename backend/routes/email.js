const express = require("express");
const { google } = require("googleapis");
const router = express.Router();
const Email = require("../models/Email");

const OAuth2 = google.auth.OAuth2;

router.post("/send", async (req, res) => {
  const { to, cc, subject, message } = req.body;
  const user = req.user;

  if (!user) return res.status(401).json({ message: "Not authenticated" });

  
  const toArray = Array.isArray(to)
    ? to
    : typeof to === "string" && to.length > 0
    ? to.split(",").map((email) => email.trim())
    : [];

  const ccArray = Array.isArray(cc)
    ? cc
    : typeof cc === "string" && cc.length > 0
    ? cc.split(",").map((email) => email.trim())
    : [];

  try {

    const trackingId = `${user._id}_${Date.now()}`;


    const trackingPixel = `<img src="http://localhost:5000/track/open/${trackingId}" width="1" height="1" style="display:none"/>`;
    const htmlWithTracking = message + trackingPixel;

    const rawMessage = Buffer.from(
      `To: ${toArray.join(",")}\r\n` +
      (ccArray.length > 0 ? `Cc: ${ccArray.join(",")}\r\n` : "") +
      `Subject: ${subject}\r\n` +
      `Content-Type: text/html; charset=UTF-8\r\n\r\n` +
      htmlWithTracking
    ).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');

    const oauth2Client = new OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: user.accessToken,
      refresh_token: user.refreshToken,
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: rawMessage },
    });


    const saved = await Email.create({
      sender: user.email,
      recipients: toArray,
      cc: ccArray,
      subject,
      body: message,
      trackingId,
    });

    res.status(200).json({ message: "Email sent", emailId: saved._id });
  } catch (err) {
    console.error("Email send error:", err.message);
    res.status(500).json({ message: "Email sending failed" });
  }
});


module.exports = router;
