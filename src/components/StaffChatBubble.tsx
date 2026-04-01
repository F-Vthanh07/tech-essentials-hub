import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { chatboxService } from "@/services/ChatboxService";
import { chatRoomService, ChatMessageResponse, ChatRoomResponse } from "@/services/ChatRoomService";
import { chatHub } from "@/services/chatHub";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type ChatMessage = {
  id: string;
  sender: "user" | "staff" | "ai";
  content: string;
  time: string;
};

const formatTime = (date: Date) =>
  date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

const StaffChatBubble = () => {
  const { token, isAuthReady } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [mode, setMode] = useState<"room" | "ai">("ai");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isRoomClosed, setIsRoomClosed] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const viewport = scrollContainerRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLDivElement | null;
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages, isOpen]);

  const welcomeMessage = useMemo<ChatMessage>(
    () => ({
      id: "welcome",
      sender: "staff",
      content:
        mode === "room"
          ? "Xin chao! Ban hay nhap noi dung, staff se ho tro som nhat."
          : "Xin chao! Day la chat AI (khong can dang nhap). Dang nhap de chat voi staff theo phong.",
      time: formatTime(new Date()),
    }),
    [mode]
  );

  useEffect(() => {
    // initialize with welcome message once
    setMessages([welcomeMessage]);
  }, [welcomeMessage]);

  useEffect(() => {
    // if user hasn't started chatting yet, keep welcome text in sync with mode
    setMessages((prev) => {
      if (prev.length === 1 && prev[0]?.id === "welcome") {
        return [welcomeMessage];
      }
      return prev;
    });
  }, [welcomeMessage]);

  useEffect(() => {
    // detect mode based on token
    if (!isAuthReady) return;
    setMode(token ? "room" : "ai");
  }, [token, isAuthReady]);

  useEffect(() => {
    // service availability check (recommended in doc)
    chatboxService
      .status()
      .then((res) => setIsAvailable(res.isAvailable))
      .catch(() => setIsAvailable(true));
  }, []);

  const mapRoomMessage = (m: ChatMessageResponse): ChatMessage => {
    const sender: ChatMessage["sender"] =
      m.userType === "Customer" ? "user" : m.userType === "AI" ? "ai" : "staff";
    return {
      id: m.id,
      sender,
      content: m.content,
      time: formatTime(new Date(m.createdAt)),
    };
  };

  const hydrateFromRoom = (room: ChatRoomResponse) => {
    const history = (room.messages || []).map(mapRoomMessage);
    setMessages((prev) => {
      // keep the first welcome message, then history
      const first = prev.find((p) => p.id === "welcome") || welcomeMessage;
      return [first, ...history];
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    if (mode !== "room") return;
    if (!token) return;

    let offHandlers: Array<() => void> = [];
    let isCancelled = false;

    const setup = async () => {
      setIsConnecting(true);
      setIsRoomClosed(false);
      try {
        offHandlers.push(
          chatHub.on("ReceiveMessage", (msg) => {
            if (isCancelled) return;
            setMessages((prev) => [...prev, mapRoomMessage(msg)]);
          })
        );
        offHandlers.push(
          chatHub.on("RoomClosed", (data) => {
            if (isCancelled) return;
            setIsRoomClosed(true);
            toast.info("Phien chat da ket thuc");
          })
        );
        offHandlers.push(
          chatHub.on("StaffJoined", () => {
            if (isCancelled) return;
            toast.success("Staff da tham gia phong chat");
          })
        );
        offHandlers.push(
          chatHub.on("Error", (message) => {
            if (isCancelled) return;
            toast.error(message || "Chat hub error");
          })
        );

        await chatHub.start();

        // restore existing open room if any
        const myRooms = await chatRoomService.getMyRooms().catch(() => []);
        const openRoom = myRooms.find((r) => r.status !== "Closed") || null;

        if (openRoom) {
          setRoomId(openRoom.id);
          const roomDetail = await chatRoomService.getRoomDetails(openRoom.id).catch(() => null);
          if (roomDetail) hydrateFromRoom(roomDetail);
          await chatHub.joinRoom(openRoom.id);
        } else {
          const created = await chatRoomService.createRoom();
          setRoomId(created.id);
          hydrateFromRoom(created);
          await chatHub.joinRoom(created.id);
        }
      } catch (err: any) {
        console.warn("chat init failed", err);
        toast.error("Khong the ket noi phong chat. Vui long thu lai.");
      } finally {
        setIsConnecting(false);
      }
    };

    setup();

    return () => {
      isCancelled = true;
      offHandlers.forEach((off) => off());
    };
  }, [isOpen, mode, token]);

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (!isAvailable) return;

    setInputValue("");

    if (mode === "ai" || !token) {
      const optimistic: ChatMessage = {
        id: `local-${Date.now()}`,
        sender: "user",
        content: trimmed,
        time: formatTime(new Date()),
      };
      setMessages((prev) => [...prev, optimistic]);
      try {
        const res = await chatboxService.send({ message: trimmed, language: "vi" });
        if (!res?.isSuccessful) {
          toast.error("AI khong phan hoi duoc luc nay");
          return;
        }
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "ai",
            content: res.message,
            time: formatTime(new Date(res.respondedAt || Date.now())),
          },
        ]);
      } catch (err) {
        console.warn("ai send failed", err);
        toast.error("Khong the gui tin nhan AI");
      }
      return;
    }

    if (isRoomClosed) {
      toast.info("Phong chat da dong");
      return;
    }
    if (!roomId) {
      toast.error("Chua co roomId");
      return;
    }

    try {
      await chatHub.sendMessage(roomId, trimmed);
    } catch (err) {
      console.warn("customer send failed", err);
      toast.error("Khong the gui tin nhan");
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <Card className="w-[340px] shadow-xl border-border">
          <CardHeader className="py-3 px-4 border-b border-border">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <CardTitle className="text-base">
                  {mode === "room" ? "Chat voi Staff" : "Chat AI"}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {mode === "room"
                    ? isConnecting
                      ? "Dang ket noi..."
                      : roomId
                        ? `Room: ${roomId.slice(0, 8)}...`
                        : "Dang tao phong..."
                    : "Stateless"}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-72 px-4 py-3" ref={scrollContainerRef}>
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                      message.sender === "user"
                        ? "ml-auto bg-primary text-primary-foreground"
                        : message.sender === "ai"
                          ? "bg-blue-500/10 text-foreground border border-blue-500/20"
                          : "bg-muted text-foreground"
                    )}
                  >
                    <p>{message.content}</p>
                    <p
                      className={cn(
                        "mt-1 text-[11px]",
                        message.sender === "user"
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground"
                      )}
                    >
                      {message.time}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-3 border-t border-border">
            <form
              className="flex w-full items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void handleSend();
              }}
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Nhap noi dung..."
                disabled={!isAvailable || (mode === "room" && (isConnecting || isRoomClosed))}
              />
              <Button
                size="icon"
                type="submit"
                disabled={!isAvailable || (mode === "room" && (isConnecting || isRoomClosed))}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center transition-transform hover:scale-110 button-shadow"
        aria-label="Chat voi staff"
      >
        <span className="absolute inset-0 rounded-full bg-primary animate-pulse-ring" />
        <MessageCircle className="h-6 w-6 relative z-10" />
      </button>
    </div>
  );
};

export default StaffChatBubble;
