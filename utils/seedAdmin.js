import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Category from "../models/Category.js";
import User from "../models/User.js";

dotenv.config();

const categoryNames = [
  ["Home", "fa-house"], ["Networking", "fa-network-wired"], ["Windows", "fa-desktop"], ["Linux", "fa-terminal"],
  ["Cisco", "fa-server"], ["CCNA", "fa-certificate"], ["Firewall", "fa-shield-halved"], ["Switching", "fa-ethernet"],
  ["Routing", "fa-route"], ["Cyber Security", "fa-user-shield"], ["Cloud", "fa-cloud"], ["Virtualization", "fa-cubes"],
  ["Server", "fa-server"], ["VMware", "fa-layer-group"], ["Azure", "fa-cloud"], ["AWS", "fa-cloud"],
  ["Microsoft 365", "fa-envelope"], ["Interview Questions", "fa-comments"], ["Troubleshooting", "fa-screwdriver-wrench"],
  ["Tools", "fa-toolbox"], ["Scripts", "fa-code"], ["Commands", "fa-terminal"], ["Projects", "fa-diagram-project"],
  ["Downloads", "fa-download"], ["Favorites", "fa-star"], ["Settings", "fa-gear"]
];

async function seed() {
  await connectDB();
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const exists = await User.findOne({ email: adminEmail });
  if (!exists) {
    await User.create({
      name: process.env.ADMIN_NAME || "Knowledge Admin",
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || "ChangeMe123!",
      role: "admin"
    });
    console.log(`Admin created: ${adminEmail}`);
  } else {
    console.log(`Admin already exists: ${adminEmail}`);
  }

  for (let index = 0; index < categoryNames.length; index += 1) {
    const [name, icon] = categoryNames[index];
    await Category.updateOne({ name }, { $setOnInsert: { name, icon, sortOrder: index } }, { upsert: true });
  }
  console.log("Default categories ready");
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
