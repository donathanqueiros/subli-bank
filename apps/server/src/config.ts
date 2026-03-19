import path from "path";

import dotenvSafe from "dotenv-safe";

const cwd = process.cwd();

const root = path.join.bind(cwd);

dotenvSafe.config({
  path: root(".env"),
  sample: root(".env.example"),
});

const ENV = process.env;

const config = {
  PORT: ENV.PORT ?? 4000,
  MONGO_URI: ENV.MONGO_URI ?? "",
  CORS_ORIGIN: ENV.CORS_ORIGIN ?? "http://localhost:5173",
  SESSION_SECRET: ENV.SESSION_SECRET ?? "dev-session-secret",
  SESSION_COOKIE_NAME: ENV.SESSION_COOKIE_NAME ?? "woovi_session",
};

export { config };
