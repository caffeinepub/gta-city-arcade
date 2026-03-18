import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";
import { useGameStore } from "../../store/gameStore";
import { checkAABB } from "../../utils/collision";

export default function NPCs() {
  const npcs = useGameStore((s) => s.npcs);
  return (
    <>
      {npcs.map((n) => (
        <NPC key={n.id} id={n.id} />
      ))}
    </>
  );
}

function NPC({ id }: { id: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const timer = useRef(Math.random() * 3);
  const setNPCs = useGameStore((s) => s.setNPCs);
  const addWanted = useGameStore((s) => s.addWanted);

  useFrame((_, delta) => {
    const { npcs, player, wantedLevel, buildings } = useGameStore.getState();
    const npc = npcs.find((n) => n.id === id);
    if (!npc || !groupRef.current) return;

    const dx = player.x - npc.position[0];
    const dz = player.z - npc.position[1];
    const distToPlayer = Math.sqrt(dx * dx + dz * dz);

    let state = npc.state;
    let targetX = npc.targetX;
    let targetZ = npc.targetZ;

    // NPC flee logic
    if (wantedLevel >= 1 && distToPlayer < 12) {
      state = "flee";
      targetX = npc.position[0] - dx * 3;
      targetZ = npc.position[1] - dz * 3;
    } else if (state === "flee" && distToPlayer > 20) {
      state = "walk";
    }

    timer.current -= delta;
    if (timer.current <= 0) {
      timer.current = 2 + Math.random() * 3;
      if (state !== "flee") {
        state = Math.random() > 0.3 ? "walk" : "idle";
        if (state === "walk") {
          targetX = (Math.random() - 0.5) * 300;
          targetZ = (Math.random() - 0.5) * 300;
        }
      }
    }

    let newX = npc.position[0];
    let newZ = npc.position[1];
    let rotation = npc.rotation;

    if (state !== "idle") {
      const tx = targetX - npc.position[0];
      const tz = targetZ - npc.position[1];
      const dist = Math.sqrt(tx * tx + tz * tz);
      if (dist > 1) {
        const spd = state === "flee" ? 6 : 2.5;
        const nx = (tx / dist) * spd * delta;
        const nz = (tz / dist) * spd * delta;
        const candX = npc.position[0] + nx;
        const candZ = npc.position[1] + nz;
        if (!checkAABB(candX, candZ, 0.4, buildings)) {
          newX = candX;
          newZ = candZ;
        }
        rotation = Math.atan2(tx, tz);
      }
    }

    // Clamp to map
    newX = Math.max(-210, Math.min(210, newX));
    newZ = Math.max(-210, Math.min(210, newZ));

    groupRef.current.position.set(newX, 0, newZ);
    groupRef.current.rotation.y = rotation;

    // Check player collision with NPC
    const ndx = player.x - newX;
    const ndz = player.z - newZ;
    if (Math.sqrt(ndx * ndx + ndz * ndz) < 1.0 && !player.isInVehicle) {
      // Player bumped into NPC
      addWanted(0.5);
    }

    setNPCs((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              position: [newX, newZ] as [number, number],
              rotation,
              state,
              targetX,
              targetZ,
            }
          : n,
      ),
    );
  });

  const npc = useGameStore((s) => s.npcs.find((n) => n.id === id));
  if (!npc) return null;

  return (
    <group ref={groupRef} position={[npc.position[0], 0, npc.position[1]]}>
      {/* Body */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 1.0, 8]} />
        <meshLambertMaterial color={npc.color} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshLambertMaterial color={npc.color} />
      </mesh>
    </group>
  );
}
