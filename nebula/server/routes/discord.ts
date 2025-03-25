// routes/discord.ts
import express from "express";
import axios, { AxiosError } from "axios";

const router = express.Router();

router.post("/callback", async (req, res) => {
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

export default router;