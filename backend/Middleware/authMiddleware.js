const jwt = require("jsonwebtoken");

const verifyAdmin = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ error: true, message: "Access Denied. No Token Provided." });
  }

  try {
    const verified = jwt.verify(token.split(" ")[1], process.env.ACCESS_TOKEN);
    
    // Check if role is admin
    if (verified.role !== "admin") {
      return res.status(403).json({ error: true, message: "You do not have access to create a branch." });
    }

    req.admin = verified; // Store admin details in request
    next();
  } catch (err) {
    return res.status(400).json({ error: true, message: "Invalid Token" });
  }
};

module.exports = verifyAdmin;
