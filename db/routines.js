const client = require("./client");
const {attachActivitiesToRoutines} = require("./activities");

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
      SELECT * FROM routines
      WHERE id NOT IN (
      SELECT "routineId" FROM routine_activities
      );
    `);

    return rows;
  } catch (error) {
    console.error("Error getting routines without activities:", error);
    throw error;
  }
}

async function getAllRoutines() {
  try {
    const { rows: routines } = await client.query(`
      SELECT routines.*, users.username AS "creatorName" FROM routines
      JOIN users ON routines."creatorId" = users.id
`);  
    return await attachActivitiesToRoutines(routines);
  } catch (error) {
    console.log(error);
  }
}

async function getAllPublicRoutines() {
  try {
    const { rows: routines } = await client.query(`
      SELECT routines.*, users.username AS "creatorName" FROM routines
      JOIN users ON routines."creatorId" = users.id
      WHERE "isPublic" = true;
    `);

    return await attachActivitiesToRoutines(routines);
  } catch (error) {
    console.log(error);
  }
}

async function getAllRoutinesByUser({ username }) {
  try {
    const { rows: routines } = await client.query(
      `
      SELECT routines.*, users.username AS "creatorName" FROM routines
      JOIN users ON routines."creatorId" = users.id
      WHERE "creatorId" = (
        SELECT id FROM users WHERE username = $1
      );
    `,
      [username]
    );

    return await attachActivitiesToRoutines(routines);
  } catch (error) {
    console.log(error);
  }

}

async function getPublicRoutinesByUser({ username }) {
  try {
    const { rows: routines } = await client.query(
      `
      SELECT routines.*, users.username AS "creatorName" FROM routines
      JOIN users ON routines."creatorId" = users.id
      WHERE "creatorId" = (
        SELECT id FROM users WHERE username = $1
      )
      AND "isPublic" = true;
    `,
      [username]
    );

    return await attachActivitiesToRoutines(routines);
  } catch (error) {
    console.log(error);
  }
}

async function getPublicRoutinesByActivity({ id }) {
  try {
    const { rows: routines } = await client.query(
      `
      SELECT routines.*, users.username AS "creatorName" FROM routines
      JOIN users ON routines."creatorId" = users.id
      JOIN routine_activities
      ON routines.id = routine_activities."routineId"
      WHERE routine_activities."activityId" = $1
      AND routines."isPublic" = true;
    `,
      [id]
    );

    return await attachActivitiesToRoutines(routines);
  } catch (error) {
    console.log(error);
  }
}

async function updateRoutine({ id, ...fields }) {
  try {
    const setString = Object.keys(fields)
      .map((key, index) => `"${key}"=$${index + 2}`)
      .join(", ");

    const values = [id, ...Object.values(fields)];

    const { rows } = await client.query(
      `
      UPDATE routines
      SET ${setString}
      WHERE id = $1
      RETURNING *;
    `,
      values
    );

    return rows[0];
  } catch (error) {
    console.log(error);
  }
}

async function destroyRoutine(id) {
  try {
    await client.query(
      `
      DELETE FROM routine_activities
      WHERE "routineId" = $1;
    `,
      [id]
    );

    const { rows } = await client.query(
      `
      DELETE FROM routines
      WHERE id = $1
      RETURNING *;
    `,
      [id]
    );

    return rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(error);
  }
}

async function canEditRoutine(routineId, userId) {
  try {
    const { rows } = await client.query(
      `
      SELECT * FROM routines
      WHERE id = $1 AND "creatorId" = $2;
    `,
      [routineId, userId]
    );

    return rows.length > 0;
  } catch (error) {
    console.log(error);
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
  canEditRoutine
};
