"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

type State = "idle" | "pending";

export function TelegramLoginFlow() {
  const [state, setState] = useState<State>("idle");
  const [deepLink, setDeepLink] = useState("");
  const [token, setToken] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const savedToken = sessionStorage.getItem("auth_token");
    const savedLink = sessionStorage.getItem("auth_link");
    if (savedToken && savedLink) {
      setToken(savedToken);
      setDeepLink(savedLink);
      setState("pending");
    }
  }, []);

  useEffect(() => {
    if (state !== "pending" || !token) return;

    pollRef.current = setInterval(async () => {
      const res = await fetch(`/api/auth/poll?token=${token}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          clearInterval(pollRef.current!);
          sessionStorage.removeItem("auth_token");
          sessionStorage.removeItem("auth_link");
          window.location.href = "/dashboard";
        }
      } else if (res.status === 410 || res.status === 404) {
        clearInterval(pollRef.current!);
        sessionStorage.removeItem("auth_token");
        sessionStorage.removeItem("auth_link");
        setState("idle");
      }
    }, 2000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [state, token]);

  async function handleLogin() {
    const res = await fetch("/api/auth/start", { method: "POST" });
    const data = await res.json();
    setToken(data.token);
    setDeepLink(data.deepLink);
    sessionStorage.setItem("auth_token", data.token);
    sessionStorage.setItem("auth_link", data.deepLink);
    setState("pending");
  }

  if (state === "idle") {
    return (
      <Button onClick={handleLogin} size="lg">
        Login with Telegram
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <a href={deepLink} target="_blank" rel="noopener noreferrer">
        <Button size="lg">Open Telegram to confirm</Button>
      </a>
      <p className="text-sm text-muted-foreground">
        Tap <strong>Start</strong> in the bot chat, then come back here
      </p>
      <p className="text-xs text-muted-foreground animate-pulse">Waiting for confirmation...</p>
      <button
        className="text-xs text-muted-foreground underline"
        onClick={() => {
          sessionStorage.removeItem("auth_token");
          sessionStorage.removeItem("auth_link");
          setState("idle");
        }}
      >
        Cancel
      </button>
    </div>
  );
}
