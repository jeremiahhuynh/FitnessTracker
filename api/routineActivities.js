const express = require('express');
const router = express.Router();
const {
  updateRoutineActivity,
  destroyRoutineActivity,
} = require('../db/routine_activities');
const { requireMatchingUser } = require('../db/utils');

router.patch('/:routineActivityId', requireMatchingUser, async (req, res, next) => {
  try {
    const { routineActivityId } = req.params;
    const fields = req.body;
    const updatedRoutineActivity = await updateRoutineActivity({
      id: routineActivityId,
      ...fields
    });
    res.send(updatedRoutineActivity);
  } catch (error) {
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