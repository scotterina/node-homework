const { userSchema } = require("../validation/userSchema");
const pool = require("../db/pg-pool");
const crypto = require("crypto");
const utils = require("util");
const scrypt = utils.promisify(crypto.scrypt);

async function register(req, res, next) {
  if (!req.body) req.body = {};
  const { error, value } = userSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      details: error.details,
    });
  }
  let result = null;

  value.hashed_password = await hashPassword(value.password);

  try {
    result = await pool.query(
      `INSERT INTO users (email, name, hashed_password)
     VALUES ($1, $2, $3)
     RETURNING id, email, name`,
      [value.email, value.name, value.hashed_password],
    );
  } catch (e) {
    if (e.code === "23505") {
      return res.status(400).json({
        message: "User already exists",
      });
    }
    return next(e);
  }

  const user = result.rows[0];
  global.user_id = user.id;

  return res.status(201).json({
    name: user.name,
    email: user.email,
  });
}

async function logon(req, res) {
  if (!req.body) req.body = {};
  const { email, password } = req.body;
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  if (result.rows.length === 0) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  const user = result.rows[0];

  const goodCredentials =
    password && (await comparePassword(password, user.hashed_password));
  if (!goodCredentials) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  global.user_id = user.id;

  res.status(200).json({
    name: user.name,
    email: user.email,
  });
}

function logoff(req, res) {
  global.user_id = null;
  res.status(200).json({
    message: "User logged off successfully",
  });
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function comparePassword(inputPassword, storedHash) {
  const [salt, key] = storedHash.split(":");
  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = await scrypt(inputPassword, salt, 64);
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

module.exports = {
  register,
  logon,
  logoff,
  hashPassword,
  comparePassword,
  userSchema,
};
