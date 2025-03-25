import express from "express";
import axios, { AxiosError } from "axios";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

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

// Discord 回調路由
app.post("/discord/callback", async (req, res) => {
  const { code } = req.body;
  console.log("Received code:", code);

  try {
    const response = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: "1353343236315418705",
        client_secret: "Ewyy1dg8JsoSJSspelOVOev_uYhqWj1i",
        grant_type: "authorization_code",
        code,
        redirect_uri: "http://localhost:5173/callback",
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    console.log("Token response:", response.data);
    res.json(response.data);
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("Axios error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to exchange token" });
    } else {
      console.error("Unknown error:", error);
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

// 錯誤處理中間件
app.use((error: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error instanceof AxiosError) {
    res.status(500).json({
      success: false,
      error: error.response?.data?.error || error.message,
    });
  } else if (error instanceof Error) {
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