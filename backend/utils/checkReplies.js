const { google } = require("googleapis");
const Email = require("../models/Email");
const EmailEvent = require("../models/EmailEvent");

async function checkRepliesForUser(user) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: user.accessToken,
    refresh_token: user.refreshToken,
  });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  const sentEmails = await Email.find({ sender: user.email });

  for (const email of sentEmails) {
    const threadId = email.threadId;
    if (!threadId) continue;

    const res = await gmail.users.messages.list({
      userId: "me",
      q: `threadId:${threadId}`,
    });

    const messages = res.data.messages || [];

    for (const msg of messages) {
      const msgDetails = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
      });

      const headers = msgDetails.data.payload.headers;
      const fromHeader = headers.find((h) => h.name === "From");
      const fromEmail = fromHeader?.value;

      // Skip self-sent messages
      if (fromEmail && fromEmail.includes(user.email)) continue;

      const existingReply = await EmailEvent.findOne({
        emailId: email._id,
        eventType: "reply",
        externalMessageId: msg.id,
      });

      if (!existingReply) {
        await EmailEvent.create({
          emailId: email._id,
          trackingId: email.trackingId,
          eventType: "reply",
          ip: "", // unknown
          userAgent: "", // unknown
          externalMessageId: msg.id,
        });
      }
    }
  }
}

module.exports = { checkRepliesForUser };
