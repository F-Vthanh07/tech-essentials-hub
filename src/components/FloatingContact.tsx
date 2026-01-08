import { useState } from "react";
import { Phone, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const FloatingContact = () => {
  const [isOpen, setIsOpen] = useState(false);

  const contacts = [
    {
      name: "Zalo",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.18-.18-.444-.18-.624 0l-1.98 1.98-1.98-1.98c-.18-.18-.444-.18-.624 0-.18.18-.18.444 0 .624l1.98 1.98-1.98 1.98c-.18.18-.18.444 0 .624.084.084.192.132.312.132s.228-.048.312-.132l1.98-1.98 1.98 1.98c.084.084.192.132.312.132s.228-.048.312-.132c.18-.18.18-.444 0-.624l-1.98-1.98 1.98-1.98c.18-.18.18-.444 0-.624z" />
        </svg>
      ),
      color: "bg-blue-500 hover:bg-blue-600",
      href: "https://zalo.me/",
    },
    {
      name: "Messenger",
      icon: <MessageCircle className="w-5 h-5" />,
      color: "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
      href: "https://m.me/",
    },
    {
      name: "Hotline",
      icon: <Phone className="w-5 h-5" />,
      color: "bg-primary hover:bg-brand-red-hover",
      href: "tel:19001234",
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-3">
      {/* Contact buttons */}
      <div
        className={`flex flex-col gap-3 transition-all duration-300 ${
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {contacts.map((contact) => (
          <a
            key={contact.name}
            href={contact.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 px-4 py-3 rounded-full text-primary-foreground shadow-lg transition-all hover:scale-105 ${contact.color}`}
          >
            {contact.icon}
            <span className="font-medium text-sm">{contact.name}</span>
          </a>
        ))}
      </div>

      {/* Main button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center transition-all hover:scale-110 button-shadow"
      >
        {/* Pulse effect */}
        <span className="absolute inset-0 rounded-full bg-primary animate-pulse-ring" />
        
        {isOpen ? (
          <X className="w-6 h-6 transition-transform" />
        ) : (
          <Phone className="w-6 h-6 transition-transform" />
        )}
      </button>
    </div>
  );
};

export default FloatingContact;
