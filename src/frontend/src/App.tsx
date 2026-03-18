import GameScene from "./components/game/GameScene";
import HUD from "./components/ui/HUD";
import MiniMap from "./components/ui/MiniMap";
import SplashScreen from "./components/ui/SplashScreen";
import { useGameStore } from "./store/gameStore";

export default function App() {
  const started = useGameStore((s) => s.started);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#0a0f1a",
      }}
    >
      <GameScene />
      {started && (
        <>
          <HUD />
          <MiniMap />
        </>
      )}
      <SplashScreen />
    </div>
  );
}
