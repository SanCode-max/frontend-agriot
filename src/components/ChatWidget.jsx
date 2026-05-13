/**
 * ChatWidget.jsx
 * Floating multilingual chat widget for the Knowledge Management project.
 * Communicates with the backend via POST /api/chat.
 * Displays a Persona Transhumana welcome message on first load.
 * Supports Spanish and English responses automatically.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import "./ChatWidget.css";
import { buildApiUrl } from "../services/apiClient";

const WELCOME_ES =
  "Soy LIBRE, AUTÓNOMO Y RESPONSABLE a través del diálogo y la construcción, como ideal regulativo; me dirijo, controlo y dicto mis propias leyes. ¿En qué puedo ayudarte hoy?";

const WELCOME_EN =
  "I am FREE, AUTONOMOUS AND RESPONSIBLE through dialogue and construction, as a regulative ideal; I direct, control and dictate my own laws. How can I help you today?";

function genId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isPrintableAsciiOnly(text) {
  for (let i = 0; i < text.length; i += 1) {
    const c = text.charCodeAt(i);
    if (c < 32 || c > 126) return false;
  }
  return true;
}

/** Lightweight heuristic for English vs Spanish in short user messages. */
function isLikelyEnglish(text) {
  const t = text.trim().toLowerCase();
  if (!t) return false;
  const spanishHints =
    /[áéíóúñü¿¡]|\b(hola|qué|cómo|gracias|por favor|bien|sí|no|ayuda|dónde|cuándo|por qué)\b/;
  const englishHints =
    /\b(the|hello|hi|how|what|thanks|thank you|please|yes|no|can you|help|where|when|why)\b/i;
  if (spanishHints.test(t) && !englishHints.test(t)) return false;
  if (englishHints.test(t)) return true;
  if (/[áéíóúñü¿¡]/.test(t)) return false;
  return isPrintableAsciiOnly(t) && t.length > 2;
}

function isLikelyEnglishReply(text) {
  const t = (text || "").trim().toLowerCase();
  if (!t) return false;
  return isLikelyEnglish(t);
}

function getChatEndpoint() {
  if (process.env.NODE_ENV === "development") {
    return "/api/chat";
  }
  return buildApiUrl("/api/chat");
}

function toHistoryPayload(list) {
  return list
    .filter(
      (m) =>
        !m.loading &&
        (m.role === "user" || m.role === "model") &&
        typeof m.content === "string" &&
        m.content.length > 0
    )
    .map(({ role, content }) => ({ role, content }));
}

function swapWelcomeToEnglish(prev) {
  if (!prev.length || prev[0].content !== WELCOME_ES) return prev;
  const next = [...prev];
  next[0] = { ...next[0], role: "model", content: WELCOME_EN };
  return next;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState(() => [
    { role: "model", content: WELCOME_ES, id: "welcome" },
  ]);
  const messagesRef = useRef(messages);
  const sendingRef = useRef(false);
  const listRef = useRef(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, open, scrollToBottom]);

  const sendMessage = async () => {
    const userText = input.trim();
    if (!userText || sendingRef.current) return;
    sendingRef.current = true;
    setSending(true);

    const base = messagesRef.current;
    let working = base;
    if (isLikelyEnglish(userText)) {
      working = swapWelcomeToEnglish(working);
    }

    const historyForApi = toHistoryPayload(working);
    const userMsg = { role: "user", content: userText, id: genId() };
    const loadingId = genId();
    const loadingMsg = { role: "model", loading: true, id: loadingId };

    setInput("");
    setMessages([...working, userMsg, loadingMsg]);

    try {
      const response = await fetch(getChatEndpoint(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: historyForApi,
        }),
      });
      const data = await response.json().catch(() => ({}));
      const reply =
        typeof data.reply === "string"
          ? data.reply
          : "No recibí una respuesta válida del servidor.";

      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === loadingId);
        if (idx === -1) return prev;
        let next = [
          ...prev.slice(0, idx),
          { role: "model", content: reply, id: genId() },
          ...prev.slice(idx + 1),
        ];
        if (isLikelyEnglishReply(reply)) {
          next = swapWelcomeToEnglish(next);
        }
        return next;
      });
    } catch {
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === loadingId);
        if (idx === -1) return prev;
        return [
          ...prev.slice(0, idx),
          {
            role: "model",
            content: "No se pudo conectar con el asistente. Intenta de nuevo.",
            id: genId(),
          },
          ...prev.slice(idx + 1),
        ];
      });
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="km-chat-root" data-open={open ? "true" : "false"}>
      <button
        type="button"
        className="km-chat-toggle"
        aria-expanded={open}
        aria-controls="km-chat-panel"
        aria-label={open ? "Cerrar asistente" : "Abrir asistente KM"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <span className="km-chat-toggle-icon" aria-hidden>
            ×
          </span>
        ) : (
          <svg
            className="km-chat-toggle-icon km-chat-bubble-svg"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2z" />
          </svg>
        )}
      </button>

      {open && (
        <div
          id="km-chat-panel"
          className="km-chat-panel"
          role="dialog"
          aria-label="KM Assistant"
        >
          <header className="km-chat-header">
            <span className="km-chat-title">KM Assistant</span>
            <button
              type="button"
              className="km-chat-close"
              aria-label="Cerrar panel"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </header>

          <div className="km-chat-messages" ref={listRef}>
            {messages.map((m) => {
              if (m.loading) {
                return (
                  <div
                    key={m.id}
                    className="km-chat-row km-chat-row-bot"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="km-chat-bubble km-chat-bubble-bot km-chat-loading-bubble">
                      <span className="km-chat-dot" />
                      <span className="km-chat-dot" />
                      <span className="km-chat-dot" />
                    </div>
                  </div>
                );
              }
              const isUser = m.role === "user";
              return (
                <div
                  key={m.id}
                  className={`km-chat-row ${isUser ? "km-chat-row-user" : "km-chat-row-bot"}`}
                >
                  <div
                    className={`km-chat-bubble ${isUser ? "km-chat-bubble-user" : "km-chat-bubble-bot"}`}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="km-chat-input-row">
            <input
              type="text"
              className="km-chat-input"
              placeholder="Escribe un mensaje…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={sending}
              aria-label="Mensaje"
            />
            <button
              type="button"
              className="km-chat-send"
              onClick={sendMessage}
              disabled={sending || !input.trim()}
            >
              Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
