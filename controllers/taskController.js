const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");
const prisma = require("../db/prisma");

const taskCounter = (() => {
  let lastTaskNumber = 0;
  return () => {
    lastTaskNumber += 1;
    return lastTaskNumber;
  };
})();

async function create(req, res, next) {
  if (!req.body) req.body = {};
  const { error, value } = taskSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }

  try {
    const task = await prisma.task.create({
      data: {
        title: value.title,
        isCompleted: value.isCompleted,
        userId: global.user_id,
      },
      select: {
        id: true,
        title: true,
        isCompleted: true,
      },
    });

    return res.status(201).json(task);
  } catch (err) {
    return next(err);
  }
}

async function index(req, res, next) {
  try {
    const userTasks = await prisma.task.findMany({
      where: {
        userId: global.user_id, // only the tasks for this user!
      },
      select: { title: true, isCompleted: true, id: true },
    });

    if (userTasks.length === 0) {
      return res.status(404).json({
        message: "No tasks found",
      });
    }

    return res.status(200).json(userTasks);
  } catch (err) {
    return next(err);
  }
}

async function show(req, res, next) {
  const taskId = Number(req.params.id);

  if (!Number.isInteger(taskId) || taskId <= 0) {
    return res.status(400).json({
      message: "Invalid task ID",
    });
  }

  try {
    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
        userId: global.user_id,
      },
      select: {
        id: true,
        title: true,
        isCompleted: true,
      },
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    return res.status(200).json(task);
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  if (!req.body) req.body = {};

  const { error, value } = patchTaskSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }

  const taskId = Number(req.params?.id);

  if (!Number.isInteger(taskId) || taskId <= 0) {
    return res.status(400).json({
      message: "Invalid task ID",
    });
  }

  try {
    const task = await prisma.task.update({
      data: value,
      where: {
        id: taskId,
        userId: global.user_id,
      },
      select: {
        title: true,
        isCompleted: true,
        id: true,
      },
    });

    return res.status(200).json(task);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({
        message: "Task not found",
      });
    } else {
      return next(err);
    }
  }
}

async function deleteTask(req, res, next) {
  const taskId = Number(req.params?.id);

  if (!Number.isInteger(taskId) || taskId <= 0) {
    return res.status(400).json({
      message: "Invalid task ID",
    });
  }

  try {
    const task = await prisma.task.delete({
      where: {
        id: taskId,
        userId: global.user_id,
      },
      select: {
        id: true,
        title: true,
        isCompleted: true,
      },
    });

    return res.status(200).json(task);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({
        message: "Task not found",
      });
    } else {
      return next(err);
    }
  }
}

module.exports = {
  create,
  index,
  show,
  update,
  deleteTask,
  taskCounter,
};
