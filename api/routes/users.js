const express = require("express");
const router = express.Router();
const { isLoggedIn, isAdmin } = require("#root/api/middleware");
const bcrypt = require("bcryptjs");

// Login User
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email) return res.status(400).send(`email is required`);
  if (!password) return res.status(400).send(`password is required`);

  if (req.session.authenticated) {
    res.json(req.session);
  } else {
    const user = await req.core.getUserByEmail(email, true);
    if (!user) {
      return res.status(403).send("Invalid email");
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(403).send("Invalid password");
    }

    req.session.authenticated = true;
    // Returns Object as Cookie to the User, but without password
    req.session.user = { name: user.name, lastName: user.lastName, email: user.email, companyName: user.companyName, isAdmin: user.isAdmin, userId: user.userId };

    res.status(200).send("Logged in successfully");
  }
});

// Logout user
router.post("/logout", isLoggedIn, async (req, res) => {
  if (req.session.authenticated) {
    req.session.destroy();
    res.status(200).send("Logged out successfully");
  }
});

// Creates user, Register
router.post("", isLoggedIn, isAdmin, async (req, res) => {
  const { name, lastName, email, companyName, password, isAdmin } = req.body;
  if (!name || name.length > req.core.cfg.varChar.userNameMaxLength) return res.status(400).send(`name is required and needs to be of max length ${req.core.cfg.varChar.userNameMaxLength}`);
  if (!lastName || lastName.length > req.core.cfg.varChar.userLastNameMaxLength) return res.status(400).send(`lastName is required and needs to be of max length ${req.core.cfg.varChar.userLastNameMaxLength}`);
  if (!email || email.length > req.core.cfg.varChar.emailMaxLength) return res.status(400).send(`email is required and needs to be of max length ${req.core.cfg.varChar.emailMaxLength}`);
  if (!companyName || companyName.length > req.core.cfg.varChar.companyNameMaxLength) return res.status(400).send(`companyName is required and needs to be of max length ${req.core.cfg.varChar.companyNameMaxLength}`);

  if (!password || password.length < 5) return res.status(400).send(`password is required with length of at least 5 characters`);

  const userExists = await req.core.getUserByEmail(email);
  if (userExists) {
    return res.status(404).send("User with this email already exists");
  }

  const user = await req.core.createUser(name, lastName, email, companyName, password, false);
  res.status(201).send(user);
});

// Get user
router.get("/:userId", isLoggedIn, isAdmin, async (req, res) => {
  const { userId } = req.params;
  const user = await req.core.getUser(userId);
  if (user) {
    res.status(200).send(user);
  } else {
    res.status(404).send("Specified user was not found");
  }
});

// Delete User
// Does not delete users Services!
router.delete("/:userId", isLoggedIn, isAdmin, async (req, res) => {
  const { userId } = req.params;
  const user = await req.core.getUser(userId);
  if (user) {
    const isDeleted = user.delete();
    if (isDeleted) {
      res.status(200).send("Specified user was deleted");
    } else {
      res.status(404).send("Unable to delete specified user");
    }
  } else {
    res.status(404).send("Specified user was not found");
  }
});

module.exports = router;