import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import discordRouter from "./routes/discord";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();

// 啟用 CORS，允許來自 http://localhost:5173 的請求
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());

// 使用 Discord router
app.use("/discord", discordRouter);

// 錯誤處理中間件
app.use((error: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error instanceof Error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  } else {
    res.status(500).json({
      success: false,
      error: "An unknown error occurred",
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));