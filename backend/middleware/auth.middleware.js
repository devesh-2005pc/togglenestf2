const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // No header provided
  if (!authHeader) {
    return res.status(401).json({ msg: "No token, access denied" });
  }

  // Header exists but not in correct format
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ msg: "Invalid token format" });
  }

  const token = parts[1];
  if (!token || token === "null") {
    return res.status(401).json({ msg: "No token, access denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Your token payload = { id: userId }
    req.user = { id: decoded.id };

    next();
  } catch (err) {
    console.error("JWT error:", err);
    return res.status(401).json({ msg: "Invalid token" });
  }
};
