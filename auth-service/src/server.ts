import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import { requireAuth, AuthedRequest } from "./middleware/requireAuth";

dotenv.config();

const app = express();

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => {
    res.send("Auth service is running. Try /health");
});

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/auth", authRoutes);

// Example protected route
app.get("/me", requireAuth, (req: AuthedRequest, res) => {
    res.json({ userId: req.userId });
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Auth service running on http://localhost:${PORT}`);
});
