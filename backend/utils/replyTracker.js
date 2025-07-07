const { google } = require("googleapis");
const Email = require("../models/Email");
const EmailEvent = require("../models/EmailEvent");
const User = require("../models/User");

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

async function pollRepliesForEmail(emailId) {
  const email = await Email.findById(emailId);
  if (!email || !email.threadId) return [];

  const user = await User.findOne({ email: email.sender });
  if (!user || !user.accessToken || !user.refreshToken) return [];

  oauth2Client.setCredentials({
    access_token: user.accessToken,
    refresh_token: user.refreshToken,
  });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  const { data } = await gmail.users.threads.get({
    userId: "me",
    id: email.threadId,
  });

  const messages = data.messages.slice(1); // skip original
  const created = [];

  for (const msg of messages) {
    const msgId = msg.id;
    const exists = await EmailEvent.findOne({
      emailId,
      eventType: "reply",
      metadata: msgId,
    });
    if (exists) continue;

    await EmailEvent.create({
      emailId,
      trackingId: email.trackingId,
      eventType: "reply",
      timestamp: new Date(Number(msg.internalDate)),
      metadata: msgId,
    });

    created.push(msgId);
  }

  return created;
}

module.exports = { pollRepliesForEmail };
