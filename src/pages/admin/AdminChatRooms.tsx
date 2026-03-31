import { useMemo, useState } from "react";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageSquare, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

type ChatRoomStatus = "open" | "closed";

type ChatRoom = {
  id: string;
  name: string;
  createdBy: string;
  participants: number;
  lastMessageAt: string;
  status: ChatRoomStatus;
};

const initialRooms: ChatRoom[] = [
  {
    id: "room-1",
    name: "Ho tro don hang",
    createdBy: "staff01",
    participants: 3,
    lastMessageAt: "01/04/2026 09:15",
    status: "open",
  },
  {
    id: "room-2",
    name: "Tu van custom case",
    createdBy: "staff02",
    participants: 2,
    lastMessageAt: "01/04/2026 08:40",
    status: "open",
  },
  {
    id: "room-3",
    name: "Bao hanh phu kien",
    createdBy: "staff03",
    participants: 4,
    lastMessageAt: "31/03/2026 17:55",
    status: "closed",
  },
];

const AdminChatRooms = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>(initialRooms);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");

  const filteredRooms = useMemo(
    () =>
      rooms.filter((room) =>
        `${room.name} ${room.createdBy}`.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [rooms, searchTerm]
  );

  const openRooms = rooms.filter((room) => room.status === "open").length;
  const closedRooms = rooms.length - openRooms;

  const handleCreateRoom = () => {
    const trimmed = newRoomName.trim();
    if (!trimmed) {
      toast.error("Vui long nhap ten phong chat");
      return;
    }

    const nextRoom: ChatRoom = {
      id: `room-${Date.now()}`,
      name: trimmed,
      createdBy: "admin",
      participants: 1,
      lastMessageAt: new Date().toLocaleString("vi-VN"),
      status: "open",
    };
    setRooms((prev) => [nextRoom, ...prev]);
    setNewRoomName("");
    setIsCreateOpen(false);
    toast.success("Da tao phong chat moi");
  };

  const handleToggleStatus = (id: string) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === id
          ? { ...room, status: room.status === "open" ? "closed" : "open" }
          : room
      )
    );
    toast.success("Da cap nhat trang thai phong");
  };

  const handleDelete = (id: string) => {
    setRooms((prev) => prev.filter((room) => room.id !== id));
    toast.success("Da xoa phong chat");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Quan ly phong chat</h1>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Tao phong
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ten phong</TableHead>
                <TableHead>Nguoi tao</TableHead>
                <TableHead>Thanh vien</TableHead>
                <TableHead>Tin nhan gan nhat</TableHead>
                <TableHead>Trang thai</TableHead>
                <TableHead className="text-right">Thao tac</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      {room.name}
                    </div>
                  </TableCell>
                  <TableCell>{room.createdBy}</TableCell>
                  <TableCell>{room.participants}</TableCell>
                  <TableCell>{room.lastMessageAt}</TableCell>
                  <TableCell>
                    <Badge variant={room.status === "open" ? "default" : "secondary"}>
                      {room.status === "open" ? "Dang mo" : "Da dong"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => handleToggleStatus(room.id)}>
                        {room.status === "open" ? "Dong phong" : "Mo lai"}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(room.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tao phong chat moi</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Nhap ten phong chat..."
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateRoom();
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Huy
            </Button>
            <Button onClick={handleCreateRoom}>Tao phong</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminChatRooms;
