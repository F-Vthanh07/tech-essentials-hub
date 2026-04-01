import * as signalR from "@microsoft/signalr";
import { BASE_URL } from "./httpClient";
import type { ChatMessageResponse } from "./ChatRoomService";

type StaffJoinedPayload = { roomId: string; staffId: string; staffName?: string };
type StaffLeftPayload = { roomId: string };
type AiStatusChangedPayload = { roomId: string; isAIEnabled: boolean };
type RoomClosedPayload = { roomId: string };

export type ChatHubEvents = {
  ReceiveMessage: (msg: ChatMessageResponse) => void;
  StaffJoined: (data: StaffJoinedPayload) => void;
  StaffLeft: (data: StaffLeftPayload) => void;
  AIStatusChanged: (data: AiStatusChangedPayload) => void;
  RoomClosed: (data: RoomClosedPayload) => void;
  Error: (message: string) => void;
};

class ChatHubClient {
  private connection: signalR.HubConnection | null = null;
  private startPromise: Promise<void> | null = null;

  get state() {
    return this.connection?.state ?? signalR.HubConnectionState.Disconnected;
  }

  private ensureConnection() {
    if (this.connection) return this.connection;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${BASE_URL}/hubs/chat`, {
        accessTokenFactory: () => localStorage.getItem("authToken") || "",
      })
      .withAutomaticReconnect()
      .build();

    return this.connection;
  }

  async start() {
    const conn = this.ensureConnection();
    if (conn.state === signalR.HubConnectionState.Connected) return;

    if (!this.startPromise) {
      this.startPromise = conn
        .start()
        .catch((err) => {
          this.startPromise = null;
          throw err;
        })
        .then(() => {});
    }
    await this.startPromise;
  }

  async stop() {
    if (!this.connection) return;
    this.startPromise = null;
    await this.connection.stop();
  }

  on<K extends keyof ChatHubEvents>(event: K, handler: ChatHubEvents[K]) {
    const conn = this.ensureConnection();
    conn.on(event as string, handler as any);
    return () => conn.off(event as string, handler as any);
  }

  // v3 hub methods: JoinRoom, LeaveRoom, SendMessage
  async joinRoom(roomId: string) {
    const conn = this.ensureConnection();
    await this.start();
    return conn.invoke("JoinRoom", roomId);
  }

  async leaveRoom(roomId: string) {
    const conn = this.ensureConnection();
    await this.start();
    return conn.invoke("LeaveRoom", roomId);
  }

  async sendMessage(roomId: string, message: string) {
    const conn = this.ensureConnection();
    await this.start();
    return conn.invoke("SendMessage", roomId, message);
  }
}

export const chatHub = new ChatHubClient();

