import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import City from "./City";
import DayNightCycle from "./DayNightCycle";
import NPCs from "./NPCs";
import Player from "./Player";
import Vehicles from "./Vehicles";

export default function GameScene() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 14, -14], fov: 60 }}
      style={{ position: "fixed", inset: 0 }}
      gl={{ antialias: true }}
    >
      <Suspense fallback={null}>
        <DayNightCycle />
        <City />
        <Player />
        <Vehicles />
        <NPCs />
      </Suspense>
    </Canvas>
  );
}
