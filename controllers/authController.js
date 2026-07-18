import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { writeLog } from "../utils/logger.js";

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
}

function userPayload(user) {
  return { _id: user._id, name: user.name, email: user.email, role: user.role, theme: user.theme, accentColor: user.accentColor };
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() });
  if (!user || !(await user.matchPassword(password))) return res.status(401).json({ message: "Invalid email or password" });
  user.lastLoginAt = new Date();
  await user.save();
  await writeLog(req, "login", "User", user._id);
  res.json({ token: signToken(user), user: userPayload(user) });
}

export async function me(req, res) {
  res.json({ user: userPayload(req.user) });
}

export async function updateProfile(req, res) {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });
  ["name", "theme", "accentColor"].forEach((field) => {
    if (req.body[field]) user[field] = req.body[field];
  });
  if (req.body.password) user.password = req.body.password;
  await user.save();
  await writeLog(req, "update_profile", "User", user._id);
  res.json({ user: userPayload(user) });
}
