import { TelegramBot } from "./bot";
import { ENV } from "./env";

const { TELEGRAM_BOT_TOKEN, GITHUB_TOKEN, GITHUB_REPO, ISSUE_TAGS } = ENV;

const [repo_owner, repo_name] = GITHUB_REPO.split("/");

const bot = new TelegramBot({
  tg_token: TELEGRAM_BOT_TOKEN,
  gh_token: GITHUB_TOKEN,
  repo_owner,
  repo_name,
  issue_tags: ISSUE_TAGS,
}).telegraf;

bot.launch().catch((error) => {
  console.error("Failed to connect to Telegram servers:", error);
});

process.once("SIGINT", () => {
  bot.stop("SIGINT");
});
process.once("SIGTERM", () => {
  bot.stop("SIGTERM");
});
