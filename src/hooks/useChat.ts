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
      const baseUrl = process.env.NEXT_PUBLIC_CHAT_API_URL || "http://0.0.0.0:9001";
      console.log("baseUrl", baseUrl);
      fetch(
        `${baseUrl}/api/chat/history?session_id=${sessionId}&app_name=${app_name}&user_id=${user_id}`
      )
        .then((response) => {
          console.log("response", response);
          return response.json();
        })
        .then((data) => {
          const messages = data.messages.map((message: Message) => ({
            id: message.id,
            text: message.text,
            sender: message.sender,
            files: message.files,
            timestamp: new Date(message.timestamp),
          }));
          setChatState((prev) => ({
            ...prev,
            messages: messages,
          }));
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

  const updateMessage = useCallback((id: string, text: string) => {
    setChatState((prev) => ({
      ...prev,
      messages: prev.messages.map((msg) =>
        msg.id === id ? { ...msg, text } : msg
      ),
    }));
  }, []);

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
        const aiMessageId = addMessage({
          text: "",
          sender: "ai",
        });

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

        const baseUrl =
          process.env.NEXT_PUBLIC_CHAT_API_URL || "http://0.0.0.0:9001";

        const response = await fetch(`${baseUrl}/api/chat`, {
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
                  updateMessage(aiMessageId, accumulatedText.trim());
                }
              } else {
                // Fallback: treat as plain text stream
                accumulatedText += trimmed + " ";
                updateMessage(aiMessageId, accumulatedText.trim());
              }
            }
          }
        } else {
          // Non-streaming response
          let finalText = "";
          try {
            const json = await response.json();
            finalText =
              json.message || json.reply || json.data || JSON.stringify(json);
          } catch {
            finalText = await response.text();
          }
          updateMessage(aiMessageId, finalText || "");
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
    [addMessage, updateMessage, session?.user?.email]
  );

  const clearChat = useCallback(() => {
    setChatState({
      messages: [],
      isLoading: false,
      isStreaming: false,
    });
  }, []);

  return {
    messages: chatState.messages,
    isLoading: chatState.isLoading,
    isStreaming: chatState.isStreaming,
    sendMessage,
    clearChat,
  };
}
