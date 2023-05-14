const client = require('./client');

async function createActivity({ name, description }) {
  try {
    const { rows: [activities], } = await client.query(
      `
      INSERT INTO activities(name, description)
      VALUES($1, $2)
      RETURNING *;
    `,
      [name.toLowerCase(), description]
    );

    return activities;
  } catch (error) {
    console.error("Error creating activity:", error);
    throw error;
  }
}

async function getAllActivities() {
  try {
    const { rows: [activities], } = await client.query(`
      SELECT *
      FROM activities;
    `);

    return activities;
  } catch (error) {
    console.error("Error getting all activities:", error);
    throw error;
  }
}

async function getActivityById(id) {
  try {
    const { rows: [activities], } = await client.query(`
      SELECT *
      FROM activities
      WHERE id = $1;
    `,
  [id]);

    return activities;
  } catch (error) {
    console.error("Error getting activity by id:", error);
    throw error;
  }
}

async function getActivityByName(name) {
  try {
    const { rows: [activities], } = await client.query(`
      SELECT *
      FROM activities
      WHERE name = $1;
    `, [name.toLowerCase()]);

    return activities;
  } catch (error) {
    console.error("Error getting activity by name:", error);
    throw error;
  }
}

async function attachActivitiesToRoutines(routines) {
  const routinesToReturn = [...routines];
  const binds = routines.map((_, index) => `$${index + 1}`).join(', ');
  const routineIds = routines.map(routine => routine.id);
  if (!routineIds?.length) return [];
  
  try {
    const { rows: activities } = await client.query(`
      SELECT activities.*, routine_activities.duration, routine_activities.count, routine_activities.id AS "routineActivityId", routine_activities."routineId"
      FROM activities 
      JOIN routine_activities ON routine_activities."activityId" = activities.id
      WHERE routine_activities."routineId" IN (${ binds });
    `, routineIds);

    for(const routine of routinesToReturn) {
      const activitiesToAdd = activities.filter(activity => activity.routineId === routine.id);
      routine.activities = activitiesToAdd;
    }
    return routinesToReturn;
  } catch (error) {
    console.log(error);
  }
}

async function updateActivity({ id, ...fields }) {
  try {
    const setString = Object.keys(fields).map((key, index) => `"${key}"=$${index + 1}`).join(", ");
    const query = `
      UPDATE activities
      SET ${setString}
      WHERE id = ${id}
      RETURNING *;
    `;
    const { rows } = await client.query(query, Object.values(fields));

    return rows[0];
  } catch (error) {
    console.error("Error updating activity:", error);
    throw error;
  }
}

module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
};
