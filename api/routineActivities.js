const express = require('express');
const router = express.Router();
const {
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity
} = require('../db/routine_activities');
const { requireMatchingUser } = require('../db/utils');
const jwt = require("jsonwebtoken");

router.patch("/:routineActivityId", async (req, res, next) => {
  try {
    const { routineActivityId } = req.params;
    const { count, duration } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;
    const userName = decodedToken.username;

    const canEdit = await canEditRoutineActivity(routineActivityId, userId);

    if (!canEdit) {
      res.status(401);
      return next({
        name: "UnauthorizedError",
        message: `User ${userName} is not allowed to update In the evening`,
      });
    }
    const updatedRoutineActivity = await updateRoutineActivity({
      id: routineActivityId,
      count,
      duration,
    });

    res.send(updatedRoutineActivity);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.delete('/:routineActivityId', requireMatchingUser, async (req, res, next) => {
  try {
    const { routineActivityId } = req.params;
    await destroyRoutineActivity(routineActivityId);
    res.send({ message: 'Routine activity deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;