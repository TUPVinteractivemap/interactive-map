import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, writeBatch } from 'firebase/firestore';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper function to calculate center point
function calculatePathCenter(pathData) {
  const numbers = pathData.match(/-?\d+\.?\d*/g);
  if (!numbers) return { x: 0, y: 0 };

  const coordinates = numbers.map(Number);
  const xCoords = [];
  const yCoords = [];
  
  for (let i = 0; i < coordinates.length; i += 2) {
    if (i + 1 < coordinates.length) {
      xCoords.push(coordinates[i]);
      yCoords.push(coordinates[i + 1]);
    }
  }

  const x = xCoords.reduce((a, b) => a + b, 0) / xCoords.length;
  const y = yCoords.reduce((a, b) => a + b, 0) / yCoords.length;

  return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
}

// Building data
const buildingData = {
  ModernTechnologyBldg: {
    id: 'ModernTechnologyBldg',
    name: 'Modern Technology Building',
    description: 'The Modern Technology Building is a new addition to the facilities and buildings of the University. It is located near the exit and has three floors.',
    type: 'Academic',
    pathData: "M607 632.5L730.5 704L742 683L619.5 612L607 632.5Z",
    center: { x: 674.5, y: 658 }
  },
  GuardHouseMain: {
    id: 'GuardHouseMain',
    name: 'Guard House',
    description: 'THE GUARD HOUSE OF TUPV WHERE CAMPUS\' GUARDS ARE STATIONED',
    type: 'Security',
    pathData: "M1050 703L1063 709L1054 724.5L1041.5 716.5L1050 703Z",
    center: { x: 1052.25, y: 713.75 }
  },
  StudentLounge: {
    id: 'StudentLounge',
    name: 'Student Lounge',
    description: 'STUDENT LOUNGE IS USED FOR CAMPUS\' EVENTS AND STUDENTS CAN ALSO HANG AROUND HERE WHEN THEY HAVE VACANT TIME',
    type: 'Recreational',
    pathData: "M790.5 339L819 354.5L785 414.5L756 398L790.5 339Z",
    center: { x: 787.5, y: 376.75 }
  },
  BasketBallCourt: {
    id: 'BasketBallCourt',
    name: 'TUPV Gymnasium',
    description: 'THE GYMNASIUM OF TUPV IS USED FOR EVENTS AND P.E. SUBJECTS OF TUPV STUDENTS. BASKETBALL COURT AND COMFORT ROOMS FOR BOTH MEN AND FEMALES ARE FOUND INSIDE THE GYMNASIUM',
    type: 'Recreational',
    pathData: "M905 542.5C905 546.366 901.866 549.5 898 549.5C897.016 549.5 896.08 549.296 895.23 548.93L902.253 536.941C903.923 538.221 905 540.234 905 542.5ZM865 527.5C865 529.425 865.68 531.19 866.812 532.57L847.129 527.676L860.904 504.344C860.92 504.362 860.936 504.38 860.953 504.398C861.279 504.764 861.752 505.296 862.343 505.96C863.524 507.288 865.174 509.145 867.053 511.257C869.346 513.835 871.979 516.796 874.512 519.644C874.022 519.55 873.517 519.5 873 519.5C868.582 519.5 865 523.082 865 527.5ZM918 557.5C918 553.634 921.134 550.5 925 550.5L924.915 550.993L928.88 551.674C930.761 552.929 932 555.069 932 557.5C932 561.366 928.866 564.5 925 564.5C923.934 564.5 922.925 564.26 922.021 563.834L919.384 560.68L919 561L918.958 561.034C918.35 559.997 918 558.789 918 557.5ZM933 557.5C933 555.371 932.167 553.438 930.812 552.005L950.705 555.42L936.059 580.632L923.25 565.306C923.813 565.431 924.399 565.5 925 565.5C929.418 565.5 933 561.918 933 557.5ZM891 542.5C891 538.634 894.134 535.5 898 535.5C899.241 535.5 900.406 535.824 901.416 536.39L894.342 548.468C892.337 547.236 891 545.025 891 542.5ZM906 542.5C906 539.866 904.726 537.529 902.762 536.071L913.679 517.433L957.816 543.18L951.241 554.497L929.246 550.721C928.015 549.948 926.56 549.5 925 549.5C920.582 549.5 917 553.082 917 557.5C917 560.618 918.785 563.318 921.389 564.638L935.525 581.551L927.818 594.816L883.435 569.069L894.723 549.797C895.723 550.247 896.832 550.5 898 550.5C902.418 550.5 906 546.918 906 542.5ZM866 527.5C866 523.634 869.134 520.5 873 520.5C873.991 520.5 874.933 520.707 875.787 521.078C876.954 522.39 878.082 523.658 879.126 524.832L879.375 524.61C879.775 525.492 880 526.469 880 527.5C880 531.366 876.866 534.5 873 534.5C872.833 534.5 872.668 534.492 872.504 534.48L872.621 534.015L868.733 533.048C867.072 531.768 866 529.76 866 527.5ZM881 527.5C881 524.295 879.115 521.532 876.394 520.255C873.526 517.031 870.439 513.559 867.801 510.593C865.922 508.48 864.271 506.624 863.09 505.296C862.499 504.632 862.027 504.099 861.701 503.733C861.599 503.619 861.512 503.52 861.439 503.439L868.677 491.182L912.814 516.929L901.921 535.527C900.762 534.874 899.425 534.5 898 534.5C893.582 534.5 890 538.082 890 542.5C890 545.393 891.536 547.927 893.836 549.332L882.569 568.567L838.187 542.819L846.598 528.575L868.297 533.97C869.617 534.931 871.242 535.5 873 535.5C877.418 535.5 881 531.918 881 527.5Z",
    center: { x: 898, y: 542.5 }
  },
  GardenWithGazebo: {
    id: 'GardenWithGazebo',
    name: 'Garden with Gazebo',
    description: 'USG CANOPY LOUNGES HAS THREE CANOPY WHERE STUDENTS CAN HANG AROUND WHEN HAS A VACANT TIME',
    type: 'Conservation',
    pathData: "M1110.5 627L1035 584L1006.5 635L1081 678L1110.5 627Z",
    center: { x: 1058.25, y: 630.5 }
  },
  Garden: {
    id: 'Garden',
    name: 'Garden',
    description: 'Landscaped garden area',
    type: 'Conservation',
    pathData: "M982 453.5L987.5 456.5L984 462.5L996.5 470L998.5 466.5L1011.5 474.5L983.5 523L967 513L964 517.5L949.5 509.5L982 453.5Z",
    center: { x: 980.5, y: 488.25 }
  },
  MultiPurposeHall: {
    id: 'MultiPurposeHall',
    name: 'Multi-Purpose Hall',
    description: 'Multi-purpose event and activity hall',
    type: 'Multipurpose',
    pathData: "M1108 131.5L1243.5 209.5L1185 312L1048.5 233L1108 131.5Z",
    center: { x: 1175.75, y: 221.5 }
  },
  MechanicalTechnologyBldg: {
    id: 'MechanicalTechnologyBldg',
    name: 'Mechanical Technology Building',
    description: 'The Mechanical Technology Building offers machineries and offices for faculty members and students taking Manufacturing Engineering Technology. Manufacturing Rooms can be found here.',
    type: 'Academic',
    pathData: "M733.5 627.5L610.5 556L600.5 575L722.5 647.5L733.5 627.5ZM779.5 547.5L656.5 476.5L610.5 556L733.5 627.5L779.5 547.5Z",
    center: { x: 695, y: 601.75 }
  },
  AutoRefrigirationAirconTechnologyBldf: {
    id: 'AutoRefrigirationAirconTechnologyBldf',
    name: 'Automotive & Refrigeration and Air-Condition Technology Building',
    description: 'The Automotive & Refrigeration and Air-Condition Technology Building provides HVAR-R rooms for students under their course. Faculty Rooms can also be found here.',
    type: 'Academic',
    pathData: "M889.5 612.5L801 561L767.5 619.5L856 670.5L889.5 612.5ZM856 670.5L767.5 619.5L753.5 643.5L841.5 694L856 670.5Z",
    center: { x: 828.25, y: 627.5 }
  },
  TwoStoreyTrainingInnovationChineseChamberBldg: {
    id: 'TwoStoreyTrainingInnovationChineseChamberBldg',
    name: 'Two-Storey Training Innovation & Chinese Chamber Building',
    description: 'The Two-Storey Training Innovation & Chinese Chamber Building is a training facility and innovation center. It is located near the main entrance.',
    type: 'Academic',
    pathData: "M936 684.5L1024 735L999.5 779L910.5 727L936 684.5Z",
    center: { x: 967.25, y: 731.75 }
  },
  EngineeringExtensionBldg: {
    id: 'EngineeringExtensionBldg',
    name: 'Engineering Building Extension',
    description: 'MECHANICAL ENGINEERING ROOMS WILL BE FOUND IN THIS AREA LABELED AS EEB ROOMS',
    type: 'Academic',
    pathData: "M754 289.5L785.5 308L698.5 453.5L669 435.5L754 289.5Z",
    center: { x: 711.5, y: 371.5 }
  },
  ElectricalTechnologyBldg: {
    id: 'ElectricalTechnologyBldg',
    name: 'Electrical Technology Building',
    description: 'ELECTRICAL ENGINEERING TECHNOLOGY BUILDING CONSISTS OF ROOMS AND OFFICES FOR ELECTRICAL TECHNOLOGY STUDENTS AND FACULTY',
    type: 'Academic',
    pathData: "M880.5 399.5L974.5 453.5L942.5 508.5L849 453.5L880.5 399.5Z",
    center: { x: 911.75, y: 454 }
  },
  EngineeringBldg: {
    id: 'EngineeringBldg',
    name: 'Engineering Building',
    description: 'ENGINEERING BUILDING CONSISTS OF ROOMS AND OFFICES FOR ENGINEERING STUDENTS AND FACULTY',
    type: 'Academic',
    pathData: "M769.5 278L831 170L853.5 183L791.5 291L769.5 278Z",
    center: { x: 800.25, y: 234.5 }
  },
  TechnologyBldg: {
    id: 'TechnologyBldg',
    name: 'Technology Building',
    description: 'IT IS A LECTURE BUILDING FOR 1ST YEAR STUDENTS',
    type: 'Academic',
    pathData: "M831 170L880 86L1001.5 156L1007 146.5L1021.5 156L1003.5 186.5L889.5 120.5L853.5 183L831 170Z",
    center: { x: 916.25, y: 128.25 }
  },
  Laboratories: {
    id: 'Laboratories',
    name: 'Laboratories',
    description: 'THIS IS WHERE THE EXPERIMENTS AND LABORATORY ACTIVITIES TAKE PLACE',
    type: 'Academic',
    pathData: "M842.5 224.5L922 270.577L908 293L829 247.5L842.5 224.5Z",
    center: { x: 875.75, y: 258.75 }
  },
  TechnologicalInventionInnovationCenter: {
    id: 'TechnologicalInventionInnovationCenter',
    name: 'Technological Invention & Innovation Center',
    description: 'ON THE GROUND FLOOR OF THIS BUILDING IS FOR COLLEGE OF AUTOMATION AND CONTROL STUDENTS AND THE FIRST FLOOR IS FOR COMPUTER TECHNOLOGY STUDENTS',
    type: 'Academic',
    pathData: "M1032 137.5L971.5 241L996 255L1056 151.5L1032 137.5Z",
    center: { x: 1014, y: 196 }
  },
  TechnologyExtension: {
    id: 'TechnologyExtension',
    name: 'Technology Extension',
    description: 'IN THIS AREA, LECTURE ROOMS FOR CHEMICAL ENGINEERING TECHNOLOGY CAN BE FOUND HERE',
    type: 'Academic',
    pathData: "M934.5 81.5L1032 137.5L1021.5 155.5L1007 146.5L1004 151.5L921 103.5L934.5 81.5Z",
    center: { x: 978, y: 118.5 }
  },
  BldgA5: {
    id: 'BldgA5',
    name: 'Building A5',
    description: 'Academic building A5',
    type: 'Academic',
    pathData: "M905 219.5L997 273L984.5 294L892.5 240.5L905 219.5Z",
    center: { x: 944.75, y: 256.75 }
  },
  EnterpriseCenter: {
    id: 'EnterpriseCenter',
    name: 'Enterprise Center',
    description: 'Enterprise development and business center',
    type: 'IGP',
    pathData: "M729 817L740.5 792.5L549.5 703L533 730.933L729 817Z",
    center: { x: 639.25, y: 760 }
  },
  Canteen: {
    id: 'Canteen',
    name: 'Canteen',
    description: 'STUDENTS, FACULTY, VISITORS AND STAFFS OF TUPV CAN PURCHASE THEIR LUNCHES AND SNACKS HERE. ALSO, THE LOCATION HAS TABLES AND CHAIRS WHERE THEY CAN DINE IN. THIS AREA IS NEAR THE ENTRANCE OR MAIN GATE OF TUPV',
    type: 'IGP',
    pathData: "M982 552L1028 578.5L998 631L951.5 603.5L982 552Z",
    center: { x: 989.75, y: 591.5 }
  },
  TUPVDormitory: {
    id: 'TUPVDormitory',
    name: 'TUPV Dormitory',
    description: 'Student dormitory and housing',
    type: 'IGP',
    pathData: "M1313 349L1463 435.603L1548.5 287.512L1400 201.776L1313 349Z",
    center: { x: 1430.75, y: 318.75 }
  },
  CampusBusinessCenter: {
    id: 'CampusBusinessCenter',
    name: 'Business Center',
    description: 'The Business Center provides professional spaces for entrepreneurship, finance, and management. It also provides students needs inside the school zone.',
    type: 'Administrative',
    pathData: "M779 547.5L801 561L767.5 619.5L745 607L779 547.5Z",
    center: { x: 773, y: 583.5 }
  },
  StockRoom1: {
    id: 'StockRoom1',
    name: 'Stock Room',
    description: 'THIS IS WHERE STUDENTS CAN PURCHASE THE MERCHANDISES OF TUPV',
    type: 'Administrative',
    pathData: "M907.5 653L928.5 665.5L907.5 700.5L887 688.5L907.5 653Z",
    center: { x: 907.75, y: 676.75 }
  },
  SupplyOffice: {
    id: 'SupplyOffice',
    name: 'Supply Office',
    description: 'IN THIS AREA, YOU CAN FIND THE SCHOOL AND OFFICE SUPPLIES OF DIFFERENT DEPARTMENTS',
    type: 'Administrative',
    pathData: "M907.5 653L922 627.5L939.5 639L924.5 663L907.5 653Z",
    center: { x: 923.25, y: 646 }
  },
  FacultyLounge: {
    id: 'FacultyLounge',
    name: 'Employees Lounge',
    description: 'IN THIS AREA,WHERE THE FACULTY AND STAFFS OF TUPV CAN HANG AROUND HERE. THIS AREA IS NEAR THE CANTEEN',
    type: 'Administrative',
    pathData: "M963.5 556.5L975.5 563L951.5 603L939.5 596.5L963.5 556.5Z",
    center: { x: 957.5, y: 579.75 }
  },
  Offices: {
    id: 'Offices',
    name: 'Offices',
    description: 'Administrative offices',
    type: 'Administrative',
    pathData: "M700.5 466.5L760 501L751 516.5L691 481.5L700.5 466.5Z",
    center: { x: 725.75, y: 483.75 }
  },
  AdminisitrationBldg: {
    id: 'AdminisitrationBldg',
    name: 'Administration Building',
    description: 'It serves as the central hub for academic planning, student services, and administrative operations. On the first floor of the building, there you can find classrooms which are used by different year levels.',
    type: 'Administrative',
    pathData: "M997 273L1123 345.746L1049.53 473L1027.5 460.281L1080.49 368.5L1074.39 345.746L984.5 293.846L997 273Z",
    center: { x: 1060, y: 373 }
  },
  TrainingCenter: {
    id: 'TrainingCenter',
    name: 'Training Center',
    description: 'USED FOR EVENTS AND MEETINGS',
    type: 'Administrative',
    pathData: "M971 773L933.5 837L954.5 850L992 785L971 773Z",
    center: { x: 962.75, y: 811.5 }
  },
  PPGSOffice: {
    id: 'PPGSOffice',
    name: 'PPGS Office',
    description: 'OFFICES',
    type: 'Utilities',
    pathData: "M822 475L853.5 493.5L835.5 524L804.5 506L822 475Z",
    center: { x: 829, y: 499.5 }
  },
  PowerHouse: {
    id: 'PowerHouse',
    name: 'Power House',
    description: 'Power generation and electrical facilities',
    type: 'Utilities',
    pathData: "M939.5 851L957.5 861.5L946.5 879L928.5 868.5L939.5 851Z",
    center: { x: 943, y: 865.25 }
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

// Run migration
migrateBuildings();
