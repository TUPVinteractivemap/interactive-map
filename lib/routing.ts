// Building coordinates (center points of each building)
export const buildingCoordinates: Record<string, { x: number; y: number }> = {
  ModernTechnologyBldg: { x: 674.5, y: 658 },
  GuardHouseMain: { x: 1052.25, y: 713.75 },
  StudentLounge: { x: 787.5, y: 376.75 },
  BasketBallCourt: { x: 898, y: 542.5 },
  GardenWithGazebo: { x: 1058.25, y: 630.5 },
  Garden: { x: 980.5, y: 488.25 },
  MultiPurposeHall: { x: 1175.75, y: 221.5 },
  MechanicalTechnologyBldg: { x: 695, y: 601.75 },
  AutoRefrigirationAirconTechnologyBldf: { x: 828.25, y: 627.5 },
  TwoStoreyTrainingInnovationChineseChamberBldg: { x: 967.25, y: 731.75 },
  EngineeringExtensionBldg: { x: 711.5, y: 371.5 },
  ElectricalTechnologyBldg: { x: 911.75, y: 454 },
  EngineeringBldg: { x: 800.25, y: 234.5 },
  TechnologyBldg: { x: 916.25, y: 128.25 },
  Laboratories: { x: 875.75, y: 258.75 },
  TechnologicalInventionInnovationCenter: { x: 1014, y: 196 },
  TechnologyExtension: { x: 978, y: 118.5 },
  BldgA5: { x: 944.75, y: 256.75 },
  EnterpriseCenter: { x: 639.25, y: 760 },
  Canteen: { x: 989.75, y: 591.5 },
  TUPVDormitory: { x: 1430.75, y: 318.75 },
  CampusBusinessCenter: { x: 773, y: 583.5 },
  StockRoom1: { x: 907.75, y: 676.75 },
  SupplyOffice: { x: 923.25, y: 646 },
  FacultyLounge: { x: 957.5, y: 579.75 },
  Offices: { x: 725.75, y: 483.75 },
  AdminisitrationBldg: { x: 1060, y: 373 },
  TrainingCenter: { x: 962.75, y: 811.5 },
  PPGSOffice: { x: 829, y: 499.5 },
  PowerHouse: { x: 943, y: 865.25 }
};

// Building areas to avoid (expanded rectangles around buildings with safety margins)
export const buildingAreas: Array<{
  id: string;
  x1: number; y1: number; x2: number; y2: number;
}> = [
  // Academic Zone
  { id: 'ModernTechnologyBldg', x1: 590, y1: 595, x2: 760, y2: 720 },
  { id: 'MechanicalTechnologyBldg', x1: 580, y1: 460, x2: 800, y2: 660 },
  { id: 'AutoRefrigirationAirconTechnologyBldf', x1: 735, y1: 545, x2: 905, y2: 710 },
  { id: 'TwoStoreyTrainingInnovationChineseChamberBldg', x1: 895, y1: 670, x2: 1040, y2: 795 },
  { id: 'EngineeringExtensionBldg', x1: 650, y1: 275, x2: 800, y2: 470 },
  { id: 'ElectricalTechnologyBldg', x1: 830, y1: 385, x2: 990, y2: 525 },
  { id: 'EngineeringBldg', x1: 750, y1: 155, x2: 870, y2: 305 },
  { id: 'TechnologyBldg', x1: 815, y1: 70, x2: 1040, y2: 200 },
  { id: 'Laboratories', x1: 810, y1: 210, x2: 940, y2: 310 },
  { id: 'TechnologicalInventionInnovationCenter', x1: 955, y1: 125, x2: 1075, y2: 270 },
  { id: 'TechnologyExtension', x1: 905, y1: 65, x2: 1050, y2: 170 },
  { id: 'BldgA5', x1: 875, y1: 205, x2: 1015, y2: 310 },

  // Administrative Zone
  { id: 'CampusBusinessCenter', x1: 725, y1: 530, x2: 820, y2: 635 },
  { id: 'StockRoom1', x1: 870, y1: 635, x2: 945, y2: 715 },
  { id: 'SupplyOffice', x1: 890, y1: 610, x2: 955, y2: 680 },
  { id: 'FacultyLounge', x1: 920, y1: 540, x2: 990, y2: 620 },
  { id: 'Offices', x1: 675, y1: 450, x2: 775, y2: 530 },
  { id: 'AdminisitrationBldg', x1: 965, y1: 260, x2: 1140, y2: 490 },
  { id: 'TrainingCenter', x1: 915, y1: 755, x2: 1010, y2: 865 },

  // Recreational Zone
  { id: 'StudentLounge', x1: 740, y1: 325, x2: 835, y2: 430 },
  { id: 'BasketBallCourt', x1: 845, y1: 510, x2: 950, y2: 580 },

  // Conservation Area
  { id: 'GardenWithGazebo', x1: 990, y1: 570, x2: 1125, y2: 695 },
  { id: 'Garden', x1: 930, y1: 440, x2: 1030, y2: 540 },

  // Multipurpose
  { id: 'MultiPurposeHall', x1: 1030, y1: 115, x2: 1260, y2: 330 },

  // IGP Facilities
  { id: 'EnterpriseCenter', x1: 515, y1: 685, x2: 755, y2: 835 },
  { id: 'Canteen', x1: 935, y1: 535, x2: 1045, y2: 650 },
  { id: 'TUPVDormitory', x1: 1295, y1: 185, x2: 1565, y2: 455 },

  // Utilities
  { id: 'PPGSOffice', x1: 785, y1: 460, x2: 870, y2: 540 },
  { id: 'PowerHouse', x1: 910, y1: 835, x2: 975, y2: 895 },

  // Security
  { id: 'GuardHouseMain', x1: 1025, y1: 685, x2: 1080, y2: 740 }
];

// Check if a point is inside any building area
function isPointInBuilding(x: number, y: number): boolean {
  return buildingAreas.some(building => 
    x >= building.x1 && x <= building.x2 && y >= building.y1 && y <= building.y2
  );
}

// Check if a line segment intersects with any building
// Legacy function kept for reference; not used in ROUTING-only pathing
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function lineIntersectsBuilding(_x1: number, _y1: number, _x2: number, _y2: number): boolean {
  return false;
}

// Define the routing path segments exactly as they appear in the SVG
interface PathSegment {
  start: { x: number; y: number };
  end: { x: number; y: number };
}

// Parse the SVG path data into actual segments
const routingPathData = "M767.5 522.5L762.881 530.5L685.377 485.753M767.5 522.5L759 517.593L771.755 495.5L732 405M767.5 522.5L774.032 526.318M732 405L685.377 485.753M732 405L794.354 297M685.377 485.753L657.5 469.658L589.183 587.987M794.354 297L762.5 278.609L876.5 81.1554L994.876 149.5M794.354 297L831 318.158M809 393.632L847.181 327.5L831 318.158M831 318.158L853.833 278.609L818.5 258.209M818.5 258.209L801.3 288M818.5 258.209L842 217.506M842 217.506L891.944 131L991.573 188.521M842 217.506L964.318 288.127M1017.88 467L1075.91 366.5L1071.49 350L964.318 288.127M1017.88 467L982 446.283L978.699 452M1017.88 467L1037.5 478.326L1015.49 515L1032.59 524.871M978.699 452L947.5 506.039M978.699 452L880.5 395.305M880.5 395.305L928.307 312.5L944.762 322L964.318 288.127M880.5 395.305L842.5 461.123M842.5 461.123L795 490L774.032 526.318M842.5 461.123L870 477M774.032 526.318L824.498 555.812M870 477L970.459 535L967.573 540M870 477L824.498 555.812M824.498 555.812L911 606.367M967.573 540L924.65 614.344M967.573 540L1027.33 574.5L1050.13 535M924.65 614.344L911 606.367M924.65 614.344L1054 689.941M1050.13 535L1095 560.904M1050.13 535L1032.59 524.871M1095 560.904L1141.93 588M1095 560.904L1250.5 291.57L1216.6 272L1182.25 331.5M1182.25 331.5L1023.5 239.844L1008.11 266.5C991.929 258.987 960.04 243.138 961.942 239.844L991.573 188.521M1182.25 331.5L1100 473.965L1071.49 457.502L1032.59 524.871M991.573 188.521L994.876 190.428M1141.93 588L1327.55 266.5L1348.52 278.609M1141.93 588L1075.83 702.5L1069.5 699L1054 689.941M911 606.367L868.776 679.5L858.5 673.567L840.352 705M840.352 705L785.908 804L678.5 753M840.352 705L960.73 774.5L922.913 840L935 846.978L920.842 871.5L947.5 886.891L956.386 871.5M840.352 705L738.161 646M738.161 646L726.037 667M738.161 646L751 623.762M726.037 667L589.183 587.987M726.037 667L676.385 753M589.183 587.987L511.81 722M1054 689.941L1035.2 722.5L1040.5 725.559L956.386 871.249M1095.5 561L1073.5 599.105L1034.5 576.588L990.384 653M898.5 739L934 677.512L1030.11 733L980.5 818.923";

// Parse the path data into segments
function parsePathData(pathData: string): PathSegment[] {
  const segments: PathSegment[] = [];
  let currentPoint = { x: 0, y: 0 };

  // Tokenize: capture command letter and its numeric payload (which may have no spaces)
  const cmdRegex = /([MLCmlc])([^MLCmlc]*)/g;
  let match: RegExpExecArray | null;
  while ((match = cmdRegex.exec(pathData)) !== null) {
    const command = match[1];
    const payload = match[2];
    const nums = (payload.match(/-?\d*\.?\d+/g) || []).map(Number);

    switch (command) {
      case 'M':
      case 'm': {
        const isRel = command === 'm';
        for (let i = 0; i + 1 < nums.length; i += 2) {
          const x = isRel ? currentPoint.x + nums[i] : nums[i];
          const y = isRel ? currentPoint.y + nums[i + 1] : nums[i + 1];
          currentPoint = { x, y };
        }
        break;
      }
      case 'L':
      case 'l': {
        const isRel = command === 'l';
        for (let i = 0; i + 1 < nums.length; i += 2) {
          const x = isRel ? currentPoint.x + nums[i] : nums[i];
          const y = isRel ? currentPoint.y + nums[i + 1] : nums[i + 1];
          const nextPoint = { x, y };
          segments.push({ start: { ...currentPoint }, end: nextPoint });
          currentPoint = nextPoint;
        }
        break;
      }
      case 'C':
      case 'c': {
        const isRel = command === 'c';
        // Cubic curves: points are grouped by 6 numbers; use the end point as a straight segment
        for (let i = 0; i + 5 < nums.length; i += 6) {
          const x = isRel ? currentPoint.x + nums[i + 4] : nums[i + 4];
          const y = isRel ? currentPoint.y + nums[i + 5] : nums[i + 5];
          const nextPoint = { x, y };
          segments.push({ start: { ...currentPoint }, end: nextPoint });
          currentPoint = nextPoint;
        }
        break;
      }
    }
  }

  // Filter degenerate/duplicate segments
  const cleaned: PathSegment[] = [];
  for (const seg of segments) {
    const dx = seg.end.x - seg.start.x;
    const dy = seg.end.y - seg.start.y;
    const len = Math.hypot(dx, dy);
    if (len < 0.5) continue;
    if (cleaned.length) {
      const prev = cleaned[cleaned.length - 1];
      const dup =
        Math.abs(prev.start.x - seg.start.x) < 0.5 &&
        Math.abs(prev.start.y - seg.start.y) < 0.5 &&
        Math.abs(prev.end.x - seg.end.x) < 0.5 &&
        Math.abs(prev.end.y - seg.end.y) < 0.5;
      if (dup) continue;
    }
    cleaned.push(seg);
  }

  return cleaned;
}

const routingSegments = parsePathData(routingPathData);

// Find the nearest point on any routing segment to a given point
function findNearestPointOnPath(point: { x: number; y: number }): { x: number; y: number; segmentIndex: number } {
  let nearestPoint = { x: 0, y: 0 };
  let minDistance = Number.MAX_VALUE;
  let segmentIndex = -1;

  routingSegments.forEach((segment, index) => {
    const p = projectPointOnSegment(point, segment.start, segment.end);
    const distance = Math.hypot(p.x - point.x, p.y - point.y);
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestPoint = p;
      segmentIndex = index;
    }
  });

  return { ...nearestPoint, segmentIndex };
}

// Project a point onto a line segment
function projectPointOnSegment(p: { x: number; y: number }, start: { x: number; y: number }, end: { x: number; y: number }): { x: number; y: number } {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  
  if (lengthSquared === 0) return start;

  let t = ((p.x - start.x) * dx + (p.y - start.y) * dy) / lengthSquared;
  t = Math.max(0, Math.min(1, t));

  return {
    x: start.x + t * dx,
    y: start.y + t * dy
  };
}

// Build an undirected graph from routing segment endpoints
type PointKey = string;

function toKey(p: { x: number; y: number }): PointKey {
  // Round to integer pixels to stabilize node identity
  return `${Math.round(p.x)},${Math.round(p.y)}`;
}

function fromKey(key: PointKey): { x: number; y: number } {
  const [x, y] = key.split(',').map(Number);
  return { x, y };
}

function buildRoutingGraph(): Map<PointKey, Map<PointKey, number>> {
  const graph = new Map<PointKey, Map<PointKey, number>>();
  const nodes: Array<{ key: PointKey; x: number; y: number }> = [];
  const EPS = 3.0; // merge endpoints within ~3px to tolerate minor SVG drift

  function findOrCreateKey(p: { x: number; y: number }): PointKey {
    for (const node of nodes) {
      if (Math.hypot(node.x - p.x, node.y - p.y) <= EPS) {
        return node.key;
      }
    }
    const key = toKey(p);
    nodes.push({ key, x: p.x, y: p.y });
    if (!graph.has(key)) graph.set(key, new Map());
    return key;
  }

  function connect(a: { x: number; y: number }, b: { x: number; y: number }) {
    const ka = findOrCreateKey(a);
    const kb = findOrCreateKey(b);
    const pa = fromKey(ka);
    const pb = fromKey(kb);
    const w = Math.hypot(pb.x - pa.x, pb.y - pa.y);
    if (!graph.get(ka)!.has(kb)) graph.get(ka)!.set(kb, w);
    if (!graph.get(kb)!.has(ka)) graph.get(kb)!.set(ka, w);
  }

  for (const seg of routingSegments) {
    connect(seg.start, seg.end);
  }

  return graph;
}

let ROUTING_GRAPH = buildRoutingGraph();

// Rebuild graph if path data/segments change at runtime (defensive)
function ensureGraphFresh() {
  // Very cheap size check; rebuild if empty unexpectedly
  if (ROUTING_GRAPH.size === 0) {
    ROUTING_GRAPH = buildRoutingGraph();
  }
}

function nearestEndpointForProjection(proj: { x: number; y: number; segmentIndex: number }): PointKey {
  const seg = routingSegments[Math.max(0, proj.segmentIndex)];
  if (!seg) {
    // Fallback: nearest node across whole graph
    let bestKey = '';
    let bestDist = Infinity;
    for (const key of ROUTING_GRAPH.keys()) {
      const p = fromKey(key);
      const d = Math.hypot(p.x - proj.x, p.y - proj.y);
      if (d < bestDist) { bestDist = d; bestKey = key; }
    }
    return bestKey;
  }

  // Prefer merged graph node closest to the projection among the two segment ends
  const ends: Array<{ key: PointKey; x: number; y: number }> = [seg.start, seg.end].map(p => ({ key: toKey(p), x: p.x, y: p.y }));
  let best = ends[0].key;
  let bestD = Infinity;
  for (const e of ends) {
    const node = fromKey(e.key); // snapped to merged node location
    const d = Math.hypot(node.x - proj.x, node.y - proj.y);
    if (d < bestD) { bestD = d; best = e.key; }
  }
  return best;
}

function nearestGraphNode(point: { x: number; y: number }): PointKey {
  let bestKey: PointKey | null = null;
  let bestDist = Infinity;
  for (const key of ROUTING_GRAPH.keys()) {
    const p = fromKey(key);
    const d = Math.hypot(p.x - point.x, p.y - point.y);
    if (d < bestDist) { bestDist = d; bestKey = key; }
  }
  // bestKey will not be null because graph has nodes from routingSegments
  return bestKey as PointKey;
}

function dijkstraWithGraph(graph: Map<PointKey, Map<PointKey, number>>, startKey: PointKey, endKey: PointKey): PointKey[] | null {
  const dist = new Map<PointKey, number>();
  const prev = new Map<PointKey, PointKey | null>();
  const visited = new Set<PointKey>();

  for (const key of graph.keys()) {
    dist.set(key, Infinity);
    prev.set(key, null);
  }
  dist.set(startKey, 0);

  while (visited.size < graph.size) {
    // pick unvisited with min distance
    let u: PointKey | null = null;
    let min = Infinity;
    for (const [key, d] of dist) {
      if (!visited.has(key) && d < min) { min = d; u = key; }
    }
    if (u === null) break;
    visited.add(u);

    const neighbors = graph.get(u)!;
    for (const [v, w] of neighbors) {
      if (visited.has(v)) continue;
      const alt = dist.get(u)! + w;
      if (alt < dist.get(v)!) {
        dist.set(v, alt);
        prev.set(v, u);
      }
    }

    if (u === endKey) break;
  }

  if (!visited.has(endKey) && startKey !== endKey) return null;

  const pathKeys: PointKey[] = [];
  let cur: PointKey | null = endKey;
  while (cur) {
    pathKeys.unshift(cur);
    cur = prev.get(cur) ?? null;
    if (cur === startKey) { pathKeys.unshift(startKey); break; }
  }
  if (pathKeys.length === 0) return null;
  return pathKeys;
}

// Find a path between two points using the routing segments
function findPathThroughSegments(startPoint: { x: number; y: number }, endPoint: { x: number; y: number }): Array<{ x: number; y: number }> {
  // Guard against NaNs leaked from bad projections
  const startProjRaw = findNearestPointOnPath(startPoint);
  const endProjRaw = findNearestPointOnPath(endPoint);
  const startProj = {
    x: Number.isFinite(startProjRaw.x) ? startProjRaw.x : startPoint.x,
    y: Number.isFinite(startProjRaw.y) ? startProjRaw.y : startPoint.y,
    segmentIndex: Number.isFinite(startProjRaw.segmentIndex) ? startProjRaw.segmentIndex : 0
  };
  const endProj = {
    x: Number.isFinite(endProjRaw.x) ? endProjRaw.x : endPoint.x,
    y: Number.isFinite(endProjRaw.y) ? endProjRaw.y : endPoint.y,
    segmentIndex: Number.isFinite(endProjRaw.segmentIndex) ? endProjRaw.segmentIndex : 0
  };

  // Prefer the endpoint of the projected segment; fallback to nearest graph node
  let startNode = nearestEndpointForProjection(startProj);
  let endNode = nearestEndpointForProjection(endProj);
  if (!ROUTING_GRAPH.has(startNode)) startNode = nearestGraphNode(startProj);
  if (!ROUTING_GRAPH.has(endNode)) endNode = nearestGraphNode(endProj);

  ensureGraphFresh();
  const pathKeys = dijkstraWithGraph(ROUTING_GRAPH, startNode, endNode);

  // Always build a path strictly along ROUTING: building -> projection -> graph nodes -> projection -> building
  const path: Array<{ x: number; y: number }> = [];
  path.push(startPoint);
  path.push({ x: Math.round(startProj.x), y: Math.round(startProj.y) });

  if (pathKeys && pathKeys.length > 0) {
    for (const key of pathKeys) {
      const p = fromKey(key);
      path.push(p);
    }
  }

  path.push({ x: Math.round(endProj.x), y: Math.round(endProj.y) });
  path.push(endPoint);

  return path;
}

// Main routing function
export function findRoute(fromBuilding: string, toBuilding: string): Array<{ x: number; y: number }> {
  const start = buildingCoordinates[fromBuilding];
  const end = buildingCoordinates[toBuilding];
  
  if (!start || !end) {
    return [];
  }

  return findPathThroughSegments(start, end);
}

// Find a safe waypoint when the original is inside a building
// Legacy helper (unused) removed for clean build

// Find an alternative path when direct path intersects buildings
// Legacy helper (unused) removed for clean build

// Get building name by ID
export function getBuildingName(buildingId: string): string {
  const buildingNames: Record<string, string> = {
    ModernTechnologyBldg: 'Modern Technology Building',
    GuardHouseMain: 'Main Guard House',
    StudentLounge: 'Student Lounge',
    BasketBallCourt: 'Basketball Court',
    GardenWithGazebo: 'Garden with Gazebo',
    Garden: 'Garden',
    MultiPurposeHall: 'Multi-Purpose Hall',
    MechanicalTechnologyBldg: 'Mechanical Technology Building',
    AutoRefrigirationAirconTechnologyBldf: 'Auto Refrigeration & Air Conditioning Technology Building',
    TwoStoreyTrainingInnovationChineseChamberBldg: 'Two-Storey Training Innovation & Chinese Chamber Building',
    EngineeringExtensionBldg: 'Engineering Extension Building',
    ElectricalTechnologyBldg: 'Electrical Technology Building',
    EngineeringBldg: 'Engineering Building',
    TechnologyBldg: 'Technology Building',
    Laboratories: 'Laboratories',
    TechnologicalInventionInnovationCenter: 'Technological Invention & Innovation Center',
    TechnologyExtension: 'Technology Extension',
    BldgA5: 'Building A5',
    EnterpriseCenter: 'Enterprise Center',
    Canteen: 'Canteen',
    TUPVDormitory: 'TUPV Dormitory',
    CampusBusinessCenter: 'Campus Business Center',
    StockRoom1: 'Stock Room 1',
    SupplyOffice: 'Supply Office',
    FacultyLounge: 'Faculty Lounge',
    Offices: 'Offices',
    AdminisitrationBldg: 'Administration Building',
    TrainingCenter: 'Training Center',
    PPGSOffice: 'PPGS Office',
    PowerHouse: 'Power House'
  };
  
  return buildingNames[buildingId] || buildingId;
} 