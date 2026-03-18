import { useGameStore } from "../../store/gameStore";

const STAR_KEYS = [0, 1, 2, 3, 4];

export default function HUD() {
  const { player, wantedLevel, dayTime } = useGameStore((s) => ({
    player: s.player,
    wantedLevel: s.wantedLevel,
    dayTime: s.dayTime,
  }));

  const h = Math.floor(dayTime);
  const m = Math.floor((dayTime % 1) * 60);
  const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  const isNight = dayTime < 6 || dayTime > 20;

  const vehicleSpeed = player.isInVehicle
    ? Math.abs(
        Math.round(
          (useGameStore
            .getState()
            .vehicles.find((v) => v.id === player.currentVehicleId)?.speed ??
            0) * 4,
        ),
      )
    : 0;

  return (
    <>
      <div
        className="fixed top-4 left-4 z-50 select-none"
        style={{ fontFamily: "monospace" }}
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span style={{ color: "#ff3b30", fontSize: 16 }}>❤</span>
            <div
              style={{
                width: 120,
                height: 10,
                background: "#1a1a2e",
                border: "1px solid #ff3b3044",
                borderRadius: 4,
              }}
            >
              <div
                style={{
                  width: `${player.health}%`,
                  height: "100%",
                  background: "#ff3b30",
                  borderRadius: 4,
                  transition: "width 0.3s",
                }}
              />
            </div>
            <span style={{ color: "#f2f6fa", fontSize: 12 }}>
              {player.health}
            </span>
          </div>
          <div style={{ color: "#a7b3bf", fontSize: 11 }}>
            {player.isInVehicle ? "CAR" : "FOOT"}
          </div>
        </div>
      </div>

      <div
        className="fixed top-4 right-4 z-50 select-none flex flex-col items-end gap-1"
        style={{ fontFamily: "monospace" }}
      >
        <div className="flex gap-1">
          {STAR_KEYS.map((i) => (
            <span
              key={i}
              style={{
                fontSize: 20,
                color: i < wantedLevel ? "#ffb000" : "#2a2a3a",
                textShadow: i < wantedLevel ? "0 0 8px #ffb000" : "none",
                transition: "color 0.2s",
              }}
            >
              ★
            </span>
          ))}
        </div>
        <div style={{ color: isNight ? "#8899cc" : "#ffb347", fontSize: 13 }}>
          {isNight ? "NIGHT" : "DAY"} {timeStr}
        </div>
        {wantedLevel > 0 && (
          <div
            style={{
              color: "#ff3b30",
              fontSize: 11,
              animation: "pulse 1s infinite",
            }}
          >
            WANTED
          </div>
        )}
      </div>

      <div
        className="fixed bottom-4 left-4 z-50 select-none"
        style={{ fontFamily: "monospace", color: "#a7b3bf", fontSize: 11 }}
      >
        <div
          style={{
            background: "#0a0f1a99",
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid #22d3ee22",
          }}
        >
          <div style={{ color: "#22d3ee", fontSize: 12, marginBottom: 4 }}>
            CONTROLS
          </div>
          <div>WASD - Move / Drive</div>
          <div>SHIFT - Run</div>
          <div>E - Enter / Exit vehicle</div>
          <div>Q/R - Rotate camera</div>
        </div>
      </div>

      {player.isInVehicle && (
        <div
          className="fixed bottom-4 z-50 select-none"
          style={{
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "monospace",
          }}
        >
          <div
            style={{
              background: "#0a0f1a99",
              padding: "6px 16px",
              borderRadius: 6,
              border: "1px solid #ffb00033",
              color: "#ffb000",
              fontSize: 14,
            }}
          >
            {vehicleSpeed} km/h
          </div>
        </div>
      )}
    </>
  );
}
