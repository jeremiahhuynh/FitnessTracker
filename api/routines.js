const express = require('express');
const router = express.Router();
const {
  getAllRoutines,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  addActivityToRoutine
} = require('../db/routines');
const { requireUser, requireMatchingUser } = require('./utils');

router.get('/', async (req, res, next) => {
  try {
    const routines = await getAllRoutines();
    res.send(routines);
  } catch (error) {
    next(error);
  }
});

router.post('/', requireUser, async (req, res, next) => {
  try {
    const { name, goal, isPublic } = req.body;
    const newRoutine = await createRoutine({
      creatorId: req.user.id,
      name,
      goal,
      isPublic
    });
    res.send(newRoutine);
  } catch (error) {
    next(error);
  }
});

router.patch('/:routineId', requireMatchingUser, async (req, res, next) => {
  try {
    const { routineId } = req.params;
    const fields = req.body;
    const updatedRoutine = await updateRoutine({ id: routineId, ...fields });
    res.send(updatedRoutine);
  } catch (error) {
    next(error);
  }
});

router.delete('/:routineId', requireMatchingUser, async (req, res, next) => {
  try {
    const { routineId } = req.params;
    await deleteRoutine(routineId);
    res.send({ message: 'Routine deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

router.post('/:routineId/activities', requireMatchingUser, async (req, res, next) => {
  try {
    const { routineId } = req.params;
    const { activityId, count, duration } = req.body;
    const addedActivity = await addActivityToRoutine({
      routineId,
      activityId,
      count,
      duration
    });
    res.send(addedActivity);
  } catch (error) {
    next(error);
  }
});

module.exports = router;