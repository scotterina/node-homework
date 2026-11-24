const prisma = require("../db/prisma");

async function getUserAnalytics(req, res, next) {
  const userId = parseInt(req.params.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({
      message: "Invalid user ID",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const taskStats = await prisma.task.groupBy({
      by: ["isCompleted"],
      where: { userId: userId },
      _count: {
        id: true,
      },
    });

    const recentTasks = await prisma.task.findMany({
      where: { userId: userId },
      select: {
        id: true,
        title: true,
        isCompleted: true,
        priority: true,
        createdAt: true,
        userId: true,
        User: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyProgress = await prisma.task.groupBy({
      by: ["createdAt"],
      where: {
        userId: userId,
        createdAt: { gte: oneWeekAgo },
      },
      _count: {
        id: true,
      },
    });

    return res.status(200).json({
      taskStats: taskStats,
      recentTasks: recentTasks,
      weeklyProgress: weeklyProgress,
    });
  } catch (err) {
    return next(err);
  }
}

async function getUsersWithStats(req, res, next) {
  const query = req.query || {};
  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? 10 : Number(query.limit);

  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    return res.status(400).json({
      message: "Invalid pagination parameters",
    });
  }

  const skip = (page - 1) * limit;

  try {
    const usersRaw = await prisma.user.findMany({
      include: {
        Task: {
          where: { isCompleted: false },
          select: { id: true },
          take: 5,
        },
        _count: {
          select: {
            Task: true,
          },
        },
      },
      skip: skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const users = usersRaw.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      _count: user._count,
      Task: user.Task,
    }));

    const totalUsers = await prisma.user.count();

    const pagination = {
      page: page,
      limit: limit,
      total: totalUsers,
      pages: Math.ceil(totalUsers / limit),
      hasNext: page * limit < totalUsers,
      hasPrev: page > 1,
    };

    return res.status(200).json({
      users: users,
      pagination: pagination,
    });
  } catch (err) {
    return next(err);
  }
}

async function searchTasks(req, res, next) {
  const query = req.query || {};
  const searchQuery = query.q;

  if (typeof searchQuery !== "string" || searchQuery.trim().length < 2) {
    return res.status(400).json({
      error: "Search query must be at least 2 characters long",
    });
  }

  const limit = query.limit === undefined ? 20 : Number(query.limit);

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return res.status(400).json({
      message: "Invalid limit",
    });
  }

  const searchTerm = searchQuery.trim();
  const searchPattern = `%${searchTerm}%`;
  const exactMatch = searchTerm;
  const startsWith = `${searchTerm}%`;

  try {
    const searchResults = await prisma.$queryRaw`
      SELECT
        t.id,
        t.title,
        t.is_completed AS "isCompleted",
        t.priority,
        t.created_at AS "createdAt",
        t.user_id AS "userId",
        u.name AS "user_name"
      FROM tasks t
      JOIN users u ON t.user_id = u.id
      WHERE t.title ILIKE ${searchPattern}
         OR u.name ILIKE ${searchPattern}
      ORDER BY
        CASE
          WHEN t.title ILIKE ${exactMatch} THEN 1
          WHEN t.title ILIKE ${startsWith} THEN 2
          WHEN t.title ILIKE ${searchPattern} THEN 3
          ELSE 4
        END,
        t.created_at DESC
      LIMIT ${limit}
    `;

    return res.status(200).json({
      results: searchResults,
      query: searchTerm,
      count: searchResults.length,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getUserAnalytics,
  getUsersWithStats,
  searchTasks,
};
