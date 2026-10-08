import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Heart, 
  CornerDownRight, 
  ShieldCheck, 
  User, 
  Clock, 
  Sparkles, 
  RefreshCw,
  X,
  AlertCircle
} from 'lucide-react';
import { ChatMessage, UserProfile } from '../types';
import { ApiClient } from '../services/apiClient';

interface LiveChatRoomProps {
  currentUser: UserProfile | null;
  onOpenLogin: () => void;
  onOpenProfile?: (username: string) => void;
}

export const LiveChatRoom: React.FC<LiveChatRoomProps> = ({
  currentUser,
  onOpenLogin,
  onOpenProfile,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchChatMessages = async (quiet = false) => {
    if (!quiet) setLoading(true);
    const res = await ApiClient.getChatMessages(80);
    if (!quiet) setLoading(false);
    if (res.success && res.data) {
      setMessages(res.data.messages);
      setTotalCount(res.data.total);
    }
  };

  useEffect(() => {
    fetchChatMessages(false);

    // Live auto-polling every 3.5 seconds for instant messages & replies
    const interval = setInterval(() => {
      fetchChatMessages(true);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (!currentUser) {
      onOpenLogin();
      return;
    }

    setSending(true);
    setErrorMsg('');
    const res = await ApiClient.sendChatMessage(inputText.trim(), replyingTo?.id);
    setSending(false);

    if (res.success && res.data) {
      setMessages(prev => [...prev, res.data!]);
      setInputText('');
      setReplyingTo(null);
      setTimeout(() => scrollToBottom(true), 100);
    } else {
      setErrorMsg(res.error || 'Failed to send message.');
    }
  };

  const handleLikeMessage = async (msgId: string) => {
    if (!currentUser) {
      onOpenLogin();
      return;
    }

    const res = await ApiClient.likeChatMessage(msgId);
    if (res.success && res.data) {
      setMessages(prev =>
        prev.map(m => (m.id === msgId ? { ...m, likes: res.data!.likes } : m))
      );
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[650px] sm:h-[720px]">
      
      {/* Chat Room Header */}
      <div className="bg-[#111827] text-white p-4 sm:p-5 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-[#16A34A]/20 text-[#16A34A] rounded-xl border border-[#16A34A]/30">
            <MessageSquare className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                Live Football Match Chat
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600/30 text-red-400 border border-red-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                LIVE
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Real-time community chat for football fans worldwide. Instant replies & notifications.
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchChatMessages(false)}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          title="Refresh chat"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-green-400' : ''}`} />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50/60"
      >
        {messages.length === 0 && !loading && (
          <div className="text-center py-16 text-gray-400 space-y-2">
            <MessageSquare className="w-10 h-10 mx-auto text-gray-300" />
            <p className="text-sm font-semibold">No messages yet. Be the first to start the banter!</p>
          </div>
        )}

        {messages.map(msg => {
          const isMe = currentUser?.id === msg.senderId;
          const isAdmin = msg.senderRole === 'admin' || msg.senderRole === 'super_admin';
          const isMod = msg.senderRole === 'moderator';

          return (
            <div 
              key={msg.id} 
              className={`flex items-start gap-2.5 sm:gap-3 group ${isMe ? 'flex-row-reverse' : ''}`}
            >
              {/* User Avatar */}
              <button
                onClick={() => onOpenProfile && onOpenProfile(msg.senderUsername)}
                className="shrink-0 transition-transform hover:scale-105"
              >
                <img
                  src={msg.senderAvatar || '/src/assets/images/football_tactics_guide_1791379711012.jpg'}
                  alt={msg.senderDisplayName}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-gray-200 shadow-2xs"
                  onError={e => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              </button>

              {/* Message Content Bubble */}
              <div className={`max-w-[82%] sm:max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                
                {/* Author Info Header */}
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px]">
                  <button
                    onClick={() => onOpenProfile && onOpenProfile(msg.senderUsername)}
                    className="font-extrabold text-gray-900 hover:text-green-700 transition-colors"
                  >
                    {msg.senderDisplayName}
                  </button>

                  {/* Country Flag Badge */}
                  {msg.senderCountryFlag && (
                    <span title={msg.senderCountry} className="text-xs">
                      {msg.senderCountryFlag}
                    </span>
                  )}

                  {/* Role Badges */}
                  {isAdmin && (
                    <span className="bg-red-100 text-red-700 text-[9px] font-black px-1.5 py-0.2 rounded border border-red-200">
                      ADMIN
                    </span>
                  )}
                  {isMod && (
                    <span className="bg-blue-100 text-blue-700 text-[9px] font-black px-1.5 py-0.2 rounded border border-blue-200">
                      MOD
                    </span>
                  )}

                  <span className="text-gray-400 text-[10px]">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Reply To Reference Box */}
                {msg.replyTo && (
                  <div className={`text-[11px] p-2 rounded-xl mb-1 border flex items-center gap-1.5 ${
                    isMe 
                      ? 'bg-green-100/70 border-green-200 text-green-950 text-right' 
                      : 'bg-gray-200/60 border-gray-300 text-gray-700'
                  }`}>
                    <CornerDownRight className="w-3 h-3 text-gray-400 shrink-0" />
                    <span className="font-bold">@{msg.replyTo.senderUsername}:</span>
                    <span className="truncate italic">"{msg.replyTo.text}"</span>
                  </div>
                )}

                {/* Bubble Body */}
                <div 
                  className={`p-3 sm:p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                    isMe
                      ? 'bg-[#16A34A] text-white rounded-tr-xs'
                      : isAdmin
                      ? 'bg-red-50 text-gray-900 border border-red-200 rounded-tl-xs'
                      : 'bg-white text-gray-900 border border-gray-200 rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                </div>

                {/* Actions: Reply and Like */}
                <div className="flex items-center gap-3 mt-1 px-1 text-[11px] text-gray-400">
                  <button
                    onClick={() => setReplyingTo(msg)}
                    className="hover:text-green-700 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Reply</span>
                  </button>

                  <button
                    onClick={() => handleLikeMessage(msg.id)}
                    className="hover:text-red-600 font-bold flex items-center gap-1 transition-colors group/heart"
                  >
                    <Heart className={`w-3.5 h-3.5 ${msg.likes > 0 ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                    <span className="tabular-nums">{msg.likes}</span>
                  </button>
                </div>

              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Error notification banner */}
      {errorMsg && (
        <div className="bg-rose-50 border-t border-rose-200 px-4 py-2 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-gray-400 hover:text-gray-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Replying banner */}
      {replyingTo && (
        <div className="bg-green-50 border-t border-green-200 px-4 py-2 flex items-center justify-between text-xs text-green-950">
          <div className="flex items-center gap-2 truncate">
            <CornerDownRight className="w-3.5 h-3.5 text-green-700 shrink-0" />
            <span>Replying to <strong className="font-bold">@{replyingTo.senderUsername}</strong>:</span>
            <span className="italic truncate text-gray-600">"{replyingTo.text.slice(0, 60)}..."</span>
          </div>
          <button 
            onClick={() => setReplyingTo(null)}
            className="p-1 text-gray-400 hover:text-gray-700 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input Form Footer */}
      <div className="p-3 sm:p-4 bg-white border-t border-gray-200">
        {currentUser ? (
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={replyingTo ? `Reply to @${replyingTo.senderUsername}...` : "Drop a live match prediction or message..."}
              maxLength={800}
              className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:border-green-600 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={sending || !inputText.trim()}
              className="px-4 py-2.5 bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <span>{sending ? 'Sending...' : 'Send'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <div className="p-3 bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-center flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-left text-xs text-gray-600">
              <strong className="text-gray-900 block font-bold">Join the Live Conversation!</strong>
              Sign in or create an account with your country to chat with football fans worldwide.
            </div>
            <button
              onClick={onOpenLogin}
              className="px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
            >
              Sign In to Chat
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
