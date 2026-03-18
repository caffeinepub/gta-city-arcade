import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useGameStore } from "../../store/gameStore";

const CITY_SIZE = 22;
const BLOCK = 20;

interface Block {
  type: "road" | "building";
  col: number;
  row: number;
  height: number;
  color: string;
}

const BCOLORS = [
  "#1a1a2e",
  "#16213e",
  "#0f3460",
  "#1b1b2f",
  "#2d2d44",
  "#252540",
  "#1c1c3a",
  "#222244",
];

function generateCity() {
  const blocks: Block[] = [];
  for (let row = 0; row < CITY_SIZE; row++) {
    for (let col = 0; col < CITY_SIZE; col++) {
      const isRoadRow = row % 3 === 0;
      const isRoadCol = col % 3 === 0;
      if (isRoadRow || isRoadCol) {
        blocks.push({ type: "road", col, row, height: 0.1, color: "#2a2a2a" });
      } else {
        const h = 3 + Math.floor(Math.random() * 14);
        blocks.push({
          type: "building",
          col,
          row,
          height: h,
          color: BCOLORS[Math.floor(Math.random() * BCOLORS.length)],
        });
      }
    }
  }
  return blocks;
}

export default function City() {
  const setBuildings = useGameStore((s) => s.setBuildings);
  const blocks = useMemo(() => generateCity(), []);

  const roadGeo = useMemo(() => new THREE.BoxGeometry(BLOCK, 0.1, BLOCK), []);
  const roadMat = useMemo(
    () => new THREE.MeshLambertMaterial({ color: "#2a2a2a" }),
    [],
  );
  const sidewalkColor = new THREE.Color("#3a3a3a");

  const roadMesh = useRef<THREE.InstancedMesh>(null);

  const offset = (CITY_SIZE / 2) * BLOCK;

  const roadBlocks = useMemo(
    () => blocks.filter((b) => b.type === "road"),
    [blocks],
  );
  const buildingBlocks = useMemo(
    () => blocks.filter((b) => b.type === "building"),
    [blocks],
  );

  useEffect(() => {
    const dummy = new THREE.Object3D();
    if (roadMesh.current) {
      roadBlocks.forEach((b, i) => {
        const x = b.col * BLOCK - offset + BLOCK / 2;
        const z = b.row * BLOCK - offset + BLOCK / 2;
        dummy.position.set(x, 0, z);
        dummy.updateMatrix();
        roadMesh.current!.setMatrixAt(i, dummy.matrix);
      });
      roadMesh.current.instanceMatrix.needsUpdate = true;
    }
  }, [roadBlocks, offset]);

  useEffect(() => {
    const bboxes = buildingBlocks.map((b) => {
      const x = b.col * BLOCK - offset + BLOCK / 2;
      const z = b.row * BLOCK - offset + BLOCK / 2;
      return {
        minX: x - BLOCK / 2 + 1,
        maxX: x + BLOCK / 2 - 1,
        minZ: z - BLOCK / 2 + 1,
        maxZ: z + BLOCK / 2 - 1,
      };
    });
    setBuildings(bboxes);
  }, [buildingBlocks, offset, setBuildings]);

  return (
    <group>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry
          args={[CITY_SIZE * BLOCK + 20, CITY_SIZE * BLOCK + 20]}
        />
        <meshLambertMaterial color="#1a1a1a" />
      </mesh>

      {/* Roads */}
      <instancedMesh
        ref={roadMesh}
        args={[roadGeo, roadMat, roadBlocks.length]}
      />

      {/* Road markings */}
      {roadBlocks
        .filter((_, i) => i % 3 === 0)
        .map((b) => {
          const x = b.col * BLOCK - offset + BLOCK / 2;
          const z = b.row * BLOCK - offset + BLOCK / 2;
          return (
            <mesh
              key={`mark_${b.col}_${b.row}`}
              position={[x, 0.06, z]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[0.5, 6]} />
              <meshBasicMaterial color="#ffffff" opacity={0.4} transparent />
            </mesh>
          );
        })}

      {/* Buildings */}
      {buildingBlocks.map((b) => {
        const x = b.col * BLOCK - offset + BLOCK / 2;
        const z = b.row * BLOCK - offset + BLOCK / 2;
        return (
          <group key={`b_${b.col}_${b.row}`} position={[x, 0, z]}>
            <mesh position={[0, b.height / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[BLOCK - 2, b.height, BLOCK - 2]} />
              <meshLambertMaterial color={b.color} />
            </mesh>
            <mesh position={[0, b.height / 2, 0]}>
              <boxGeometry args={[BLOCK - 1.8, b.height, BLOCK - 1.8]} />
              <meshBasicMaterial
                color="#ffff88"
                wireframe
                opacity={0.03}
                transparent
              />
            </mesh>
          </group>
        );
      })}

      {/* Sidewalks */}
      {buildingBlocks.map((b) => {
        const x = b.col * BLOCK - offset + BLOCK / 2;
        const z = b.row * BLOCK - offset + BLOCK / 2;
        return (
          <mesh
            key={`sw_${b.col}_${b.row}`}
            position={[x, 0.05, z]}
            receiveShadow
          >
            <boxGeometry args={[BLOCK - 0.2, 0.1, BLOCK - 0.2]} />
            <meshLambertMaterial color={sidewalkColor} />
          </mesh>
        );
      })}
    </group>
  );
}
