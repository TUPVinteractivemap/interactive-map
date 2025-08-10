'use client';

import { useState, useEffect } from 'react';
import { findRoute } from '@/lib/routing';

export interface BuildingInfo {
  id: string;
  name: string;
  description: string;
  type: string;
}

const buildingData: Record<string, BuildingInfo> = {
  // Academic Zone
  ModernTechnologyBldg: {
    id: 'ModernTechnologyBldg',
    name: 'Modern Technology Building',
    description: 'The Modern Technology Building is a new addition to the facilities and buildings of the University. It is located near the exit and has three floors.',
    type: 'Academic'
  },
  MechanicalTechnologyBldg: {
    id: 'MechanicalTechnologyBldg',
    name: 'Mechanical Technology Building',
    description: 'The Mechanical Technology Building offers machineries and offices for faculty members and students taking Manufacturing Engineering Technology. Manufacturing Rooms can be found here.',
    type: 'Academic'
  },
  AutoRefrigirationAirconTechnologyBldf: {
    id: 'AutoRefrigirationAirconTechnologyBldf',
    name: 'Automotive & Refrigeration and Air-Condition Technology Building',
    description: 'The Automotive & Refrigeration and Air-Condition Technology Building provides HVAR-R rooms for students under their course. Faculty Rooms can also be found here.',
    type: 'Academic'
  },
  TwoStoreyTrainingInnovationChineseChamberBldg: {
    id: 'TwoStoreyTrainingInnovationChineseChamberBldg',
    name: 'Two-Storey Training Innovation & Chinese Chamber Building',
    description: 'The Two-Storey Training Innovation & Chinese Chamber Building is a training facility and innovation center. It is located near the main entrance.',
    type: 'Academic'
  },
  EngineeringExtensionBldg: {
    id: 'EngineeringExtensionBldg',
    name: 'Engineering Building Extension',
    description: 'MECHANICAL ENGINEERING ROOMS WILL BE FOUND IN THIS AREA LABELED AS EEB ROOMS', 
    type: 'Academic'
  },
  ElectricalTechnologyBldg: {
    id: 'ElectricalTechnologyBldg',
    name: 'Electrical Technology Building',
    description: 'ELECTRICAL ENGINEERING TECHNOLOGY BUILDING CONSISTS OF ROOMS AND OFFICES FOR ELECTRICAL TECHNOLOGY STUDENTS AND FACULTY',
    type: 'Academic'
  },
  EngineeringBldg: {
    id: 'EngineeringBldg',
    name: 'Engineering Building',
    description: 'ENGINEERING BUILDING CONSISTS OF SURFACE MOUNTAIN TECHNOLOGY ROOM, OFFICE OF COLLEGE OF ENGINEERING AND REGISTRAR OFFICE',
    type: 'Academic'
  },
  TechnologyBldg: {
    id: 'TechnologyBldg',
    name: 'Technology Building',
    description: 'IT IS A LECTURE BUILDING FOR 1ST YEAR STUDENTS',
    type: 'Academic'
  },
  Laboratories: {
    id: 'Laboratories',
    name: 'Laboratories',
    description: 'THIS IS WHERE THE EXPERIMENTS AND LABORATORY ACTIVITIES TAKE PLACE',
    type: 'Academic'
  },
  TechnologicalInventionInnovationCenter: {
    id: 'TechnologicalInventionInnovationCenter',
    name: 'Technological Invention & Innovation Center',
    description: 'ON THE GROUND FLOOR OF THIS BUILDING IS FOR COLLEGE OF AUTOMATION AND CONTROL STUDENTS AND THE FIRST FLOOR IS FOR COMPUTER TECHNOLOGY STUDENTS',
    type: 'Academic'
  },
  TechnologyExtension: {
    id: 'TechnologyExtension',
    name: 'Technology Extension',
    description: 'IN THIS AREA, LECTURE ROOMS FOR CHEMICAL ENGINEERING TECHNOLOGY CAN BE FOUND HERE',
    type: 'Academic'
  },
  BldgA5: {
    id: 'BldgA5',
    name: 'Building A5',
    description: 'Academic building A5',
    type: 'Academic'
  },

  // Administrative Zone
  CampusBusinessCenter: {
    id: 'CampusBusinessCenter',
    name: 'Business Center',
    description: 'The Business Center provides professional spaces for entrepreneurship, finance, and management. It also provides students needs inside the school zone.',
    type: 'Administrative'
  },
  StockRoom1: {
    id: 'StockRoom1',
    name: 'Stock Room',
    description: 'THIS IS WHERE STUDENTS CAN PURCHASE THE MERCHANDISES OF TUPV',
    type: 'Administrative'
  },
  SupplyOffice: {
    id: 'SupplyOffice',
    name: 'Supply Office',
    description: 'IN THIS AREA, YOU CAN FIND THE SCHOOL AND OFFICE SUPPLIES OF DIFFERENT DEPARTMENTS',
    type: 'Administrative'
  },
  FacultyLounge: {
    id: 'FacultyLounge',
    name: 'Employees Lounge',
    description: 'IN THIS AREA,WHERE THE FACULTY AND STAFFS OF TUPV CAN HANG AROUND HERE. THIS AREA IS NEAR THE CANTEEN',
    type: 'Administrative'
  },
  Offices: {
    id: 'Offices',
    name: 'Offices',
    description: 'Administrative offices',
    type: 'Administrative'
  },
  AdminisitrationBldg: {
    id: 'AdminisitrationBldg',
    name: 'Administration Building',
    description: 'It serves as the central hub for academic planning, student services, and administrative operations. On the first floor of the building, there you can find classrooms which are used by different year levels.',
    type: 'Administrative'
  },
  TrainingCenter: {
    id: 'TrainingCenter',
    name: 'Training Center',
    description: 'USED FOR EVENTS AND MEETINGS',
    type: 'Administrative'
  },

  // Recreational Zone
  StudentLounge: {
    id: 'StudentLounge',
    name: 'Student Lounge',
    description: 'STUDENT LOUNGE IS USED FOR CAMPUS\' EVENTS AND STUDENTS CAN ALSO HANG AROUND HERE WHEN THEY HAVE VACANT TIME',
    type: 'Recreational'
  },
  BasketBallCourt: {
    id: 'BasketBallCourt',
    name: 'TUPV Gymnasium',
    description: 'THE GYMNASIUM OF TUPV IS USED FOR EVENTS AND P.E. SUBJECTS OF TUPV STUDENTS. BASKETBALL COURT AND COMFORT ROOMS FOR BOTH MEN AND FEMALES ARE FOUND INSIDE THE GYMNASIUM',
    type: 'Recreational'
  },

  // Conservation Area Zones
  GardenWithGazebo: {
    id: 'GardenWithGazebo',
    name: 'Garden with Gazebo',
    description: 'USG CANOPY LOUNGES HAS THREE CANOPY WHERE STUDENTS CAN HANG AROUND WHEN HAS A VACANT TIME',
    type: 'Conservation'
  },
  Garden: {
    id: 'Garden',
    name: 'Garden',
    description: 'Landscaped garden area',
    type: 'Conservation'
  },

  // Multipurpose Activity Zone
  MultiPurposeHall: {
    id: 'MultiPurposeHall',
    name: 'Multi-Purpose Hall',
    description: 'Multi-purpose event and activity hall',
    type: 'Multipurpose'
  },

  // IGP Facilities
  EnterpriseCenter: {
    id: 'EnterpriseCenter',
    name: 'Enterprise Center',
    description: 'Enterprise development and business center',
    type: 'IGP'
  },
  Canteen: {
    id: 'Canteen',
    name: 'Canteen',
    description: 'STUDENTS, FACULTY, VISITORS AND STAFFS OF TUPV CAN PURCHASE THEIR LUNCHES AND SNACKS HERE. ALSO, THE LOCATION HAS TABLES AND CHAIRS WHERE THEY CAN DINE IN. THIS AREA IS NEAR THE ENTRANCE OR MAIN GATE OF TUPV',
    type: 'IGP'
  },
  TUPVDormitory: {
    id: 'TUPVDormitory',
    name: 'TUPV Dormitory',
    description: 'Student dormitory and housing',
    type: 'IGP'
  },

  // Utilities Zone
  PPGSOffice: {
    id: 'PPGSOffice',
    name: 'PPGS Office',
    description: 'OFFICES',
    type: 'Utilities'
  },
  PowerHouse: {
    id: 'PowerHouse',
    name: 'Power House',
    description: 'Power generation and electrical facilities',
    type: 'Utilities'
  },

  // Security
  GuardHouseMain: {
    id: 'GuardHouseMain',
    name: 'Guard House',
    description: 'THE GUARD HOUSE OF TUPV WHERE CAMPUS\' GUARDS ARE STATIONED',
    type: 'Security'
  }
};

interface InteractiveMapProps {
  zoom: number;
  origin?: string;
  destination?: string;
  onSelectBuilding?: (building: BuildingInfo) => void;
  showInlineInfo?: boolean;
}

export default function InteractiveMap({ zoom, origin, destination, onSelectBuilding, showInlineInfo = true }: InteractiveMapProps) {
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingInfo | null>(null);
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);
  const [currentRoute, setCurrentRoute] = useState<Array<{ x: number; y: number }>>([]);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [localZoom, setLocalZoom] = useState(zoom);

  // Sync localZoom with prop zoom
  useEffect(() => {
    setLocalZoom(zoom);
  }, [zoom]);

  // Handle mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.01;
    setLocalZoom(prev => Math.max(0.5, Math.min(5, prev + delta)));
  };

  const handleBuildingClick = (buildingId: string) => {
    const building = buildingData[buildingId];
    if (building) {
      setSelectedBuilding(building);
      if (onSelectBuilding) {
        onSelectBuilding(building);
      }
    }
  };

  const handleBuildingHover = (buildingId: string) => {
    setHoveredBuilding(buildingId);
  };

  const handleBuildingLeave = () => {
    setHoveredBuilding(null);
  };

  // Calculate route when origin and destination change
  useEffect(() => {
    if (origin && destination && origin !== destination) {
      const route = findRoute(origin, destination);
      setCurrentRoute(route);
    } else {
      setCurrentRoute([]);
    }
  }, [origin, destination]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch-to-zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const initialDistance = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      );
      (e.currentTarget as unknown as { initialDistance?: number }).initialDistance = initialDistance;
    } else if (e.touches.length === 1) {
      // Single touch for panning
      const touch = e.touches[0];
      setTouchStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch-to-zoom
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      );
      const initialDistance = (e.currentTarget as unknown as { initialDistance?: number }).initialDistance;
      
      if (initialDistance) {
        const scale = currentDistance / initialDistance;
        const zoomDelta = (scale - 1) * 0.3; // Reduced zoom sensitivity
        setLocalZoom(prev => Math.max(0.5, Math.min(5, prev + zoomDelta)));
        (e.currentTarget as unknown as { initialDistance?: number }).initialDistance = currentDistance;
      }
    } else if (e.touches.length === 1 && touchStart) {
      // Single touch panning with reduced sensitivity
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStart.x - position.x;
      const deltaY = touch.clientY - touchStart.y - position.y;
      
      // Add dead zone to prevent accidental movements
      const deadZone = 3; // pixels
      if (Math.abs(deltaX) > deadZone || Math.abs(deltaY) > deadZone) {
        // Reduce sensitivity by applying a factor
        const sensitivityFactor = 0.6; // Reduced from 1.0 to 0.6
        const newX = position.x + (deltaX * sensitivityFactor);
        const newY = position.y + (deltaY * sensitivityFactor);
        setPosition({ x: newX, y: newY });
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTouchStart(null);
  };

  const getBuildingColor = (buildingId: string, type: string) => {
    if (hoveredBuilding === buildingId) {
      return '#FFD700'; // Gold for hover
    }
    
    switch (type) {
      case 'Academic':
        return '#678DFF';
      case 'Administrative':
        return '#FF6D6D';
      case 'Recreational':
        return '#FFC76D';
      case 'Conservation':
        return '#63FFFF';
      case 'Multipurpose':
        return '#1B9C00';
      case 'IGP':
        return '#FF946D';
      case 'Utilities':
        return '#B163FF';
      case 'Security':
        return '#FFFFFF';
      default:
        return '#678DFF';
    }
  };

  return (
    <div className="relative" onWheel={handleWheel}>
      {/* SVG Map */}
      <svg 
        width="1920" 
        height="1080" 
        viewBox="0 0 1920 1080" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain"
        style={{
          transform: `scale(${localZoom}) translate(${position.x}px, ${position.y}px)`,
          transformOrigin: 'center',
          transition: isDragging ? 'none' : 'transform 0.3s ease-in-out',
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none' // Prevent browser handling of touch events
        }}
        onMouseDown={(e) => {
          setIsDragging(true);
          setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }}
        onMouseMove={(e) => {
          if (isDragging) {
            const newX = e.clientX - dragStart.x;
            const newY = e.clientY - dragStart.y;
            setPosition({ x: newX, y: newY });
          }
        }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <g id="Slide 16:9 - 1">
          {/* Main Road */}
          <path 
            id="MainRoad" 
            d="M1416.5 104L945.959 919L386 668.5L371 694.481L479 741L407.409 865L431.5 875.5L501.648 754L884.5 929.5L835.714 1014L861.5 1025L909.709 941.5L1073 1014L1088.88 986.5L970.5 931.5L1448.26 104L1416.5 104Z" 
            fill="#A7A7A7" 
            stroke="black"
          />
          
          {/* Campus Outline */}
          <path 
            id="Campus" 
            d="M500.5 717.5L945 916L1379 164.29L856 66L500.5 717.5Z" 
            fill="#D9D9D9" 
            stroke="#1E1E1E"
          />
          
          {/* Open Space Zones */}
          <path id="OpenSpace1" d="M598.5 578L513 722L944 914.5L970 868.5L940 851L981.569 779L751.5 646L719.5 650L598.5 578Z" fill="#77E360" stroke="#1E1E1E"/>
          <path id="OpenSpace3" d="M934.5 81.5L935.5 79.5L1378 163L1160.5 540L1065.5 485L1067 482.402L1049.5 472.5L1122.82 345.5L988.59 268L996.095 255L1056 151.242L934.5 81.5Z" fill="#77E360" stroke="#1E1E1E"/>
          <path id="OpenSpace2" d="M972 301L1071.5 357.5L1042.5 409L1025.5 398.5L1017 414.5L1033.5 424L1013 459.5L979.5 440.5L976.5 445.5L885 393L922 328L948.5 342.5L972 301Z" fill="#77E360" stroke="#1E1E1E"/>

          {/* Route Visualization moved later to render above buildings */}

          {/* Clickable Buildings */}
          {Object.entries(buildingData).map(([buildingId, building]) => (
            <path
              key={buildingId}
              id={buildingId}
              d={getBuildingPath(buildingId)}
              fill={getBuildingColor(buildingId, building.type)}
              stroke="#1E1E1E"
              strokeWidth={hoveredBuilding === buildingId ? "3" : "1"}
              className="cursor-pointer transition-all duration-200"
              onClick={() => handleBuildingClick(buildingId)}
              onMouseEnter={() => handleBuildingHover(buildingId)}
              onMouseLeave={handleBuildingLeave}
            />
          ))}

          {/* Map Outline / Paths */}
          {/* Hidden routing path used for navigation */}
          <path 
            id="ROUTING" 
            d="M767.5 522.5L762.881 530.5L685.377 485.753M767.5 522.5L759 517.593L771 496.808L771.755 495.5L732 405M767.5 522.5L774.032 526.318M511.81 722L589.183 587.987M732 405L685.377 485.753M732 405L794.354 297M685.377 485.753L657.5 469.658L589.183 587.987M794.354 297L762.5 278.609L828.5 164.294L876.5 81.1554L994.876 149.5M794.354 297L831 318.158M809 393.632L847.181 327.5L831 318.158M831 318.158L853.833 278.609L818.5 258.209M818.5 258.209L801.3 288M818.5 258.209L842 217.506M994.876 190.428L991.573 188.521M842 217.506L891.944 131L991.573 188.521M842 217.506L964.318 288.127M1017.88 467L1075.91 366.5L1071.49 350L964.318 288.127M1017.88 467L982 446.283L978.699 452M1017.88 467L1037.5 478.326L1015.49 515L1032.59 524.871M947.5 506.039L978.699 452M978.699 452L880.5 395.305M880.5 395.305L928.307 312.5L944.762 322L964.318 288.127M880.5 395.305L842.5 461.123M842.5 461.123L795 490L774.032 526.318M842.5 461.123L870 477M924.65 614.344L967.573 540M924.65 614.344L911 606.367M924.65 614.344L1054 689.941M774.032 526.318L824.498 555.812M870 477L970.459 535L967.573 540M870 477L824.498 555.812M824.498 555.812L911 606.367M967.573 540L1027.33 574.5L1050.13 535M1050.13 535L1095 560.904M1050.13 535L1032.59 524.871M1095 560.904L1135.87 584.5L1141.93 588M1095 560.904L1161.18 446.283L1250.5 291.57L1216.6 272L1182.25 331.5M1182.25 331.5L1023.5 239.844L1008.11 266.5C991.929 258.987 960.04 243.138 961.942 239.844C963.843 236.551 982.488 204.257 991.573 188.521M1182.25 331.5L1100 473.965L1087.94 467L1071.49 457.502L1032.59 524.871M1141.93 588L1327.55 266.5L1348.52 278.609M1141.93 588L1075.83 702.5L1069.5 699L1054 689.941M911 606.367L868.776 679.5L858.5 673.567L844.5 697.816L840.352 705M840.352 705L785.908 673.567L738.161 646M840.352 705L785.908 804L678.5 753M840.352 705L960.73 774.5L922.913 840L935 846.978L920.842 871.5L947.5 886.891L956.386 871.5M738.161 646L726.037 667M738.161 646L751 623.762L726.037 667M726.037 667L589.183 587.987M726.037 667L676.385 753M1054 689.941L1035.2 722.5L1040.5 725.559L956.386 871.249" 
            stroke="transparent" 
            fill="none"
          />

          {/* Map Outline / Paths */}
          <path id="Vector 21" d="M895.5 729.5L932.5 665.414L1038.5 726.613L961.778 859.5L942 848.081L940.315 851L962.832 864L1043 725.144L1037.55 722L1049.39 701.5L1046 699.543L1034.19 720L946.5 669.373L957.685 650L939.498 639.5" stroke="#1E1E1E"/>
          <path id="Vector 20" d="M885 691L906.651 703.5L894.238 725L872.5 712.45L884.884 691M862.5 678L850.087 699.5L870.872 711.5L883.285 690L862.5 678Z" stroke="#1E1E1E"/>
          <path id="Vector 19" d="M856 670.5L864 675.119L868.687 667M887 688.5L879 683.881L884.059 675.119" stroke="#1E1E1E"/>
          <path id="Vector 18" d="M698.5 453L684.355 477.5L658.5 462.573L509.297 721" stroke="#1E1E1E"/>
          <path id="Vector 17" d="M700.5 467L731.966 412.5L766 490.5L759.938 501" stroke="#1E1E1E"/>
          <path id="Vector 15" d="M791.5 291L801.432 296.734M801.432 296.734L827.007 311.5L840.575 288L815 273.234L801.432 296.734Z" stroke="#1E1E1E"/>
          <path id="Vector 11" d="M979.5 530L963.5 556.5" stroke="#1E1E1E"/>
          <path id="Vector 9" d="M942.5 508.5L979.5 529.862L983.75 522.5" stroke="#1E1E1E"/>
          <path id="Vector 10" d="M950.5 508L948.191 512" stroke="#1E1E1E"/>
          <path id="Vector 8" d="M1055.5 530L1068.78 507" stroke="#1E1E1E"/>
          <path id="Vector 5" d="M987.5 456.5L1013.48 471.5L1011.5 474.931" stroke="#1E1E1E"/>
          <path id="Vector 4" d="M922.5 328L917 324.825M917 324.825L842.42 454L837.5 451.159L923.853 301.592M917 324.825L928.773 304.433M923.853 301.592L908.105 292.5L922 270.5L950.5 286.954L937.5 309.471L928.773 304.433M923.853 301.592L928.773 304.433" stroke="#1E1E1E"/>
          <path id="Vector 3" d="M968 298.691L972 301L948.5 342.5L922 328.14L925 322.944L946.748 335.5L968 298.691Z" stroke="#1E1E1E"/>
          <path id="Vector 1" d="M921 103.5L902.5 92.819L899.797 97.5L918.5 108.298L1001.5 156.218L1004.22 151.5L921 103.451" stroke="#1E1E1E"/>
          <path id="Vector 2" d="M997 197.5L893 137.456L863.3 188.898M863.3 188.898L848 215.398L892.344 241L907.644 214.5L863.3 188.898Z" stroke="#1E1E1E"/>
          <path id="Vector 6" d="M1042.5 409L1033.55 424.5" stroke="#1E1E1E"/>
          <path id="Vector 7" d="M1155.5 548.5L1060.24 493.5L1066.59 482.5L1058.22 497L1044 488.792L1038.5 498.318L1053 506.69L1058.59 497L1043.58 523L1076 541.716C1082.05 537.977 1096.91 532.1 1108 538.5C1119.09 544.9 1123.59 560.167 1124.45 567L1140.04 576L1130.81 592L1116.5 583.741L1114.5 582.586C1108.5 586.724 1093.8 593.1 1083 585.5C1069.5 576 1068 562 1068 554.5L1048.5 543.242L1027.85 579" stroke="#1E1E1E"/>
          <path id="Vector 12" d="M998 631L994 637.928L960.349 618.5L963 613.909M957 606.981L964.5 611.311L963 613.909M957 606.981L955.5 609.579M957 606.981L939.5 596.5L935.5 604L953 613.909L955.5 609.579M955.5 609.579L963 613.909" stroke="#1E1E1E"/>
          <path id="Vector 13" d="M1007 635L1002.96 642L1077 684.748" stroke="#1E1E1E"/>
          <path id="Vector 14" d="M1022.5 475.5L993.034 526.536M993.034 526.536L993 526.595L991.5 525.729L989.034 530L993.5 532.578L994.75 530.413M993.034 526.536L996 528.248L994.75 530.413M994.75 530.413L1005.29 536.5L1011.51 525.729L1041.42 543L1026.5 568.85L1021.56 566L1034.84 543L1013.04 530.413L1001 551.27L997.935 549.5L1005.29 536.756" stroke="#1E1E1E"/>
          <path id="Vector 16" d="M818.5 354.5L821.964 356.5L836.5 331.323L803.5 312.271L805.966 308L796 302.246L736.386 405.5L776.5 498L836.5 460.5L840.5 453.572" stroke="#1E1E1E"/>
          <path id="Vector 22" d="M853 493.5L856.308 495.41M826.811 526.5L824.5 530.502L838.353 538.5L861.5 498.407L856.308 495.41M826.811 526.5L835.471 531.5L856.308 495.41M826.811 526.5L801 511.598L804.809 505" stroke="#1E1E1E"/>
        </g>
        {/* Route Visualization - above buildings and outlines */}
        {currentRoute.length > 1 && (
          <g style={{ pointerEvents: 'none' }}>
            <path
              d={`M ${currentRoute.map(point => `${point.x} ${point.y}`).join(' L ')}`}
              stroke="#FF6B35"
              strokeWidth="4"
              fill="none"
              strokeDasharray="10,5"
            />
            {/* Start and End markers */}
            <circle cx={currentRoute[0].x} cy={currentRoute[0].y} r="9" fill="#4CAF50" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx={currentRoute[currentRoute.length - 1].x} cy={currentRoute[currentRoute.length - 1].y} r="9" fill="#F44336" stroke="#FFFFFF" strokeWidth="2" />
          </g>
        )}
      </svg>

      {/* Building Info Modal (can be disabled by parent) */}
      {showInlineInfo && selectedBuilding && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-20">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-800">{selectedBuilding.name}</h3>
            <button
              onClick={() => setSelectedBuilding(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-2">{selectedBuilding.description}</p>
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            {selectedBuilding.type}
          </span>
        </div>
      )}

      {/* Debug hover tooltip removed */}
    </div>
  );
}

// Helper function to get building path data
function getBuildingPath(buildingId: string): string {
  const paths: Record<string, string> = {
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

  return paths[buildingId] || "";
}