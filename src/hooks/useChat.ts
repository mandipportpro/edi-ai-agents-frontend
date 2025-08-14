"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Message, ChatState } from "@/types/chat";

export function useChat() {
  const { data: session } = useSession();
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    isStreaming: false,
  });

  // Simple robust ID generator to avoid collisions
  const generateId = useCallback(() => {
    try {
      if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
      }
    } catch {
      // ignore
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }, []);

  const getChatHistoryBySessionId = useCallback(
    (sessionId: string) => {
      const app_name = process.env.NEXT_PUBLIC_APP_NAME || "edi_agent";
      const user_id = session?.user?.email || "";
      fetch(
        `/api/chat/history?session_id=${encodeURIComponent(sessionId)}&app_name=${encodeURIComponent(app_name)}&user_id=${encodeURIComponent(user_id)}`
      )
        .then((response) => {
          console.log("response", response);
          return response.json();
        })
        .then((data) => {
          if (data.messages) {
            const messages = data.messages.map((message: Message) => ({
              id: message.id,
              text: message.text,
              sender: message.sender,
              files: message.files,
              timestamp: new Date(message.timestamp),
            }));
            console.log("messages", messages);
            setChatState((prev) => ({
              ...prev,
              messages: messages,
            }));
          }
        });
    },
    [session?.user?.email]
  );

  // Persist a session_id for this client
  const sessionIdRef = useRef<string | null>(null);
  useEffect(() => {
    try {
      const stored =
        typeof window !== "undefined"
          ? localStorage.getItem("chat_session_id")
          : null;
      if (stored) {
        sessionIdRef.current = stored;
      } else if (
        typeof window !== "undefined" &&
        "crypto" in window &&
        "randomUUID" in crypto
      ) {
        const newId = crypto.randomUUID();
        localStorage.setItem("chat_session_id", newId);
        sessionIdRef.current = newId;
      } else {
        const newId = Date.now().toString();
        if (typeof window !== "undefined")
          localStorage.setItem("chat_session_id", newId);
        sessionIdRef.current = newId;
      }
      if (stored) {
        getChatHistoryBySessionId(stored);
      }
    } catch {
      // ignore localStorage errors
      if (!sessionIdRef.current) sessionIdRef.current = Date.now().toString();
    }
  }, [getChatHistoryBySessionId]);

  const addMessage = useCallback(
    (message: Omit<Message, "id" | "timestamp">) => {
      const newMessage: Message = {
        ...message,
        id: generateId(),
        timestamp: new Date(),
      };

      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, newMessage],
      }));

      return newMessage.id;
    },
    [generateId]
  );

  // Removed updateMessage since streaming now appends tokens as new AI messages for simplicity

  const sendMessage = useCallback(
    async (text: string, files?: File[]) => {
      // Add user message
      const userMessage: Omit<Message, "id" | "timestamp"> = {
        text,
        sender: "user",
        files:
          files && files.length > 0
            ? files.map((f) => ({ name: f.name, type: f.type, size: f.size }))
            : undefined,
      };

      addMessage(userMessage);

      // Set loading state
      setChatState((prev) => ({ ...prev, isLoading: true, isStreaming: true }));

      try {
        // Create AI message placeholder
        // const aiMessageId = addMessage({
        //   text: "",
        //   sender: "ai",
        // });

        // Prepare form data for API call
        const formData = new FormData();
        formData.append("message", text);

        const appName = process.env.NEXT_PUBLIC_APP_NAME || "edi_agent";
        formData.append("app_name", appName);

        const envUserId = process.env.NEXT_PUBLIC_CHAT_USER_ID;
        const envSessionId = process.env.NEXT_PUBLIC_CHAT_SESSION_ID;

        if (envUserId) {
          formData.append("user_id", envUserId);
        } else if (session?.user?.email) {
          formData.append("user_id", session.user.email);
        }

        if (envSessionId) {
          formData.append("session_id", envSessionId);
        } else if (sessionIdRef.current) {
          formData.append("session_id", sessionIdRef.current);
        }

        if (files && files.length > 0) {
          for (const file of files) {
            formData.append("files", file);
          }
        }

        // Call our internal Next.js API route to avoid exposing API keys
        const response = await fetch(`/api/chat`, {
          method: "POST",
          body: formData,
          redirect: "follow",
        });

        console.log("response", response);

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        const contentType = response.headers.get("content-type") || "";

        // Handle streaming responses (SSE-like)
        if (
          response.body &&
          (contentType.includes("text/event-stream") ||
            contentType.includes("text/plain"))
        ) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let accumulatedText = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;
              if (trimmed.startsWith("data: ")) {
                const data = trimmed.slice(6).trim();
                if (data && data !== "[DONE]") {
                  accumulatedText += data + " ";
                  addMessage({
                    text: accumulatedText.trim(),
                    sender: "ai",
                  });
                }
              } else {
                // Fallback: treat as plain text stream
                accumulatedText += trimmed + " ";
                addMessage({
                  text: accumulatedText.trim(),
                  sender: "ai",
                });
              }
            }
          }
        } else {
          // Non-streaming response
          let finalText = "";
          try {
            const json = await response.json();
            finalText = json.message || json.reply || json.data || "";
            console.log("finalText", finalText);
          } catch {
            finalText = await response.text();
          }
          addMessage({
            text: finalText || "",
            sender: "ai",
          });
        }
      } catch (error) {
        console.error("Error sending message:", error);
        // Add error message
        addMessage({
          text: "Sorry, I encountered an error while processing your message. Please try again.",
          sender: "ai",
        });
      } finally {
        setChatState((prev) => ({
          ...prev,
          isLoading: false,
          isStreaming: false,
        }));
      }
    },
    [addMessage, session?.user?.email]
  );

  const clearChat = useCallback(async () => {
    try {
      const appName = process.env.NEXT_PUBLIC_APP_NAME || "edi_agent";

      const envUserId = process.env.NEXT_PUBLIC_CHAT_USER_ID;
      const userId = envUserId || session?.user?.email || "";

      const envSessionId = process.env.NEXT_PUBLIC_CHAT_SESSION_ID;
      const sessionId = envSessionId || sessionIdRef.current || "";

      const baseUrl =
        process.env.NEXT_PUBLIC_CHAT_API_URL || "http://0.0.0.0:9001";

      if (sessionId && userId) {
        const response = await fetch(`${baseUrl}/api/chat/clear`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            user_id: userId,
            app_name: appName,
          }),
        });

        if (!response.ok) {
          // Log the error body for diagnostics but still clear locally
          try {
            const errText = await response.text();
            console.error("Failed to clear chat session:", errText);
          } catch {
            console.error("Failed to clear chat session");
          }
        }
      } else {
        console.warn(
          "Missing sessionId or userId when attempting to clear chat session"
        );
      }
    } catch (error) {
      console.error("Error clearing chat session:", error);
    } finally {
      // Always reset local state so the UI clears immediately
      setChatState({
        messages: [],
        isLoading: false,
        isStreaming: false,
      });
    }
  }, [session?.user?.email]);

  return {
    messages: chatState.messages,
    isLoading: chatState.isLoading,
    isStreaming: chatState.isStreaming,
    sendMessage,
    clearChat,
  };
}
