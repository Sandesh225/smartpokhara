"use client";

import React, { useRef, useEffect, useState } from "react";
import { useUnifiedMessaging } from "@/hooks/messaging/useUnifiedMessaging";
import { MessageChannelType, MessageVariant } from "@/types/messaging"; // Ensure types exist
import {
  Send,
  Loader2,
  Sparkles,
  Lock,
  Globe,
  MessageSquare,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Shield,
  Tag,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface UniversalMessagingProps {
  channelType: MessageChannelType;
  channelId: string;
  variant?: MessageVariant;
  currentUserId: string;
  currentUserRole?: string;
  title?: string;
  subtitle?: string;
  className?: string; // Container override
}

export function UniversalMessaging({
  channelType,
  channelId,
  variant = 'default',
  currentUserId,
  currentUserRole = 'staff',
  title,
  subtitle,
  className,
}: UniversalMessagingProps) {
  const { messages, isLoading, isSending, sendMessage } = useUnifiedMessaging({
    channelType,
    channelId,
    currentUserId,
    currentUserRole,
  });

  const [input, setInput] = useState("");
  const [isInternal, setIsInternal] = useState(channelType === 'OFFICIAL_NOTE');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isSending) return;

    sendMessage({
      channelId,
      content: input,
      isInternal,
    });
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };


  // --- RENDERING VARIANTS ---

  // 1. TACTICAL (Supervisor)
  if (variant === "tactical") {
    return (
      <div className={cn("flex flex-col h-full overflow-hidden stone-card dark:stone-card-elevated border-none shadow-2xl transition-all duration-500", className)}>
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-primary/10 bg-primary/5 dark:bg-dark-surface/40 backdrop-blur-md">
           <div className="flex items-center gap-4">
             <div className="h-10 w-10 shrink-0 rounded-full bg-linear-to-r from-primary to-primary/80 flex items-center justify-center shadow-lg hover:shadow-primary/25 transition-all duration-300 group-hover:scale-105">
               <MessageSquare className="h-5 w-5 text-primary" />
             </div>
             <div>
               <h3 className="text-sm font-black uppercase tracking-[0.15em] text-foreground">
                 {title || "Communication Ledger"}
               </h3>
               <div className="flex items-center gap-2 mt-0.5">
                 <Globe className="h-3 w-3 text-emerald-500" />
                 <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                   {subtitle || "Live Stream"}
                 </p>
               </div>
             </div>
           </div>
           <Badge variant="outline" className="text-xs font-black uppercase bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3 py-1">
             Live
           </Badge>
        </div>

        {/* Message List */}
        <ScrollArea className="flex-1 p-6 bg-transparent custom-scrollbar">
          {isLoading ? (
             <div className="flex items-center justify-center h-full">
               <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : messages.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full py-20 opacity-40">
               <Sparkles className="h-12 w-12 text-primary/30 mb-4" />
               <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                 No Data in Stream
               </p>
             </div>
          ) : (
             <div className="space-y-6">
                {messages.map((msg, idx) => {
                   const isMe = msg.author_id === currentUserId;
                   const showHeader = idx === 0 || messages[idx - 1].author_id !== msg.author_id;
                   
                   return (
                     <div key={msg.id || idx} className={cn("flex gap-4 group", isMe ? "flex-row-reverse" : "flex-row")}>
                        {showHeader ? (
                           <Avatar className="h-9 w-9 border border-primary/20 shadow-sm mt-1">
                              <AvatarImage src={msg.author_avatar || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black">
                                 {msg.author_name?.[0] || "?"}
                              </AvatarFallback>
                           </Avatar>
                        ) : <div className="w-9" />}
                        
                        <div className={cn("flex flex-col max-w-[85%]", isMe ? "items-end" : "items-start")}>
                           {showHeader && (
                              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 px-1">
                                 {isMe ? "You" : msg.author_name}
                              </span>
                           )}
                           <div className={cn(
                              "rounded-lg px-4 py-3 text-sm leading-relaxed shadow-sm border",
                              msg.is_internal 
                                ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
                                : isMe 
                                   ? "bg-primary text-primary-foreground border-primary" 
                                   : "bg-card dark:bg-muted/10 border-border text-foreground"
                           )}>
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                              {msg.status === 'sending' && <span className="text-[9px] opacity-70 block mt-1">Sending...</span>}
                              {msg.is_optimistic && <span className="text-[9px] opacity-70 block mt-1">Sending...</span>}
                           </div>
                           <span className="text-[9px] font-bold text-muted-foreground/30 mt-1 px-1">
                             {format(new Date(msg.created_at), "HH:mm")}
                           </span>
                        </div>
                     </div>
                   );
                })}
                <div ref={scrollRef} />
             </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="p-4 bg-muted/20 dark:bg-dark-surface/60 border-t border-primary/10">
           {channelType !== 'OFFICIAL_NOTE' && (
              <div className="flex items-center justify-end mb-2 px-1 gap-2">
                 <span className="text-[10px] font-bold text-muted-foreground uppercase">Internal Mode</span>
                 <Switch checked={isInternal} onCheckedChange={setIsInternal} className="scale-75 data-[state=checked]:bg-amber-500" />
              </div>
           )}
           <form onSubmit={handleSend} className="flex gap-3 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isInternal ? "Add internal note..." : "Type message..."}
                disabled={isSending}
                className={cn(
                  "h-12 bg-background border-primary/10 focus-visible:ring-primary rounded-xl pr-14 text-sm font-medium shadow-inner",
                  isInternal && "border-amber-500/30 bg-amber-500/5 focus-visible:ring-amber-500"
                )}
              />
              <Button type="submit" disabled={!input.trim() || isSending} className="absolute right-1 top-1 h-10 w-10 p-0 rounded-lg shadow-sm">
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
           </form>
        </div>
      </div>
    );
  }

  // 2. GRADIENT (Citizen)
  if (variant === "gradient") {
    return (
      <div className={cn("glass rounded-3xl overflow-hidden border border-white/50 shadow-2xl flex flex-col h-full", className)}>
         {/* Colorful Header */}
         <div className="relative overflow-hidden shrink-0">
           <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />
           <div className="absolute inset-0 bg-grid-pattern opacity-20" />
           <div className="relative px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-lg border border-white/20">
                    <Shield className="w-5 h-5" />
                 </div>
                 <div className="text-white">
                    <h3 className="font-bold text-lg leading-tight">{title || "Support Chat"}</h3>
                    <p className="text-xs text-white/80 font-medium">{subtitle || "We are here to help"}</p>
                 </div>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1.5 border border-white/20">
                 <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                 <span className="text-xs font-bold text-white uppercase tracking-wider">Live</span>
              </div>
           </div>
         </div>

         {/* Messages */}
         <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-slate-50 to-white relative">
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
            {isLoading ? (
               <div className="flex justify-center py-10"><Loader2 className="w-10 h-10 animate-spin text-indigo-500/30" /></div>
            ) : messages.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                     <Sparkles className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h4 className="font-bold text-slate-700">Start the conversation</h4>
                  <p className="text-sm text-slate-500 mt-1">Send a message to get updates on your request.</p>
               </div>
            ) : (
               messages.map((msg, idx) => {
                  const isMe = msg.author_id === currentUserId;
                  return (
                     <div key={msg.id || idx} className={cn("flex gap-3", isMe ? "flex-row-reverse" : "flex-row")}>
                        <div className={cn("flex flex-col max-w-[80%]", isMe ? "items-end" : "items-start")}>
                           <div className={cn(
                              "px-5 py-3 rounded-2xl text-sm shadow-sm",
                              isMe 
                               ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-sm"
                               : "bg-white border text-slate-700 rounded-tl-sm"
                           )}>
                              {msg.content}
                           </div>
                           <span className="text-[10px] text-slate-400 font-bold mt-1 px-1">
                              {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                           </span>
                        </div>
                     </div>
                  )
               })
            )}
            <div ref={scrollRef} />
         </div>

         {/* Input */}
         <div className="p-5 bg-white border-t border-slate-100 shrink-0">
            <div className="relative flex items-end gap-2">
               <Textarea 
                 ref={textareaRef}
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={handleKeyDown}
                 placeholder="Type your message..."
                 disabled={isSending}
                 rows={1}
                 className="min-h-[50px] max-h-[120px] bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-2xl py-3 px-4 resize-none"
               />
               <Button 
                  onClick={() => handleSend()} 
                  disabled={!input.trim() || isSending}
                  className="h-[50px] w-[50px] rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
               >
                  {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
               </Button>
            </div>
         </div>
      </div>
    );
  }

  // 3. DEFAULT (Staff)
  return (
    <div className={cn("flex flex-col h-full bg-background border border-border rounded-xl shadow-sm overflow-hidden", className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between shrink-0">
         <div>
            <h3 className="text-sm font-semibold text-foreground">{title || "Messages"}</h3>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
         </div>
         {channelType !== 'OFFICIAL_NOTE' && (
            <div className="flex items-center gap-2">
               <span className="text-[10px] uppercase font-bold text-muted-foreground">Internal</span>
               <Switch checked={isInternal} onCheckedChange={setIsInternal} />
            </div>
         )}
      </div>

      {/* List */}
      <ScrollArea className="flex-1 p-4 bg-muted/10">
         {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
         ) : messages.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground mt-8">No messages yet.</div>
         ) : (
            <div className="space-y-4">
               {messages.map((msg, idx) => {
                  const isMe = msg.author_id === currentUserId;
                  return (
                     <div key={msg.id || idx} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                        <div className={cn(
                           "max-w-[85%] px-4 py-2 rounded-lg text-sm",
                           msg.is_internal
                             ? "bg-amber-100 text-amber-900 border border-amber-200"
                             : isMe 
                               ? "bg-primary text-primary-foreground" 
                               : "bg-card border text-foreground"
                        )}>
                           <p>{msg.content}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1 px-1">
                           <span className="text-[10px] text-muted-foreground font-medium">
                              {/* {msg.author_name} •  */}
                              {format(new Date(msg.created_at), "MMM d, h:mm a")}
                           </span>
                        </div>
                     </div>
                  );
               })}
               <div ref={scrollRef} />
            </div>
         )}
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t bg-card shrink-0">
         <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
            <Input 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder="Type a message..."
               disabled={isSending}
               className={cn(isInternal && "bg-amber-50 border-amber-200 placeholder:text-amber-400")}
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isSending}>
               {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
         </form>
      </div>
    </div>
  );
}
