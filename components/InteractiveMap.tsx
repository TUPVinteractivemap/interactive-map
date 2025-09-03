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
  selectedFloorLevel?: number | 'all';
}

export default function InteractiveMap({
  zoom,
  origin,
  destination,
  onSelectBuilding,
  showInlineInfo = true,
  activeFloor,
  highlightedBuilding,
  selectedFloorLevel = 'all'
}: InteractiveMapProps) {
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingInfo | null>(null);
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);
  const [currentRoute, setCurrentRoute] = useState<Array<{ x: number; y: number }>>([]);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [localZoom, setLocalZoom] = useState(zoom);
  const [buildings, setBuildings] = useState<Record<string, BuildingInfo>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBuildings = async () => {
      try {
        setLoading(true);
        console.log('Loading buildings...');
        
        // Use a timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          console.warn('Building loading timeout');
          setLoading(false);
        }, 10000); // 10 second timeout

        const buildingsData = await getAllBuildings();
        clearTimeout(timeoutId);
        
        console.log(`Loaded ${buildingsData.length} buildings`);
        const buildingsMap = buildingsData.reduce((acc, building) => {
          acc[building.id] = building;
          return acc;
        }, {} as Record<string, BuildingInfo>);
        setBuildings(buildingsMap);
        setLoading(false);
      } catch (error) {
        console.error('Error loading buildings:', error);
        setLoading(false);
        // Set empty buildings object to prevent infinite loading
        setBuildings({});
      }
    };

    loadBuildings();
  }, []);

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



  const getBuildingStyle = (buildingId: string, type: string) => {
    let opacity = 1;
    let color;
    const building = buildings[buildingId];

    // Floor level filtering logic
    if (selectedFloorLevel !== 'all' && building) {
      // If a specific floor level is selected, check if building has that level
      if (building.floors < selectedFloorLevel) {
        // Building doesn't have the selected floor level, show in gray
        color = '#D3D3D3'; // Light gray for non-matching buildings
      } else {
        // Building has the selected floor level, show normal color
        if (hoveredBuilding === buildingId) {
          color = '#FFD700'; // Gold for hover
        } else {
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
              case 'Parking':
                return '#4A4A4A';
              case 'Open Space':
                return '#77E360'; // Always green for Open Space buildings
              default:
                return '#678DFF';
            }
          })();
        }
      }
    } else {
      // No floor filter selected, show normal colors
      if (hoveredBuilding === buildingId) {
        color = '#FFD700'; // Gold for hover
      } else {
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
            case 'Parking':
              return '#4A4A4A';
            case 'Open Space':
              return '#77E360';
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
    } else if (activeFloor !== undefined && building?.floors > 1) {
      // Reduce opacity for multi-floor buildings when a specific floor is selected
      opacity = 0.4;
    }

    return {
      fill: color,
      opacity,
    };
  };

  // Get style for open spaces (areas that are not buildings)
  const getOpenSpaceStyle = () => {
    // When a floor level is selected, show open spaces in gray
    if (selectedFloorLevel !== 'all') {
      return {
        fill: '#D3D3D3', // Light gray for open spaces when floor filter is active
        opacity: 1,
      };
    }
    // Default green color for open spaces
    return {
      fill: '#77E360',
      opacity: 1,
    };
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
          <path id="OpenSpace1" d="M598.5 578L513 722L944 914.5L970 868.5L940 851L981.569 779L751.5 646L719.5 650L598.5 578Z" {...getOpenSpaceStyle()} stroke="#1E1E1E"/>
          <path id="OpenSpace3" d="M935.5 79.5L934.5 81.5L1056 151.242L996.095 255L992.342 261.5L1127 339.245L1148 302.872L1043.5 242.538L1049 233.5L1185 312.02L1244 209.829L1108.5 131.598L1112.6 124.5L1196.5 172.941L1206.28 156L1248.5 180.375L1239.48 196L1257 206.116L1253.89 211.5L1268 219.646L1265 224.842L1259.21 221.5L1197 329.254L1159.5 307.604L1060.65 478.811L1067 482.402L1065.5 485L1160.5 540L1378 163L935.5 79.5Z" {...getOpenSpaceStyle()} stroke="#1E1E1E"/>
          <path id="OpenSpace2" d="M972 301L1071.5 357.5L1042.5 409L1025.5 398.5L1017 414.5L1033.5 424L1013 459.5L979.5 440.5L976.5 445.5L885 393L922 328L948.5 342.5L972 301Z" {...getOpenSpaceStyle()} stroke="#1E1E1E"/>
          <path id="OpenSpace4" d="M837.086 451.5L782 419.696L783.268 417.5L785.015 414.5L756.436 398L790.5 339L822.156 356.5L836.5 331.656L803.5 312.604L806 308.274L796 302.5L736.5 406L776.5 498L836.5 460.515L839 456.185L840.839 453L838.241 451.5L837.952 452L837.086 451.5Z" {...getOpenSpaceStyle()} stroke="#1E1E1E"/>
          <path id="OpenSpace5" d="M815 273.5L815.054 273.406M815.054 273.406L829.722 248L855 262.594L840.332 288L815.054 273.406ZM732 413L732.034 413.077M732.034 413.077L766 490.5L760 500.892L701 466.829L732.034 413.077ZM893 137.5L991.5 194.369L961.691 246L863 189.021L892.746 137.5L893 137.5Z" {...getOpenSpaceStyle()} stroke="#1E1E1E"/>
          <path id="OpenSpace6" d="M971 773L971.083 772.91M971.083 772.91L977 766.5L1004.42 719L1027 730L1034.5 733L1038.5 726.5L932.845 665.5L895.895 729.5L971.083 772.91Z" {...getOpenSpaceStyle()} stroke="#1E1E1E"/>

          {/* Conservation Area Zones */}
          <path id="GardenWithGazebo" d="M1110.5 627L1035 584L1006.5 635L1081 678L1110.5 627Z" fill="#63FFFF" stroke="#1E1E1E"/>
          <path id="Garden" d="M982 453.5L987.5 456.5L984 462.5L996.5 470L998.5 466.5L1011.5 474.5L983.5 523L967 513L964 517.5L949.5 509.5L982 453.5Z" fill="#63FFFF" stroke="#1E1E1E"/>

          {/* Parking Spaces */}
          <path id="ParkingSpace1" d="M798 303.5L802 297L826.672 311.5L855 262.435L895.5 285.818L907.94 293L908.44 292.5L924.028 301.5L837.426 451.5L782 419.5L819 354.707L822.106 356.5L836.5 331.57L803.471 312.5L806 308.119L798 303.5Z" fill="#BAB9B9" stroke="black"/>
          <path id="ParkingSpace2" d="M1162 526.346L1253.5 367.863L1168 318.5L1166 317.345L1074.5 475.828L1162 526.346Z" fill="#BAB9B9" stroke="black"/>
          <path id="CoveredParkingSpace" d="M1046 699.5L957.5 650L947 669.5L1034.5 719.5L1046 699.5Z" fill="#BAB9B9" stroke="black"/>

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

          {/* Buildings Layer */}
          <g id="buildings">
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
          </g>

          {/* Hidden routing path used for navigation - rendered above buildings */}
          <g id="routing-layer" style={{ pointerEvents: 'none' }}>
            <path 
              id="ROUTING" 
              d="M256.5 442.5L251.881 450.5L174.377 405.753M256.5 442.5L248 437.593L260.755 415.5L221 325M256.5 442.5L263.032 446.318M221 325L174.377 405.753M221 325L283.354 217M174.377 405.753L146.5 389.658L78.1827 507.987M283.354 217L251.5 198.609L280 149.246L294.25 124.564M283.354 217L320 238.158M298 313.632L336.181 247.5L320 238.158M320 238.158L342.833 198.609L307.5 178.209M307.5 178.209L290.301 208M307.5 178.209L331 137.506M331 137.506L380.944 51L480.574 108.521M331 137.506L377.364 164.274M506.883 387L564.907 286.5L560.486 270L453.319 208.127M506.883 387L471 366.283L467.699 372M506.883 387L526.5 398.326L504.493 435L521.59 444.871M467.699 372L436.5 426.039M467.699 372L369.5 315.305M369.5 315.305L417.307 232.5L433.762 242L453.319 208.127M369.5 315.305L331.5 381.123M453.319 208.127L377.364 164.274M331.5 381.123L284 410L263.032 446.318M331.5 381.123L359 397M263.032 446.318L313.498 475.812M359 397L459.459 455L456.573 460M359 397L313.498 475.812M313.498 475.812L400 526.367M456.573 460L413.65 534.344M456.573 460L516.328 494.5M413.65 534.344L400 526.367M413.65 534.344L513 592.408M516.328 494.5L539.134 455M516.328 494.5L523.5 496.588M539.134 455L584 480.904M539.134 455L521.59 444.871M480.574 108.521L483.876 110.428L480.574 122.5L453.319 169.707M480.574 108.521L498.483 77.5L483.876 69.5L365.5 1.1554L351.25 25.8371L344.125 38.178M589 393.965L557.5 374.5M557.5 374.5L521.59 444.871M557.5 374.5L618.5 265.075M837.524 198.609L816.551 186.5L630.932 508L564.826 622.5L558.5 619L543 609.941M400 526.367L387.5 548.017M329.352 625L274.908 724L198.274 687.581M329.352 625L449.73 694.5L411.913 760L424 766.978L409.842 791.5L436.5 806.891L445.386 791.5M329.352 625L347.5 593.567L357.777 599.5L369.612 579M329.352 625L227.161 566M227.161 566L215.037 587M227.161 566L240 543.762M215.037 587L78.1827 507.987M215.037 587L248 607L206.692 673L198.274 687.581M78.1827 507.987L0.810364 642M198.274 687.581L71.5001 628M543 609.941L524.202 642.5M543 609.941L513 592.408M524.202 642.5L529.5 645.559L445.386 791.249M524.202 642.5L501.977 611.5L513 592.408M584.5 481L562.5 519.105L523.5 496.588M523.5 496.588L479.384 573M387.5 659L423 597.512L521 650L505.363 677M469.5 738.923L505.363 677M369.612 579L383 586.729M369.612 579L387.5 548.017M387.5 548.017L400 555.234M453.319 169.707L618.5 265.075M453.319 169.707L394 135.459L377.364 164.274M618.5 265.075L643.08 222.5M643.08 222.5L542 164.141M643.08 222.5L682 241L710.723 191.25M607.23 51.5L706.5 108.813M706.5 108.813L738 127L738.723 134.25M706.5 108.813L714 95.8231M738.723 134.25L739.446 141.5L710.723 191.25M738.723 134.25L770.5 149.5L776.5 137M710.723 191.25L756.19 217.5M505.363 677L503 675.5" 
              stroke="transparent" 
              fill="none"
              style={{ pointerEvents: 'none' }}
            />
            {currentRoute.length > 1 && (
              <>
                <path
                  d={`M ${currentRoute.map(point => `${point.x} ${point.y}`).join(' L ')}`}
                  stroke="#FF6B35"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray="10,5"
                  style={{ filter: 'drop-shadow(0px 0px 4px rgba(255,255,255,0.8))' }}
                />
                <circle cx={currentRoute[0].x} cy={currentRoute[0].y} r="9" fill="#4CAF50" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx={currentRoute[currentRoute.length - 1].x} cy={currentRoute[currentRoute.length - 1].y} r="9" fill="#F44336" stroke="#FFFFFF" strokeWidth="2" />
              </>
            )}
          </g>

          {/* Map Outline / Paths */}
          <path id="Vector 21" d="M895.5 729.5L932.5 665.414L1038.5 726.613L961.778 859.5L942 848.081L940.315 851L962.832 864L1043 725.144L1037.55 722L1049.39 701.5L1046 699.543L1034.19 720L946.5 669.373L957.685 650L939.498 639.5" stroke="#1E1E1E"/>
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

