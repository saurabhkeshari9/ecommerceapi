const jwt = require("jsonwebtoken");
require("dotenv").config();

const getTokenFromHeader = (req) => {
  const token = req.header("Authorization");
  if (!token) return null; // ❌ `res` nahi use karein, sirf null return karein

  return token.startsWith("Bearer ") ? token.split(" ")[1] : token;
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null; // ❌ `res` return nahi karein, sirf null return karein
  }
};

module.exports = { getTokenFromHeader, verifyToken };
