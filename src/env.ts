import { z, TypeOf } from "zod";

declare global {
  namespace NodeJS {
    interface ProcessEnv extends TypeOf<typeof zodEnv> {}
  }
}

const zodEnv = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  GITHUB_TOKEN: z.string().min(1),
  GITHUB_REPO: z.string().min(1),
  ISSUE_TAGS: z.string().optional(),
});
let ENV: TypeOf<typeof zodEnv>;
try {
  ENV = zodEnv.parse(process.env);
} catch (err) {
  if (err instanceof z.ZodError) {
    const { fieldErrors } = err.flatten();
    const errorMessage = Object.entries(fieldErrors)
      .map(([field, errors]) =>
        errors ? `${field}: ${errors.join(", ")}` : field
      )
      .join("\n  ");
    throw new Error(
      `Missing or invalid environment variables:\n  ${errorMessage}`
    );
  }
}

export { ENV };
