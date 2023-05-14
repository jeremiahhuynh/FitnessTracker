const client = require("./client");

async function addActivityToRoutine({ routineId, activityId, count, duration }) {
  try {
    const { rows: [routine_activity] } = await client.query(
      `
      INSERT INTO routine_activities ("routineId", "activityId", count, duration)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
      [routineId, activityId, count, duration]
    );
    return routine_activity;
  } catch (error) {
    console.error("Error adding activity to routine:", error);
    throw error;
  }
}

async function getRoutineActivityById(id) {
  try {
    const { rows } = await client.query(`
      SELECT * FROM routine_activities
      WHERE id=$1;
    `, [id]);

    return rows[0];
  } catch (error) {
    console.error("Error getting routine activity by id:", error);
    throw error;
  }
}

async function getRoutineActivitiesByRoutine({ id }) {
  try {
    const { rows } = await client.query(`
      SELECT * FROM routine_activities
      WHERE "routineId"=$1;
    `, [id]);

    return rows;
  } catch (error) {
    console.error("Error getting routine activities by routine:", error);
    throw error;
  }
}

async function updateRoutineActivity({ id, ...fields }) {
  try {
    const setString = Object.keys(fields).map((key, index) => `"${key}"=$${index + 2}`).join(', ');

    if (setString.length === 0) {
      return;
    }

    const { rows } = await client.query(
      `
      UPDATE routine_activities
      SET ${setString}
      WHERE id=$1
      RETURNING *;
    `,
      [id, ...Object.values(fields)]
    );

    return rows[0];
  } catch (error) {
    console.error("Error updating routine activity:", error);
    throw error;
  }
}

async function destroyRoutineActivity(id) {
  try {
    const { rows } = await client.query(`
      DELETE FROM routine_activities
      WHERE id = $1
      RETURNING *;
    `, [id]);

    return rows[0];
  } catch (error) {
    console.error("Error deleting routine activity:", error);
    throw error;
  }
}

async function canEditRoutineActivity(routineActivityId, userId) {
  try {
    const { rows } = await client.query(`
      SELECT r."creatorId"
      FROM routines r
      JOIN routine_activities ra ON r.id = ra."routineId"
      WHERE ra.id=$1;
    `, [routineActivityId]);

    const creatorId = rows[0]?.creatorId;

    return creatorId === userId;
  } catch (error) {
    console.error("Error checking if user can edit routine activity:", error);
    throw error;
  }
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
