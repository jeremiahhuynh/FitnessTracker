const jwt = require("jsonwebtoken");
const { getUserById } = require("./users");
const { getRoutineById } = require("./routines");
const JWT_SECRET = process.env.JWT_SECRET;

async function requireUser(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).send("You must be logged in to perform this action.");
  }

  try {
    const { id } = jwt.verify(token, JWT_SECRET);
    const user = await getUserById(id);

    if (!user) {
      return res.status(401).send("Invalid token.");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

async function requireMatchingUser(req, res, next) {
    const { user } = req;
    const { routineId } = req.params;
    if (!user) {
      return res.status(401).send({
        name: "MissingUserError",
        message: "You must be logged in to perform this action.",
      });
    }
  
    try {
      const routine = await getRoutineById(routineId);
      if (routine.creatorId !== user.id) {
        return res.status(403).send({
          name: "UserMismatchError",
          message: "You do not have permission to perform this action.",
        });
      }
      next();
    } catch (error) {
      next(error);
    }
  }

module.exports = {
  requireUser,
  requireMatchingUser
};