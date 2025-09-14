import { db } from '../lib/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { BuildingInfo } from '../lib/buildings';
import { calculatePathCenter } from '../lib/utils';

// SVG path data for each building
const buildingPaths: Record<string, string> = {
  ModernTechnologyBldg: "M607 632.5L730.5 704L742 683L619.5 612L607 632.5Z",
  GuardHouseMain: "M1050 703L1063 709L1054 724.5L1041.5 716.5L1050 703Z",
  StudentLounge: "M790.5 339L819 354.5L785 414.5L756 398L790.5 339Z",
  BasketBallCourt: "M905 542.5C905 546.366 901.866 549.5 898 549.5C897.016 549.5 896.08 549.296 895.23 548.93L902.253 536.941C903.923 538.221 905 540.234 905 542.5ZM865 527.5C865 529.425 865.68 531.19 866.812 532.57L847.129 527.676L860.904 504.344C860.92 504.362 860.936 504.38 860.953 504.398C861.279 504.764 861.752 505.296 862.343 505.96C863.524 507.288 865.174 509.145 867.053 511.257C869.346 513.835 871.979 516.796 874.512 519.644C874.022 519.55 873.517 519.5 873 519.5C868.582 519.5 865 523.082 865 527.5ZM918 557.5C918 553.634 921.134 550.5 925 550.5L924.915 550.993L928.88 551.674C930.761 552.929 932 555.069 932 557.5C932 561.366 928.866 564.5 925 564.5C923.934 564.5 922.925 564.26 922.021 563.834L919.384 560.68L919 561L918.958 561.034C918.35 559.997 918 558.789 918 557.5ZM933 557.5C933 555.371 932.167 553.438 930.812 552.005L950.705 555.42L936.059 580.632L923.25 565.306C923.813 565.431 924.399 565.5 925 565.5C929.418 565.5 933 561.918 933 557.5ZM891 542.5C891 538.634 894.134 535.5 898 535.5C899.241 535.5 900.406 535.824 901.416 536.39L894.342 548.468C892.337 547.236 891 545.025 891 542.5ZM906 542.5C906 539.866 904.726 537.529 902.762 536.071L913.679 517.433L957.816 543.18L951.241 554.497L929.246 550.721C928.015 549.948 926.56 549.5 925 549.5C920.582 549.5 917 553.082 917 557.5C917 560.618 918.785 563.318 921.389 564.638L935.525 581.551L927.818 594.816L883.435 569.069L894.723 549.797C895.723 550.247 896.832 550.5 898 550.5C902.418 550.5 906 546.918 906 542.5ZM866 527.5C866 523.634 869.134 520.5 873 520.5C873.991 520.5 874.933 520.707 875.787 521.078C876.954 522.39 878.082 523.658 879.126 524.832L879.375 524.61C879.775 525.492 880 526.469 880 527.5C880 531.366 876.866 534.5 873 534.5C872.833 534.5 872.668 534.492 872.504 534.48L872.621 534.015L868.733 533.048C867.072 531.768 866 529.76 866 527.5ZM881 527.5C881 524.295 879.115 521.532 876.394 520.255C873.526 517.031 870.439 513.559 867.801 510.593C865.922 508.48 864.271 506.624 863.09 505.296C862.499 504.632 862.027 504.099 861.701 503.733C861.599 503.619 861.512 503.52 861.439 503.439L868.677 491.182L912.814 516.929L901.921 535.527C900.762 534.874 899.425 534.5 898 534.5C893.582 534.5 890 538.082 890 542.5C890 545.393 891.536 547.927 893.836 549.332L882.569 568.567L838.187 542.819L846.598 528.575L868.297 533.97C869.617 534.931 871.242 535.5 873 535.5C877.418 535.5 881 531.918 881 527.5Z",
  GardenWithGazebo: "M1110.5 627L1035 584L1006.5 635L1081 678L1110.5 627Z",
  Garden: "M982 453.5L987.5 456.5L984 462.5L996.5 470L998.5 466.5L1011.5 474.5L983.5 523L967 513L964 517.5L949.5 509.5L982 453.5Z",
  MultiPurposeHall: "M1108 131.5L1243.5 209.5L1185 312L1048.5 233L1108 131.5Z",
  MechanicalTechnologyBldg: "M733.5 627.5L610.5 556L600.5 575L722.5 647.5L733.5 627.5ZM779.5 547.5L656.5 476.5L610.5 556L733.5 627.5L779.5 547.5Z",
  AutoRefrigirationAirconTechnologyBldf: "M889.5 612.5L801 561L767.5 619.5L856 670.5L889.5 612.5ZM856 670.5L767.5 619.5L753.5 643.5L841.5 694L856 670.5Z",
  TwoStoreyTrainingInnovationChineseChamberBldg: "M936 684.5L1024 735L999.5 779L910.5 727L936 684.5Z",
  EngineeringExtensionBldg: "M754 289.5L785.5 308L698.5 453.5L669 435.5L754 289.5Z",
  ElectricalTechnologyBldg: "M880.5 399.5L974.5 453.5L942.5 508.5L849 453.5L880.5 399.5Z",
  EngineeringBldg: "M769.5 278L831 170L853.5 183L791.5 291L769.5 278Z",
  TechnologyBldg: "M831 170L880 86L1001.5 156L1007 146.5L1021.5 156L1003.5 186.5L889.5 120.5L853.5 183L831 170Z",
  Laboratories: "M842.5 224.5L922 270.577L908 293L829 247.5L842.5 224.5Z",
  TechnologicalInventionInnovationCenter: "M1032 137.5L971.5 241L996 255L1056 151.5L1032 137.5Z",
  TechnologyExtension: "M934.5 81.5L1032 137.5L1021.5 155.5L1007 146.5L1004 151.5L921 103.5L934.5 81.5Z",
  BldgA5: "M905 219.5L997 273L984.5 294L892.5 240.5L905 219.5Z",
  EnterpriseCenter: "M729 817L740.5 792.5L549.5 703L533 730.933L729 817Z",
  Canteen: "M982 552L1028 578.5L998 631L951.5 603.5L982 552Z",
  TUPVDormitory: "M1313 349L1463 435.603L1548.5 287.512L1400 201.776L1313 349Z",
  CampusBusinessCenter: "M779 547.5L801 561L767.5 619.5L745 607L779 547.5Z",
  StockRoom1: "M907.5 653L928.5 665.5L907.5 700.5L887 688.5L907.5 653Z",
  SupplyOffice: "M907.5 653L922 627.5L939.5 639L924.5 663L907.5 653Z",
  FacultyLounge: "M963.5 556.5L975.5 563L951.5 603L939.5 596.5L963.5 556.5Z",
  Offices: "M700.5 466.5L760 501L751 516.5L691 481.5L700.5 466.5Z",
  AdminisitrationBldg: "M997 273L1123 345.746L1049.53 473L1027.5 460.281L1080.49 368.5L1074.39 345.746L984.5 293.846L997 273Z",
  TrainingCenter: "M971 773L933.5 837L954.5 850L992 785L971 773Z",
  PPGSOffice: "M822 475L853.5 493.5L835.5 524L804.5 506L822 475Z",
  PowerHouse: "M939.5 851L957.5 861.5L946.5 879L928.5 868.5L939.5 851Z"
};

const buildingData: Record<string, BuildingInfo> = {
  // Academic Zone
  ModernTechnologyBldg: {
  id: 'ModernTechnologyBldg',
  name: 'Modern Technology Building',
  description: 'The Modern Technology Building is a new addition to the facilities and buildings of the University. It is located near the exit and has three floors.',
  type: 'Academic',
  pathData: buildingPaths.ModernTechnologyBldg,
  center: calculatePathCenter(buildingPaths.ModernTechnologyBldg),
  floors: 3,
  images: [],
  imageUrl: ''
  },
  MechanicalTechnologyBldg: {
  id: 'MechanicalTechnologyBldg',
  name: 'Mechanical Technology Building',
  description: 'The Mechanical Technology Building offers machineries and offices for faculty members and students taking Manufacturing Engineering Technology. Manufacturing Rooms can be found here.',
  type: 'Academic',
  pathData: buildingPaths.MechanicalTechnologyBldg,
  center: calculatePathCenter(buildingPaths.MechanicalTechnologyBldg),
  floors: 2,
  images: [],
  imageUrl: ''
  },
  AutoRefrigirationAirconTechnologyBldf: {
  id: 'AutoRefrigirationAirconTechnologyBldf',
  name: 'Automotive & Refrigeration and Air-Condition Technology Building',
  description: 'The Automotive & Refrigeration and Air-Condition Technology Building provides HVAR-R rooms for students under their course. Faculty Rooms can also be found here.',
  type: 'Academic',
  pathData: buildingPaths.AutoRefrigirationAirconTechnologyBldf,
  center: calculatePathCenter(buildingPaths.AutoRefrigirationAirconTechnologyBldf),
  floors: 2,
  images: [],
  imageUrl: ''
  },
  TwoStoreyTrainingInnovationChineseChamberBldg: {
  id: 'TwoStoreyTrainingInnovationChineseChamberBldg',
  name: 'Two-Storey Training Innovation & Chinese Chamber Building',
  description: 'The Two-Storey Training Innovation & Chinese Chamber Building is a training facility and innovation center. It is located near the main entrance.',
  type: 'Academic',
  pathData: buildingPaths.TwoStoreyTrainingInnovationChineseChamberBldg,
  center: calculatePathCenter(buildingPaths.TwoStoreyTrainingInnovationChineseChamberBldg),
  floors: 2,
  images: [],
  imageUrl: ''
  },
  EngineeringExtensionBldg: {
  id: 'EngineeringExtensionBldg',
  name: 'Engineering Building Extension',
  description: 'MECHANICAL ENGINEERING ROOMS WILL BE FOUND IN THIS AREA LABELED AS EEB ROOMS',
  type: 'Academic',
  pathData: buildingPaths.EngineeringExtensionBldg,
  center: calculatePathCenter(buildingPaths.EngineeringExtensionBldg),
  floors: 2,
  images: [],
  imageUrl: ''
  },
  ElectricalTechnologyBldg: {
  id: 'ElectricalTechnologyBldg',
  name: 'Electrical Technology Building',
  description: 'ELECTRICAL ENGINEERING TECHNOLOGY BUILDING CONSISTS OF ROOMS AND OFFICES FOR ELECTRICAL TECHNOLOGY STUDENTS AND FACULTY',
  type: 'Academic',
  pathData: buildingPaths.ElectricalTechnologyBldg,
  center: calculatePathCenter(buildingPaths.ElectricalTechnologyBldg),
  floors: 2,
  images: [],
  imageUrl: ''
  },
  EngineeringBldg: {
  id: 'EngineeringBldg',
  name: 'Engineering Building',
  description: 'ENGINEERING BUILDING CONSISTS OF ROOMS AND OFFICES FOR ENGINEERING STUDENTS AND FACULTY',
  type: 'Academic',
  pathData: buildingPaths.EngineeringBldg,
  center: calculatePathCenter(buildingPaths.EngineeringBldg),
  floors: 3,
  images: [],
  imageUrl: ''
  },
  // Conservation Zone
  Garden: {
  id: 'Garden',
  name: 'Garden',
  description: 'Landscaped garden area',
  type: 'Conservation',
  pathData: buildingPaths.Garden,
  center: calculatePathCenter(buildingPaths.Garden),
  floors: 0,
  images: [],
  imageUrl: ''
  },
  // Multipurpose Activity Zone
  MultiPurposeHall: {
  id: 'MultiPurposeHall',
  name: 'TUPV Gymnasium',
  description: 'TUPV Gymnasium for physical education and sports activities',
  type: 'Multipurpose',
  pathData: buildingPaths.MultiPurposeHall,
  center: calculatePathCenter(buildingPaths.MultiPurposeHall),
  floors: 1,
  images: [],
  imageUrl: ''
  },
  // IGP Facilities
  EnterpriseCenter: {
  id: 'EnterpriseCenter',
  name: 'Enterprise Center',
  description: 'Enterprise development and business center',
  type: 'IGP',
  pathData: buildingPaths.EnterpriseCenter,
  center: calculatePathCenter(buildingPaths.EnterpriseCenter),
  floors: 2,
  images: [],
  imageUrl: ''
  },
  Canteen: {
  id: 'Canteen',
  name: 'Canteen',
  description: 'STUDENTS, FACULTY, VISITORS AND STAFFS OF TUPV CAN PURCHASE THEIR LUNCHES AND SNACKS HERE. ALSO, THE LOCATION HAS TABLES AND CHAIRS WHERE THEY CAN DINE IN. THIS AREA IS NEAR THE ENTRANCE OR MAIN GATE OF TUPV',
  type: 'IGP',
  pathData: buildingPaths.Canteen,
  center: calculatePathCenter(buildingPaths.Canteen),
  floors: 1,
  images: [],
  imageUrl: ''
  },
  TUPVDormitory: {
  id: 'TUPVDormitory',
  name: 'TUPV Dormitory',
  description: 'Student dormitory and housing',
  type: 'IGP',
  pathData: buildingPaths.TUPVDormitory,
  center: calculatePathCenter(buildingPaths.TUPVDormitory),
  floors: 3,
  images: [],
  imageUrl: ''
  },
  // Utilities Zone
  PPGSOffice: {
  id: 'PPGSOffice',
  name: 'PPGS Office',
  description: 'OFFICES',
  type: 'Utilities',
  pathData: buildingPaths.PPGSOffice,
  center: calculatePathCenter(buildingPaths.PPGSOffice),
  floors: 1,
  images: [],
  imageUrl: ''
  },
  PowerHouse: {
  id: 'PowerHouse',
  name: 'Power House',
  description: 'Power generation and electrical facilities',
  type: 'Utilities',
  pathData: buildingPaths.PowerHouse,
  center: calculatePathCenter(buildingPaths.PowerHouse),
  floors: 1,
  images: [],
  imageUrl: ''
  },
  // Security
  GuardHouseMain: {
  id: 'GuardHouseMain',
  name: 'Guard House',
  description: 'THE GUARD HOUSE OF TUPV WHERE CAMPUS\' GUARDS ARE STATIONED',
  type: 'Security',
  pathData: buildingPaths.GuardHouseMain,
  center: calculatePathCenter(buildingPaths.GuardHouseMain),
  floors: 1,
  images: [],
  imageUrl: ''
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
  } catch (error) {
    console.error('Error migrating building data:', error);
  }
}

migrateBuildings();
