// Building coordinates (center points of each building)
export const buildingCoordinates: Record<string, { x: number; y: number }> = {
  ModernTechnologyBldg: { x: 669.75, y: 658.25 },
  GuardHouseMain: { x: 1052.25, y: 713.75 },
  StudentLounge: { x: 787.75, y: 376.75 },
  BasketBallCourt: { x: 898.5, y: 542.5 },
  GardenWithGazebo: { x: 1058.25, y: 630.5 },
  Garden: { x: 987.75, y: 488.25 },
  MultiPurposeHall: { x: 1175.75, y: 170.75 },
  MechanicalTechnologyBldg: { x: 666.75, y: 601.75 },
  AutoRefrigirationAirconTechnologyBldf: { x: 823.25, y: 615.75 },
  TwoStoreyTrainingInnovationChineseChamberBldg: { x: 980.25, y: 731.75 },
  EngineeringExtensionBldg: { x: 721.75, y: 371.5 },
  ElectricalTechnologyBldg: { x: 911.75, y: 454 },
  EngineeringBldg: { x: 800.25, y: 234.5 },
  TechnologyBldg: { x: 916.25, y: 128.25 },
  Laboratories: { x: 875.75, y: 258.75 },
  TechnologicalInventionInnovationCenter: { x: 1014.25, y: 194.25 },
  TechnologyExtension: { x: 983.25, y: 109.5 },
  BldgA5: { x: 951.25, y: 256.75 },
  EnterpriseCenter: { x: 639.25, y: 760.25 },
  Canteen: { x: 1005.25, y: 591.5 },
  TUPVDormitory: { x: 1388.25, y: 318.25 },
  CampusBusinessCenter: { x: 790.25, y: 583.5 },
  StockRoom1: { x: 917.75, y: 676.75 },
  SupplyOffice: { x: 930.75, y: 646 },
  FacultyLounge: { x: 957.5, y: 579.75 },
  Offices: { x: 730.25, y: 483.75 },
  AdminisitrationBldg: { x: 1060.25, y: 373.25 },
  TrainingCenter: { x: 981.75, y: 811.5 },
  PPGSOffice: { x: 838.25, y: 499.5 },
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
function lineIntersectsBuilding(x1: number, y1: number, x2: number, y2: number): boolean {
  // Check multiple points along the line
  const steps = 10;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x1 + t * (x2 - x1);
    const y = y1 + t * (y2 - y1);
    if (isPointInBuilding(x, y)) {
      return true;
    }
  }
  return false;
}

// Advanced pathfinding with building avoidance
export function findRoute(fromBuilding: string, toBuilding: string): Array<{ x: number; y: number }> {
  const start = buildingCoordinates[fromBuilding];
  const end = buildingCoordinates[toBuilding];
  
  if (!start || !end) {
    return [];
  }

  // Never use direct path - always create a route that avoids buildings
  const path: Array<{ x: number; y: number }> = [start];
  
  // Calculate the direction vector
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Create multiple waypoints to ensure building avoidance
  const numWaypoints = Math.max(2, Math.floor(distance / 150)); // More waypoints for longer distances
  
  for (let i = 1; i <= numWaypoints; i++) {
    const t = i / (numWaypoints + 1);
    
    // Base waypoint position
    let waypoint = {
      x: start.x + t * dx,
      y: start.y + t * dy
    };
    
    // If waypoint is in a building, find a safe alternative
    if (isPointInBuilding(waypoint.x, waypoint.y)) {
      waypoint = findSafeWaypoint(waypoint, start, end, i, numWaypoints);
    }
    
    // Check if the path to this waypoint intersects buildings
    const prevPoint = path[path.length - 1];
    if (lineIntersectsBuilding(prevPoint.x, prevPoint.y, waypoint.x, waypoint.y)) {
      // Find an alternative path around buildings
      const alternativeWaypoint = findAlternativePath(prevPoint, waypoint);
      if (alternativeWaypoint) {
        path.push(alternativeWaypoint);
      }
    }
    
    path.push(waypoint);
  }
  
  path.push(end);
  return path;
}

// Find a safe waypoint when the original is inside a building
function findSafeWaypoint(
  originalWaypoint: { x: number; y: number }, 
  start: { x: number; y: number }, 
  end: { x: number; y: number },
  waypointIndex: number,
  totalWaypoints: number
): { x: number; y: number } {
  const baseX = originalWaypoint.x;
  const baseY = originalWaypoint.y;
  
  // Try different directions and distances to find a safe spot
  const directions = [
    { dx: 0, dy: -80 },   // North
    { dx: 80, dy: 0 },    // East
    { dx: 0, dy: 80 },    // South
    { dx: -80, dy: 0 },   // West
    { dx: 60, dy: -60 },  // Northeast
    { dx: 60, dy: 60 },   // Southeast
    { dx: -60, dy: 60 },  // Southwest
    { dx: -60, dy: -60 }, // Northwest
    { dx: 0, dy: -120 },  // Further North
    { dx: 120, dy: 0 },   // Further East
    { dx: 0, dy: 120 },   // Further South
    { dx: -120, dy: 0 },  // Further West
  ];
  
  for (const dir of directions) {
    const candidate = {
      x: baseX + dir.dx,
      y: baseY + dir.dy
    };
    
    // Check if candidate is safe and not too far from the intended path
    if (!isPointInBuilding(candidate.x, candidate.y)) {
      const distanceFromPath = Math.abs((end.y - start.y) * candidate.x - (end.x - start.x) * candidate.y + end.x * start.y - end.y * start.x) / Math.sqrt((end.y - start.y) ** 2 + (end.x - start.x) ** 2);
      
      if (distanceFromPath < 200) { // Don't go too far from the intended path
        return candidate;
      }
    }
  }
  
  // If no safe spot found, return a point further away
  return {
    x: baseX + (baseX > 960 ? -150 : 150), // Move away from center
    y: baseY + (baseY > 540 ? -150 : 150)
  };
}

// Find an alternative path when direct path intersects buildings
function findAlternativePath(from: { x: number; y: number }, to: { x: number; y: number }): { x: number; y: number } | null {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Try perpendicular directions
  const perpendicular1 = { x: from.x - dy * 0.3, y: from.y + dx * 0.3 };
  const perpendicular2 = { x: from.x + dy * 0.3, y: from.y - dx * 0.3 };
  
  // Check if perpendicular paths are safe
  if (!isPointInBuilding(perpendicular1.x, perpendicular1.y) && 
      !lineIntersectsBuilding(from.x, from.y, perpendicular1.x, perpendicular1.y)) {
    return perpendicular1;
  }
  
  if (!isPointInBuilding(perpendicular2.x, perpendicular2.y) && 
      !lineIntersectsBuilding(from.x, from.y, perpendicular2.x, perpendicular2.y)) {
    return perpendicular2;
  }
  
  // Try a curved path
  const midPoint = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  const offset = distance * 0.2;
  
  const curvedPoint = {
    x: midPoint.x + (dy / distance) * offset,
    y: midPoint.y - (dx / distance) * offset
  };
  
  if (!isPointInBuilding(curvedPoint.x, curvedPoint.y)) {
    return curvedPoint;
  }
  
  return null;
}

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