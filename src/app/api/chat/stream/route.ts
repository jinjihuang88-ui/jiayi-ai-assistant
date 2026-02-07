import { NextRequest, NextResponse } from "next/server";

/**
 * 流式对话：调用扣子 API stream: true，将内容以 NDJSON 流式返回给前端，
 * 首字更快出现，体感延迟更低。
 */
export async function POST(req: NextRequest) {
  try {
    const { message, user_id, conversation_id } = await req.json();

    if (!process.env.COZE_API_KEY) {
      return NextResponse.json(
        { error: "API 配置错误，请联系管理员。" },
        { status: 500 }
      );
    }

    const botId = process.env.COZE_BOT_ID || "7598385173373190195";
    const userId = typeof user_id === "string" && user_id ? user_id : "web_user_" + Date.now();

    const body: Record<string, unknown> = {
      bot_id: botId,
      user: userId,
      query: message,
      stream: true,
      auto_save_history: true,
    };
    if (typeof conversation_id === "string" && conversation_id) {
      body.conversation_id = conversation_id;
    }

    const res = await fetch("https://api.coze.cn/open_api/v2/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.COZE_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Coze stream API error:", res.status, errText);
      return NextResponse.json(
        { error: "AI 服务暂时不可用，请稍后再试。" },
        { status: 502 }
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = res.body?.getReader();
        if (!reader) {
          controller.enqueue(encoder.encode(JSON.stringify({ error: "无响应体" }) + "\n"));
          controller.close();
          return;
        }
        const decoder = new TextDecoder();
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            for (const line of lines) {
              const dataLine = line.startsWith("data:") ? line : null;
              if (!dataLine) continue;
              const raw = dataLine.slice(5).trim();
              if (raw === "[DONE]" || raw === "") continue;
              try {
                const data = JSON.parse(raw);
                const convId = data?.conversation_id ?? data?.conversation?.id;
                if (typeof convId === "string" && convId) {
                  controller.enqueue(encoder.encode(JSON.stringify({ conversation_id: convId }) + "\n"));
                }
                const msg = data?.message ?? data?.message_part;
                const msgType = msg?.type;
                const content =
                  msg?.content ?? data?.content ?? data?.delta;
                if (typeof content !== "string" || !content) continue;
                if (msgType != null && msgType !== "answer" && msgType !== "text") continue;
                const cleaned = content
                  .replace(/\{"msg_type"[^}]*\}/g, "")
                  .replace(/\{"finish_reason"[^}]*\}/g, "")
                  .replace(/\{"event"[^}]*\}/g, "");
                if (cleaned) {
                  controller.enqueue(encoder.encode(JSON.stringify({ content: cleaned }) + "\n"));
                }
              } catch (_) {
                // 忽略单行解析错误（可能为截断或非 JSON）
              }
            }
          }
          controller.enqueue(encoder.encode(JSON.stringify({ done: true }) + "\n"));
        } catch (e) {
          console.error("Stream read error:", e);
          controller.enqueue(encoder.encode(JSON.stringify({ error: "流式读取异常" }) + "\n"));
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    console.error("Chat stream API error:", e);
    return NextResponse.json(
      { error: "系统暂时无法生成回答，请稍后再试。" },
      { status: 500 }
    );
  }
}
