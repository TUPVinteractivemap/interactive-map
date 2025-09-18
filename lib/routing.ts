import { getAllBuildings } from './buildings';

export let buildingCoordinates: Record<string, { x: number; y: number }> = {};

// Load building coordinates from Firestore
export async function loadBuildingCoordinates() {
  const buildings = await getAllBuildings();
  buildingCoordinates = buildings.reduce((acc, building) => {
    acc[building.id] = building.center;
    return acc;
  }, {} as Record<string, { x: number; y: number }>);
  return buildingCoordinates;
}

// Building areas to avoid (expanded rectangles around buildings with safety margins)
export const buildingAreas: Array<{
  id: string;
  x1: number; y1: number; x2: number; y2: number;
}> = [
  // Academic Zone
  { id: 'ModernTechnologyBldg', x1: 590, y1: 595, x2: 760, y2: 720 },
  { id: 'MechanicalTechnologyBldg', x1: 580, y1: 460, x2: 800, y2: 660 },
  { id: 'AutoRefrigirationAirconTechnologyBldf', x1: 735, y1: 545, x2: 905, y2: 710 },
  { id: 'LamoiyanBldg', x1: 960, y1: 705, x2: 1045, y2: 795 },
  { id: 'EngineeringExtensionBldg', x1: 650, y1: 275, x2: 800, y2: 470 },
  { id: 'ElectricalTechnologyBldg', x1: 830, y1: 385, x2: 990, y2: 525 },
  { id: 'EngineeringBldg', x1: 750, y1: 155, x2: 870, y2: 305 },
  { id: 'TechnologyBldg', x1: 815, y1: 70, x2: 1040, y2: 200 },
  { id: 'Laboratories', x1: 810, y1: 210, x2: 940, y2: 310 },
  { id: 'TechnologicalInventionInnovationCenter', x1: 955, y1: 125, x2: 1075, y2: 270 },
  { id: 'TechnologyExtension', x1: 905, y1: 65, x2: 1050, y2: 170 },
  { id: 'BldgA5', x1: 875, y1: 205, x2: 1015, y2: 310 },
  { id: 'EngineeringAnnexBldg', x1: 780, y1: 100, x2: 870, y2: 210 },

  // Administrative Zone
  { id: 'CampusBusinessCenter', x1: 725, y1: 530, x2: 820, y2: 635 },
  { id: 'StockRoom1', x1: 870, y1: 635, x2: 945, y2: 715 },
  { id: 'SupplyOffice', x1: 890, y1: 610, x2: 955, y2: 680 },
  { id: 'FacultyLounge', x1: 920, y1: 540, x2: 990, y2: 620 },
  { id: 'Offices', x1: 675, y1: 450, x2: 775, y2: 530 },
  { id: 'AdministrationBldg', x1: 965, y1: 260, x2: 1140, y2: 490 },
  { id: 'TrainingCenter', x1: 915, y1: 755, x2: 1010, y2: 865 },
  { id: 'InnovationCenter', x1: 835, y1: 665, x2: 920, y2: 740 },

  // Recreational Zone
  { id: 'StudentLounge', x1: 740, y1: 325, x2: 835, y2: 430 },
  { id: 'BasketBallCourt', x1: 820, y1: 475, x2: 975, y2: 615 },
  { id: 'SmallCanteen', x1: 1190, y1: 125, x2: 1275, y2: 195 },
  { id: 'StudentCenter', x1: 1230, y1: 135, x2: 1340, y2: 285 },

  // Conservation Area
  { id: 'GardenWithGazebo', x1: 990, y1: 570, x2: 1125, y2: 695 },
  { id: 'Garden', x1: 930, y1: 440, x2: 1030, y2: 540 },

  // Multipurpose Activity Zone
  { id: 'TUPVGymnasium', x1: 1030, y1: 115, x2: 1260, y2: 330 },
  { id: 'USGCanopy', x1: 1240, y1: 260, x2: 1320, y2: 360 },

  // IGP Facilities
  { id: 'EnterpriseCenter', x1: 515, y1: 685, x2: 755, y2: 835 },
  { id: 'Canteen', x1: 935, y1: 535, x2: 1045, y2: 650 },
  { id: 'TUPVDormitory', x1: 1295, y1: 185, x2: 1565, y2: 455 },

  // Utilities
  { id: 'PPGSOffice', x1: 785, y1: 460, x2: 870, y2: 540 },
  { id: 'PowerHouse', x1: 910, y1: 835, x2: 975, y2: 895 },
  { id: 'SmartTower', x1: 1055, y1: 95, x2: 1115, y2: 155 },

  // Security
  { id: 'GuardHouseMain', x1: 1025, y1: 685, x2: 1080, y2: 740 },

  // Parking Areas
  { id: 'ParkingSpace1', x1: 765, y1: 280, x2: 940, y2: 470 },
  { id: 'ParkingSpace2', x1: 1055, y1: 300, x2: 1270, y2: 545 },
  { id: 'CoveredParkingSpace', x1: 930, y1: 635, x2: 1065, y2: 735 },
];

// Point-in-building helper is not needed for ROUTING-only navigation; removed for clean build

// Define the routing path segments exactly as they appear in the SVG
interface PathSegment {
  start: { x: number; y: number };
  end: { x: number; y: number };
}

// Parse the SVG path data into actual segments - Updated routing path from new SVG
const routingPathData = "M767.5 522.5L762.881 530.5L724.129 508.127M767.5 522.5L759 517.593L771.755 495.5L732 405M767.5 522.5L774.032 526.318M732 405L685.377 485.753M732 405L794.354 297M685.377 485.753L657.5 469.658L589.183 587.987L511.81 722M685.377 485.753L724.129 508.127M794.354 297L831 318.158L847.181 327.5L826.151 363.926M794.354 297L801.301 288L818.5 258.209L842 217.506M809 393.632L826.151 363.926M886.623 87L909.667 100.304M842 217.506L888.364 244.274M842 217.506L855.125 194.773M891.944 131L855.125 194.773M891.944 131L909.667 100.304M891.944 131L941.759 159.76M1017.88 467L1075.91 366.5L1073.7 358.25M1017.88 467L982 446.283L978.699 452M1017.88 467L1021 468.799M978.699 452L941 517.992M978.699 452L929.6 423.652M880.5 395.305L928.307 312.5L944.762 322L964.319 288.127M880.5 395.305L842.5 461.123M880.5 395.305L826.151 363.926M880.5 395.305L929.6 423.652M964.319 288.127L1071.49 350L1073.7 358.25M964.319 288.127L926.341 266.201M842.5 461.123L795 490L774.032 526.318M842.5 461.123L870 477M774.032 526.318L799.265 541.065M870 477L824.498 555.812M870 477L889 450.5M870 477L926.5 509.62M824.498 555.812L858.5 575.684M824.498 555.812L799.265 541.065M967.573 540L970.459 535L926.5 509.62M967.573 540L924.65 614.344M967.573 540L976 544.866M924.65 614.344L911 606.367M924.65 614.344L960.394 635.234M1027.33 574.5L1050.13 535M1027.33 574.5L1034.5 576.588M1027.33 574.5L1008.28 563.5M1050.13 535L1095 560.904M1050.13 535L1032.59 524.871M1037.5 478.326L1015.49 515L1032.59 524.871M1037.5 478.326L1021 468.799M1037.5 478.326L1054 482.915M991.574 188.521L994.876 190.428L991.574 202.5L964.319 249.707M991.574 188.521L1009.48 157.5L994.876 149.5L971.5 136.004M991.574 188.521L941.759 159.76M1068.5 454.5L1133 494L1167.25 433.5M1068.5 454.5L1054 482.915M1068.5 454.5L1099 399.787M1032.59 524.871L1054 482.915M1348.52 278.609L1327.55 266.5L1141.93 588L1075.83 702.5L1069.5 699L1054 689.941M911 606.367L898.5 628.017M911 606.367L870 582.405M709.274 767.581L785.908 804L840.352 705L858.5 673.567L868.777 679.5L880.612 659M709.274 767.581L717.692 753M709.274 767.581L582.5 708M1054 689.941L1035.2 722.5M1054 689.941L1024 672.408M1035.2 722.5L1040.5 725.559L962 861.525L948.5 853.73M1035.2 722.5L1012.98 691.5L1024 672.408M1095.5 561L1073.5 599.105M1073.5 599.105L1034.5 576.588M1073.5 599.105L1063 618M1034.5 576.588L1019.54 602.5M990.384 653L1019.54 602.5M880.612 659L894 666.729M880.612 659L898.5 628.017M898.5 628.017L911 635.234M1024 672.408L960.394 635.234M1024 672.408L1045.5 635.234M964.319 249.707L1129.5 345.075M964.319 249.707L905 215.459L888.364 244.274M1129.5 345.075L1154.08 302.5L1193 321M1129.5 345.075L1166 352.5M1129.5 345.075L1099 399.787M1193 321L1221.72 271.25M1193 321L1166 352.5M1226.49 173.5L1243 184L1233 196.5L1249 207L1249.72 214.25M1249.72 214.25L1250.45 221.5L1226.49 263M1249.72 214.25L1281.5 229.5L1287.5 217M1221.72 271.25L1267.19 297.5M1221.72 271.25L1226.49 263M888.364 244.274L926.341 266.201M855.125 194.773L818.5 173.628M1226.49 263L1168.5 232.5M858.5 575.684L844.978 599.105M858.5 575.684L870 582.405M799.265 541.065L774.032 585L717.692 682.583M799.265 541.065L830.768 486.5M724.129 508.127L703.5 543.857L682.344 580.5M976 544.866L1021 468.799M976 544.866L1008.28 563.5M909.667 100.304L971.5 136.004M926.341 266.201L935.864 249.707M1166 352.5L1201.5 373L1167.25 433.5M960.394 635.234L982 599.105M870 582.405L890.5 540M1073.7 358.25L1098 352.5M941.759 159.76L951 144.5M971.5 136.004L977.5 122.5M926.5 509.62L911 544.866M929.6 423.652L919.5 443M1019.54 602.5L1057.5 624.5M1008.28 563.5L995.5 582.405M1167.25 433.5L1099 399.787";

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

// Get building areas for collision detection
export function getBuildingAreas(): Array<{
  id: string;
  x1: number; y1: number; x2: number; y2: number;
}> {
  return buildingAreas;
}

// Main routing function
export async function findRoute(fromBuilding: string, toBuilding: string): Promise<Array<{ x: number; y: number }>> {
  // Make sure coordinates are loaded
  if (Object.keys(buildingCoordinates).length === 0) {
    await loadBuildingCoordinates();
  }

  const start = buildingCoordinates[fromBuilding];
  const end = buildingCoordinates[toBuilding];
  
  if (!start || !end) {
    return [];
  }

  return findPathThroughSegments(start, end);
}

// Get building name by ID
export function getBuildingName(buildingId: string): string {
  const buildingNames: Record<string, string> = {
    // Academic Zone
    ModernTechnologyBldg: 'Modern Technology Building',
    MechanicalTechnologyBldg: 'Mechanical Technology Building',
    AutoRefrigerationAirconTechnologyBldf: 'Automotive & Refrigeration and Air-Condition Technology Building',
    LamoiyanBldg: 'Lamoiyan Building',
    EngineeringExtensionBldg: 'Engineering Extension Building',
    ElectricalTechnologyBldg: 'Electrical Technology Building',
    EngineeringBldg: 'Engineering Building',
    TechnologyBldg: 'Technology Building',
    Laboratories: 'Laboratories',
    TechnologicalInventionInnovationCenter: 'Technological Invention & Innovation Center',
    TechnologyExtension: 'Technology Extension',
    BldgA5: 'Building A5',
    EngineeringAnnexBldg: 'Engineering Annex Building',

    // Recreational Zone
    StudentLounge: 'Student Lounge',
    BasketBallCourt: 'Basketball Court',
    SmallCanteen: 'Small Canteen',
    StudentCenter: 'Student Center',

    // Conservation Area
    GardenWithGazebo: 'Garden with Gazebo',
    Garden: 'Garden',

    // Multipurpose Activity Zone
    TUPVGymnasium: 'TUPV Gymnasium',
    USGCanopy: 'USG Canopy Lounges',

    // IGP Facilities
    EnterpriseCenter: 'Enterprise Center',
    Canteen: 'Canteen',
    TUPVDormitory: 'TUPV Dormitory',

    // Administrative Zone
    CampusBusinessCenter: 'Campus Business Center',
    SupplyOffice: 'Supply Office',
    FacultyLounge: 'Faculty Lounge',
    Offices: 'Offices',
    AdminisitrationBldg: 'Administration Building',
    TrainingCenter: 'Training Center',
    InnovationCenter: 'Innovation Center',
    StockRoom1: 'Stock Room',

    // Utilities Zone
    PPGSOffice: 'PPGS Office',
    PowerHouse: 'Power House',
    SmartTower: 'Smart Tower',

    // Security
    GuardHouseMain: 'Guard House',

    // Parking Areas
    ParkingSpace1: 'Parking Space 1',
    ParkingSpace2: 'Parking Area',
    CoveredParkingSpace: 'Covered Parking Space'
  };
  
  return buildingNames[buildingId] || buildingId;
} 