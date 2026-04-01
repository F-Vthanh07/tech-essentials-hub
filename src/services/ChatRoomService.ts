import { httpClient } from "./httpClient";

export type ChatRoomStatus = "Waiting" | "HandledByStaff" | "Closed";
export type ChatMessageUserType = "Customer" | "Staff" | "AI";

export type ChatMessageResponse = {
  id: string;
  roomId: string;
  senderId?: string | null;
  senderName?: string | null;
  content: string;
  userType: ChatMessageUserType;
  createdAt: string;
};

export type ChatRoomResponse = {
  id: string;
  name?: string | null;
  customerId: string;
  customerName?: string | null;
  activeStaffId?: string | null;
  activeStaffName?: string | null;
  status: ChatRoomStatus;
  isAIEnabled: boolean;
  createdAt: string;
  closedAt?: string | null;
  messages?: ChatMessageResponse[];
};

export const chatRoomService = {
  createRoom: () => httpClient.post<ChatRoomResponse>("/api/chatroom"),
  getActiveRooms: () => httpClient.get<ChatRoomResponse[]>("/api/chatroom/active"),
  getMyRooms: () => httpClient.get<ChatRoomResponse[]>("/api/chatroom/my-rooms"),
  getRoomDetails: (roomId: string) =>
    httpClient.get<ChatRoomResponse>(`/api/chatroom/${roomId}`),
  joinRoomByStaff: (roomId: string) =>
    httpClient.post<ChatRoomResponse>(`/api/chatroom/${roomId}/join`),
  leaveRoomByStaff: (roomId: string) =>
    httpClient.post<{ message: string }>(`/api/chatroom/${roomId}/leave`),
  toggleAi: (roomId: string, enabled: boolean) =>
    httpClient.patch<{ roomId: string; isAIEnabled: boolean }>(
      `/api/chatroom/${roomId}/ai?enabled=${enabled}`
    ),
  closeRoom: (roomId: string) =>
    httpClient.patch<{ message: string }>(`/api/chatroom/${roomId}/close`),
};

