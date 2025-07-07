// 📁 cron.js
const cron = require("node-cron");
const User = require("./models/User");
const { checkRepliesForUser } = require("./utils/checkReplies");

cron.schedule("*/5 * * * *", async () => {
  const users = await User.find({ accessToken: { $exists: true } });
  for (const user of users) {
    try {
      await checkRepliesForUser(user);
      console.log(`✅ Checked replies for ${user.email}`);
    } catch (err) {
      console.error(`❌ Reply check failed for ${user.email}`, err);
    }
  }
});
