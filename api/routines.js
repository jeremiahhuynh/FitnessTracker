const express = require('express');
const router = express.Router();
const {
  getAllRoutines,  
  createRoutine, 
  canEditRoutine, 
  destroyRoutine, 
  getRoutineById, 
  updateRoutine
} = require('../db/routines');
const { addActivityToRoutine } = require('../db/routine_activities');
const { attachActivitiesToRoutines } = require('../db/activities');
const { getRoutineActivitiesByRoutine } = require('../db/routine_activities');
const jwt = require("jsonwebtoken");

router.get('/', async (req, res, next) => {
  try {
      const allRoutines = await getAllRoutines();
      const activitiesAndRoutines = await attachActivitiesToRoutines(allRoutines);
      res.send(activitiesAndRoutines);
  } catch (error) {
         next(error);
         console.log(error)

  }
})

router.post('/', async (req, res, next) => {
  try {

      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
          res.status(403);
          next({
              name: "UnauthorizedError",
              message: `You must be logged in to perform this action`,
          });
      }

      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      if (!decodedToken) {
          return res.status(401).json({ success: false, message: "Invalid token" });
      }

      const { id: userId, username: userName } = decodedToken;
      const { isPublic, name, goal } = req.body;

      const newRoutine = await createRoutine({ creatorId: userId, isPublic, name, goal });
      res.send(newRoutine);
  } catch (error) {
      next(error);
  }
});

router.patch('/:routineId', async (req, res, next) => {
  try {
    const { routineId } = req.params;
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(403);
      next({
        name: "UnauthorizedError",
        message: "You must be logged in to perform this action",
      });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const userId = decodedToken.id;
    const { isPublic, name, goal } = req.body;
    const canEdit = await canEditRoutine(routineId, userId);
    const username = decodedToken.username;

    if (!canEdit) {
      res.status(403);
      next({
        name: "UnauthorizedError",
        message: `User ${username} is not allowed to update Every day`,
      });
    }

    const routine = await getRoutineById(routineId);
    if (!routine) {
      return res.status(404).send('Routine not found');
    }

    const updatedFields = {};

    if (isPublic !== undefined) {
      updatedFields.isPublic = isPublic;
    }
    if (name) {
      updatedFields.name = name;
    }
    if (goal) {
      updatedFields.goal = goal;
    }

    const updatedRoutine = await updateRoutine({ id: routineId, ...updatedFields });
    res.send(updatedRoutine);
  } catch (error) {
   
    next(error);
  }
});

router.delete("/:routineId", async (req, res, next) => {
  try {
      const { routineId } = req.params;
      const token = req.headers.authorization?.split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decodedToken.id;
      const userName = decodedToken.username;

      const canEdit = await canEditRoutine(routineId, userId);

      
      if (!canEdit) {
          res.status(403);
          next({
              name: "UnauthorizedError",
              message: `User ${userName} is not allowed to delete On even days`,
          });
      }

     
      const destoryedRoutineActivity = await destroyRoutine(
          routineId
      );

      res.send(destoryedRoutineActivity);
  } catch (error) {
      next(error);
  }
});

router.post('/:routineId/activities', async (req, res, next) => {
  try {
    const { routineId } = req.params;
    const { activityId, count, duration } = req.body;

    const routine = await getRoutineById(routineId);
    if (!routine) {
      console.log('Routine not found');
      return res.status(404).send('Routine not found');
    }

    console.log('Routine:', routine);

    const token = req.headers.authorization?.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;
    const canEdit = await canEditRoutine(routineId, userId);
    const username = decodedToken.username;

    if (!canEdit) {
      console.log(`User ${username} is not allowed to add activities to the routine`);
      res.status(403);
      next({
        name: "UnauthorizedError",
        message: `User ${username} is not allowed to add activities to the routine`,
      });
    }

    const routineCheck = await getRoutineActivitiesByRoutine({ id: routineId });

const isDuplicate = routineCheck.some(activity => activity.activityId === activityId);
  if (isDuplicate) {
    
    res.status(400);
    next({
      name: "BadRequestError",
      message: `Activity ID ${activityId} already exists in Routine ID ${routineId}`,
    });
  }

    const addedActivity = await addActivityToRoutine({
      routineId: routineId,
      activityId: activityId,
      count: count,
      duration: duration, 
    });     

    res.send(addedActivity);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;