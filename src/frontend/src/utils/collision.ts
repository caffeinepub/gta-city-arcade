import type { BuildingBox } from "../store/gameStore";

export function checkAABB(
  x: number,
  z: number,
  radius: number,
  boxes: BuildingBox[],
): boolean {
  for (const b of boxes) {
    if (
      x + radius > b.minX &&
      x - radius < b.maxX &&
      z + radius > b.minZ &&
      z - radius < b.maxZ
    ) {
      return true;
    }
  }
  return false;
}

export function resolveCollision(
  newX: number,
  newZ: number,
  oldX: number,
  oldZ: number,
  radius: number,
  boxes: BuildingBox[],
): [number, number] {
  // Try X only
  if (!checkAABB(newX, oldZ, radius, boxes)) return [newX, oldZ];
  // Try Z only
  if (!checkAABB(oldX, newZ, radius, boxes)) return [oldX, newZ];
  // Blocked both
  return [oldX, oldZ];
}
