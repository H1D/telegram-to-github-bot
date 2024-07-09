import { TelegramBot, TelegramBotConfig } from "../bot";
import {
  createContext,
  createReplyMsg,
  createTextMsg,
  createPhotoMsg,
} from "./fixtures";

jest.mock("telegraf", () => {
  return {
    Telegraf: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
      telegram: {
        getFileLink: jest.fn().mockResolvedValue({ href: "mocked_file_link" }),
      },
    })),
  };
});

jest.mock("@octokit/rest", () => {
  const mockCreateIssue = jest.fn().mockResolvedValue({
    data: { html_url: "mocked_issue_url" },
  });
  const Octokit = jest.fn().mockImplementation(() => ({
    issues: {
      create: mockCreateIssue,
    },
  }));
  return { Octokit, mockCreateIssue };
});

// Setting up the test
describe("TelegramBot", () => {
  const config: TelegramBotConfig = {
    tg_token: "mocked_tg_token",
    gh_token: "mocked_gh_token",
    repo_owner: "mocked_owner",
    repo_name: "mocked_repo",
  };

  let bot: TelegramBot;
  let mockCreateIssue: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateIssue = require("@octokit/rest").mockCreateIssue;

    bot = new TelegramBot(config);
  });

  it("should call Octokit API with correct parameters when creating an issue", async () => {
    const mockContext = createContext(
      createTextMsg({
        text: "@issueBOT example issue title: example issue description",
      })
    );
    const handleMessage = (bot.telegraf.on as jest.Mock).mock.calls[0][1];
    await handleMessage(mockContext);

    expect(mockCreateIssue).toHaveBeenCalledWith({
      owner: "mocked_owner",
      repo: "mocked_repo",
      title: "example issue title",
      body: expect.stringContaining("example issue description"),
      labels: undefined,
    });
  });

  it("should reply with the issue URL when an issue is successfully created", async () => {
    const mockContext = createContext(
      createTextMsg({
        text: "@issueBOT example issue title: example issue description",
      })
    );

    const handleMessage = (bot.telegraf.on as jest.Mock).mock.calls[0][1];

    await handleMessage(mockContext);

    expect(mockContext.reply).toHaveBeenCalledWith(
      "Issue created: mocked_issue_url"
    );
  });

  it("should not reply for messages without a mention", async () => {
    const mockContext = createContext(
      createTextMsg({
        text: "example issue title: example issue description",
      })
    );

    const handleMessage = (bot.telegraf.on as jest.Mock).mock.calls[0][1];

    await handleMessage(mockContext);

    expect(mockContext.reply).not.toHaveBeenCalled();
  });

  it("should reply with the issue URL when an issue is successfully created from a reply with mention", async () => {
    const mockContext = createContext(
      createReplyMsg({
        text: "@issueBOT handle",
        replyToText: "Original message",
      })
    );

    const handleMessage = (bot.telegraf.on as jest.Mock).mock.calls[0][1];

    await handleMessage(mockContext);

    expect(mockContext.reply).toHaveBeenCalledWith(
      "Issue created: mocked_issue_url"
    );
  });

  // New test case for photo message
  it("should call Octokit API with correct parameters when creating an issue from a photo message with mention", async () => {
    const mockContext = createContext(
      createPhotoMsg({
        caption: "@issueBOT Look at this photo",
      })
    );

    const handleMessage = (bot.telegraf.on as jest.Mock).mock.calls[0][1];
    await handleMessage(mockContext);

    expect(mockCreateIssue).toHaveBeenCalledWith({
      owner: "mocked_owner",
      repo: "mocked_repo",
      title: "Look at this photo",
      // Adjust as necessary for your logic
      body: expect.stringContaining("Quote from a telegram chat"),
      labels: undefined,
    });
  });

  it("should reply with the issue URL when an issue is successfully created from a photo message", async () => {
    const mockContext = createContext(
      createPhotoMsg({
        caption: "@issueBOT Look at this photo",
      })
    );

    const handleMessage = (bot.telegraf.on as jest.Mock).mock.calls[0][1];

    await handleMessage(mockContext);

    expect(mockContext.reply).toHaveBeenCalledWith(
      "Issue created: mocked_issue_url"
    );
  });
});
