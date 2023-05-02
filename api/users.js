const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { createUser, getUser, getUserByUserName } = require("../db/users");
const { getPublicRoutinesByUser } = require("../db/routines");
const { JWT_SECRET } = process.env;
const { requireUser } = require('../db/utils');

// POST /api/users/register
router.post("/register", async (req, res, next) => {
  const { username, password } = req.body;

  if (password.length < 8) {
    return res.status(400).send("Password must be at least 8 characters long");
  }

  try {
    const existingUser = await getUserByUserName(username);
    if (existingUser) {
      return res.status(409).send("Username already exists");
    }

    const newUser = await createUser({ username, password });
    const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET);

    res.status(201).send({ user: newUser, token });
  } catch (error) {
    next(error);
  }
});

// POST /api/users/login
router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await getUser({ username, password });
    if (!user) {
      return res.status(401).send("Invalid username or password");
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);

    res.status(200).send({ user, token });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/me
router.get("/me", requireUser, async (req, res) => {
  try {
    res.send(req.user);
  } catch (error) {
    console.error("Error getting user data:", error);
    res.status(500).send("Internal server error");
  }
});

// GET /api/users/:username/routines
router.get("/:username/routines", async (req, res, next) => {
  const { username } = req.params;

  try {
    const user = await getUserByUserName(username);

    if (!user) {return res.status(404).send("User not found");
}

const routines = await getPublicRoutinesByUser({ username });
res.status(200).send(routines);
} catch (error) {
next(error);
}
});

module.exports = router;