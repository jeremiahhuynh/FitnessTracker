const express = require("express");
const jwt = require("jsonwebtoken");
const { createUser, getUser, getUserById } = require("../db/users");
const { requireUser } = require("./utils");

const router = express.Router();

// POST /api/users/register
router.post("/register", async (req, res, next) => {
  const { username, password } = req.body;

  try {
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long.");
    }

    const newUser = await createUser({ username, password });
    const token = jwt.sign({ id: newUser.id, username: newUser.username }, process.env.JWT_SECRET);

    res.send({ user: newUser, token });
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
      throw new Error("Invalid username or password.");
    }

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET);

    res.send({ user, token });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/me
router.get("/me", requireUser, async (req, res, next) => {
  try {
    res.send(req.user);
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:username/routines
router.get("/:username/routines", requireUser, async (req, res, next) => {
  const { username } = req.params;

  try {
    const user = await getUserByUserName(username);

    if (!user) {
      throw new Error("User not found.");
    }

    const routines = await getPublicRoutinesByUser({ id: user.id });

    res.send(routines);
  } catch (error) {
    next(error);
  }
});

module.exports = router;