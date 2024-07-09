import { Context } from "telegraf";
import { Message } from "@telegraf/types";

const createTextMsg = ({
  text,
  username = "mockuser",
  chatId = 123,
  messageId = 1,
}: {
  text: string;
  username?: string;
  chatId?: number;
  messageId?: number;
}) => ({
  message_id: messageId,
  text: text,
  from: { username: username, id: 123 },
  chat: { id: chatId },
});

const createReplyMsg = ({
  text,
  replyToText,
  username = "mockuser",
  chatId = 123,
  messageId = 2,
  replyToUsername = "otheruser",
  replyToId = 456,
}: {
  text: string;
  replyToText: string;
  username?: string;
  chatId?: number;
  messageId?: number;
  replyToUsername?: string;
  replyToId?: number;
}) => ({
  message_id: messageId,
  text: text,
  from: { username: username, id: 123 },
  reply_to_message: {
    message_id: 1,
    text: replyToText,
    from: { username: replyToUsername, id: replyToId },
  },
  chat: { id: chatId },
});

const createPhotoMsg = ({
  caption,
  username = "mockuser",
  chatId = 123,
  messageId = 3,
  photoFileId = "photo_file_id",
}: {
  caption: string;
  username?: string;
  chatId?: number;
  messageId?: number;
  photoFileId?: string;
}) => ({
  message_id: messageId,
  caption: caption,
  from: { username: username, id: 123 },
  photo: [{ file_id: photoFileId }],
  chat: { id: chatId },
});

const createContext = (
  message: { chat: { id: number }; from: { username: string } },
  botUsername: string = "issueBOT"
) => {
  return {
    message: message,
    chat: { id: message.chat.id },
    botInfo: { username: botUsername },
    from: message.from,
    reply: jest.fn(),
  } as unknown as Context;
};

export { createTextMsg, createReplyMsg, createPhotoMsg, createContext };
