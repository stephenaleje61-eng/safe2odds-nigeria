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
  AlertCircle,
  Radio,
  Crown
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
    <div className="bg-[#0E121A] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col h-[650px] sm:h-[720px]">
      
      {/* Chat Room Header */}
      <div className="bg-[#141923] text-white p-4 sm:p-5 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-red-600/20 text-red-400 rounded-xl border border-red-500/30">
            <MessageSquare className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                Live Football Match Chat
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/40">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                LIVE CHAT
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Real-time community banter for fans worldwide. Instant replies & alerts.
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchChatMessages(false)}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          title="Refresh chat"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-400' : ''}`} />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#0A0D14]"
      >
        {messages.length === 0 && !loading && (
          <div className="text-center py-16 text-gray-400 space-y-2">
            <MessageSquare className="w-10 h-10 mx-auto text-gray-600" />
            <p className="text-sm font-semibold text-gray-300">No messages yet. Be the first to start the banter!</p>
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
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-white/20 shadow-md"
                  onError={e => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              </button>

              {/* Message Content Bubble */}
              <div className={`max-w-[82%] sm:max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                
                {/* Author Info Header */}
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px]">
                  <button
                    onClick={() => onOpenProfile && onOpenProfile(msg.senderUsername)}
                    className="font-extrabold text-gray-200 hover:text-red-400 transition-colors"
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
                    <span className="bg-red-950 text-red-400 text-[9px] font-black px-1.5 py-0.2 rounded border border-red-700/60 flex items-center gap-0.5">
                      <Crown className="w-2.5 h-2.5 text-red-400" /> ADMIN
                    </span>
                  )}
                  {isMod && (
                    <span className="bg-blue-950 text-blue-400 text-[9px] font-black px-1.5 py-0.2 rounded border border-blue-700/60">
                      MOD
                    </span>
                  )}

                  <span className="text-gray-500 text-[10px]">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Reply To Reference Box */}
                {msg.replyTo && (
                  <div className={`text-[11px] p-2 rounded-xl mb-1 border flex items-center gap-1.5 ${
                    isMe 
                      ? 'bg-red-950/80 border-red-700/60 text-red-200 text-right' 
                      : 'bg-white/10 border-white/15 text-gray-300'
                  }`}>
                    <CornerDownRight className="w-3 h-3 text-gray-400 shrink-0" />
                    <span className="font-bold">@{msg.replyTo.senderUsername}:</span>
                    <span className="truncate italic">"{msg.replyTo.text}"</span>
                  </div>
                )}

                {/* Bubble Body */}
                <div 
                  className={`p-3 sm:p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md ${
                    isMe
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white rounded-tr-xs'
                      : isAdmin
                      ? 'bg-[#1D1418] text-white border border-red-600/40 rounded-tl-xs shadow-red-950/20'
                      : 'bg-[#151A24] text-gray-100 border border-white/10 rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                </div>

                {/* Actions: Reply and Like */}
                <div className="flex items-center gap-3 mt-1 px-1 text-[11px] text-gray-400">
                  <button
                    onClick={() => setReplyingTo(msg)}
                    className="hover:text-red-400 font-bold flex items-center gap-1 transition-colors"
                  >
                    <span>Reply</span>
                  </button>

                  <button
                    onClick={() => handleLikeMessage(msg.id)}
                    className="hover:text-red-500 font-bold flex items-center gap-1 transition-colors group/heart"
                  >
                    <Heart className={`w-3.5 h-3.5 ${msg.likes > 0 ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
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
        <div className="bg-red-950/90 border-t border-red-700/60 px-4 py-2 text-xs text-red-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-gray-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Replying banner */}
      {replyingTo && (
        <div className="bg-red-950/70 border-t border-red-700/50 px-4 py-2 flex items-center justify-between text-xs text-red-200">
          <div className="flex items-center gap-2 truncate">
            <CornerDownRight className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>Replying to <strong className="font-bold">@{replyingTo.senderUsername}</strong>:</span>
            <span className="italic truncate text-gray-300">"{replyingTo.text.slice(0, 60)}..."</span>
          </div>
          <button 
            onClick={() => setReplyingTo(null)}
            className="p-1 text-gray-400 hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input Form Footer */}
      <div className="p-3 sm:p-4 bg-[#141923] border-t border-white/10">
        {currentUser ? (
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={replyingTo ? `Reply to @${replyingTo.senderUsername}...` : "Drop a live match prediction or message..."}
              maxLength={800}
              className="flex-1 bg-[#0A0D14] border border-white/15 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-gray-500 focus:outline-hidden focus:border-red-500 transition-all"
            />
            <button
              type="submit"
              disabled={sending || !inputText.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-md shadow-red-700/30 transition-all active:scale-95 border border-red-500/30"
            >
              <span>{sending ? 'Sending...' : 'Send'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <div className="p-3 bg-[#0A0D14] rounded-2xl border border-dashed border-white/20 text-center flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-left text-xs text-gray-300">
              <strong className="text-white block font-black">Join the Live Match Banter!</strong>
              Sign in or create a worldwide account to chat with football fans in real time.
            </div>
            <button
              onClick={onOpenLogin}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-red-700/30 shrink-0"
            >
              Sign In to Chat
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
