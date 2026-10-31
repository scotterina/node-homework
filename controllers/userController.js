const { userSchema } = require("../validation/userSchema");
const crypto = require("crypto");
const utils = require("util");
const scrypt = utils.promisify(crypto.scrypt);

async function register(req, res) {
  if (!req.body) req.body = {};
  const { error, value } = userSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }

  const { name, email, password } = value;
  const existingUser = global.users.find((user) => {
    return user.email === email;
  });

  if (existingUser) {
    return res.status(409).json({
      message: "User already exists",
    });
  }

  const hashedPassword = await hashPassword(value.password);
  const newUser = { email: value.email, name: value.name, hashedPassword };

  global.users.push(newUser);
  global.user_id = newUser;

  return res.status(201).json({
    name: newUser.name,
    email: newUser.email,
  });
}

async function logon(req, res) {
  if (!req.body) req.body = {};
  const { email, password } = req.body;
  const user = global.users.find((user) => {
    return user.email === email;
  });

  const goodCredentials =
    user && password && (await comparePassword(password, user.hashedPassword));
  if (!goodCredentials) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  global.user_id = user;
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
