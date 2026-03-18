import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";
import { useGameStore } from "../../store/gameStore";

export default function Vehicles() {
  const vehicles = useGameStore((s) => s.vehicles);

  return (
    <>
      {vehicles.map((v) => (
        <Car key={v.id} id={v.id} />
      ))}
    </>
  );
}

const WHEEL_KEYS = ["fl", "fr", "rl", "rr"] as const;
const WHEEL_POSITIONS: [number, number, number][] = [
  [-1.2, 0.3, 1.4],
  [1.2, 0.3, 1.4],
  [-1.2, 0.3, -1.4],
  [1.2, 0.3, -1.4],
];

function Car({ id }: { id: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const vehicle = useGameStore((s) => s.vehicles.find((v) => v.id === id));

  useFrame(() => {
    if (!vehicle || !groupRef.current) return;
    groupRef.current.position.set(
      vehicle.position[0],
      vehicle.position[1],
      vehicle.position[2],
    );
    groupRef.current.rotation.y = vehicle.rotation;
  });

  if (!vehicle) return null;

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[2.2, 0.7, 4.5]} />
        <meshLambertMaterial color={vehicle.color} />
      </mesh>
      <mesh position={[0, 1.15, -0.2]} castShadow>
        <boxGeometry args={[2, 0.55, 2.4]} />
        <meshLambertMaterial color={vehicle.color} />
      </mesh>
      <mesh position={[0, 1.15, -0.2]}>
        <boxGeometry args={[2.01, 0.45, 2.41]} />
        <meshBasicMaterial color="#88bbff" opacity={0.4} transparent />
      </mesh>
      {WHEEL_KEYS.map((key, i) => (
        <mesh
          key={`wheel_${id}_${key}`}
          position={WHEEL_POSITIONS[i]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.35, 0.35, 0.25, 10]} />
          <meshLambertMaterial color="#111" />
        </mesh>
      ))}
      <mesh position={[0.7, 0.65, 2.28]}>
        <boxGeometry args={[0.4, 0.2, 0.05]} />
        <meshBasicMaterial color="#ffffaa" />
      </mesh>
      <mesh position={[-0.7, 0.65, 2.28]}>
        <boxGeometry args={[0.4, 0.2, 0.05]} />
        <meshBasicMaterial color="#ffffaa" />
      </mesh>
      <mesh position={[0.7, 0.65, -2.28]}>
        <boxGeometry args={[0.4, 0.2, 0.05]} />
        <meshBasicMaterial color="#ff2200" />
      </mesh>
      <mesh position={[-0.7, 0.65, -2.28]}>
        <boxGeometry args={[0.4, 0.2, 0.05]} />
        <meshBasicMaterial color="#ff2200" />
      </mesh>
      {!vehicle.occupied && (
        <mesh position={[0, 2.5, 0]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshBasicMaterial color="#22d3ee" />
        </mesh>
      )}
    </group>
  );
}
