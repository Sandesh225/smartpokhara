"use client";

import { useState } from "react";
import { Send, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Message {
  id: string;
  content: string;
  author_role: string;
  created_at: string;
  is_internal: boolean;
}

interface CommunicationThreadProps {
  complaintId: string;
  initialMessages: Message[];
  currentUserId: string;
}

export function CommunicationThread({ complaintId, initialMessages, currentUserId }: CommunicationThreadProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  // Filter out internal notes if this was a public thread component
  // But for supervisor, we typically see everything. 
  // Here we just render them distinctively.

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Optimistic update
    const newMessage: Message = {
      id: Date.now().toString(),
      content: input,
      author_role: "supervisor",
      created_at: new Date().toISOString(),
      is_internal: false
    };
    
    setMessages([...messages, newMessage]);
    setInput("");
    // TODO: Call API to persist
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-base font-semibold text-gray-900">Communication</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            <p className="text-sm">No messages yet.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.author_role === "supervisor"; // Simplified check
            const isSystem = msg.author_role === "system";

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-4">
                  <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                    {msg.content}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col max-w-[80%]",
                  isMe ? "self-end items-end" : "self-start items-start"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-600 capitalize">
                    {msg.author_role}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {format(new Date(msg.created_at), "h:mm a")}
                  </span>
                </div>
                <div
                  className={cn(
                    "px-4 py-3 rounded-2xl text-sm",
                    isMe
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                  )}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <form onSubmit={handleSend} className="flex gap-2">
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}