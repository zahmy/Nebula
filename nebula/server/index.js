import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();

// 啟用 CORS，允許來自 http://localhost:5173 的請求
app.use(
	cors({
		origin: "http://localhost:5173",
		methods: ["POST"], // 只允許 POST 請求
	})
);

app.use(express.json());

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
	} catch (error) {
		console.error("Axios error:", error.response?.data || error.message);
		res.status(500).json({ error: "Failed to exchange token" });
	}
});

app.listen(5000, () => console.log("Server running on port 5000"));
