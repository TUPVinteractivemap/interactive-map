import { db } from '../lib/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { BuildingInfo } from '../lib/buildings';
import { calculatePathCenter } from '../lib/utils';

// SVG path data extracted from the updated SVG file
const buildingPaths: Record<string, string> = {
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

// Building data with descriptions from facilities sheet (converted from caps to proper case)
const buildingData: Record<string, BuildingInfo> = {
  // Academic Zone
  ModernTechnologyBldg: {
    id: 'ModernTechnologyBldg',
    name: 'Modern Technology Building',
    description: 'A new building of TUPV near the exit and has three floors. Ground floor contains auditorium, office of the campus director, conference room, and comfort rooms. Second floor has MTB rooms 1-4, physics lab with preparation room, and comfort rooms. Third floor includes MTB rooms 5-10, chemtech lecture rooms, and comfort rooms.',
    type: 'Academic',
    pathData: buildingPaths.ModernTechnologyBldg,
    center: calculatePathCenter(buildingPaths.ModernTechnologyBldg),
    floors: 3
  },
  MechanicalTechnologyBldg: {
    id: 'MechanicalTechnologyBldg',
    name: 'Mechanical Technology Building',
    description: 'Manufacturing rooms will be found here, also machines and office for faculty and students who majored in manufacturing engineering technology. Includes modern machining center, metal fabrication training center, metrology lab, faculty room, tool room, MT rooms 1-8, welding area, and handwashing area.',
    type: 'Academic',
    pathData: buildingPaths.MechanicalTechnologyBldg,
    center: calculatePathCenter(buildingPaths.MechanicalTechnologyBldg),
    floors: 1
  },
  AutoRefrigirationAirconTechnologyBldf: {
    id: 'AutoRefrigirationAirconTechnologyBldf',
    name: 'Automotive & Refrigeration and Air-Condition Technology Building',
    description: 'HVAC-R and automotive rooms for students will be found here and its office for faculty. HVAC section includes RAC rooms 1-3, stock room, faculty room, tool room, and comfort room. Automotive section has AUT rooms 2-4, faculty room, laboratory room, and lecture room.',
    type: 'Academic',
    pathData: buildingPaths.AutoRefrigirationAirconTechnologyBldf,
    center: calculatePathCenter(buildingPaths.AutoRefrigirationAirconTechnologyBldf),
    floors: 1
  },
  LamoiyanBldg: {
    id: 'LamoiyanBldg',
    name: 'Lamoiyan Building',
    description: 'This building is for TUPV personnel.',
    type: 'Administrative',
    pathData: buildingPaths.LamoiyanBldg,
    center: calculatePathCenter(buildingPaths.LamoiyanBldg),
    floors: 1
  },
  EngineeringExtensionBldg: {
    id: 'EngineeringExtensionBldg',
    name: 'Engineering Building Extension',
    description: 'Mechanical engineering rooms will be found in this area labeled as EEB rooms and the second floor of this building is the library of TUPV. Ground floor has EEB rooms 1-4 and comfort rooms. First floor contains library, learning commons, and comfort rooms.',
    type: 'Academic',
    pathData: buildingPaths.EngineeringExtensionBldg,
    center: calculatePathCenter(buildingPaths.EngineeringExtensionBldg),
    floors: 2
  },
  ElectricalTechnologyBldg: {
    id: 'ElectricalTechnologyBldg',
    name: 'Electrical Technology Building',
    description: 'Electrical engineering technology building consists of rooms and offices for electrical technology students and faculty. Includes ELECT rooms 1-3, EC 1-2, EM 4, stock room, faculty room, SIT office, and handwashing area.',
    type: 'Academic',
    pathData: buildingPaths.ElectricalTechnologyBldg,
    center: calculatePathCenter(buildingPaths.ElectricalTechnologyBldg),
    floors: 1
  },
  EngineeringBldg: {
    id: 'EngineeringBldg',
    name: 'Engineering Building',
    description: 'Engineering building consists of surface mount technology room, office of college of engineering and registrar office. Ground floor has surface mount technology center (SMTC), college of engineering (COE) office, registrar, comfort rooms, and stairs. First floor contains rooms 31-34.',
    type: 'Academic',
    pathData: buildingPaths.EngineeringBldg,
    center: calculatePathCenter(buildingPaths.EngineeringBldg),
    floors: 2
  },
  TechnologyBldg: {
    id: 'TechnologyBldg',
    name: 'Technology Building',
    description: 'The ground floor of this building consists of machining area and offices. The first floor of this building has lecture rooms, laboratories and faculty offices. Ground floor includes records office, technical research and development center, machine shop area, ADAA, COET office, ETEEAP/graduate studies, welding area, comfort rooms, and stairs. First floor has rooms 37A, 38, 39 (electromechanical engineering technology), research and extension office, ECE tool room, ECE labs 1-2, and ECE workshop.',
    type: 'Academic',
    pathData: buildingPaths.TechnologyBldg,
    center: calculatePathCenter(buildingPaths.TechnologyBldg),
    floors: 2
  },
  Laboratories: {
    id: 'Laboratories',
    name: 'Laboratories',
    description: 'On the ground floor of this building, is where the experiments and laboratory activities take place and an office for faculty. And for the first floor, the electronics and communication technology labs take place. Ground floor has chemical engineering technology faculty, CL 3-4, chemical preparation and instrumentation room, comfort rooms, stairs, and handwashing area. First floor contains ELX comp lab 1, ELEX lab 1, ELX lab 1A, and room 30.',
    type: 'Academic',
    pathData: buildingPaths.Laboratories,
    center: calculatePathCenter(buildingPaths.Laboratories),
    floors: 2
  },
  TechnologicalInventionInnovationCenter: {
    id: 'TechnologicalInventionInnovationCenter',
    name: 'Technological Invention and Innovation Center',
    description: 'On the first floor of this building is for college of automation and control students and the second floor is for computer technology students. Ground floor includes college of automation and control lab 3, technology transfer support office, innovation and technology support office, electro-pneumatic lab 1, simulation room, and lab 2 (HMI/computer). First floor has EAC rooms 1-2, computer laboratories 1-3, and CPE room 1.',
    type: 'Academic',
    pathData: buildingPaths.TechnologicalInventionInnovationCenter,
    center: calculatePathCenter(buildingPaths.TechnologicalInventionInnovationCenter),
    floors: 2
  },
  TechnologyExtension: {
    id: 'TechnologyExtension',
    name: 'Technology Extension',
    description: 'In this area, lecture rooms for chemical engineering technology can be found here on the ground floor and faculties on the first floor. Ground floor has chemistry lecture rooms (CLR) 1-2 and college of automation and control (COAC) lab. First floor contains TUPV campus radio station, ECE faculty, EBR 2, and computer laboratory 4.',
    type: 'Academic',
    pathData: buildingPaths.TechnologyExtension,
    center: calculatePathCenter(buildingPaths.TechnologyExtension),
    floors: 2
  },
  BldgA5: {
    id: 'BldgA5',
    name: 'Building A/5',
    description: 'On the ground floor of this building, another laboratory rooms for chemical engineering/technology students. This building also has a first floor where electronics and communication technology laboratories and lecture rooms are found. Ground floor has chemical storage area, CL 1-2. First floor contains room 26, electronics stock room, and electronics lab 2.',
    type: 'Academic',
    pathData: buildingPaths.BldgA5,
    center: calculatePathCenter(buildingPaths.BldgA5),
    floors: 2
  },
  EngineeringAnnexBldg: {
    id: 'EngineeringAnnexBldg',
    name: 'Engineering Annex Building',
    description: 'The first floor of this building is for mechanical engineering students and the second floor is for electronics and communication engineering students. Ground floor has NEB rooms 1-4. First floor contains NEB rooms 5-8.',
    type: 'Academic',
    pathData: buildingPaths.EngineeringAnnexBldg,
    center: calculatePathCenter(buildingPaths.EngineeringAnnexBldg),
    floors: 2
  },

  // Recreational Zone
  StudentLounge: {
    id: 'StudentLounge',
    name: 'Student Lounge',
    description: 'Student lounge is used for campus events and students can also hang around here when they have vacant time.',
    type: 'Recreational',
    pathData: buildingPaths.StudentLounge,
    center: calculatePathCenter(buildingPaths.StudentLounge),
    floors: 1
  },
  BasketBallCourt: {
    id: 'BasketBallCourt',
    name: 'Basketball Court',
    description: 'It is an open basketball court near the canteen.',
    type: 'Recreational',
    pathData: buildingPaths.BasketBallCourt,
    center: calculatePathCenter(buildingPaths.BasketBallCourt),
    floors: 1
  },
  SmallCanteen: {
    id: 'SmallCanteen',
    name: 'Small Canteen',
    description: 'Students, faculty, visitors and staffs can also purchase their snacks and lunches but has limited tables and chairs to dine in. The location of this canteen is near the TUPV gymnasium.',
    type: 'Recreational',
    pathData: buildingPaths.SmallCanteen,
    center: calculatePathCenter(buildingPaths.SmallCanteen),
    floors: 1
  },
  StudentCenter: {
    id: 'StudentCenter',
    name: 'Student Center',
    description: 'The student center is a building for USG officers where they manage campus affairs.',
    type: 'Recreational',
    pathData: buildingPaths.StudentCenter,
    center: calculatePathCenter(buildingPaths.StudentCenter),
    floors: 1
  },

  // Multipurpose Activity Zone
  TUPVGymnasium: {
    id: 'TUPVGymnasium',
    name: 'TUPV Gymnasium',
    description: 'The gymnasium of TUPV is used for events and P.E. subjects of TUPV students. Basketball court and comfort rooms for both men and females are found inside the gymnasium. Offices include planning office, university fitness center, procurement office, sports & cultural affairs office and physical education department, naval reserve center - western visayas, TUPV alumni office, gender and development office, and TUPV yearbook office.',
    type: 'Multipurpose',
    pathData: buildingPaths.TUPVGymnasium,
    center: calculatePathCenter(buildingPaths.TUPVGymnasium),
    floors: 1
  },
  USGCanopy: {
    id: 'USGCanopy',
    name: 'USG Canopy Lounges',
    description: 'Has three canopy where students can hang around when has a vacant time.',
    type: 'Recreational',
    pathData: buildingPaths.USGCanopy,
    center: calculatePathCenter(buildingPaths.USGCanopy),
    floors: 1
  },

  // IGP Facilities
  EnterpriseCenter: {
    id: 'EnterpriseCenter',
    name: 'Enterprise Center',
    description: 'Enterprise development and business center.',
    type: 'IGP',
    pathData: buildingPaths.EnterpriseCenter,
    center: calculatePathCenter(buildingPaths.EnterpriseCenter),
    floors: 1
  },
  Canteen: {
    id: 'Canteen',
    name: 'Canteen',
    description: 'Students, faculty, visitors and staffs of TUPV can purchase their lunches and snacks here. Also, the location has tables and chairs where they can dine in. This area is near the entrance or main gate of TUPV.',
    type: 'IGP',
    pathData: buildingPaths.Canteen,
    center: calculatePathCenter(buildingPaths.Canteen),
    floors: 1
  },
  TUPVDormitory: {
    id: 'TUPVDormitory',
    name: 'TUPV Dormitory',
    description: 'Student dormitory and housing facility.',
    type: 'IGP',
    pathData: buildingPaths.TUPVDormitory,
    center: calculatePathCenter(buildingPaths.TUPVDormitory),
    floors: 1
  },

  // Administrative Zone
  CampusBusinessCenter: {
    id: 'CampusBusinessCenter',
    name: 'Campus Business Center',
    description: 'This is where the students can buy school supplies and it has a photocopy and printing jobs.',
    type: 'Administrative',
    pathData: buildingPaths.CampusBusinessCenter,
    center: calculatePathCenter(buildingPaths.CampusBusinessCenter),
    floors: 1
  },
  SupplyOffice: {
    id: 'SupplyOffice',
    name: 'Supply Office',
    description: 'In this area, you can find the school and office supplies of different departments.',
    type: 'Administrative',
    pathData: buildingPaths.SupplyOffice,
    center: calculatePathCenter(buildingPaths.SupplyOffice),
    floors: 1
  },
  FacultyLounge: {
    id: 'FacultyLounge',
    name: 'Faculty Lounge',
    description: 'In this area, where the faculty and staffs of TUPV can hang around here. This area is near the canteen.',
    type: 'Administrative',
    pathData: buildingPaths.FacultyLounge,
    center: calculatePathCenter(buildingPaths.FacultyLounge),
    floors: 1
  },
  Offices: {
    id: 'Offices',
    name: 'Offices',
    description: 'General office spaces for various administrative functions.',
    type: 'Administrative',
    pathData: buildingPaths.Offices,
    center: calculatePathCenter(buildingPaths.Offices),
    floors: 1
  },
  AdminisitrationBldg: {
    id: 'AdminisitrationBldg',
    name: 'Administration Building',
    description: 'It serves as the central hub for academic planning, student services, and administrative operations. Ground floor includes clinic, emergency room, assistant director offices, budget office, conference room, comfort rooms, accounting office, cashier, and accreditation office. First floor has basic arts and sciences office, comfort rooms, computer engineering technology faculty room, computer engineering faculty room, rooms 17-19, 22-23, university information technology center, and computer engineering technology tool room.',
    type: 'Administrative',
    pathData: buildingPaths.AdminisitrationBldg,
    center: calculatePathCenter(buildingPaths.AdminisitrationBldg),
    floors: 2
  },
  TrainingCenter: {
    id: 'TrainingCenter',
    name: 'Training Center',
    description: 'Used for events and meetings.',
    type: 'Administrative',
    pathData: buildingPaths.TrainingCenter,
    center: calculatePathCenter(buildingPaths.TrainingCenter),
    floors: 1
  },
  InnovationCenter: {
    id: 'InnovationCenter',
    name: 'Innovation Center',
    description: 'This building is for TUPV personnel.',
    type: 'Administrative',
    pathData: buildingPaths.InnovationCenter,
    center: calculatePathCenter(buildingPaths.InnovationCenter),
    floors: 1
  },

  // Utilities Zone
  PPGSOffice: {
    id: 'PPGSOffice',
    name: 'PPGS Office',
    description: 'This building is for the physical plant & general services. Includes comfort rooms for male/female/neutral.',
    type: 'Utilities',
    pathData: buildingPaths.PPGSOffice,
    center: calculatePathCenter(buildingPaths.PPGSOffice),
    floors: 1
  },
  PowerHouse: {
    id: 'PowerHouse',
    name: 'Power House',
    description: 'This is where the generators of TUPV are stored.',
    type: 'Utilities',
    pathData: buildingPaths.PowerHouse,
    center: calculatePathCenter(buildingPaths.PowerHouse),
    floors: 1
  },
  SmartTower: {
    id: 'SmartTower',
    name: 'Smart Tower',
    description: 'A cell tower located near TUPV gymnasium.',
    type: 'Utilities',
    pathData: buildingPaths.SmartTower,
    center: calculatePathCenter(buildingPaths.SmartTower),
    floors: 1
  },
  StockRoom1: {
    id: 'StockRoom1',
    name: 'Stock Room',
    description: 'This is where students can purchase the merchandises of TUPV.',
    type: 'Administrative',
    pathData: buildingPaths.StockRoom1,
    center: calculatePathCenter(buildingPaths.StockRoom1),
    floors: 1
  },

  // Conservation Areas
  GardenWithGazebo: {
    id: 'GardenWithGazebo',
    name: 'Garden with Gazebo',
    description: 'Landscaped garden area with gazebo for relaxation and events.',
    type: 'Conservation',
    pathData: buildingPaths.GardenWithGazebo,
    center: calculatePathCenter(buildingPaths.GardenWithGazebo),
    floors: 1
  },
  Garden: {
    id: 'Garden',
    name: 'Garden',
    description: 'Landscaped garden area for campus beautification and relaxation.',
    type: 'Conservation',
    pathData: buildingPaths.Garden,
    center: calculatePathCenter(buildingPaths.Garden),
    floors: 1
  },

  // Security
  GuardHouseMain: {
    id: 'GuardHouseMain',
    name: 'Guard House',
    description: 'The guard house of TUPV where campus guards are stationed.',
    type: 'Security',
    pathData: buildingPaths.GuardHouseMain,
    center: calculatePathCenter(buildingPaths.GuardHouseMain),
    floors: 1
  },

  // Parking Areas
  ParkingSpace1: {
    id: 'ParkingSpace1',
    name: 'Parking Space 1',
    description: 'The parking space is for faculty, staffs and students of TUPV. This is near the student lounge.',
    type: 'Parking',
    pathData: buildingPaths.ParkingSpace1,
    center: calculatePathCenter(buildingPaths.ParkingSpace1),
    floors: 1
  },
  ParkingSpace2: {
    id: 'ParkingSpace2',
    name: 'Parking Area',
    description: 'The parking area is also for faculty, staffs and students of TUPV. This is located near the TUPV gymnasium.',
    type: 'Parking',
    pathData: buildingPaths.ParkingSpace2,
    center: calculatePathCenter(buildingPaths.ParkingSpace2),
    floors: 1
  },
  CoveredParkingSpace: {
    id: 'CoveredParkingSpace',
    name: 'Covered Parking Space',
    description: 'The covered parking space of TUPV are exclusive for faculty and staffs.',
    type: 'Parking',
    pathData: buildingPaths.CoveredParkingSpace,
    center: calculatePathCenter(buildingPaths.CoveredParkingSpace),
    floors: 1
  },

  // Open Spaces
  OpenSpace1: {
    id: 'OpenSpace1',
    name: 'Open Space 1',
    description: 'This is where the umbrellas are located for faculty, staffs and students can hang around. This is located near the electrical technology building.',
    type: 'Open Space',
    pathData: buildingPaths.OpenSpace1,
    center: calculatePathCenter(buildingPaths.OpenSpace1),
    floors: 1
  },
  OpenSpace2: {
    id: 'OpenSpace2',
    name: 'Open Space 2',
    description: 'Open recreational area for students, faculty, and staff to gather and relax.',
    type: 'Open Space',
    pathData: buildingPaths.OpenSpace2,
    center: calculatePathCenter(buildingPaths.OpenSpace2),
    floors: 1
  },
  OpenSpace3: {
    id: 'OpenSpace3',
    name: 'Open Space 3',
    description: 'Large open area for outdoor activities and campus events.',
    type: 'Open Space',
    pathData: buildingPaths.OpenSpace3,
    center: calculatePathCenter(buildingPaths.OpenSpace3),
    floors: 1
  }
};

async function migrateBuildings() {
  const batch = writeBatch(db);
  const buildingsRef = collection(db, 'buildings');

  Object.values(buildingData).forEach((building) => {
    const { id, ...buildingWithoutId } = building;
    const docRef = doc(buildingsRef, id);
    batch.set(docRef, buildingWithoutId);
  });

  try {
    await batch.commit();
    console.log('Successfully migrated building data to Firestore');
    console.log(`Migrated ${Object.keys(buildingData).length} buildings`);
  } catch (error) {
    console.error('Error migrating building data:', error);
  }
}

migrateBuildings();
