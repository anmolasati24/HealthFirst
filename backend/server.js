import "dotenv/config";
import express from "express";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import mongoose from "mongoose";
import { User } from "./models/user.js";
import { processData } from "./utils/process-data.js";
import { keepAlive } from "./utils/keep-alive.js";
import otpRoutes from "./routes/otp.routes.js";
import productRoutes from "./routes/product.routes.js";

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────
const port = process.env.PORT || 7000;
const dbUrl = process.env.ATLASDB_URL;

const ALLOWED_ORIGINS = [
  "https://purepick.vercel.app",
  "http://localhost:3000",
  process.env.CLIENT_URL,
].filter(Boolean);

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB per image

// ─────────────────────────────────────────────
// EXPRESS
// ─────────────────────────────────────────────
const app = express();

app.use(cors({
  origin: ALLOWED_ORIGINS,
  methods: ["GET", "POST"],
}));

app.use(express.json({ limit: "10mb" }));

// ─────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ msg: "PurePick Server running 🚀" });
});

app.use("/api/otp", otpRoutes);
app.use("/api/product", productRoutes);

// ─────────────────────────────────────────────
// HTTP + SOCKET SERVER
// ─────────────────────────────────────────────
const server = http.createServer(app);

const io = new Server(server, {
  maxHttpBufferSize: 5 * 1024 * 1024,
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
  },
});

// ─────────────────────────────────────────────
// SOCKET EVENTS
// ─────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  // ───────────────────────
  // ✅ AUTH — matches frontend:
  // socket.emit("verify-user-auth", userId)
  // socket.once("user-auth-response", callback)
  // ───────────────────────
  socket.on("verify-user-auth", async (userId) => {
    try {
      if (!userId) {
        return socket.emit("user-auth-response", { authenticated: false });
      }

      const user = await User.findById(userId);
      socket.emit("user-auth-response", { authenticated: !!user });

    } catch (error) {
      console.log("❌ Auth error:", error.message);
      // ✅ null triggers "Server not responding" toast in frontend
      socket.emit("user-auth-response", { authenticated: null });
    }
  });

  // ───────────────────────
  // ✅ IMAGE UPLOAD — matches frontend:
  // socket.emit("upload-images", { userId, images: imageData })
  // ───────────────────────
socket.on("upload-images", async (data) => {
    try {
      // ✅ Log what frontend is sending
      console.log("📦 Data received:", typeof data);
      console.log("📦 Data preview:", JSON.stringify(data)?.slice(0, 200));

      // ✅ Guard against null
      if (!data) {
        return socket.emit("process-error", {
          message: "No data received",
        });
      }

      const { userId, images } = data;

      if (!userId) {
        return socket.emit("process-error", {
          message: "Authentication required",
        });
      }

      if (!Array.isArray(images) || images.length < 2) {
        return socket.emit("process-error", {
          message: "Please upload both images",
        });
      }

      const oversized = images.some(
        (img) => Buffer.byteLength(img?.file || img, "base64") > MAX_IMAGE_SIZE
      );
      if (oversized) {
        return socket.emit("process-error", {
          message: "Each image must be under 2MB",
        });
      }

      await processData(images, socket, userId);

    } catch (error) {
      console.log("❌ Socket error:", error.message);
      socket.emit("process-error", {
        message: "Something went wrong while processing.",
      });
    }
  });

  // ───────────────────────
  // DISCONNECT
  // ───────────────────────
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// ─────────────────────────────────────────────
// MONGODB
// ─────────────────────────────────────────────
async function connectToMongoDB() {
  if (!dbUrl) {
    console.error("❌ ATLASDB_URL not defined in .env");
    process.exit(1);
  }
  try {
    await mongoose.connect(dbUrl);
    console.log("✅ Connected to MongoDB");
    console.log("📦 DB:", mongoose.connection.name);
  } catch (error) {
    console.error("❌ MongoDB error:", error.message);
    process.exit(1);
  }
}

// ─────────────────────────────────────────────
// KEEP ALIVE (Render free tier)
// ─────────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  keepAlive("https://purepick-backend-b90b.onrender.com");
}

// ─────────────────────────────────────────────
// START
// ─────────────────────────────────────────────
connectToMongoDB().then(() => {
  server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
});