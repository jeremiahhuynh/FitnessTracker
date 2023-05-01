const client = require('./client');

// database functions
async function createActivity({ name, description }) {
  try {
    const { rows } = await client.query(
      `
      INSERT INTO activities(name, description)
      VALUES($1, $2)
      RETURNING *;
    `,
      [name.toLowerCase(), description]
    );

    return rows[0];
  } catch (error) {
    console.error("Error creating activity:", error);
    throw error;
  }
}

async function getAllActivities() {
  try {
    const { rows } = await client.query(`
      SELECT * FROM activities;
    `);

    return rows;
  } catch (error) {
    console.error("Error getting all activities:", error);
    throw error;
  }
}

async function getActivityById(id) {
  try {
    const { rows } = await client.query(`
      SELECT * FROM activities WHERE id = $1;
    `, [id]);

    return rows[0];
  } catch (error) {
    console.error("Error getting activity by id:", error);
    throw error;
  }
}

async function getActivityByName(name) {
  try {
    const { rows } = await client.query(`
      SELECT * FROM activities WHERE name = $1;
    `, [name.toLowerCase()]);

    return rows[0];
  } catch (error) {
    console.error("Error getting activity by name:", error);
    throw error;
  }
}

// used as a helper inside db/routines.js
async function attachActivitiesToRoutines(routines) {
  try {
    const activities = await getAllActivities();
    
    for (let routine of routines) {
      const routineActivities = activities.filter(activity => activity.routineId === routine.id);
      routine.activities = routineActivities;
    }

    return routines;
  } catch (error) {
    console.error("Error attaching activities to routines:", error);
    throw error;
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
