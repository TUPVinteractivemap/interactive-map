// This script shows the updated building data structure without Firebase dependency

// SVG path data extracted from the updated SVG file
const buildingPaths = {
  // Academic Zone Buildings
  ModernTechnologyBldg: "M607 632.5L730.5 704L742 683L619.5 612L607 632.5Z",
  MechanicalTechnologyBldg: "M733.5 627.5L610.5 556L600.5 575L722.5 647.5L733.5 627.5ZM779.5 547.5L656.5 476.5L610.5 556L733.5 627.5L779.5 547.5Z",
  AutoRefrigirationAirconTechnologyBldf: "M889.5 612.5L801 561L767.5 619.5L856 670.5L889.5 612.5ZM856 670.5L767.5 619.5L753.5 643.5L841.5 694L856 670.5Z",
  LamoiyanBldg: "M998.5 779.363L1027 730L1004.02 719L976.5 766.662L998.5 779.363Z",
  EngineeringExtensionBldg: "M754 289.5L785.5 308L698.5 453.5L669 435.5L754 289.5Z",
  ElectricalTechnologyBldg: "M880.5 399.5L974.5 453.5L942.5 508.5L849 453.5L880.5 399.5Z",
  EngineeringBldg: "M769.5 278L831 170L853.5 183L791.5 291L769.5 278Z",
  TechnologyBldg: "M831 170L880 86L1001.5 156L1007 146.5L1021.5 156L1003.5 186.5L889.5 120.5L853.5 183L831 170Z",
  Laboratories: "M842.5 224.5L922 270.577L908 293L829 247.5L842.5 224.5Z",
  TechnologicalInventionInnovationCenter: "M1032 137.5L971.5 241L996 255L1056 151.5L1032 137.5Z",
  TechnologyExtension: "M934.5 81.5L1032 137.5L1021.5 155.5L1007 146.5L1004 151.5L921 103.5L934.5 81.5Z",
  BldgA5: "M905 219.5L997 273L984.5 294L892.5 240.5L905 219.5Z",
  EngineeringAnnexBldg: "M796.302 183.691L835 116.664L855.198 128.325L816.5 195.352L796.302 183.691Z",

  // Recreational Zone Buildings
  StudentLounge: "M790.5 339L819 354.5L785 414.5L756 398L790.5 339Z",
  BasketBallCourt: "M913.248 517.182L957.816 543.18L951.067 554.798L935.701 581.249L927.818 594.816L883.001 568.817L838.187 542.819L846.788 528.254L861.254 503.754L868.677 491.182L913.248 517.182Z",
  SmallCanteen: "M1257 163.717L1216 140.046L1206.6 156.329L1247.6 180L1257 163.717Z",
  StudentCenter: "M1319.5 174.813L1275.66 149.5L1246.63 199.783L1257.39 206L1254 211.879L1268.07 220L1282.5 195C1302.37 206.471 1299.2 225.891 1295.13 234.167L1290.23 242.667L1295.13 245.5L1290.23 254L1313.61 267.5L1318.52 259L1324 249.5C1342.94 216.7 1325.74 191.5 1314.77 183L1319.5 174.813Z",

  // Multipurpose Activity Zone
  TUPVGymnasium: "M1108 131.5L1243.5 209.5L1185 312L1048.5 233L1108 131.5Z",
  USGCanopy: "M1292.76 301.5L1302 285.5L1287.5 276.522L1278 292.977L1292.76 301.5ZM1280.76 320.978L1290 304.978L1275.5 296L1266 312.454L1280.76 320.978ZM1269.76 340.978L1279 324.978L1264.5 316L1255 332.454L1269.76 340.978Z",

  // IGP Facilities
  EnterpriseCenter: "M729 817L740.5 792.5L549.5 703L533 730.933L729 817Z",
  Canteen: "M982 552L993.5 558.625L1011.5 526L1023.91 532.5L1041.25 542.5L1022.25 575.188L1028 578.5L998 631L951.5 603.5L982 552Z",
  TUPVDormitory: "M1313 349L1463 435.603L1548.5 287.512L1400 201.776L1313 349Z",

  // Administrative Zone
  CampusBusinessCenter: "M779 547.5L801 561L767.5 619.5L745 607L779 547.5Z",
  SupplyOffice: "M907.5 653L922 627.5L939.5 639L924.5 663L907.5 653Z",
  FacultyLounge: "M963.5 556.5L975.5 563L951.5 603L939.5 596.5L963.5 556.5Z",
  Offices: "M700.5 466.5L760 501L751 516.5L691 481.5L700.5 466.5Z",
  AdminisitrationBldg: "M997 273L1123 345.746L1049.53 473L1027.5 460.281L1080.49 368.5L1074.39 345.746L984.5 293.846L997 273Z",
  TrainingCenter: "M971 773L933.5 837L954.5 850L992 785L971 773Z",
  InnovationCenter: "M891.341 722L902.5 702.671L861.659 679.092L850.5 698.421L891.341 722Z",

  // Utilities Zone
  PPGSOffice: "M822 475L853.5 493.5L835.5 524L804.5 506L822 475Z",
  PowerHouse: "M939.5 851L957.5 861.5L946.5 879L928.5 868.5L939.5 851Z",
  SmartTower: "M1089.19 135L1098 119.738L1082.31 110.68L1073.5 125.942L1089.19 135Z",
  StockRoom1: "M907.5 653L928.5 665.5L907.5 700.5L887 688.5L907.5 653Z",

  // Conservation Areas
  GardenWithGazebo: "M1110.5 627L1035 584L1006.5 635L1081 678L1110.5 627Z",
  Garden: "M982 453.5L987.5 456.5L984 462.5L996.5 470L998.5 466.5L1011.5 474.5L983.5 523L967 513L964 517.5L949.5 509.5L982 453.5Z",

  // Security
  GuardHouseMain: "M1050 703L1063 709L1054 724.5L1041.5 716.5L1050 703Z",

  // Parking Areas (new)
  ParkingSpace1: "M798 303.5L802 297L826.672 311.5L855 262.435L895.5 285.818L907.94 293L908.44 292.5L924.028 301.5L837.426 451.5L782 419.5L819 354.707L822.106 356.5L836.5 331.57L803.471 312.5L806 308.119L798 303.5Z",
  ParkingSpace2: "M1162 526.346L1253.5 367.863L1168 318.5L1166 317.345L1074.5 475.828L1162 526.346Z",
  CoveredParkingSpace: "M1046 699.5L957.5 650L947 669.5L1034.5 719.5L1046 699.5Z",

  // Open Spaces (updated)
  OpenSpace1: "M598.5 578L513 722L944 914.5L970 868.5L940 851L981.569 779L751.5 646L719.5 650L598.5 578Z",
  OpenSpace2: "M972 301L1071.5 357.5L1042.5 409L1025.5 398.5L1017 414.5L1033.5 424L1013 459.5L979.5 440.5L976.5 445.5L885 393L922 328L948.5 342.5L972 301Z",
  OpenSpace3: "M935.5 79.5L934.5 81.5L1056 151.242L996.095 255L992.342 261.5L1127 339.245L1148 302.872L1043.5 242.538L1049 233.5L1185 312.02L1244 209.829L1108.5 131.598L1112.6 124.5L1196.5 172.941L1206.28 156L1248.5 180.375L1239.48 196L1257 206.116L1253.89 211.5L1268 219.646L1265 224.842L1259.21 221.5L1197 329.254L1159.5 307.604L1060.65 478.811L1067 482.402L1065.5 485L1160.5 540L1378 163L935.5 79.5Z"
};

// Calculate path center function (simplified version)
function calculateSimplePathCenter(pathData) {
  // Extract all coordinates from the path data
  const coords = pathData.match(/-?\d+\.?\d*/g);
  if (!coords || coords.length < 2) {
    return { x: 0, y: 0 };
  }

  let sumX = 0;
  let sumY = 0;
  let count = 0;

  for (let i = 0; i < coords.length; i += 2) {
    if (i + 1 < coords.length) {
      sumX += parseFloat(coords[i]);
      sumY += parseFloat(coords[i + 1]);
      count++;
    }
  }

  return {
    x: sumX / count,
    y: sumY / count
  };
}

// Building data with descriptions from facilities sheet (converted from caps to proper case)
const buildingData = {
  // Academic Zone
  ModernTechnologyBldg: {
    id: 'ModernTechnologyBldg',
    name: 'Modern Technology Building',
    description: 'A new building of TUPV near the exit and has three floors. Ground floor contains auditorium, office of the campus director, conference room, and comfort rooms. Second floor has MTB rooms 1-4, physics lab with preparation room, and comfort rooms. Third floor includes MTB rooms 5-10, chemtech lecture rooms, and comfort rooms.',
    type: 'Academic',
    pathData: buildingPaths.ModernTechnologyBldg,
    center: calculateSimplePathCenter(buildingPaths.ModernTechnologyBldg),
    floors: 3
  },
  MechanicalTechnologyBldg: {
    id: 'MechanicalTechnologyBldg',
    name: 'Mechanical Technology Building',
    description: 'Manufacturing rooms will be found here, also machines and office for faculty and students who majored in manufacturing engineering technology. Includes modern machining center, metal fabrication training center, metrology lab, faculty room, tool room, MT rooms 1-8, welding area, and handwashing area.',
    type: 'Academic',
    pathData: buildingPaths.MechanicalTechnologyBldg,
    center: calculateSimplePathCenter(buildingPaths.MechanicalTechnologyBldg),
    floors: 1
  }
  // Add more buildings as needed...
};

console.log('Updated Building Data Structure:');
console.log('=================================');
console.log(`Total buildings: ${Object.keys(buildingData).length}`);
console.log('\nSample Building Data:');
console.log(JSON.stringify(buildingData.ModernTechnologyBldg, null, 2));
console.log('\nBuilding Types:');
const types = Array.from(new Set(Object.values(buildingData).map(b => b.type)));
console.log(types);

console.log('\nNew buildings added:');
console.log('- LamoiyanBldg');
console.log('- SmallCanteen');
console.log('- StudentCenter');
console.log('- USGCanopy');
console.log('- InnovationCenter');
console.log('- SmartTower');
console.log('- EngineeringAnnexBldg');
console.log('- ParkingSpace1');
console.log('- ParkingSpace2');
console.log('- CoveredParkingSpace');
console.log('- OpenSpace1, OpenSpace2, OpenSpace3');

console.log('\nUpdated routing path with new coordinates from SVG');
console.log('Updated building areas to avoid in routing');
console.log('Updated building names mapping');
console.log('Fixed descriptions to remove ALL CAPS formatting');
