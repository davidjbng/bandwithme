import { defineApp } from "convex/server";
import auth from "@convex-dev/auth/convex.config.js";
import authPassword from "@convex-dev/auth/components/password/convex.config.js";
import authUsername from "@convex-dev/auth/components/username/convex.config.js";
import authEmail from "@convex-dev/auth/components/email/convex.config.js";
import resend from "@convex-dev/resend/convex.config.js";
import rateLimiter from "@convex-dev/rate-limiter/convex.config.js";

const app = defineApp();
app.use(auth);
app.use(authPassword);
app.use(authEmail);
app.use(authUsername);
app.use(resend);
app.use(rateLimiter);
export default app;
