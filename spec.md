# Open World Action Game

## Current State
New project. Empty workspace.

## Requested Changes (Diff)

### Add
- Full 3D city environment using React Three Fiber + Three.js
- Procedurally generated city blocks with roads, sidewalks, buildings (varied heights/colors)
- Player character (capsule) with WASD walk/run controls and camera follow
- Vehicle system: parked cars on streets, player can enter/exit (E key), drive with WASD
- NPC pedestrians that wander the streets with simple pathfinding
- Mini-map in bottom-right corner showing player position, roads, buildings
- HUD with health bar and wanted level (1-5 stars)
- Day/night cycle with dynamic lighting (sun/moon arc, ambient changes)
- Basic collision detection for buildings, vehicles, and map boundaries
- Wanted level system: increases when player hits NPCs or vehicles, decreases over time
- Arcade feel: punchy controls, fun NPC reactions

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Minimal Motoko backend (just a stub actor for future score persistence)
2. Frontend game engine:
   - CityMap component: grid of city blocks, roads, buildings using instanced meshes
   - Player component: capsule mesh, keyboard input, collision response
   - Vehicle component: box mesh cars, enter/exit logic, driving physics
   - NPC component: wandering pedestrians with state machine (idle/walk/flee)
   - DayNightCycle: directional light animation over time
   - MiniMap: orthographic canvas overlay showing positions
   - HUD: health bar, wanted stars, controls legend
   - Collision system: AABB checks against building/vehicle bounding boxes
   - Zustand store for: player state, vehicle state, NPCs, game settings
