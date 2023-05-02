const express = require('express');
const router = express.Router();
const {
  getActivityById,
  getAllActivities,
  createActivity,
  updateActivity,
} = require('../db/activities');

router.get('/:activityId/routines', async (req, res, next) => {
  try {
    const { activityId } = req.params;
    const routines = await getActivityById({ id: activityId });
    res.send(routines);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const activities = await getAllActivities();
    res.send(activities);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const activity = await createActivity({ name, description });
    res.send(activity);
  } catch (error) {
    next(error);
  }
});


router.patch('/:activityId', async (req, res, next) => {
  try {
    const { activityId } = req.params;
    const { name, description } = req.body;
    const activity = await updateActivity({ id: activityId, name, description });
    res.send(activity);
  } catch (error) {
    next(error);
  }
});

module.exports = router;