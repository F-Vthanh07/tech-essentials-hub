import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Search, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { chatRoomService, ChatMessageResponse, ChatRoomResponse } from "@/services/ChatRoomService";
import { chatHub } from "@/services/chatHub";

const formatDateTime = (value?: string | null) => {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("vi-VN");
};

const roomStatusLabel = (status: ChatRoomResponse["status"]) => {
  if (status === "Waiting") return "Dang cho";
  if (status === "HandledByStaff") return "Dang duoc staff xu ly";
  return "Da dong";
};

const AdminChatRooms = () => {
  const [rooms, setRooms] = useState<ChatRoomResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomResponse | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [replyValue, setReplyValue] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const filteredRooms = useMemo(
    () =>
      rooms.filter((room) =>
        `${room.name || ""} ${room.customerName || ""} ${room.activeStaffName || ""} ${room.id}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      ),
    [rooms, searchTerm]
  );

  const openRooms = rooms.filter((room) => room.status !== "Closed").length;
  const closedRooms = rooms.length - openRooms;

  const fetchActiveRooms = async () => {
    setIsLoading(true);
    try {
      const data = await chatRoomService.getActiveRooms();
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("get active rooms failed", err);
      toast.error("Khong the tai danh sach phong chat");
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchActiveRooms();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void fetchActiveRooms();
    }, 15000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let offs: Array<() => void> = [];
    let cancelled = false;

    const setup = async () => {
      try {
        offs.push(
          chatHub.on("ReceiveMessage", (msg: ChatMessageResponse) => {
            if (cancelled) return;
            setSelectedRoom((prev) => {
              if (!prev || prev.id !== msg.roomId) return prev;
              const nextMessages = [...(prev.messages || []), msg];
              return { ...prev, messages: nextMessages };
            });
          })
        );

        offs.push(
          chatHub.on("AIStatusChanged", (data) => {
            if (cancelled) return;
            console.log("[AdminChatRooms] AIStatusChanged", data);
            setSelectedRoom((prev) => {
              if (!prev || prev.id !== data.roomId) return prev;
              return { ...prev, isAIEnabled: data.isAIEnabled };
            });
          })
        );

        offs.push(
          chatHub.on("RoomClosed", (data) => {
            if (cancelled) return;
            setRooms((prev) => prev.filter((r) => r.id !== data.roomId));
            setSelectedRoom((prev) => {
              if (!prev || prev.id !== data.roomId) return prev;
              return { ...prev, status: "Closed" };
            });
            toast.success("Da dong phong chat");
          })
        );

        offs.push(
          chatHub.on("Error", (message) => {
            if (cancelled) return;
            toast.error(message || "Chat hub error");
            setIsJoining(false);
          })
        );

        await chatHub.start();
      } catch (err) {
        console.warn("hub start failed", err);
      }
    };

    setup();

    return () => {
      cancelled = true;
      offs.forEach((off) => off());
    };
  }, []);

  const handleJoinRoom = async (roomId: string) => {
    setIsJoining(true);
    try {
      await chatRoomService.joinRoomByStaff(roomId);
      const detail = await chatRoomService.getRoomDetails(roomId);
      setSelectedRoom(detail);
      setIsDetailOpen(true);
      await chatHub.joinRoom(roomId);
      await fetchActiveRooms();
      setIsJoining(false);
    } catch (err) {
      console.warn("staff join failed", err);
      toast.error("Khong the nhan phong");
      setIsJoining(false);
    }
  };

  const handleToggleAi = async () => {
    if (!selectedRoom) return;
    console.log("[AdminChatRooms] handleToggleAi", {
      roomId: selectedRoom.id,
      current: selectedRoom.isAIEnabled,
      next: !selectedRoom.isAIEnabled,
    });
    try {
      await chatRoomService.toggleAi(selectedRoom.id, !selectedRoom.isAIEnabled);
      setSelectedRoom((prev) =>
        prev ? { ...prev, isAIEnabled: !prev.isAIEnabled } : prev
      );
      console.log("[AdminChatRooms] toggleAi success", {
        roomId: selectedRoom.id,
        isAIEnabled: !selectedRoom.isAIEnabled,
      });
    } catch (err) {
      console.warn("toggle ai failed", err);
      toast.error("Khong the doi trang thai AI");
    }
  };

  const handleCloseRoom = async () => {
    if (!selectedRoom) return;
    try {
      await chatRoomService.closeRoom(selectedRoom.id);
      await chatHub.leaveRoom(selectedRoom.id).catch(() => {});
      setRooms((prev) => prev.filter((r) => r.id !== selectedRoom.id));
      setIsDetailOpen(false);
      setSelectedRoom(null);
    } catch (err) {
      console.warn("close room failed", err);
      toast.error("Khong the dong phong");
    }
  };

  const handleSendReply = async () => {
    if (!selectedRoom) return;
    const trimmed = replyValue.trim();
    if (!trimmed) return;
    if (selectedRoom.status === "Closed") return;

    setReplyValue("");
    try {
      await chatHub.sendMessage(selectedRoom.id, trimmed);
    } catch (err) {
      console.warn("staff send failed", err);
      toast.error("Khong the gui tin nhan");
    }
  };

  useEffect(() => {
    if (isDetailOpen || !selectedRoom?.id) return;
    void chatHub.leaveRoom(selectedRoom.id).catch(() => {});
  }, [isDetailOpen, selectedRoom?.id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Quan ly phong chat</h1>
        <Button variant="outline" onClick={() => void fetchActiveRooms()} disabled={isLoading}>
          Tai lai
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Tong phong</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{rooms.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Dang mo</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-green-600">{openRooms}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Da dong</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-amber-600">{closedRooms}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative w-full max-w-sm">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                className="pl-9"
                placeholder="Tim theo ten phong, staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">{filteredRooms.length} phong chat</p>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phong</TableHead>
                  <TableHead>Khach hang</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Trang thai</TableHead>
                  <TableHead>Tao luc</TableHead>
                  <TableHead className="text-right">Thao tac</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        <div className="flex flex-col">
                          <span>{room.name || `Room ${room.id.slice(0, 8)}...`}</span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {room.id}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{room.customerName || room.customerId?.slice(0, 8)}</TableCell>
                    <TableCell>{room.activeStaffName || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={room.status === "Waiting" ? "default" : "secondary"}>
                        {roomStatusLabel(room.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDateTime(room.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        onClick={() => void handleJoinRoom(room.id)}
                        disabled={isJoining}
                      >
                        Nhan phong
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredRooms.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      Khong tim thay phong chat
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedRoom?.name || "Chi tiet phong chat"}{" "}
              <span className="text-xs text-muted-foreground font-mono">
                {selectedRoom?.id}
              </span>
            </DialogTitle>
          </DialogHeader>

          {selectedRoom && (
            <div className="grid gap-4 md:grid-cols-[1fr,240px]">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedRoom.status === "Waiting" ? "default" : "secondary"}>
                      {roomStatusLabel(selectedRoom.status)}
                    </Badge>
                    <Badge variant={selectedRoom.isAIEnabled ? "default" : "secondary"}>
                      AI: {selectedRoom.isAIEnabled ? "ON" : "OFF"}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => void handleToggleAi()}>
                      Toggle AI
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => void handleCloseRoom()}
                      disabled={selectedRoom.status === "Closed"}
                    >
                      Dong phong
                    </Button>
                  </div>
                </div>

                <ScrollArea className="h-[420px] rounded-lg border border-border p-3">
                  <div className="space-y-2">
                    {(selectedRoom.messages || []).map((m) => (
                      <div key={m.id} className="rounded-lg bg-muted/40 px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">
                            {m.userType === "AI"
                              ? "AI Assistant"
                              : m.senderName || m.userType}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatDateTime(m.createdAt)}</p>
                        </div>
                        <p className="text-sm mt-1 whitespace-pre-wrap">{m.content}</p>
                      </div>
                    ))}
                    {(selectedRoom.messages || []).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-10">
                        Chua co tin nhan
                      </p>
                    )}
                  </div>
                </ScrollArea>

                <form
                  className="flex items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleSendReply();
                  }}
                >
                  <Input
                    placeholder="Nhap tin nhan tra loi..."
                    value={replyValue}
                    onChange={(e) => setReplyValue(e.target.value)}
                    disabled={selectedRoom.status === "Closed"}
                  />
                  <Button size="icon" type="submit" disabled={selectedRoom.status === "Closed"}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Thong tin</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Khach</span>
                    <span className="text-right">{selectedRoom.customerName || selectedRoom.customerId}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Staff</span>
                    <span className="text-right">{selectedRoom.activeStaffName || "—"}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Tao luc</span>
                    <span className="text-right">{formatDateTime(selectedRoom.createdAt)}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Dong luc</span>
                    <span className="text-right">{formatDateTime(selectedRoom.closedAt)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminChatRooms;
