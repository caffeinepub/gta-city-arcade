import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useGameStore } from "../../store/gameStore";

export default function DayNightCycle() {
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const ambRef = useRef<THREE.AmbientLight>(null);
  const setDayTime = useGameStore((s) => s.setDayTime);
  const dayTime = useGameStore((s) => s.dayTime);
  const { scene } = useThree();
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    elapsed.current += delta;
    // Full day cycle = 120 seconds
    const t = (elapsed.current / 120) * 24;
    setDayTime(t % 24);

    const h = dayTime;
    const angle = ((h - 6) / 24) * Math.PI * 2;
    const sunX = Math.cos(angle) * 200;
    const sunY = Math.sin(angle) * 200;

    if (sunRef.current) {
      sunRef.current.position.set(sunX, sunY, 50);
      sunRef.current.target.position.set(0, 0, 0);

      // Sun intensity based on time
      if (h >= 6 && h <= 18) {
        const noon = 1 - Math.abs(h - 12) / 6;
        sunRef.current.intensity = 0.3 + noon * 1.5;
        // Dawn/dusk color
        if (h < 8 || h > 16) {
          sunRef.current.color.setHex(0xff7733);
        } else {
          sunRef.current.color.setHex(0xffeedd);
        }
      } else {
        sunRef.current.intensity = 0;
      }
    }

    if (ambRef.current) {
      if (h >= 6 && h <= 18) {
        const noon = 1 - Math.abs(h - 12) / 6;
        ambRef.current.intensity = 0.2 + noon * 0.6;
        ambRef.current.color.setHex(0x8899cc);
      } else {
        ambRef.current.intensity = 0.08;
        ambRef.current.color.setHex(0x223366);
      }
    }

    // Sky color
    let skyColor: THREE.Color;
    if (h >= 6 && h < 8) {
      skyColor = new THREE.Color(0xff7744);
    } else if (h >= 8 && h < 18) {
      skyColor = new THREE.Color(0x334477);
    } else if (h >= 18 && h < 20) {
      skyColor = new THREE.Color(0x441133);
    } else {
      skyColor = new THREE.Color(0x0a0a1a);
    }
    scene.background = skyColor;
    scene.fog = new THREE.Fog(skyColor, 80, 300);
  });

  return (
    <>
      <ambientLight ref={ambRef} intensity={0.5} />
      <directionalLight
        ref={sunRef}
        castShadow
        intensity={1.5}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={500}
        shadow-camera-left={-150}
        shadow-camera-right={150}
        shadow-camera-top={150}
        shadow-camera-bottom={-150}
      />
      <pointLight
        position={[0, 5, 0]}
        intensity={0.3}
        color="#4488ff"
        distance={50}
      />
    </>
  );
}
