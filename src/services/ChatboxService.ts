import { httpClient } from "./httpClient";

export type ChatboxStatusResponse = {
  isAvailable: boolean;
  message: string;
};

export type ChatboxSendRequest = {
  message: string;
  language?: "vi" | "en";
};

export type ChatboxSendResponse = {
  isSuccessful: boolean;
  message: string;
  responseType: string;
  respondedAt: string;
  debugInfo?: Record<string, unknown>;
};

export const chatboxService = {
  status: () => httpClient.get<ChatboxStatusResponse>("/api/chatbox/status"),
  send: (data: ChatboxSendRequest) =>
    httpClient.post<ChatboxSendResponse>("/api/chatbox/send", data),
};

