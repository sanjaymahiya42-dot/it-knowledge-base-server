import path from "node:path";
import { fileURLToPath } from "node:url";

import compression from "compression";
import cors from "cors";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import articleRoutes from "./routes/articleRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import backupRoutes from "./routes/backupRoutes.js";

import { errorHandler, notFound } from "./middleware/errorMiddleware.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();

app.set("trust proxy", 1);


// ================= SECURITY =================

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin"
    },
    contentSecurityPolicy: false,
  })
);


// ================= CORS =================

// ================= CORS =================

const allowedOrigins = [
  "http://localhost:5173",
  "https://it-knowledge-base-client.vercel.app"
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());
// ================= MIDDLEWARE =================


app.use(express.json({
  limit:"2mb"
}));

app.use(
 express.urlencoded({
  extended:true
 })
);


app.use(compression());


app.use(
 mongoSanitize()
);



app.use(
 rateLimit({
  windowMs:15*60*1000,
  max:300,
  standardHeaders:true,
  legacyHeaders:false
 })
);



if(process.env.NODE_ENV !== "test"){
 app.use(morgan("dev"));
}



// ================= STATIC =================


app.use(
 "/uploads",
 express.static(
  path.join(__dirname,"uploads")
 )
);



// ================= HEALTH CHECK =================


app.get("/api/health",(req,res)=>{

 res.status(200).json({

  status:"ok",

  service:"IT Knowledge Base API",

  message:"Backend Running Successfully"

 });

});



// ================= ROUTES =================


app.use("/api/auth",authRoutes);

app.use("/api/categories",categoryRoutes);

app.use("/api/articles",articleRoutes);

app.use("/api/uploads",uploadRoutes);

app.use("/api/backup",backupRoutes);


// ================= FRONTEND =================

app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({
      success: false,
      message: "API Route Not Found",
    });
  }

  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ================= ERROR =================


app.use(notFound);

app.use(errorHandler);



export default app;