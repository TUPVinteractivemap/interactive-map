import { loadBuildingCoordinates, findRoute, getBuildingAreas } from '../lib/routing.js';

async function testRouting() {
  console.log('Testing updated routing algorithm...\n');
  
  try {
    // Load building coordinates
    console.log('Loading building coordinates...');
    const coordinates = await loadBuildingCoordinates();
    console.log(`Loaded ${Object.keys(coordinates).length} building coordinates\n`);
    
    // Show first few coordinates
    const coordEntries = Object.entries(coordinates).slice(0, 5);
    console.log('Sample coordinates:');
    coordEntries.forEach(([id, coord]) => {
      console.log(`  ${id}: (${coord.x}, ${coord.y})`);
    });
    console.log();
    
    // Test building areas generation
    console.log('Generating dynamic building areas...');
    const areas = await getBuildingAreas();
    console.log(`Generated ${areas.length} building areas (Open Spaces excluded from collision)\n`);
    
    // Show sample building areas
    console.log('Sample building areas:');
    areas.slice(0, 5).forEach(area => {
      const width = area.x2 - area.x1;
      const height = area.y2 - area.y1;
      console.log(`  ${area.id}: ${width}x${height} at (${area.x1}, ${area.y1})`);
    });
    console.log();
    
    // Test routing between some buildings
    console.log('Testing routing between buildings...');
    const buildingIds = Object.keys(coordinates);
    
    if (buildingIds.length >= 2) {
      const from = buildingIds[0];
      const to = buildingIds[1];
      
      console.log(`Finding route from ${from} to ${to}...`);
      const route = await findRoute(from, to);
      console.log(`Route found with ${route.length} waypoints`);
      
      if (route.length > 0) {
        console.log(`Start: (${route[0].x}, ${route[0].y})`);
        console.log(`End: (${route[route.length - 1].x}, ${route[route.length - 1].y})`);
      }
    }
    
    console.log('\n✅ Routing algorithm test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing routing algorithm:', error);
  }
}

testRouting();
