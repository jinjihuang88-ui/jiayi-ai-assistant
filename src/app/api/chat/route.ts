import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!process.env.COZE_API_KEY) {
      return NextResponse.json({
        reply: "API 配置错误，请联系管理员。",
      });
    }

    const botId = process.env.COZE_BOT_ID || "7598385173373190195";

    // 尝试流式请求
    const res = await fetch("https://api.coze.cn/open_api/v2/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.COZE_API_KEY}`,
      },
      body: JSON.stringify({
        bot_id: botId,
        user: "web_user_" + Date.now(),
        query: message,
        stream: true,
      }),
    });

    if (!res.ok) {
      console.error("Coze API error:", res.status, res.statusText);
      return NextResponse.json({
        reply: "AI 服务暂时不可用，请稍后再试。",
      });
    }

    // 检查是否是流式响应
    const contentType = res.headers.get("content-type");
    
    if (contentType?.includes("text/event-stream") || contentType?.includes("application/octet-stream")) {
      // 流式响应 - 转发给客户端
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      const stream = new ReadableStream({
        async start(controller) {
          const reader = res.body?.getReader();
          if (!reader) {
            controller.close();
            return;
          }

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split("\n");

              for (const line of lines) {
                if (line.startsWith("data:")) {
                  const data = line.slice(5).trim();
                  if (data === "[DONE]") continue;
                  
                  try {
                    const parsed = JSON.parse(data);
                    // 扣子流式返回的消息格式
                    if (parsed.message?.type === "answer" && parsed.message?.content) {
                      controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ content: parsed.message.content })}\n\n`)
                      );
                    } else if (parsed.event === "message" && parsed.message?.content) {
                      controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ content: parsed.message.content })}\n\n`)
                      );
                    }
                  } catch {
                    // 忽略解析错误
                  }
                }
              }
            }
          } catch (error) {
            console.error("Stream error:", error);
          } finally {
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // 非流式响应 - 直接返回
    const data = await res.json();
    let reply = "抱歉，我暂时无法回答这个问题。";

    if (data.messages && Array.isArray(data.messages)) {
      const answerMsg = data.messages.find(
        (m: any) => m.type === "answer" && m.content
      );
      if (answerMsg) {
        reply = answerMsg.content;
      } else {
        const assistantMsgs = data.messages.filter(
          (m: any) => m.role === "assistant" && m.content
        );
        if (assistantMsgs.length > 0) {
          reply = assistantMsgs[assistantMsgs.length - 1].content;
        }
      }
    }

    return NextResponse.json({ reply });
  } catch (e) {
    console.error("Chat API error:", e);
    return NextResponse.json({
      reply: "系统暂时无法生成回答，请稍后再试。",
    });
  }
}
