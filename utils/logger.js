import Log from "../models/Log.js";

export async function writeLog(req, action, entity, entityId, meta = {}) {
  try {
    await Log.create({
      user: req.user?._id,
      action,
      entity,
      entityId,
      ip: req.ip,
      meta
    });
  } catch {
    // Logging should never block primary admin actions.
  }
}
