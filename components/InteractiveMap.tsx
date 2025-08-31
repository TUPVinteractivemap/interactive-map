'use client';

import { useState, useEffect } from 'react';
import { findRoute } from '@/lib/routing';
import { BuildingInfo, getAllBuildings } from '@/lib/buildings';



interface InteractiveMapProps {
  zoom: number;
  origin?: string;
  destination?: string;
  onSelectBuilding?: (building: BuildingInfo) => void;
  showInlineInfo?: boolean;
  activeFloor?: number;
  highlightedBuilding?: string;
  floorFilter?: 'all' | number;
  buildingTypeFilter?: 'all' | string;
  position?: { x: number; y: number };
}

export default function InteractiveMap({ 
  zoom, 
  origin, 
  destination, 
  onSelectBuilding, 
  showInlineInfo = true,
  activeFloor,
  highlightedBuilding,
  floorFilter = 'all',
  buildingTypeFilter = 'all',
  position = { x: 0, y: 0 }
}: InteractiveMapProps) {
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingInfo | null>(null);
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);
  const [currentRoute, setCurrentRoute] = useState<Array<{ x: number; y: number }>>([]);
  const [buildings, setBuildings] = useState<Record<string, BuildingInfo>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBuildings = async () => {
      try {
        const buildingsData = await getAllBuildings();
        const buildingsMap = buildingsData.reduce((acc, building) => {
          acc[building.id] = building;
          return acc;
        }, {} as Record<string, BuildingInfo>);
        setBuildings(buildingsMap);
      } catch (error) {
        console.error('Error loading buildings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBuildings();
  }, []);

  const handleBuildingClick = (buildingId: string) => {
    const building = buildings[buildingId];
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
    const loadRoute = async () => {
      if (origin && destination && origin !== destination) {
        const route = await findRoute(origin, destination);
        setCurrentRoute(route);
      } else {
        setCurrentRoute([]);
      }
    };

    loadRoute();
  }, [origin, destination]);



  const getBuildingStyle = (buildingId: string, type: string) => {
    let opacity = 1;
    let color;
    const building = buildings[buildingId];
    const buildingFloors = building?.floors || 1;

    // Floor filter logic
    if (floorFilter !== 'all') {
      if (buildingFloors !== floorFilter) {
        opacity = 0.3; // Dim buildings that don't match the filter
      }
    }

    // Building type filter logic
    if (buildingTypeFilter !== 'all') {
      if (type !== buildingTypeFilter) {
        opacity = 0.3; // Dim buildings that don't match the filter
      }
    }

    if (hoveredBuilding === buildingId) {
      color = '#FFD700'; // Gold for hover
    } else {
      // Color based on floor count when floor filter is active, otherwise by building type
      if (floorFilter !== 'all') {
        // Floor-based coloring
        switch (buildingFloors) {
          case 1:
            color = '#E3F2FD'; // Light blue
            break;
          case 2:
            color = '#2196F3'; // Blue
            break;
          case 3:
            color = '#1976D2'; // Dark blue
            break;
          case 4:
            color = '#0D47A1'; // Very dark blue
            break;
          default:
            color = '#000051'; // Navy blue for 5+ floors
            break;
        }
      } else {
        // Original type-based coloring
        color = (() => {
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
        })();
      }
    }

    // If there's an active floor and this is the highlighted building
    if (activeFloor !== undefined && highlightedBuilding === buildingId) {
      color = '#FFD700'; // Highlight color for the active building
      opacity = 1;
    } else if (activeFloor !== undefined && buildings[buildingId]?.floors > 1) {
      // Reduce opacity for multi-floor buildings when a specific floor is selected
      opacity = Math.min(opacity, 0.4);
    }

    return {
      fill: color,
      opacity,
    };
  };

  return (
    <div className="relative">
      {/* SVG Map */}
      <svg 
        width="1920" 
        height="1080" 
        viewBox="0 0 1920 1080" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain"
        style={{
          transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
          transformOrigin: 'center',
          transition: 'transform 0.3s ease-in-out',
          touchAction: 'none'
        }}
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

          {/* Loading State */}
          {loading && (
            <text x="50%" y="50%" textAnchor="middle" className="text-xl font-semibold">
              Loading map...
            </text>
          )}

          {/* Clickable Buildings */}
          {!loading && Object.entries(buildings).map(([buildingId, building]) => (
            <path
              key={buildingId}
              id={buildingId}
              d={building.pathData}
              {...getBuildingStyle(buildingId, building.type)}
              stroke="#1E1E1E"
              strokeWidth={hoveredBuilding === buildingId ? "3" : "1"}
              className="cursor-pointer transition-all duration-200"
              onClick={() => handleBuildingClick(buildingId)}
              onMouseEnter={() => handleBuildingHover(buildingId)}
              onMouseLeave={handleBuildingLeave}
            />
          ))}

          {/* Hidden routing path used for navigation - invisible */}
          <path 
            id="ROUTING" 
            d="M767.5 522.5L762.881 530.5L685.377 485.753M767.5 522.5L759 517.593L771 496.808L771.755 495.5L732 405M767.5 522.5L774.032 526.318M511.81 722L589.183 587.987M732 405L685.377 485.753M732 405L794.354 297M685.377 485.753L657.5 469.658L589.183 587.987M794.354 297L762.5 278.609L828.5 164.294L876.5 81.1554L994.876 149.5M794.354 297L831 318.158M809 393.632L847.181 327.5L831 318.158M831 318.158L853.833 278.609L818.5 258.209M818.5 258.209L801.3 288M818.5 258.209L842 217.506M994.876 190.428L991.573 188.521M842 217.506L891.944 131L991.573 188.521M842 217.506L964.318 288.127M1017.88 467L1075.91 366.5L1071.49 350L964.318 288.127M1017.88 467L982 446.283L978.699 452M1017.88 467L1037.5 478.326L1015.49 515L1032.59 524.871M947.5 506.039L978.699 452M978.699 452L880.5 395.305M880.5 395.305L928.307 312.5L944.762 322L964.318 288.127M880.5 395.305L842.5 461.123M842.5 461.123L795 490L774.032 526.318M842.5 461.123L870 477M924.65 614.344L967.573 540M924.65 614.344L911 606.367M924.65 614.344L1054 689.941M774.032 526.318L824.498 555.812M870 477L970.459 535L967.573 540M870 477L824.498 555.812M824.498 555.812L911 606.367M967.573 540L1027.33 574.5L1050.13 535M1050.13 535L1095 560.904M1050.13 535L1032.59 524.871M1095 560.904L1135.87 584.5L1141.93 588M1095 560.904L1161.18 446.283L1250.5 291.57L1216.6 272L1182.25 331.5M1182.25 331.5L1023.5 239.844L1008.11 266.5C991.929 258.987 960.04 243.138 961.942 239.844C963.843 236.551 982.488 204.257 991.573 188.521M1182.25 331.5L1100 473.965L1087.94 467L1071.49 457.502L1032.59 524.871M1141.93 588L1327.55 266.5L1348.52 278.609M1141.93 588L1075.83 702.5L1069.5 699L1054 689.941M911 606.367L868.776 679.5L858.5 673.567L844.5 697.816L840.352 705M840.352 705L785.908 673.567L738.161 646M840.352 705L785.908 804L678.5 753M840.352 705L960.73 774.5L922.913 840L935 846.978L920.842 871.5L947.5 886.891L956.386 871.5M738.161 646L726.037 667M738.161 646L751 623.762L726.037 667M726.037 667L589.183 587.987M726.037 667L676.385 753M1054 689.941L1035.2 722.5L1040.5 725.559L956.386 871.249" 
            stroke="transparent" 
            fill="none"
            style={{ pointerEvents: 'none' }}
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
    </div>
  );
}

