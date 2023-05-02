const express = require('express');
const router = express.Router();

router.get('/health', async (req, res, next) => {
  try {
    res.send({ message: 'Server is up and running!' });
  } catch (error) {
    next(error);
  }
});

const usersRouter = require('./users');
router.use('/users', usersRouter);

const activitiesRouter = require('./activities');
router.use('/activities', activitiesRouter);

const routinesRouter = require('./routines');
router.use('/routines', routinesRouter);

const routineActivitiesRouter = require('./routineActivities');
router.use('/routine_activities', routineActivitiesRouter);

module.exports = router;