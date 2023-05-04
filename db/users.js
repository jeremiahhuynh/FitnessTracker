const client = require("./client");
const bcrypt = require("bcrypt");
const SALT_COUNT = 10;

async function createUser({ username, password }) {
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_COUNT);
    const { rows: [user] } = await client.query(`
      INSERT INTO users (username, password)
      VALUES ($1, $2)
      RETURNING id, username;
    `, [username, hashedPassword]);
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

async function getUser({ username, password }) {
  try {
    const user = await getUserByUsername(username);
    if (!user) {
      return null;
    }
    const hashedPassword = user.password;
    const isValid = await bcrypt.compare(password, hashedPassword);
    if (isValid) {
      delete user.password;
      return user;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

async function getUserById(userId) {
  try {
    const { rows: [user] } = await client.query(`
      SELECT id, username FROM users
      WHERE id = $1;
    `, [userId]);
    return user;
  } catch (error) {
    console.error('Error getting user by id:', error);
    throw error;
  }
}

async function getUserByUsername(username) {
  try {
    const { rows: [user] } = await client.query(`
      SELECT id, username, password FROM users
      WHERE username = $1;
    `, [username]);
    return user;
  } catch (error) {
    console.error('Error getting user by username:', error);
    throw error;
  }
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername
}