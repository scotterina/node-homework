const { userSchema } = require("../validation/userSchema");
const prisma = require("../db/prisma");
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

  value.hashedPassword = await hashPassword(value.password);
  delete value.password;

  const { name, email, hashedPassword } = value;
  let user = null;

  try {
    user = await prisma.user.create({
      data: { name, email, hashedPassword },
      select: { name: true, email: true, id: true }, // specify the column values to return
    });
  } catch (err) {
    if (err.name === "PrismaClientKnownRequestError" && err.code === "P2002") {
      // send the appropriate error back -- the email was already registered
      return res.status(400).json({
        message: "User already exists",
      });
    } else {
      return next(err);
    }
  }

  global.user_id = user.id;

  return res.status(201).json({
    name: user.name,
    email: user.email,
  });
}

async function logon(req, res, next) {
  if (!req.body) req.body = {};
  let { email, password } = req.body;

  if (typeof email !== "string") {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  email = email.toLowerCase();

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const goodCredentials =
      password && (await comparePassword(password, user.hashedPassword));
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
  } catch (err) {
    return next(err);
  }
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
