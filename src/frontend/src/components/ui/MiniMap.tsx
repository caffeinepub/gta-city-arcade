import { useEffect, useRef } from "react";
import { useGameStore } from "../../store/gameStore";

const MAP_SIZE = 180;
const WORLD_EXTENT = 240;
const SCALE = MAP_SIZE / (WORLD_EXTENT * 2);

export default function MiniMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const player = useGameStore((s) => s.player);
  const npcs = useGameStore((s) => s.npcs);
  const vehicles = useGameStore((s) => s.vehicles);
  const buildings = useGameStore((s) => s.buildings);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cx = MAP_SIZE / 2;
    const cy = MAP_SIZE / 2;

    ctx.clearRect(0, 0, MAP_SIZE, MAP_SIZE);

    // Background
    ctx.fillStyle = "#0a0f1a";
    ctx.beginPath();
    ctx.arc(cx, cy, MAP_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();

    // Clip circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, MAP_SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.clip();

    // Buildings
    ctx.fillStyle = "#1e2535";
    for (const b of buildings) {
      const bx = cx + b.minX * SCALE;
      const bz = cy + b.minZ * SCALE;
      const bw = (b.maxX - b.minX) * SCALE;
      const bh = (b.maxZ - b.minZ) * SCALE;
      ctx.fillRect(bx, bz, bw, bh);
    }

    // NPCs
    for (const npc of npcs) {
      const nx = cx + npc.position[0] * SCALE;
      const nz = cy + npc.position[1] * SCALE;
      ctx.fillStyle = npc.state === "flee" ? "#ff6b6b" : "#aaaaaa";
      ctx.beginPath();
      ctx.arc(nx, nz, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Vehicles
    for (const v of vehicles) {
      const vx = cx + v.position[0] * SCALE;
      const vz = cy + v.position[2] * SCALE;
      ctx.fillStyle = v.occupied ? "#ffb000" : v.color;
      ctx.fillRect(vx - 3, vz - 3, 6, 4);
    }

    // Player
    const px = cx + player.x * SCALE;
    const pz = cy + player.z * SCALE;
    ctx.fillStyle = "#22d3ee";
    ctx.beginPath();
    ctx.arc(px, pz, 4, 0, Math.PI * 2);
    ctx.fill();
    // Direction arrow
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(px, pz);
    ctx.lineTo(
      px + Math.sin(player.rotation) * 7,
      pz + Math.cos(player.rotation) * 7,
    );
    ctx.stroke();

    ctx.restore();

    // Border ring
    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, MAP_SIZE / 2 - 1, 0, Math.PI * 2);
    ctx.stroke();
  }, [player, npcs, vehicles, buildings]);

  return (
    <div
      className="fixed bottom-4 right-4 z-50"
      style={{ filter: "drop-shadow(0 0 8px #22d3ee88)" }}
    >
      <canvas
        ref={canvasRef}
        width={MAP_SIZE}
        height={MAP_SIZE}
        style={{ borderRadius: "50%" }}
      />
    </div>
  );
}
