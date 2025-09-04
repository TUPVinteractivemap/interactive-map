'use client';

import { useState, useEffect, useRef } from 'react';
import { findRoute } from '@/lib/routing';
import { BuildingInfo, getAllBuildings } from '@/lib/buildings';
import { logRouteNavigation } from '@/lib/userHistory';
import { useAuthContext } from '@/contexts/AuthContext';


interface InteractiveMapProps {
  zoom: number;
  origin?: string;
  destination?: string;
  onSelectBuilding?: (building: BuildingInfo) => void;
  showInlineInfo?: boolean;
  activeFloor?: number;
  highlightedBuilding?: string;
  selectedFloorLevel?: number | 'all';
  showLabels?: boolean;
  onToggleLabels?: () => void;
}

export default function InteractiveMap({
  zoom,
  origin,
  destination,
  onSelectBuilding,
  showInlineInfo = true,
  activeFloor,
  highlightedBuilding,
  selectedFloorLevel = 'all',
  showLabels: externalShowLabels,
  onToggleLabels
}: InteractiveMapProps) {
  const { user } = useAuthContext();
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
  const [labelPositions, setLabelPositions] = useState<Record<string, { x: number; y: number }>>({});

  // Container ref for calculating pan boundaries
  const containerRef = useRef<HTMLDivElement>(null);

  // Use external showLabels if provided, otherwise default to true
  const showLabels = externalShowLabels ?? true;

  // Calculate pan boundaries based on zoom and container dimensions
  const getPanBoundaries = () => {
    if (!containerRef.current) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();

    // Map dimensions (from SVG viewBox)
    const mapWidth = 1920;
    const mapHeight = 1080;

    // Calculate scaled map dimensions
    const scaledWidth = mapWidth * localZoom;
    const scaledHeight = mapHeight * localZoom;

    // Container dimensions
    const containerWidth = containerRect.width;
    // On mobile, use actual screen height for full screen experience, on desktop use actual container height
    const isMobile = window.innerWidth < 768; // md breakpoint
    const containerHeight = isMobile ? window.innerHeight : containerRect.height;

    // Calculate pan boundaries to prevent panning outside map dimensions
    // The maximum pan distance is the difference between scaled map and container
    const maxPanX = Math.max(0, (scaledWidth - containerWidth) / 2);
    const maxPanY = Math.max(0, (scaledHeight - containerHeight) / 2);

    // Ensure boundaries are always at least 0 to prevent panning outside map
    return {
      minX: -maxPanX,
      maxX: maxPanX,
      minY: -maxPanY,
      maxY: maxPanY
    };
  };

  // Constrain position within boundaries
  const constrainPosition = (x: number, y: number) => {
    const boundaries = getPanBoundaries();
    return {
      x: Math.max(boundaries.minX, Math.min(boundaries.maxX, x)),
      y: Math.max(boundaries.minY, Math.min(boundaries.maxY, y))
    };
  };

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

  // Reset position when zoom changes to ensure map stays within bounds
  useEffect(() => {
    const constrainedPosition = constrainPosition(position.x, position.y);
    if (constrainedPosition.x !== position.x || constrainedPosition.y !== position.y) {
      setPosition(constrainedPosition);
    }
  }, [localZoom]);

  // Handle window resize to update boundaries
  useEffect(() => {
    const handleResize = () => {
      const constrainedPosition = constrainPosition(position.x, position.y);
      if (constrainedPosition.x !== position.x || constrainedPosition.y !== position.y) {
        setPosition(constrainedPosition);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position.x, position.y]);

  // Calculate label positions when buildings or zoom change
  useEffect(() => {
    if (!loading && Object.keys(buildings).length > 0) {
      const positions = calculateLabelPositions();
      setLabelPositions(positions);
    }
  }, [buildings, localZoom, loading]);

  // Handle mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.01;
    setLocalZoom(prev => Math.max(1, Math.min(5, prev + delta)));
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

        // Log route navigation to user history
        if (user?.uid && route.length > 0 && buildings[origin] && buildings[destination]) {
          try {
            await logRouteNavigation(
              user.uid,
              origin,
              destination,
              buildings[origin].name,
              buildings[destination].name,
              route
            );
          } catch (error) {
            console.error('❌ Failed to log route navigation:', error);
          }
        }
      } else {
        setCurrentRoute([]);
      }
    };

    loadRoute();
  }, [origin, destination, user?.uid, buildings]);

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
      setTouchStart({ x: touch.clientX, y: touch.clientY });
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
        setLocalZoom(prev => Math.max(1, Math.min(5, prev + zoomDelta)));
        (e.currentTarget as unknown as { initialDistance?: number }).initialDistance = currentDistance;
      }
    } else if (e.touches.length === 1 && touchStart) {
      // Single touch panning with reduced sensitivity
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      // Add dead zone to prevent accidental movements
      const deadZone = 3; // pixels
      if (Math.abs(deltaX) > deadZone || Math.abs(deltaY) > deadZone) {
        // Reduce sensitivity by applying a factor
        const sensitivityFactor = 0.6; // Reduced from 1.0 to 0.6
        const newX = position.x + (deltaX * sensitivityFactor);
        const newY = position.y + (deltaY * sensitivityFactor);
        // Constrain position within map boundaries
        const constrainedPosition = constrainPosition(newX, newY);
        setPosition(constrainedPosition);
        // Update touchStart for smooth continuous drag
        setTouchStart({ x: touch.clientX, y: touch.clientY });
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

  // Calculate label positions to avoid overlaps
  const calculateLabelPositions = () => {
    const positions: Record<string, { x: number; y: number }> = {};
    const labelHeight = 20;
    const labelSpacing = 5;

    Object.values(buildings).forEach((building, index) => {
      let baseX = building.center.x;
      let baseY = building.center.y - 15; // Position above the building center
      let yOffset = 0;

      // Check for overlaps with previously positioned labels
      let overlaps = true;
      let attempts = 0;
      const maxAttempts = 10;

      while (overlaps && attempts < maxAttempts) {
        overlaps = false;
        const currentLabelWidth = building.name.length * 7;

        // Check overlap with all previously positioned labels
        for (const [otherId, otherPos] of Object.entries(positions)) {
          if (otherId === building.id) continue;

          const otherBuilding = buildings[otherId];
          if (!otherBuilding) continue;

          const otherLabelWidth = otherBuilding.name.length * 7;

          // Check if labels overlap horizontally and vertically
          const thisLeft = baseX - currentLabelWidth / 2;
          const thisRight = baseX + currentLabelWidth / 2;
          const thisTop = baseY + yOffset - labelHeight / 2;
          const thisBottom = baseY + yOffset + labelHeight / 2;

          const otherLeft = otherPos.x - otherLabelWidth / 2;
          const otherRight = otherPos.x + otherLabelWidth / 2;
          const otherTop = otherPos.y - labelHeight / 2;
          const otherBottom = otherPos.y + labelHeight / 2;

          if (!(thisRight < otherLeft || thisLeft > otherRight ||
                thisBottom < otherTop || thisTop > otherBottom)) {
            overlaps = true;
            // Try moving up or down alternately
            yOffset += (attempts % 2 === 0 ? -1 : 1) * (labelHeight + labelSpacing);
            break;
          }
        }
        attempts++;
      }

      positions[building.id] = { x: baseX, y: baseY + yOffset };
    });

    return positions;
  };



  return (
    <div
      ref={containerRef}
      className="relative h-screen md:h-full w-full overflow-hidden"
      onWheel={handleWheel}
    >

      {/* SVG Map */}
      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-screen md:h-full object-contain"
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
            // Constrain position within map boundaries
            const constrainedPosition = constrainPosition(newX, newY);
            setPosition(constrainedPosition);
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
          {/* Group 1 */}
          <g id="Group 1">
          <path id="Vector 30" d="M1196.5 1034.5C1148.27 1026.49 1121.23 1022.01 1073 1014" stroke="black"/>
          <g id="MainRoad">
          <path d="M945.959 919L1378.92 164L1165 118.5L1146.5 106.5L1086 67L984 35.5L937 -5.5H961L1004 28L1093.5 52.5L1155.5 92.5L1389 136.5L1563 158L1557.5 187L1410.73 169L970.5 931.5L1029.69 959L1089 986.5L1196.5 1007L1308.5 1000.5L1824.41 886.356L1924.5 713V769.787L1862 878.04L1934.5 862V899.5L1308.5 1028.5L1196.5 1034.5L1073 1014L909.709 941.5L861.5 1025L816.755 1102.5L788.765 1095L835.714 1014L884.5 929.5L501.648 754L431.5 875.5L307.5 1090.27H279.5L407.409 865L479 741L371 694.481L205.5 628.253L-17.5385 1109.5L-47 1082L172 614.847L-17.5385 539L-9.50001 509L185.5 587.641L439.838 78L323.5 24.5L185.5 311L160.5 296.566L316.5 -20.5L335 -1L332 6L449.569 58.5L486 -14.5L523.5 -6L221.5 602.159L386 668.5L945.959 919Z" fill="#727272"/>
          <path d="M1088.88 986.5L1029.69 959M1029.69 959L970.5 931.5L1410.73 169L1557.5 187L1563 158L1389 136.5L1155.5 92.5L1093.5 52.5L1004 28L961 -5.5H937L984 35.5L1086 67L1146.5 106.5L1165 118.5L1378.92 164L945.959 919L386 668.5L221.5 602.159L523.5 -6L486 -14.5L449.569 58.5L332 6L335 -1L316.5 -20.5L160.5 296.566L185.5 311L323.5 24.5L439.838 78L185.5 587.641L-9.50001 509L-17.5385 539L172 614.847L-47 1082L-17.5385 1109.5L205.5 628.253L371 694.481L479 741L407.409 865L279.5 1090.27H307.5L431.5 875.5L501.648 754L884.5 929.5L835.714 1014L788.765 1095L816.755 1102.5L861.5 1025L909.709 941.5L1073 1014L1196.5 1034.5L1308.5 1028.5L1934.5 899.5V862L1862 878.04L1924.5 769.787V713L1824.41 886.356L1308.5 1000.5L1196.5 1007L1089 986.5L1029.69 959Z" stroke="black"/>
          </g>
          </g>
          
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

          {/* Building Labels - only show when zoomed in enough */}
          {!loading && localZoom > 1.2 && showLabels && Object.keys(labelPositions).length > 0 && (
            <g id="building-labels">
              {Object.entries(buildings).map(([buildingId, building]) => {
                const position = labelPositions[buildingId];
                if (!position) return null;


                return (
                  <g key={`label-${buildingId}`}>
                    {/* Building name text - no background */}
                    <text
                      x={position.x}
                      y={position.y + 3}
                      textAnchor="middle"
                      className="text-xs font-medium select-none"
                      style={{
                        fontSize: '8px',
                        fill: '#1a1a1a',
                        pointerEvents: 'none',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        textShadow: '0px 0px 2px rgba(255, 255, 255, 0.8)'
                      }}
                    >
                      {building.name}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Hidden routing path used for navigation - rendered above buildings */}
          <g id="routing-layer" style={{ pointerEvents: 'none' }}>
            <path
              id="ROUTING"
              d="M767.5 522.5L762.881 530.5L685.377 485.753M767.5 522.5L759 517.593L771.755 495.5L732 405M767.5 522.5L774.032 526.318M732 405L685.377 485.753M732 405L794.354 297M685.377 485.753L657.5 469.658L589.183 587.987L511.81 722M794.354 297L831 318.158L847.181 327.5L826.151 363.926M794.354 297L801.301 288L818.5 258.209L842 217.506M809 393.632L826.151 363.926M886.623 87L994.876 149.5L1009.48 157.5L991.574 188.521M842 217.506L888.364 244.274M842 217.506L855.125 194.773M1017.88 467L1075.91 366.5L1071.49 350L964.319 288.127M1017.88 467L982 446.283L978.699 452M1017.88 467L1037.5 478.326L1015.49 515L1032.59 524.871M978.699 452L947.5 506.039M978.699 452L880.5 395.305M880.5 395.305L928.307 312.5L944.762 322L964.319 288.127M880.5 395.305L842.5 461.123M880.5 395.305L826.151 363.926M964.319 288.127L888.364 244.274M842.5 461.123L795 490L774.032 526.318M842.5 461.123L870 477M774.032 526.318L824.498 555.812M870 477L970.459 535L967.573 540M870 477L824.498 555.812M824.498 555.812L858.5 575.684M967.573 540L924.65 614.344M967.573 540L1027.33 574.5M924.65 614.344L911 606.367M924.65 614.344L1024 672.408M1027.33 574.5L1050.13 535M1027.33 574.5L1034.5 576.588M1050.13 535L1095 560.904M1050.13 535L1032.59 524.871M991.574 188.521L891.944 131L855.125 194.773M991.574 188.521L994.876 190.428L991.574 202.5L964.319 249.707M1100 473.965L1068.5 454.5M1068.5 454.5L1032.59 524.871M1068.5 454.5L1129.5 345.075M1348.52 278.609L1327.55 266.5L1141.93 588L1075.83 702.5L1069.5 699L1054 689.941M911 606.367L898.5 628.017M911 606.367L858.5 575.684M840.352 705L785.908 804L709.274 767.581M840.352 705L858.5 673.567L868.777 679.5L880.612 659M840.352 705L738.161 646M738.161 646L726.037 667L759 687L717.692 753L709.274 767.581M738.161 646L751 623.762M709.274 767.581L582.5 708M1054 689.941L1035.2 722.5M1054 689.941L1024 672.408M1035.2 722.5L1040.5 725.559L962 861.525L948.5 853.73M1035.2 722.5L1012.98 691.5L1024 672.408M1095.5 561L1073.5 599.105L1034.5 576.588M1034.5 576.588L990.384 653M880.612 659L894 666.729M880.612 659L898.5 628.017M898.5 628.017L911 635.234M964.319 249.707L1129.5 345.075M964.319 249.707L905 215.459L888.364 244.274M1129.5 345.075L1154.08 302.5M1154.08 302.5L1053 244.141M1154.08 302.5L1193 321L1221.72 271.25M1118.23 131.5L1217.5 188.813M1217.5 188.813L1249 207L1249.72 214.25M1217.5 188.813L1225 175.823M1249.72 214.25L1250.45 221.5L1226.49 263M1249.72 214.25L1281.5 229.5L1287.5 217M1221.72 271.25L1267.19 297.5M1221.72 271.25L1226.49 263M855.125 194.773L818.5 173.628M1226.49 263L1209 252.904M858.5 575.684L844.978 599.105"
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
        <g id="City">
        <g id="City 2">
        <path d="M1866.5 924.862L1914.5 912L1920.1 952.5L1877 964.048L1866.5 924.862Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1869.12 964.048L1859 926.274L1808.6 939L1818.92 977.5L1869.12 964.048Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1633 979.5L1681 966.638L1686.6 1007.14L1643.5 1018.69L1633 979.5Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1808.6 979.5L1798.48 941.726L1748.08 954.452L1758.4 992.952L1808.6 979.5Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1866.5 924.862L1914.5 912L1920.1 952.5L1877 964.048L1866.5 924.862Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1869.12 964.048L1859 926.274L1808.6 939L1818.92 977.5L1869.12 964.048Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1866.5 924.862L1914.5 912L1920.1 952.5L1877 964.048L1866.5 924.862Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1869.12 964.048L1859 926.274L1808.6 939L1818.92 977.5L1869.12 964.048Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1633 1018.69L1622.88 980.912L1572.48 993.638L1582.8 1032.14L1633 1018.69Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1808.6 979.5L1798.48 941.726L1748.08 954.452L1758.4 992.952L1808.6 979.5Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1752.5 993.638L1742.38 955.864L1691.98 968.59L1702.3 1007.09L1752.5 993.638Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1567.7 1026.05L1557.58 988.274L1507.18 1001L1517.5 1039.5L1567.7 1026.05Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1507.18 1042.5L1497.06 1004.73L1446.66 1017.45L1456.98 1055.95L1507.18 1042.5Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1441.3 1057.19L1431.18 1019.41L1380.78 1032.14L1391.1 1070.64L1441.3 1057.19Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1371 1070.64L1360.88 1032.86L1310.48 1045.59L1320.8 1084.09L1371 1070.64Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1303.12 1080.27L1293 1042.5L1242.6 1055.23L1252.92 1093.73L1303.12 1080.27Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1231.02 1082.23L1220.9 1044.46L1170.5 1057.19L1180.82 1095.69L1231.02 1082.23Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1849.02 981.452L1897.02 968.59L1902.62 1009.09L1859.52 1020.64L1849.02 981.452Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1851.64 1020.64L1841.52 982.864L1791.12 995.59L1801.44 1034.09L1851.64 1020.64Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1615.52 1036.09L1663.52 1023.23L1669.12 1063.73L1626.02 1075.28L1615.52 1036.09Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1791.12 1036.09L1781 998.316L1730.6 1011.04L1740.92 1049.54L1791.12 1036.09Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1849.02 981.452L1897.02 968.59L1902.62 1009.09L1859.52 1020.64L1849.02 981.452Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1851.64 1020.64L1841.52 982.864L1791.12 995.59L1801.44 1034.09L1851.64 1020.64Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1849.02 981.452L1897.02 968.59L1902.62 1009.09L1859.52 1020.64L1849.02 981.452Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1851.64 1020.64L1841.52 982.864L1791.12 995.59L1801.44 1034.09L1851.64 1020.64Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1615.52 1075.28L1605.4 1037.5L1555 1050.23L1565.32 1088.73L1615.52 1075.28Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1791.12 1036.09L1781 998.316L1730.6 1011.04L1740.92 1049.54L1791.12 1036.09Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1735.02 1050.23L1724.9 1012.45L1674.5 1025.18L1684.82 1063.68L1735.02 1050.23Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1910.62 1055.77L1900.5 1018L1850.1 1030.73L1860.42 1069.23L1910.62 1055.77Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1910.62 1055.77L1900.5 1018L1850.1 1030.73L1860.42 1069.23L1910.62 1055.77Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1854.52 1069.91L1844.4 1032.14L1794 1044.86L1804.32 1083.36L1854.52 1069.91Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1570.5 831L1469 762.5L1407 853L1517.5 918.5L1570.5 831Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1720 472.411L1586.5 749.5C1634.5 905.9 1762.5 861.667 1825 819.5L1920 623.207L1922 678.5L1844 838.5L1825 853C1654.6 947.8 1574 828.167 1555 756.5L1698 455C1744.83 411.333 1854.8 352.5 1920 466.5V505C1850.4 386.2 1757.67 433.774 1720 472.411Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1272 874.186L1387 675L1414 689.434L1298.5 889.486L1272 874.186Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1292.87 802L1256.5 781L1220.5 845.549L1255.92 866L1292.87 802Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1250.5 776.82L1220.5 759.5L1214.98 757.522L1175.5 825.895L1210.5 846.103L1250.5 776.82Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1276.5 564.468L1306 581.5L1172 820.844L1139.36 802L1276.5 564.468Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1134.93 802L1094.5 778.657L1129.5 718.035L1140.5 698.983L1232 540.5L1274 561.126L1134.93 802Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1394.5 578.254L1339.5 546.5L1236.4 726L1291 757.522L1394.5 578.254Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1074.55 1070.64L1086.5 1026.05L1152.5 1036.09V1070.64H1074.55Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M980.272 1039.5L1002.5 1001L1074.37 1023.23L1064 1061.93L980.272 1039.5Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M990.5 995.165L926.5 958.214L904.672 1004.73L964.903 1039.5L990.5 995.165Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M867.628 1070.64L895 1023.23L956.712 1045.59L950 1070.64H867.628Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1043 895.279L1020 882L1016.89 879.5L990.5 925.263L1016.89 940.5L1043 895.279Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1024 942.337L1047 902.5L1051.5 895.929L1078.47 911.5L1051.5 958.214L1024 942.337Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1323 926.274L1132 816L1116 847.731L1305.26 957L1323 926.274ZM1082.5 914.5L1068.57 966.5L1093.68 981L1109.09 923.5L1082.5 914.5ZM1152.5 969.666L1123.89 962L1141.4 931.68L1161.25 937L1163.93 927L1188 933.449L1290 961V984.5H1174.32L1152.5 969.666Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1380.78 952.5L1371 916L1405.53 908L1415 943.331L1380.78 952.5Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1635 266L1665 274.038L1669.04 270L1711 289.5L1637.5 466.5L1597 450.5L1602 432.5L1570 423.926L1591.17 372.5L1558.5 359.5L1586.5 292.5L1619.57 303.5L1635 266Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1588.5 474.341L1555 455L1493 576.749L1520.28 592.5L1588.5 474.341Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1437.2 511.64L1472.5 450.5L1526.5 472.411L1487.19 540.5L1437.2 511.64Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1457 623.207L1422 603L1437.2 581.5L1470.11 600.5L1457 623.207Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1450 627.924L1402.5 600.5L1387 625.774L1406 636.743L1387 669.652L1416.18 686.5L1450 627.924Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1355.41 382.5L1322.5 439.5L1353 455L1377.5 421.5L1397 429L1392.5 446L1437.98 472.411L1457 439.5L1355.41 382.5Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1335.54 403.5L1303.5 385L1279.5 419.144L1314.76 439.5L1335.54 403.5Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1619.57 256.5V220L1427 187.5L1423 207.5L1469.5 231.5L1619.57 256.5Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1572 201.5L1589.5 97L1638 105.5L1619.57 209.5L1572 201.5Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1626.5 240.5L1630 211.5L1692.5 215.5V242.5L1626.5 240.5Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1626.5 193L1635 155L1825 196.5L1818 234L1626.5 193Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1760 280.5V258L1790 254V280.5H1760Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1790 280.5V254L1818 258L1815.5 280.5H1790Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1830.5 236L1861 238.5H1868.93L1867.5 258L1871.05 287.5H1830.5L1825 271.5L1830.5 236Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1867.5 258L1868.93 238.5L1872 196.5H1920V324.5H1875.5L1871.05 287.5L1867.5 258Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1414.5 125L1431.5 15L1541.5 31.5L1521 141L1414.5 125Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1332.5 69L1341.5 5.5L1300 0L1283 105L1392.5 121L1396 77.5L1332.5 69Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1283 48L1102.5 16L1098.5 46.5L1274.5 79L1283 48Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1849.02 981.452L1897.02 968.59L1902.62 1009.09L1859.52 1020.64L1849.02 981.452Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1851.64 1020.64L1841.52 982.864L1791.12 995.59L1801.44 1034.09L1851.64 1020.64Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1615.52 1036.09L1663.52 1023.23L1669.12 1063.73L1626.02 1075.28L1615.52 1036.09Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1791.12 1036.09L1781 998.316L1730.6 1011.04L1740.92 1049.54L1791.12 1036.09Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1849.02 981.452L1897.02 968.59L1902.62 1009.09L1859.52 1020.64L1849.02 981.452Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1851.64 1020.64L1841.52 982.864L1791.12 995.59L1801.44 1034.09L1851.64 1020.64Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1849.02 981.452L1897.02 968.59L1902.62 1009.09L1859.52 1020.64L1849.02 981.452Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1851.64 1020.64L1841.52 982.864L1791.12 995.59L1801.44 1034.09L1851.64 1020.64Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1615.52 1075.28L1605.4 1037.5L1555 1050.23L1565.32 1088.73L1615.52 1075.28Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1791.12 1036.09L1781 998.316L1730.6 1011.04L1740.92 1049.54L1791.12 1036.09Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1735.02 1050.23L1724.9 1012.45L1674.5 1025.18L1684.82 1063.68L1735.02 1050.23Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M471 832L508.5 768L575.42 798.5L541.5 862.5L471 832Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M648.922 832L615.5 894.514L544.5 863.798L578.5 799.904L648.922 832Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M762.5 883.765L735.5 946.429L686.574 925.263L712 860.749L762.5 883.765Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M709 859.382L683 923.716L618.769 895.929L651.536 833.191L709 859.382Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M819.5 909.744L786.064 968.304L740 948.376L766 885.361L819.5 909.744Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M867.628 931.68L836.628 990.18L789.5 969.791L823.352 911.5L867.628 931.68Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M430 905.32L467.5 841.32L534.42 871.82L500.5 935.82L430 905.32Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M607.922 905.32L574.5 967.835L503.5 937.118L537.5 873.224L607.922 905.32Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M721.5 957.086L694.5 1019.75L645.574 998.583L671 934.07L721.5 957.086Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M668 932.702L642 997.037L577.769 969.249L610.536 906.512L668 932.702Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M778.5 983.065L745.064 1041.62L699 1021.7L725 958.681L778.5 983.065Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M826.628 1005L795.628 1063.5L748.5 1043.11L782.352 984.82L826.628 1005Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M678 1101.5L715.5 1037.5L782.42 1068L748.5 1132L678 1101.5Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M705.036 1034.88L671.6 1093.44L625.536 1073.52L651.536 1010.5L705.036 1034.88Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M646.5 1012.14L615.5 1070.64L568.372 1050.25L602.224 991.959L646.5 1012.14Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M594 990.18L560.464 1048.74L496.233 1020.95L529 958.214L594 990.18Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M521.922 955.813L488.5 1018.33L391 975.394L425 911.5L521.922 955.813Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M461.422 1015.16L428 1077.68L357 1046.96L391 983.065L461.422 1015.16Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M536 1051.71L502.464 1110.27L438.233 1082.49L471 1019.75L536 1051.71Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M589.5 1077.68L558.5 1136.18L511.372 1115.79L545.224 1057.5L589.5 1077.68Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M416.422 1089.59L383 1152.11L312 1121.39L346 1057.5L416.422 1089.59Z" fill="#E6E6E6" stroke="#1E1E1E"/>
        <path d="M1129.5 718.035L1094.5 778.657L1134.93 802L1274 561.126L1232 540.5L1140.5 698.983M1129.5 718.035L1140.5 698.983M1129.5 718.035L1119.5 712.262L1130.5 693.209L1140.5 698.983M1141.4 931.68L1123.89 962L1152.5 969.666L1174.32 984.5H1290V961L1188 933.449L1163.93 927L1161.25 937L1141.4 931.68ZM1141.4 931.68L1141.5 931.5M1790 254L1760 258V280.5H1790M1790 254V280.5M1790 254L1818 258L1815.5 280.5H1790M1868.93 238.5H1861L1830.5 236L1825 271.5L1830.5 287.5H1871.05M1868.93 238.5L1867.5 258L1871.05 287.5M1868.93 238.5L1872 196.5H1920V324.5H1875.5L1871.05 287.5M1866.5 924.862L1914.5 912L1920.1 952.5L1877 964.048L1866.5 924.862ZM1869.12 964.048L1859 926.274L1808.6 939L1818.92 977.5L1869.12 964.048ZM1633 979.5L1681 966.638L1686.6 1007.14L1643.5 1018.69L1633 979.5ZM1808.6 979.5L1798.48 941.726L1748.08 954.452L1758.4 992.952L1808.6 979.5ZM1633 1018.69L1622.88 980.912L1572.48 993.638L1582.8 1032.14L1633 1018.69ZM1752.5 993.638L1742.38 955.864L1691.98 968.59L1702.3 1007.09L1752.5 993.638ZM1567.7 1026.05L1557.58 988.274L1507.18 1001L1517.5 1039.5L1567.7 1026.05ZM1507.18 1042.5L1497.06 1004.73L1446.66 1017.45L1456.98 1055.95L1507.18 1042.5ZM1441.3 1057.19L1431.18 1019.41L1380.78 1032.14L1391.1 1070.64L1441.3 1057.19ZM1371 1070.64L1360.88 1032.86L1310.48 1045.59L1320.8 1084.09L1371 1070.64ZM1303.12 1080.27L1293 1042.5L1242.6 1055.23L1252.92 1093.73L1303.12 1080.27ZM1231.02 1082.23L1220.9 1044.46L1170.5 1057.19L1180.82 1095.69L1231.02 1082.23ZM1849.02 981.452L1897.02 968.59L1902.62 1009.09L1859.52 1020.64L1849.02 981.452ZM1851.64 1020.64L1841.52 982.864L1791.12 995.59L1801.44 1034.09L1851.64 1020.64ZM1615.52 1036.09L1663.52 1023.23L1669.12 1063.73L1626.02 1075.28L1615.52 1036.09ZM1791.12 1036.09L1781 998.316L1730.6 1011.04L1740.92 1049.54L1791.12 1036.09ZM1615.52 1075.28L1605.4 1037.5L1555 1050.23L1565.32 1088.73L1615.52 1075.28ZM1735.02 1050.23L1724.9 1012.45L1674.5 1025.18L1684.82 1063.68L1735.02 1050.23ZM1910.62 1055.77L1900.5 1018L1850.1 1030.73L1860.42 1069.23L1910.62 1055.77ZM1854.52 1069.91L1844.4 1032.14L1794 1044.86L1804.32 1083.36L1854.52 1069.91ZM1570.5 831L1469 762.5L1407 853L1517.5 918.5L1570.5 831ZM1720 472.411L1586.5 749.5C1634.5 905.9 1762.5 861.667 1825 819.5L1920 623.207L1922 678.5L1844 838.5L1825 853C1654.6 947.8 1574 828.167 1555 756.5L1698 455C1744.83 411.333 1854.8 352.5 1920 466.5V505C1850.4 386.2 1757.67 433.774 1720 472.411ZM1272 874.186L1387 675L1414 689.434L1298.5 889.486L1272 874.186ZM1292.87 802L1256.5 781L1220.5 845.549L1255.92 866L1292.87 802ZM1250.5 776.82L1220.5 759.5L1214.98 757.522L1175.5 825.895L1210.5 846.103L1250.5 776.82ZM1276.5 564.468L1306 581.5L1172 820.844L1139.36 802L1276.5 564.468ZM1394.5 578.254L1339.5 546.5L1236.4 726L1291 757.522L1394.5 578.254ZM1074.55 1070.64L1086.5 1026.05L1152.5 1036.09V1070.64H1074.55ZM980.272 1039.5L1002.5 1001L1074.37 1023.23L1064 1061.93L980.272 1039.5ZM990.5 995.165L926.5 958.214L904.672 1004.73L964.903 1039.5L990.5 995.165ZM867.628 1070.64L895 1023.23L956.712 1045.59L950 1070.64H867.628ZM1043 895.279L1020 882L1016.89 879.5L990.5 925.263L1016.89 940.5L1043 895.279ZM1024 942.337L1047 902.5L1051.5 895.929L1078.47 911.5L1051.5 958.214L1024 942.337ZM1323 926.274L1132 816L1116 847.731L1305.26 957L1323 926.274ZM1082.5 914.5L1068.57 966.5L1093.68 981L1109.09 923.5L1082.5 914.5ZM1152.5 969.666L1123.89 962L1141.4 931.68L1161.25 937L1163.93 927L1188 933.449L1290 961V984.5H1174.32L1152.5 969.666Z" stroke="black"/>
        </g>
        <g id="City 1">
        <path d="M485 545.5L454.5 621L517.5 638L541.5 559L485 545.5Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M287.5 943L310.5 888.5L371.5 912.5L338.5 960.5L287.5 943Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M266 1014.5L287.5 952.5L338.5 968.5L305.5 1027.5L266 1014.5Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M280 943L211 918L187 990.5L254 1014.5L280 943Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M197 822L135 791.5L19 1043.5L69.5 1053L197 822Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M441 800.5L214.5 712.5L166 791.5L280 845.5L272 864L379.5 906.5L441 800.5Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M190 888.5L208.5 859L261 874L242.5 906.5L190 888.5Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M463 742L233.5 652.5L214.5 687.5L448 775.5L463 742Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M258.5 1062.5L98.5 1017L62.5 1075.5L246.5 1080L258.5 1062.5Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M430 472.5L372.5 638L336.5 630L396.5 457.5L430 472.5Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M312 621L437.5 305L392.5 283.5L239.5 592L312 621Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M408.5 444L430 397.5L459.5 407.5L442.5 457.5L408.5 444Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M466.5 397.5L430 378L454.5 305L497.5 323.5L466.5 397.5Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M491 416L507 373.5L641 438L620 472.5L491 416Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M497.5 317L509.5 283.5L688.5 359L669.5 393L497.5 317Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M550 97L561.5 61.5L681 108.5L666.5 148.5L592.5 116.5L566.5 184.5L685.5 237L673 269L507 202L521.5 164L531.5 167L558.5 103.5L550 97Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M673 157.5L605 129.5L599.5 127L577 181.5L655 216L673 157.5Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M677 148.5L685.5 129.5L757 154L748.5 175.5L743 173.423L722.5 165.682L677 148.5Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M722.5 165.682L743 173.423L719 244L693 234.5L722.5 165.682Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M841.5 61.5L847 3.5H886.5L876 66L841.5 61.5Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M886.5 59L894 3.5L920.5 6L915 37L1044 66L1040.5 89.5L886.5 59Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1051.5 89.5L1055.5 66L1091.5 75.5V96L1051.5 89.5Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1199.5 25L1202.5 6L1287.5 13L1283 37L1199.5 25Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1358 60L1362.5 25L1366.5 13L1391 20L1384 60H1358Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1646.5 143.5L1670 64L1746 72.5V163.5L1646.5 143.5Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1723.5 49.5L1733 -1H1802L1796 56.5L1723.5 49.5Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1759 152L1753 99.5H1799.5V154.5L1759 152Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1837.5 150L1839 94H1891.5L1899 150H1837.5Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1873 88L1865.5 42L1918.5 35.5V88H1873Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1844 32.5V10L1909 7V29.5L1844 32.5Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M65 531.5L128.5 383L184 405.75L219.5 420.302L239.5 428.5L167.5 571L65 531.5Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M122 383L52 340.5L-1 335V498.5L60.5 524.5L122 383Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M48.5 323.5L73 218L-1 195V317L48.5 323.5Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M136 327.5L69.5 296L60.5 330.5L122 367L136 327.5Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M168 249L95 218L69.5 283.5L136 317L168 249Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M132.5 373.5L163 317L212 327.5L184 388.5L132.5 373.5Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M277 256L303 205.5L352 229.5L326.5 283.5L277 256Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M212 269.5L326.5 37.5L364.5 55L253 288.5L212 269.5Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M309.5 195L341.5 133.5L386.5 156L360 218L309.5 195Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M348 124L376.5 61.5L424.5 79L392.5 141.5L348 124Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M205.5 191.5L293.5 8H245L168 174.5L205.5 191.5Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M145 229.5L163 181.5L201.5 198.5L184 240.5L145 229.5Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M136 218L231 8H178L95 191.5L136 218Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M69.5 198.5L108.5 112L43.5 103.5L6.5 167L69.5 198.5Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M115 100.5L155 11H87L69.5 85L115 100.5Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M57 85L69.5 11L-1 8V85H57Z" fill="#D9D9D9"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M145 630L-18 571L-12.5 952.5L145 630Z" fill="#D9D9D9"/>
        <path d="M743 173.423L748.5 175.5L757 154L685.5 129.5L677 148.5L722.5 165.682M743 173.423L722.5 165.682M743 173.423L719 244L693 234.5L722.5 165.682M184 405.75L128.5 383L65 531.5L167.5 571L239.5 428.5L219.5 420.302M184 405.75L219.5 420.302M184 405.75L239.5 296L277 308.5L219.5 420.302M485 545.5L454.5 621L517.5 638L541.5 559L485 545.5ZM287.5 943L310.5 888.5L371.5 912.5L338.5 960.5L287.5 943ZM266 1014.5L287.5 952.5L338.5 968.5L305.5 1027.5L266 1014.5ZM280 943L211 918L187 990.5L254 1014.5L280 943ZM197 822L135 791.5L19 1043.5L69.5 1053L197 822ZM441 800.5L214.5 712.5L166 791.5L280 845.5L272 864L379.5 906.5L441 800.5ZM190 888.5L208.5 859L261 874L242.5 906.5L190 888.5ZM463 742L233.5 652.5L214.5 687.5L448 775.5L463 742ZM258.5 1062.5L98.5 1017L62.5 1075.5L246.5 1080L258.5 1062.5ZM430 472.5L372.5 638L336.5 630L396.5 457.5L430 472.5ZM312 621L437.5 305L392.5 283.5L239.5 592L312 621ZM408.5 444L430 397.5L459.5 407.5L442.5 457.5L408.5 444ZM466.5 397.5L430 378L454.5 305L497.5 323.5L466.5 397.5ZM491 416L507 373.5L641 438L620 472.5L491 416ZM497.5 317L509.5 283.5L688.5 359L669.5 393L497.5 317ZM550 97L561.5 61.5L681 108.5L666.5 148.5L592.5 116.5L566.5 184.5L685.5 237L673 269L507 202L521.5 164L531.5 167L558.5 103.5L550 97ZM673 157.5L605 129.5L599.5 127L577 181.5L655 216L673 157.5ZM841.5 61.5L847 3.5H886.5L876 66L841.5 61.5ZM886.5 59L894 3.5L920.5 6L915 37L1044 66L1040.5 89.5L886.5 59ZM1051.5 89.5L1055.5 66L1091.5 75.5V96L1051.5 89.5ZM1199.5 25L1202.5 6L1287.5 13L1283 37L1199.5 25ZM1358 60L1362.5 25L1366.5 13L1391 20L1384 60H1358ZM1646.5 143.5L1670 64L1746 72.5V163.5L1646.5 143.5ZM1723.5 49.5L1733 -1H1802L1796 56.5L1723.5 49.5ZM1759 152L1753 99.5H1799.5V154.5L1759 152ZM1837.5 150L1839 94H1891.5L1899 150H1837.5ZM1873 88L1865.5 42L1918.5 35.5V88H1873ZM1844 32.5V10L1909 7V29.5L1844 32.5ZM122 383L52 340.5L-1 335V498.5L60.5 524.5L122 383ZM48.5 323.5L73 218L-1 195V317L48.5 323.5ZM136 327.5L69.5 296L60.5 330.5L122 367L136 327.5ZM168 249L95 218L69.5 283.5L136 317L168 249ZM132.5 373.5L163 317L212 327.5L184 388.5L132.5 373.5ZM277 256L303 205.5L352 229.5L326.5 283.5L277 256ZM212 269.5L326.5 37.5L364.5 55L253 288.5L212 269.5ZM309.5 195L341.5 133.5L386.5 156L360 218L309.5 195ZM348 124L376.5 61.5L424.5 79L392.5 141.5L348 124ZM205.5 191.5L293.5 8H245L168 174.5L205.5 191.5ZM145 229.5L163 181.5L201.5 198.5L184 240.5L145 229.5ZM136 218L231 8H178L95 191.5L136 218ZM69.5 198.5L108.5 112L43.5 103.5L6.5 167L69.5 198.5ZM115 100.5L155 11H87L69.5 85L115 100.5ZM57 85L69.5 11L-1 8V85H57ZM145 630L-18 571L-12.5 952.5L145 630Z" stroke="black"/>
        </g>
        </g>
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

      {/* ClipPath definition */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <clipPath id="clip0_1_5">
            <rect width="1920" height="1080" fill="white"/>
          </clipPath>
        </defs>
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

