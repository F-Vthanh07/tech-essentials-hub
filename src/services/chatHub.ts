import * as signalR from "@microsoft/signalr";
import { BASE_URL } from "./httpClient";
import type { ChatMessageResponse, ChatRoomResponse } from "./ChatRoomService";

type StaffJoinedPayload = { roomId: string; staffId: string };
type StaffLeftPayload = { roomId: string; staffId: string };
type AiStatusChangedPayload = { roomId: string; isAIEnabled: boolean };
type RoomClosedPayload = { roomId: string };

export type ChatHubEvents = {
  RoomCreated: (room: ChatRoomResponse) => void;
  NewRoomAvailable: (room: ChatRoomResponse) => void;
  RoomHistory: (room: ChatRoomResponse) => void;
  ReceiveMessage: (msg: ChatMessageResponse) => void;
  StaffJoined: (data: StaffJoinedPayload) => void;
  StaffLeft: (data: StaffLeftPayload) => void;
  AIStatusChanged: (data: AiStatusChangedPayload) => void;
  RoomClosed: (data: RoomClosedPayload) => void;
  RoomJoined: (room: ChatRoomResponse) => void;
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

  // Client -> Server methods (invoke)
  async createRoom() {
    const conn = this.ensureConnection();
    await this.start();
    return conn.invoke("CreateRoom");
  }

  async joinRoomGroup(roomId: string) {
    const conn = this.ensureConnection();
    await this.start();
    return conn.invoke("JoinRoomGroup", roomId);
  }

  async customerSendMessage(roomId: string, message: string) {
    const conn = this.ensureConnection();
    await this.start();
    return conn.invoke("CustomerSendMessage", roomId, message);
  }

  async staffJoinRoom(roomId: string) {
    const conn = this.ensureConnection();
    await this.start();
    return conn.invoke("StaffJoinRoom", roomId);
  }

  async staffLeaveRoom(roomId: string) {
    const conn = this.ensureConnection();
    await this.start();
    return conn.invoke("StaffLeaveRoom", roomId);
  }

  async staffSendMessage(roomId: string, message: string) {
    const conn = this.ensureConnection();
    await this.start();
    return conn.invoke("StaffSendMessage", roomId, message);
  }

  async toggleAi(roomId: string, enabled: boolean) {
    const conn = this.ensureConnection();
    await this.start();
    return conn.invoke("ToggleAI", roomId, enabled);
  }

  async closeRoom(roomId: string) {
    const conn = this.ensureConnection();
    await this.start();
    return conn.invoke("CloseRoom", roomId);
  }
}

export const chatHub = new ChatHubClient();

