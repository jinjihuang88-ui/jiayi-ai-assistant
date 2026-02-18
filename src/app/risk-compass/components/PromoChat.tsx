"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { GlassCard } from "./GlassCard";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function cleanContent(s: string): string {
  if (!s) return "";
  return s
    .replace(/\{"msg_type"[^}]*\}/g, "")
    .replace(/\{"finish_reason"[^}]*\}/g, "")
    .replace(/\{"event"[^}]*\}/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function genId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "rc_" + Math.random().toString(36).slice(2) + "_" + Date.now();
}

const SUGGESTED = [
  "我想移民加拿大，有哪些途径？",
  "Express Entry 需要什么条件？",
  "学签转工签的流程是什么？",
];

export function PromoChat({ embedded }: { embedded?: boolean } = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(genId());
  const conversationId = useRef("");

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          user_id: sessionId.current,
          conversation_id: conversationId.current || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errMsg = (errData as { error?: string })?.error || "请求失败";
        throw new Error(errMsg);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";
      if (reader) {
        let buf = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() || "";
          for (const line of lines) {
            const t = line.trim();
            if (!t) continue;
            try {
              const data = JSON.parse(t);
              if (data.conversation_id) conversationId.current = data.conversation_id;
              if (data.content) {
                full += data.content;
                setMessages((prev) => {
                  const next = [...prev];
                  const last = next[next.length - 1];
                  if (last?.role === "assistant") {
                    next[next.length - 1] = { ...last, content: full };
                  } else {
                    next.push({ role: "assistant", content: full });
                  }
                  return next;
                });
              }
              if (data.error) throw new Error(data.error);
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }
      }

      if (!full) {
        const fallback = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: msg,
            user_id: sessionId.current,
            conversation_id: conversationId.current || undefined,
          }),
        });
        const data = await fallback.json();
        if (data.conversation_id) conversationId.current = data.conversation_id;
        full = cleanContent(data.reply || "抱歉，暂时无法回复。");
        setMessages((prev) => [...prev, { role: "assistant", content: full }]);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "网络或服务异常，请稍后再试。";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: msg + "\n\n若持续出现，可尝试使用完整版 AI 顾问页面。" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const Wrapper = embedded ? "div" : GlassCard;
  const wrapperClass = embedded
    ? "flex h-full min-h-0 flex-col overflow-hidden"
    : "p-0 flex flex-col overflow-hidden";

  return (
    <Wrapper className={wrapperClass}>
      {!embedded && (
        <div
          className="px-5 py-4 border-b border-white/10"
          style={{ borderColor: "rgba(0,255,136,0.2)" }}
        >
          <h2 className="text-lg font-semibold" style={{ color: "#00FF88" }}>
            AI 顾问 快速问答 / Quick Q&A
          </h2>
          <p className="text-white/50 text-xs mt-1">
            输入问题或点击下方推荐问题 · Ask or click a suggested question
          </p>
        </div>
      )}
      {embedded && (
        <p className="px-4 py-2 text-white/50 text-xs border-b border-white/10">
          输入问题或点击推荐问题 · Ask or click a suggested question
        </p>
      )}

      <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${embedded ? "min-h-0" : "min-h-[200px] max-h-[320px]"}`}>
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTED.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => send(q)}
                disabled={loading}
                className="px-3 py-2 rounded-lg border text-left text-sm transition-all border-[#00FF88]/40 text-[#00FF88]/90 hover:bg-[#00FF88]/10 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className="space-y-1">
            <div
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-[#00FF88]/20 border border-[#00FF88]/40 text-white"
                    : "bg-white/5 border border-white/10 text-white/90"
                }`}
              >
                {m.content}
              </div>
            </div>
            {m.role === "assistant" && /稍后再试|请求失败|API|配置错误/.test(m.content) && (
              <div className="flex justify-start pl-1">
                <Link
                  href="/chat"
                  className="text-xs text-[#00FF88] hover:underline"
                >
                  前往完整版 AI 顾问 →
                </Link>
              </div>
            )}
          </div>
        ))}
        {loading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="rounded-lg px-4 py-2.5 text-sm text-white/50 border border-white/10">
              <span className="animate-pulse">AI 正在回复...</span>
            </div>
          </div>
        )}
        <div ref={endRef} className="h-0" aria-hidden />
      </div>

      <div className="p-4 border-t border-white/10 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send("")}
          placeholder="输入您的问题..."
          className="flex-1 rounded-lg border bg-black/30 px-4 py-2.5 text-sm text-white placeholder-white/40 border-[#00FF88]/30 focus:border-[#00FF88] focus:outline-none"
        />
        <button
          type="button"
          onClick={() => send("")}
          disabled={loading || !input.trim()}
          className="px-5 py-2.5 rounded-lg font-semibold text-sm text-black bg-[#00FF88] hover:shadow-[0_0_16px_rgba(0,255,136,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          发送
        </button>
      </div>
    </Wrapper>
  );
}
