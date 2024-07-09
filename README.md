# Telegram to GitHub Bot

---

## What It Is

Telegram bot to create GitHub issues simply by `@mentioning`. Useful for "TDD" (Telegarm Driven Development) team styles. Comparing to [annndruha/issue-github-telegram-bot](https://github.com/annndruha/issue-github-telegram-bot) needs less github permissions and is more lightweight overall.

## How to use

You'll need to create a Telegram bot and a GitHub token.

1. **Create a Telegram Bot**

   - Go to ['@BotFather'](https//t.me/BotFather).
   - Create a new bot via `/newbot` command.
   - Follow the instructions to set up your bot. **BotFather** will give you a **token** when your bot is created.

2. **Generate a GitHub Personal Access Token**

   - If you own the repo:
     - Go to your [GitHub settings](https://github.com/settings/tokens?type=beta).
     - Click on **Generate new token**.
     - Choose `Repository access` -> `Only select repositories`. Select **repo(s)** where you want to create issues.
     - Add `Repository permissions` -> `Issues` -> `Read & Write`.
     - Click on **Generate token** and save the token.
   - If you are a collaborator on a repo you don't own:
     - Create a 'classic' token with `repo` scope – https://github.com/settings/tokens

3. **Prepare Environment Variables**

Keep in mind – one bot instance – one repo. So if you want to create issues in multiple repos, you'll need to create multiple bots.

    - Prepare env variables:
    ```sh
    TELEGRAM_BOT_TOKEN=your-telegram-bot-token
    GITHUB_TOKEN=your-github-token
    GH_REPO=user/repo
    ```

4. **Run the bot**. Here is an example:
   ```sh
   docker run --env-file .env ghcr.io/h1d/telegram-to-github-bot:main
   ```
5. **Add the bot to your group(s)**
6. **Start creating issues!**
