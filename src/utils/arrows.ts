import { Task, TaskDependencyType, Vec2 } from "./types";

// Minimum horizontal stub length when exiting/entering a task
const STUB_LENGTH = 15;
// Extra padding around the bounding box for viewport intersection checks
const BBOX_PADDING = 12;
// Corner radius for rounded path bends
const CORNER_RADIUS = 6;
// How far the horizontal section should be separated from its source.
const HORIZONTALL_POSITION_OFFSET = 0;
// How war the horizontal line should at least be from its source.
const MIN_SOURCE_DIST = 30 / 2;

export interface BBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface GanttArrow {
  fromTaskId: number;
  toTaskId: number;
  type: TaskDependencyType;
  path: string; // SVG path `d` attribute
  bbox: BBox;
}

/**
 * Compute source and target anchor points for a dependency arrow using precomputed layout data.
 *
 * Anchor logic per dependency type:
 * - FS: source exits right (finish), target enters left (start)
 * - FF: source exits right (finish), target enters right (finish)
 * - SS: source exits left (start),  target enters left (start)
 * - SF: source exits left (start),  target enters right (finish)
 */
export function getAnchors(
  fromCol: number,
  fromWidth: number,
  fromRow: number,
  toCol: number,
  toWidth: number,
  toRow: number,
  type: TaskDependencyType,
  cellSize: Vec2,
): { source: Vec2; target: Vec2 } {
  const fromLeftX = fromCol * cellSize.x;
  const fromRightX = (fromCol + fromWidth) * cellSize.x;
  const fromCenterY = fromRow * cellSize.y + cellSize.y / 2;

  const toLeftX = toCol * cellSize.x;
  const toRightX = (toCol + toWidth) * cellSize.x;
  const toCenterY = toRow * cellSize.y + cellSize.y / 2;

  let source: Vec2;
  let target: Vec2;

  switch (type) {
    case "FS":
      source = { x: fromRightX, y: fromCenterY };
      target = { x: toLeftX, y: toCenterY };
      break;
    case "FF":
      source = { x: fromRightX, y: fromCenterY };
      target = { x: toRightX, y: toCenterY };
      break;
    case "SS":
      source = { x: fromLeftX, y: fromCenterY };
      target = { x: toLeftX, y: toCenterY };
      break;
    case "SF":
      source = { x: fromLeftX, y: fromCenterY };
      target = { x: toRightX, y: toCenterY };
      break;
  }

  return { source, target };
}

// --- Path building ---

type Segment = { dir: "H" | "V"; len: number };

/**
 * Build an SVG path string from a starting point and a list of alternating H/V segments,
 * inserting rounded arc corners at each direction change.
 */
function buildPathFromSegments(start: Vec2, segments: Segment[], r: number): string {
  if (segments.length === 0) return `M ${start.x} ${start.y}`;

  // Clone segment lengths so we can mutate them when consuming corner radius
  const segs = segments.map((s) => ({ ...s }));
  const parts: string[] = [`M ${start.x} ${start.y}`];

  for (let i = 0; i < segs.length; i++) {
    const seg = segs[i];
    const next = segs[i + 1];

    if (next && seg.dir !== next.dir) {
      const cr = Math.min(r, Math.abs(seg.len), Math.abs(next.len));

      if (cr < 1 || seg.len === 0) {
        // Too small for rounding — straight line
        parts.push(seg.dir === "H" ? `h ${seg.len}` : `v ${seg.len}`);
        continue;
      }

      const segSign = seg.len > 0 ? 1 : -1;
      const nextSign = next.len > 0 ? 1 : -1;

      // Draw the segment minus the corner radius
      parts.push(seg.dir === "H" ? `h ${seg.len - segSign * cr}` : `v ${seg.len - segSign * cr}`);

      // Draw the arc corner
      let sweep: number;
      if (seg.dir === "H") {
        sweep = segSign * nextSign > 0 ? 1 : 0;
        parts.push(`a ${cr} ${cr} 0 0 ${sweep} ${segSign * cr} ${nextSign * cr}`);
      } else {
        sweep = segSign * nextSign > 0 ? 0 : 1;
        parts.push(`a ${cr} ${cr} 0 0 ${sweep} ${nextSign * cr} ${segSign * cr}`);
      }

      // Consume the corner radius from the next segment's length
      next.len -= nextSign * cr;
    } else {
      // Last segment (or consecutive same-direction, which shouldn't normally happen)
      parts.push(seg.dir === "H" ? `h ${seg.len}` : `v ${seg.len}`);
    }
  }

  return parts.join(" ");
}

/**
 * Build an orthogonal (Manhattan-style) SVG path between source and target anchors.
 * Uses rounded corners for a polished look.
 *
 * Routing strategy:
 * 1. Simple case — target is reachable with exit-stub → vertical → enter-stub (3 segments)
 * 2. Complex case — target requires a detour (usually when it has to flip back): exit-stub → V half → H across → V half → enter-stub (5 segments)
 */
export function buildArrowPath(source: Vec2, target: Vec2, type: TaskDependencyType): string {
  const r = CORNER_RADIUS;
  const dx = target.x - source.x;
  const dy = target.y - source.y;

  // Exit direction: FS/FF exit right (+x), SS/SF exit left (-x)
  const exitRight = type === "FS" || type === "FF";
  // Enter direction: FS/SS approach from left (-x), FF/SF approach from right (+x)
  const enterLeft = type === "FS" || type === "SS";

  const exitSign = exitRight ? 1 : -1;
  const enterSign = enterLeft ? -1 : 1;

  // Same row — straight horizontal line if direction is favorable
  if (dy === 0) {
    const minDirect = STUB_LENGTH * 2;
    if ((exitRight && dx > minDirect) || (!exitRight && dx < -minDirect)) {
      return `M ${source.x} ${source.y} h ${dx}`;
    }
  }

  const stubOut = STUB_LENGTH * exitSign;
  const stubIn = STUB_LENGTH * enterSign;
  const midX_afterExit = source.x + stubOut;
  const midX_beforeEnter = target.x + stubIn;

  // Check if a simple 3-segment route works:
  // The midpoint between exit stub end and enter stub end must be reachable
  // without the path doubling back through the tasks.
  const simpleRouteWorks = exitRight
    ? enterLeft
      ? midX_afterExit < midX_beforeEnter // FS: exit point stays left of entry approach
      : midX_afterExit < target.x + STUB_LENGTH // FF: exit doesn't overshoot target's right
    : enterLeft
      ? midX_afterExit > target.x - STUB_LENGTH // SS: exit doesn't overshoot target's left
      : midX_afterExit > midX_beforeEnter; // SF: exit point stays right of entry approach

  if (simpleRouteWorks && dy !== 0) {
    // 3-segment route: H → V → H
    // With parameter (0 = at exit stub, 1 = at entry stub):
    const midX = midX_afterExit + (midX_beforeEnter - midX_afterExit) * HORIZONTALL_POSITION_OFFSET;
    return buildPathFromSegments(
      source,
      [
        { dir: "H", len: midX - source.x },
        { dir: "V", len: dy },
        { dir: "H", len: target.x - midX },
      ],
      r,
    );
  }

  // 5-segment detour route: H stub → V half → H across → V half → H stub
  const sign = Math.sign(dy);
  const absDy = Math.abs(dy);
  const absFirstV = Math.min(
    Math.max(absDy * HORIZONTALL_POSITION_OFFSET, MIN_SOURCE_DIST),
    absDy - MIN_SOURCE_DIST,
  );
  const firstV = absFirstV * sign;
  const secondV = dy - firstV;

  // If dy is 0 (same row, but simple route didn't work), offset vertically to route around
  const detourV = dy === 0 ? STUB_LENGTH * 2 : 0;

  return buildPathFromSegments(
    source,
    [
      { dir: "H", len: stubOut },
      { dir: "V", len: firstV + detourV },
      { dir: "H", len: target.x + stubIn - (source.x + stubOut) },
      { dir: "V", len: secondV - detourV },
      { dir: "H", len: -stubIn },
    ],
    r,
  );
}

// --- Bounding box & visibility ---

/**
 * Compute the bounding box enclosing an arrow given its source and target anchors.
 */
export function computeArrowBBox(source: Vec2, target: Vec2): BBox {
  return {
    left: Math.min(source.x, target.x) - BBOX_PADDING,
    top: Math.min(source.y, target.y) - BBOX_PADDING,
    right: Math.max(source.x, target.x) + BBOX_PADDING,
    bottom: Math.max(source.y, target.y) + BBOX_PADDING,
  };
}

/**
 * Check whether an arrow's bounding box intersects with the visible viewport.
 */
export function isArrowVisible(bbox: BBox, viewport: BBox): boolean {
  return !(
    bbox.right < viewport.left ||
    bbox.left > viewport.right ||
    bbox.bottom < viewport.top ||
    bbox.top > viewport.bottom
  );
}

// --- Main entry point: compute all visible arrows ---

/**
 * Compute all visible dependency arrows for the current viewport.
 *
 * This iterates over ALL tasks (not just visible ones) because an arrow can
 * cross through the viewport even when both connected tasks are off-screen.
 * The bounding-box intersection test ensures only relevant arrows are returned.
 *
 * @param tasks - All tasks in the project
 * @param taskMap - O(1) lookup map: task ID → Task
 * @param getLayout - Function returning precomputed { col, width } for a task
 * @param cellSize - Cell dimensions in pixels
 * @param viewport - Visible viewport bounds in virtual (scroll) coordinates
 */
export function computeVisibleArrows(
  tasks: Task[],
  taskMap: Map<number, Task>,
  getLayout: (taskId: number, startDate: string, endDate: string) => { col: number; width: number },
  cellSize: Vec2,
  viewport: BBox,
): GanttArrow[] {
  const arrows: GanttArrow[] = [];

  for (const fromTask of tasks) {
    if (!fromTask.dependencies || fromTask.dependencies.length === 0) continue;

    const fromLayout = getLayout(
      fromTask.id,
      fromTask.startDate.toString(),
      fromTask.endDate.toString(),
    );

    for (const dep of fromTask.dependencies) {
      const toTask = taskMap.get(dep.toId);
      if (!toTask) continue; // Target task doesn't exist

      const toLayout = getLayout(toTask.id, toTask.startDate.toString(), toTask.endDate.toString());

      const { source, target } = getAnchors(
        fromLayout.col,
        fromLayout.width,
        fromTask.row,
        toLayout.col,
        toLayout.width,
        toTask.row,
        dep.type,
        cellSize,
      );

      const bbox = computeArrowBBox(source, target);

      // Virtualization: skip arrows entirely outside the viewport
      if (!isArrowVisible(bbox, viewport)) continue;

      console.log(fromTask.label);
      const path = buildArrowPath(source, target, dep.type);

      arrows.push({
        fromTaskId: fromTask.id,
        toTaskId: dep.toId,
        type: dep.type,
        path,
        bbox,
      });
    }
  }

  return arrows;
}
