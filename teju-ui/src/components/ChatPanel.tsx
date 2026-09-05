import { submitChat } from '../services/ChatService';
import { useEffect, useRef, useState, type JSX } from 'react';
import { useAI } from '../context/AIContext';
import { suggestedPrompts } from '../lib/aiEngine';
import { sounds } from '../lib/sound';
import {
  Send,
  Copy,
  RefreshCw,
  Pin,
  Volume2,
  Sparkles,
  Trash2,
} from 'lucide-react';

export default function ChatPanel() {
  const {
    messages,
    addMessage,
    updateMessage,
    togglePin,
    clearMessages,
    state,
    setState,
    focusMode,
    setLastInput,
  } = useAI();

  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSubmit(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    setLastInput(trimmed);
    addMessage({
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    });
    setInput('');
    setState('thinking');
    if (sounds) sounds.thinking();
const responseText = await submitChat(
  trimmed,
  messages.map((m) => ({
    role: m.role,
    content: m.content,
  })),
);
    const assistantId = crypto.randomUUID();
    addMessage({
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      streaming: false,
    });
    setState('responding');
    if (sounds) sounds.respond();

    updateMessage(assistantId, responseText);
    setState('idle');
  }
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(input);
    }
  }

  function handleCopy(content: string) {
    navigator.clipboard.writeText(content);
    if (sounds) sounds.click();
  }

  function handleRegenerate() {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUser) {
      handleSubmit(lastUser.content);
    }
  }

  return (
    <div
      className={`glass-strong rounded-3xl overflow-hidden transition-all duration-500 ease-out flex flex-col ${
        focusMode ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100'
      } ${isExpanded ? 'w-[440px] h-[600px]' : 'w-[380px] h-[520px]'}`}
      style={{
        transitionProperty: 'width, height, opacity, transform',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-cyan-accent/10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald animate-breathe" />
          <span className="text-sm font-medium text-cyan-accent/90 tracking-wide">
            Teju Chat
          </span>
          <span className="text-xs text-white/30 ml-1">
            {messages.length} messages
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setIsExpanded((e) => !e);
              sounds.click();
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white/80"
            aria-label="Toggle size"
          >
            <Sparkles size={14} />
          </button>
          <button
            onClick={() => {
              clearMessages();
              sounds.click();
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white/80"
            aria-label="Clear chat"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-4 animate-breathe">
              <Sparkles size={28} className="text-cyan-accent/70" />
            </div>
            <p className="text-white/60 text-sm font-medium mb-1">
              Start a conversation
            </p>
            <p className="text-white/30 text-xs mb-4">
              Type below or hold SPACE to speak
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-[300px]">
              {suggestedPrompts.slice(0, 4).map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSubmit(prompt)}
                  className="text-xs px-3 py-1.5 rounded-full glass hover:border-cyan-accent/30 transition-all hover:scale-105 text-white/60 hover:text-cyan-accent/90"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
          >
            <div
              className={`group max-w-[85%] rounded-2xl px-4 py-2.5 ${
                msg.role === 'user'
                  ? 'bg-cyan-accent/15 border border-cyan-accent/20'
                  : 'glass border border-white/5'
              }`}
            >
              <div className="text-sm text-white/85 whitespace-pre-wrap break-words leading-relaxed">
                <MarkdownLite content={msg.content} />
                {msg.streaming && (
                  <span className="inline-block w-1.5 h-4 bg-cyan-accent/70 ml-0.5 animate-pulse rounded-sm" />
                )}
              </div>
              {msg.role === 'assistant' && !msg.streaming && (
                <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopy(msg.content)}
                    className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
                    aria-label="Copy"
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    onClick={handleRegenerate}
                    className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
                    aria-label="Regenerate"
                  >
                    <RefreshCw size={12} />
                  </button>
                  <button
                    onClick={() => togglePin(msg.id)}
                    className={`p-1 rounded hover:bg-white/10 transition-colors ${
                      msg.pinned ? 'text-cyan-accent' : 'text-white/40 hover:text-white/70'
                    }`}
                    aria-label="Pin"
                  >
                    <Pin size={12} />
                  </button>
                  <button
                    onClick={() => sounds.click()}
                    className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
                    aria-label="Voice playback"
                  >
                    <Volume2 size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {state === 'thinking' && (
          <div className="flex justify-start animate-fade-in">
            <div className="glass rounded-2xl px-4 py-3">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-cyan-accent/60"
                    style={{
                      animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-cyan-accent/10">
        <div className="flex items-center gap-2 glass rounded-2xl px-3 py-2 focus-within:border-cyan-accent/30 transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Teju..."
            className="flex-1 bg-transparent text-sm text-white/90 placeholder:text-white/30 outline-none"
          />
          <button
            onClick={() => handleSubmit(input)}
            disabled={!input.trim()}
            className="p-1.5 rounded-xl bg-cyan-accent/20 hover:bg-cyan-accent/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110 active:scale-95"
            aria-label="Send"
          >
            <Send size={16} className="text-cyan-accent" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function MarkdownLite({ content }: { content: string }) {
  // Lightweight markdown: bold, inline code, code blocks, lists, headers
  const lines = content.split('\n');
  return (
    <>
      {lines.map((line, i) => {
        if (line.startsWith('```')) return null;
        if (line.startsWith('### '))
          return (
            <p key={i} className="font-semibold text-white/90 mt-2 mb-1">
              {line.slice(4)}
            </p>
          );
        if (line.startsWith('## '))
          return (
            <p key={i} className="font-semibold text-white/95 text-base mt-2 mb-1">
              {line.slice(3)}
            </p>
          );
        if (line.match(/^[\d]+\.\s/))
          return (
            <p key={i} className="ml-4 text-white/80">
              {renderInline(line)}
            </p>
          );
        if (line.startsWith('- '))
          return (
            <p key={i} className="ml-3 text-white/80">
              <span className="text-cyan-accent/60">•</span>{' '}
              {renderInline(line.slice(2))}
            </p>
          );
        if (line.trim() === '')
          return <div key={i} className="h-2" />;
        return (
          <span key={i}>
            {renderInline(line)}
            {i < lines.length - 1 && <br />}
          </span>
        );
      })}
    </>
  );
}

function renderInline(text: string) {
  // Handle **bold** and `code`
  const parts: (string | JSX.Element)[] = [];
  let remaining = text;
  let key = 0;
  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const codeMatch = remaining.match(/`(.+?)`/);
    const matches = [
      boldMatch ? { match: boldMatch, type: 'bold' } : null,
      codeMatch ? { match: codeMatch, type: 'code' } : null,
    ].filter(Boolean) as { match: RegExpMatchArray; type: string }[];
    if (matches.length === 0) {
      parts.push(remaining);
      break;
    }
    const earliest = matches.sort((a, b) => a.match.index! - b.match.index!)[0];
    const idx = earliest.match.index!;
    if (idx > 0) parts.push(remaining.slice(0, idx));
    if (earliest.type === 'bold') {
      parts.push(
        <strong key={key++} className="font-semibold text-white">
          {earliest.match[1]}
        </strong>,
      );
    } else {
      parts.push(
        <code
          key={key++}
          className="font-mono text-xs px-1.5 py-0.5 rounded bg-navy-900/60 border border-cyan-accent/15 text-cyan-accent/90"
        >
          {earliest.match[1]}
        </code>,
      );
    }
    remaining = remaining.slice(idx + earliest.match[0].length);
  }
  return <>{parts}</>;
}
