import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  sender: "user" | "staff";
  content: string;
  time: string;
};

const formatTime = (date: Date) =>
  date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

const StaffChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "staff",
      content: "Xin chao! Staff dang online, ban can ho tro gi a?",
      time: formatTime(new Date()),
    },
  ]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const viewport = scrollContainerRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLDivElement | null;
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: trimmed,
      time: formatTime(new Date()),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    window.setTimeout(() => {
      const staffReply: ChatMessage = {
        id: `staff-${Date.now()}`,
        sender: "staff",
        content: "Staff da nhan tin. Ben minh se phan hoi chi tiet trong it phut nhe!",
        time: formatTime(new Date()),
      };
      setMessages((prev) => [...prev, staffReply]);
    }, 500);
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <Card className="w-[340px] shadow-xl border-border">
          <CardHeader className="py-3 px-4 border-b border-border">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">Chat voi Staff</CardTitle>
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
                handleSend();
              }}
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Nhap noi dung..."
              />
              <Button size="icon" type="submit">
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
