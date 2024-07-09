import { Context, NarrowedContext, Telegraf } from "telegraf";
import { Octokit } from "@octokit/rest";
import { Message, Update } from "@telegraf/types";
import { readFileSync } from "fs";
import d from "debug";
import path from "path";
import { fileURLToPath } from "url";

type MsgContext = NarrowedContext<
  Context<Update>,
  | Update.MessageUpdate<Record<"text", {}> & Message.TextMessage>
  | Update.MessageUpdate<Record<"photo", {}> & Message.PhotoMessage>
  | Update.MessageUpdate<Record<"video", {}> & Message.VideoMessage>
  | Update.MessageUpdate<Record<"document", {}> & Message.DocumentMessage>
>;

export interface TelegramBotConfig {
  tg_token: string;
  gh_token: string;
  repo_owner: string;
  repo_name: string;
  issue_tags?: string;
}

export class TelegramBot {
  public telegraf: Telegraf;
  private octokit: Octokit;
  private repoOwner: string;
  private repoName: string;
  private issueTags?: string;
  private error: debug.Debugger;
  private log: debug.Debugger;

  constructor(
    {
      tg_token,
      gh_token,
      repo_owner,
      repo_name,
      issue_tags,
    }: TelegramBotConfig,
    telegraf_options?: object
  ) {
    const pkg = JSON.parse(readFileSync("./package.json", "utf8"));
    const log_prefix = `${pkg.name}:${repo_owner}/${repo_name}:`;
    this.error = d(log_prefix);
    this.log = d(log_prefix);
    this.log.log = console.info.bind(console);

    this.telegraf = new Telegraf(tg_token, telegraf_options);
    this.octokit = new Octokit({ auth: gh_token });
    this.repoOwner = repo_owner;
    this.repoName = repo_name;
    this.issueTags = issue_tags;

    this.initialize();
  }

  private async extractIssueInfo(ctx: MsgContext) {
    //@ts-expect-error meh..
    const text = ctx.message.text || ctx.message.caption;
    const mentionRegex = new RegExp(`@${ctx.botInfo.username}`, "i");

    let title = "";
    let description = "";
    let authorUrl = ctx.from.username
      ? `https://t.me/${ctx.from.username}`
      : `https://t.me/user?id=${ctx.from.id}`;

    // Handle replies
    if (ctx.message.reply_to_message && ctx.message.reply_to_message.from) {
      const replyMessage = ctx.message.reply_to_message;
      authorUrl = `https://t.me/${
        replyMessage.from?.username || `user?id=${replyMessage.from?.id}`
      }`;

      if ("text" in replyMessage || "caption" in replyMessage) {
        const replyText =
          "text" in replyMessage ? replyMessage.text : replyMessage.caption;
        title = (text || "").replace(mentionRegex, "").trim();
        description += replyText?.split("\n").join("\n>");
      }
    } else {
      const [titlePart, ...bodyParts] = text
        .replace(mentionRegex, "")
        .trim()
        .split(":");
      title = titlePart.trim();
      description += bodyParts.join(":").trim() || title;
    }

    title = title || "From a telegram chat";

    return { title, description, authorUrl };
  }

  private async getMedia(message: MsgContext["message"]) {
    let res = "";
    if (message.reply_to_message) {
      res += await this.getMedia(
        message.reply_to_message as MsgContext["message"]
      );
    }

    // @ts-expect-error meh..
    const media = message.photo ?? message.video ?? message.document;

    if (media) {
      let fileId = "";
      if ("photo" in message) {
        fileId = media[media.length - 1].file_id;
      } else {
        fileId = media.file_id;
      }
      const fileLink = await this.telegraf.telegram.getFileLink(fileId);
      res += `[Attachment](${fileLink.href})`;
    }

    return res;
  }

  private async createGitHubIssue(
    title: string,
    description: string,
    media: string,
    authorUrl: string
  ) {
    this.log(`Creating a GitHub issue for ${this.repoOwner}/${this.repoName}`);

    const body = `
      Quote from a telegram chat:

      >${description}

      >${media}


      ---

      From: ${authorUrl}`.replace(/^\s+/gm, "");

    return await this.octokit.issues.create({
      owner: this.repoOwner,
      repo: this.repoName,
      title: title,
      body: body,
      labels: this.issueTags?.split(","),
    });
  }

  private initialize() {
    this.log("Bot is starting...");

    this.telegraf.on("message", async (ctx) => {
      const { message, chat } = ctx;
      this.log("Received a message #", message.message_id, "chat #", chat.id);

      //@ts-expect-error meh..
      const text = message.text || message.caption;
      const mentionRegex = new RegExp(`@${ctx.botInfo.username}`, "i");

      if (!mentionRegex.test(text)) {
        this.log(`No mention found (@${ctx.botInfo.username})`);
        return;
      }

      const { title, description, authorUrl } = await this.extractIssueInfo(
        ctx as MsgContext
      );
      const media = await this.getMedia(ctx.message as MsgContext["message"]);

      try {
        const issue = await this.createGitHubIssue(
          title,
          description,
          media,
          authorUrl
        );
        this.log(`Issue created: ${issue.data.html_url}`);
        ctx.reply(`Issue created: ${issue.data.html_url}`);
      } catch (error) {
        this.error(error);
        ctx.reply("Failed to create issue");
      }
    });
  }
}
