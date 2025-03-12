import { Hono } from "hono";
import { cors } from 'hono/cors';
import { env } from "./env";
import { processQuery } from "./handlers/process-query";
import { processorStatus } from "./handlers/processor-status";

const app = new Hono();

app.use('*', cors({
  origin: 'http://localhost:5173',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'proxy-key'],
}));

// middleware
app.use(async (c, next) => {
  const key = c.req.header("proxy-key");
  if (key !== env.PROXY_KEY) {
    return c.json({ error: "Invalid key" }, 401);
  }

  await next();
});

app.post("/query", processQuery);
app.get("/status", processorStatus);

console.log(`[drizzle-proxy] Listening on port ${env.PROXY_HTTP_PORT}`);

export default {
  port: env.PROXY_HTTP_PORT,
  fetch: app.fetch,
};
