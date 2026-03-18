import { create } from "zustand";

export interface BuildingBox {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface VehicleState {
  id: number;
  position: [number, number, number];
  rotation: number;
  speed: number;
  occupied: boolean;
  color: string;
}

export interface NPCState {
  id: number;
  position: [number, number];
  rotation: number;
  state: "idle" | "walk" | "flee";
  targetX: number;
  targetZ: number;
  color: string;
}

export interface PlayerState {
  x: number;
  z: number;
  rotation: number;
  health: number;
  speed: number;
  isInVehicle: boolean;
  currentVehicleId: number | null;
}

export interface GameState {
  started: boolean;
  player: PlayerState;
  vehicles: VehicleState[];
  npcs: NPCState[];
  wantedLevel: number;
  wantedTimer: number;
  dayTime: number;
  buildings: BuildingBox[];
  setStarted: (v: boolean) => void;
  setPlayer: (p: Partial<PlayerState>) => void;
  setVehicles: (fn: (v: VehicleState[]) => VehicleState[]) => void;
  setNPCs: (fn: (n: NPCState[]) => NPCState[]) => void;
  addWanted: (amount: number) => void;
  tickWanted: (dt: number) => void;
  setDayTime: (t: number) => void;
  setBuildings: (b: BuildingBox[]) => void;
  damagePlayer: (amount: number) => void;
}

const NPC_COLORS = [
  "#ff6b6b",
  "#ffd93d",
  "#6bcb77",
  "#4d96ff",
  "#ff922b",
  "#da77ff",
  "#63e6be",
  "#f783ac",
];

function makeNPCs(): NPCState[] {
  return Array.from({ length: 20 }, (_, i) => ({
    id: i,
    position: [(Math.random() - 0.5) * 300, (Math.random() - 0.5) * 300] as [
      number,
      number,
    ],
    rotation: Math.random() * Math.PI * 2,
    state: "walk" as const,
    targetX: (Math.random() - 0.5) * 300,
    targetZ: (Math.random() - 0.5) * 300,
    color: NPC_COLORS[i % NPC_COLORS.length],
  }));
}

function makeVehicles(): VehicleState[] {
  const colors = [
    "#e74c3c",
    "#3498db",
    "#f1c40f",
    "#2ecc71",
    "#ffffff",
    "#1a1a2e",
    "#e67e22",
    "#9b59b6",
  ];
  const positions: [number, number, number][] = [
    [20, 0, 0],
    [-20, 0, 0],
    [0, 0, 20],
    [0, 0, -20],
    [40, 0, 40],
    [-40, 0, -40],
    [40, 0, -40],
    [-40, 0, 40],
  ];
  return positions.map((pos, i) => ({
    id: i,
    position: pos,
    rotation: Math.random() * Math.PI * 2,
    speed: 0,
    occupied: false,
    color: colors[i % colors.length],
  }));
}

export const useGameStore = create<GameState>((set, get) => ({
  started: false,
  player: {
    x: 0,
    z: 0,
    rotation: 0,
    health: 100,
    speed: 0,
    isInVehicle: false,
    currentVehicleId: null,
  },
  vehicles: makeVehicles(),
  npcs: makeNPCs(),
  wantedLevel: 0,
  wantedTimer: 0,
  dayTime: 8,
  buildings: [],
  setStarted: (v) => set({ started: v }),
  setPlayer: (p) => set((s) => ({ player: { ...s.player, ...p } })),
  setVehicles: (fn) => set((s) => ({ vehicles: fn(s.vehicles) })),
  setNPCs: (fn) => set((s) => ({ npcs: fn(s.npcs) })),
  addWanted: (amount) =>
    set((s) => ({
      wantedLevel: Math.min(5, s.wantedLevel + amount),
      wantedTimer: 10,
    })),
  tickWanted: (dt) => {
    const s = get();
    if (s.wantedLevel === 0) return;
    const newTimer = s.wantedTimer - dt;
    if (newTimer <= 0) {
      set({ wantedLevel: Math.max(0, s.wantedLevel - 1), wantedTimer: 10 });
    } else {
      set({ wantedTimer: newTimer });
    }
  },
  setDayTime: (t) => set({ dayTime: t % 24 }),
  setBuildings: (b) => set({ buildings: b }),
  damagePlayer: (amount) =>
    set((s) => ({
      player: { ...s.player, health: Math.max(0, s.player.health - amount) },
    })),
}));
