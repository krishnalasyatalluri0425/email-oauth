// require("dotenv").config();
// const express = require("express");
// const mongoose = require("mongoose");
// const session = require("cookie-session");
// const passport = require("passport");
// const cors = require("cors");

// require("./config/passport");

// const app = express();
// app.use(cors({ origin: "http://localhost:3000", credentials: true }));
// app.use(
//   session({
//     maxAge: 24 * 60 * 60 * 1000,
//     keys: [process.env.SESSION_SECRET],
//   })
// );
// app.use(passport.initialize());
// app.use(passport.session());

// mongoose.connect(process.env.MONGO_URI).then(() => console.log("MongoDB Connected"));

// app.use("/auth", require("./routes/auth"));

// app.listen(process.env.PORT, () =>
//   console.log(`Server running on http://localhost:${process.env.PORT}`)
// );
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session"); // ✅ Fixed: use express-session
const passport = require("passport");
const cors = require("cors");

require("./config/passport");

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// ✅ Setup session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ✅ Routes
app.use("/auth", require("./routes/auth"));
app.use("/email", require("./routes/email"));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
