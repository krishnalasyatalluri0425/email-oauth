// const express = require("express");
// const passport = require("passport");
// const router = express.Router();

// router.get("/google", passport.authenticate("google", { session: true }));

// router.get(
//   "/google/callback",
//   passport.authenticate("google", {
//     failureRedirect: "/auth/failure",
//     session: true,
//   }),
//   (req, res) => {
//     res.redirect("http://localhost:3000/dashboard"); // React frontend
//   }
// );

// router.get("/logout", (req, res) => {
//   req.logout(() => {
//     res.redirect("/");
//   });
// });

// router.get("/me", (req, res) => {
//   res.send(req.user);
// });

// module.exports = router;
const express = require("express");
const passport = require("passport");
const router = express.Router();


router.get(
  "/google",
  passport.authenticate("google", {
    session: true,
    prompt: "select_account", 
  })
);


router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/failure",
    session: true,
  }),
  (req, res) => {
    res.redirect("http://localhost:3000/dashboard");
  }
);


router.get("/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid"); 
      res.redirect("http://localhost:3000/");
    });
  });
});


router.get("/me", (req, res) => {
  res.send(req.user);
});

module.exports = router;
