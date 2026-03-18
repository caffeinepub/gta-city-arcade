import { useCallback, useEffect, useState } from "react";
import { useGameStore } from "../../store/gameStore";

export default function SplashScreen() {
  const setStarted = useGameStore((s) => s.setStarted);
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  const start = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      setStarted(true);
      setVisible(false);
    }, 600);
  }, [setStarted]);

  useEffect(() => {
    window.addEventListener("keydown", start, { once: true });
    return () => window.removeEventListener("keydown", start);
  }, [start]);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={start}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "#0a0f1a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        opacity: fading ? 0 : 1,
        transition: "opacity 0.6s",
        fontFamily: "monospace",
        userSelect: "none",
        border: "none",
        padding: 0,
        width: "100vw",
        height: "100vh",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, #22d3ee15 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          fontSize: 72,
          fontWeight: 900,
          letterSpacing: 8,
          textTransform: "uppercase",
          background: "linear-gradient(135deg, #22d3ee, #ffb000)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: 8,
        }}
      >
        NEON RIOT
      </div>
      <div
        style={{
          color: "#a7b3bf",
          fontSize: 16,
          letterSpacing: 4,
          marginBottom: 48,
        }}
      >
        OPEN WORLD ARCADE
      </div>

      <div
        style={{
          color: "#22d3ee",
          fontSize: 14,
          letterSpacing: 3,
          animation: "blink 1.2s step-end infinite",
        }}
      >
        PRESS ANY KEY TO START
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 24,
          color: "#444",
          fontSize: 11,
          letterSpacing: 2,
        }}
      >
        WASD to move - E to enter vehicles - SHIFT to run
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </button>
  );
}
