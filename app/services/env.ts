import { z } from "zod";

let envSchema = z.object({
  ADMIN_UID: z.string(),
  IHU_OAUTH_CLIENT_ID: z.string(),
  IHU_OAUTH_CLIENT_SECRET: z.string(),
  IHU_OAUTH_REDIRECT_URI: z.string(),
  DATABASE_URL: z.string(),
});

export let env = envSchema.parse(process.env);
