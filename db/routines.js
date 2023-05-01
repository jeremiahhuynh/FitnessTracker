const client = require("./client");

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const { rows } = await client.query(
      `
      INSERT INTO routines(creatorId, isPublic, name, goal)
      VALUES($1, $2, $3, $4)
      RETURNING *;
    `,
      [creatorId, isPublic, name, goal]
    );

    return rows[0];
  } catch (error) {
    console.error("Error creating routine:", error);
    throw error;
  }
}

async function getRoutineById(id) {
  try {
    const { rows } = await client.query(`
      SELECT * FROM routines WHERE id = $1;
    `, [id]);

    return rows[0];
  } catch (error) {
    console.error("Error getting routine by id:", error);
    throw error;
  }
}

async function getRoutinesWithoutActivities() {
  try {
    const { rows } = await client.query(`
      SELECT * FROM routines;
    `);

    return rows;
  } catch (error) {
    console.error("Error getting routines without activities:", error);
    throw error;
  }
}

async function getAllRoutines() {
  try {
    const { rows } = await client.query(`
      SELECT * FROM routines;
    `);

    return rows;
  } catch (error) {
    console.error("Error getting all routines:", error);
    throw error;
  }
}

async function getAllPublicRoutines() {
  try {
    const { rows } = await client.query(`
      SELECT * FROM routines WHERE isPublic = true;
    `);

    return rows;
  } catch (error) {
    console.error("Error getting all public routines:", error);
    throw error;
  }
}

async function getAllRoutinesByUser({ username }) {
  try {
    const { rows } = await client.query(`
      SELECT * FROM routines
      WHERE creatorId = (
        SELECT id FROM users WHERE username = $1
      );
    `, [username]);

    return rows;
  } catch (error) {
    console.error("Error getting all routines by user:", error);
    throw error;
  }
}

async function getPublicRoutinesByUser({ username }) {
  try {
    const { rows } = await client.query(`
      SELECT * FROM routines
      WHERE isPublic = true AND creatorId = (
        SELECT id FROM users WHERE username = $1
      );
    `, [username]);

    return rows;
  } catch (error) {
    console.error("Error getting public routines by user:", error);
    throw error;
  }
}

async function getPublicRoutinesByActivity({ id }) {
  try {
    const { rows } = await client.query(`
      SELECT * FROM routines
      WHERE isPublic = true AND id IN (
        SELECT routineId FROM routine_activities WHERE activityId = $1
      );
    `, [id]);

    return rows;
  } catch (error) {
    console.error("Error getting public routines by activity:", error);
    throw error;
  }
}

async function updateRoutine({ id, ...fields }) {
  try {
    const setString = Object.keys(fields).map((key, index) => `"${key}"=$${index + 2}`).join(', ');

    if (setString.length === 0) {
      return;
    }

    const { rows } = await client.query(
      `
      UPDATE routines
      SET ${setString}
      WHERE id=$1
      RETURNING *;
    `,
      [id, ...Object.values(fields)]
    );

    return rows[0];
  } catch (error) {
    console.error("Error updating routine:", error);
    throw error;
  }
}

async function destroyRoutine(id) {
  try {
    await client.query(`
      DELETE FROM routine_activities WHERE "routineId"=$1;
    `, [id]);

    const { rows } = await client.query(`
      DELETE FROM routines WHERE id=$1
      RETURNING *;
    `, [id]);

    return rows[0];
  } catch (error) {
    console.error("Error deleting routine:", error);
    throw error;
  }
}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};
