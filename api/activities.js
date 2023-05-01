const express = require('express');
const router = express.Router();
const {
  getActivityById,
  getAllActivities,
  createActivity,
  updateActivity,
  getPublicRoutinesByActivity
} = require('../db/activities');

// GET /api/activities/:activityId/routines
router.get('/:activityId/routines', async (req, res, next) => {
  try {
    const { activityId } = req.params;
    const routines = await getPublicRoutinesByActivity({ id: activityId });
    res.send(routines);
  } catch (error) {
    next(error);
  }
});

// GET /api/activities
router.get('/', async (req, res, next) => {
  try {
    const activities = await getAllActivities();
    res.send(activities);
  } catch (error) {
    next(error);
  }
});

// POST /api/activities
router.post('/', async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const activity = await createActivity({ name, description });
    res.send(activity);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/activities/:activityId
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