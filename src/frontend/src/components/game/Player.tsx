import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useGameStore } from "../../store/gameStore";
import { resolveCollision } from "../../utils/collision";

const WALK_SPEED = 8;
const RUN_SPEED = 16;
const TURN_SPEED = 2.5;
const VEHICLE_ACCEL = 0.3;
const VEHICLE_MAX_SPEED = 22;
const VEHICLE_FRICTION = 0.93;
const VEHICLE_TURN = 1.8;
const ENTRY_DIST = 5;

const keys: Record<string, boolean> = {};

export default function Player() {
  const meshRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const camAngle = useRef(0);
  const setPlayer = useGameStore((s) => s.setPlayer);
  const setVehicles = useGameStore((s) => s.setVehicles);
  const addWanted = useGameStore((s) => s.addWanted);
  const tickWanted = useGameStore((s) => s.tickWanted);

  useEffect(() => {
    const onKey = (e: KeyboardEvent, down: boolean) => {
      keys[e.code] = down;
      if (down && e.code === "KeyE") {
        const { player, vehicles } = useGameStore.getState();
        if (player.isInVehicle) {
          const vid = player.currentVehicleId!;
          setVehicles((vs) =>
            vs.map((v) =>
              v.id === vid ? { ...v, occupied: false, speed: 0 } : v,
            ),
          );
          setPlayer({ isInVehicle: false, currentVehicleId: null });
        } else {
          let nearest: (typeof vehicles)[0] | null = null;
          let minDist = ENTRY_DIST;
          for (const v of vehicles) {
            if (v.occupied) continue;
            const dx = v.position[0] - player.x;
            const dz = v.position[2] - player.z;
            const d = Math.sqrt(dx * dx + dz * dz);
            if (d < minDist) {
              minDist = d;
              nearest = v;
            }
          }
          if (nearest) {
            setVehicles((vs) =>
              vs.map((v) =>
                v.id === nearest!.id ? { ...v, occupied: true } : v,
              ),
            );
            setPlayer({
              isInVehicle: true,
              currentVehicleId: nearest.id,
              x: nearest.position[0],
              z: nearest.position[2],
            });
          }
        }
      }
      if (down && e.code === "KeyQ") camAngle.current -= 0.3;
      if (down && e.code === "KeyR") camAngle.current += 0.3;
    };
    const kd = (e: KeyboardEvent) => onKey(e, true);
    const ku = (e: KeyboardEvent) => onKey(e, false);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
    };
  }, [setPlayer, setVehicles]);

  useFrame((_, delta) => {
    const state = useGameStore.getState();
    const { player, vehicles, buildings } = state;
    tickWanted(delta);

    if (player.isInVehicle && player.currentVehicleId !== null) {
      const vid = player.currentVehicleId;
      const veh = vehicles.find((v) => v.id === vid);
      if (!veh) return;

      let speed = veh.speed;
      let rot = veh.rotation;

      if (keys.KeyW || keys.ArrowUp) speed += VEHICLE_ACCEL;
      if (keys.KeyS || keys.ArrowDown) speed -= VEHICLE_ACCEL * 0.7;
      speed *= VEHICLE_FRICTION;
      speed = Math.max(
        -VEHICLE_MAX_SPEED * 0.4,
        Math.min(VEHICLE_MAX_SPEED, speed),
      );

      const turnAmt = VEHICLE_TURN * delta * (speed / 8);
      if (keys.KeyA || keys.ArrowLeft) rot += turnAmt;
      if (keys.KeyD || keys.ArrowRight) rot -= turnAmt;

      const fwdX = Math.sin(rot);
      const fwdZ = Math.cos(rot);
      let nx = veh.position[0] + fwdX * speed * delta;
      let nz = veh.position[2] + fwdZ * speed * delta;

      const [rx, rz] = resolveCollision(
        nx,
        nz,
        veh.position[0],
        veh.position[2],
        2.5,
        buildings,
      );
      const hitWall = rx !== nx || rz !== nz;
      if (hitWall && Math.abs(speed) > 5) addWanted(0.3);
      nx = rx;
      nz = rz;

      nx = Math.max(-220, Math.min(220, nx));
      nz = Math.max(-220, Math.min(220, nz));

      setVehicles((vs) =>
        vs.map((v) =>
          v.id === vid
            ? {
                ...v,
                position: [nx, 0, nz] as [number, number, number],
                rotation: rot,
                speed,
              }
            : v,
        ),
      );
      setPlayer({ x: nx, z: nz, rotation: rot, speed });

      const camDist = 18;
      const camH = 12;
      const targetCamX = nx - Math.sin(rot + camAngle.current) * camDist;
      const targetCamZ = nz - Math.cos(rot + camAngle.current) * camDist;
      camera.position.lerp(
        new THREE.Vector3(targetCamX, camH, targetCamZ),
        0.08,
      );
      camera.lookAt(nx, 1, nz);
    } else {
      const isRunning = keys.ShiftLeft || keys.ShiftRight;
      const speed = isRunning ? RUN_SPEED : WALK_SPEED;
      let rot = player.rotation;
      let moved = false;

      if (keys.KeyA || keys.ArrowLeft) {
        rot += TURN_SPEED * delta;
        moved = true;
      }
      if (keys.KeyD || keys.ArrowRight) {
        rot -= TURN_SPEED * delta;
        moved = true;
      }

      let nx = player.x;
      let nz = player.z;

      if (keys.KeyW || keys.ArrowUp) {
        nx += Math.sin(rot) * speed * delta;
        nz += Math.cos(rot) * speed * delta;
        moved = true;
      }
      if (keys.KeyS || keys.ArrowDown) {
        nx -= Math.sin(rot) * speed * delta * 0.6;
        nz -= Math.cos(rot) * speed * delta * 0.6;
        moved = true;
      }

      if (moved) {
        const [rx, rz] = resolveCollision(
          nx,
          nz,
          player.x,
          player.z,
          0.6,
          buildings,
        );
        nx = rx;
        nz = rz;
        nx = Math.max(-220, Math.min(220, nx));
        nz = Math.max(-220, Math.min(220, nz));
      }

      setPlayer({ x: nx, z: nz, rotation: rot, speed: moved ? speed : 0 });

      if (meshRef.current) {
        meshRef.current.position.set(nx, 0, nz);
        meshRef.current.rotation.y = rot;
      }

      const camDist = 14;
      const camH = 10;
      const targetCamX = nx - Math.sin(rot + camAngle.current) * camDist;
      const targetCamZ = nz - Math.cos(rot + camAngle.current) * camDist;
      camera.position.lerp(
        new THREE.Vector3(targetCamX, camH, targetCamZ),
        0.1,
      );
      camera.lookAt(nx, 0.5, nz);
    }
  });

  const player = useGameStore((s) => s.player);

  return (
    <group
      ref={meshRef}
      position={[player.x, 0, player.z]}
      rotation={[0, player.rotation, 0]}
      visible={!player.isInVehicle}
    >
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 1.2, 10]} />
        <meshLambertMaterial color="#22d3ee" />
      </mesh>
      <mesh position={[0, 1.7, 0]} castShadow>
        <sphereGeometry args={[0.28, 10, 10]} />
        <meshLambertMaterial color="#ffb347" />
      </mesh>
      <mesh position={[0, 1.1, 0.32]}>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}
