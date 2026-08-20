import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/UserSidebar';
import MenuGrid from '../../components/App/MenuGrid';
import Slideshow from '../../components/App/Slideshow/Slideshow';
import '../../styles/index.css';
import HeaderComponent from '../../components/App/HeaderComponent';
import { API_BASE_URL } from '../../config/api';

// / High level components 
// / Document protocol -- how do you deploy it up- and running
// / dns server -- bill
// / authentication scheme - go side - create another request type for uthenticating based on a public private key pair 
// go public frontend private key

// Helper function to get current day index (0 = Monday, 6 = Sunday)
function getCurrentDayIndex() {
  const today = new Date();
  // getDay() returns 0-6 where 0 = Sunday, so we adjust it to Monday = 0
  return (today.getDay() + 6) % 7;
}

// Function to flatten menu data from the new cycle structure
function flattenMenuData(dayMeals, allFoods) {
  if (!dayMeals) return [];

  const foodMap = new Map(); // key: "foodId-station"

  Object.keys(dayMeals).forEach(timePeriod => {
    const mealStations = dayMeals[timePeriod];

    Object.keys(mealStations).forEach(station => {
      const foodIds = mealStations[station];
      const normalizedStation = station === "Emily's" ? "Emily's Garden" : station;

      foodIds.forEach(foodId => {
        const foodDetails = allFoods.find(f => f.id === foodId);
        if (!foodDetails) return;

        const key = `${foodId}-${normalizedStation}`;

        if (foodMap.has(key)) {
          // Merge: add this timePeriod if not already present
          const existing = foodMap.get(key);
          if (!existing.timePeriods.includes(timePeriod)) {
            existing.timePeriods.push(timePeriod);
          }
        } else {
          foodMap.set(key, {
            name: foodDetails.name,
            station: normalizedStation,
            timePeriods: [timePeriod],  // now an array
            allergens: foodDetails.restrictions || [],
            description: foodDetails.ingredients,
          });
        }
      });
    });
  });

  return Array.from(foodMap.values());
}

// Function filtering menu items
// Function filtering menu items
function filterMenuItems(items, filters, searchTerm) {
  const { stations, times, exclude, preferences } = filters;
  
  return items.filter(item => {
    // Station filter
    const stationMatch = stations.length === 0 || stations.includes(item.station);
    
    // Time filter
    const timeMatch = times.length === 0 || item.timePeriods.some(t => times.includes(t));
    
    // EXCLUDE filter - item must NOT contain any excluded allergens
    const excludeMatch = exclude.length === 0 || !exclude.some(allergen => item.allergens.includes(allergen));
    
    // PREFERENCE filter - item must contain ALL selected preferences
    const preferenceMatch = preferences.length === 0 || preferences.every(pref => item.allergens.includes(pref));
    
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const searchMatch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower) ||
      item.station.toLowerCase().includes(searchLower);
    
    return stationMatch && timeMatch && excludeMatch && preferenceMatch && searchMatch;
  });
}

function App() {
  const [filters, setFilters] = useState({
    stations: [],
    times: [],
    exclude: [],      // NEW: allergens to exclude
    preferences: [],  // NEW: dietary preferences to include
  });
  
  const [activeCycle, setActiveCycle] = useState(null);  // Stores the active cycle
  const [allFoods, setAllFoods] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [slideshowImages, setSlideshowImages] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);  // add here


  const stations = ['Diner', "Emily's Garden", 'Global/Noodle Bar', 'Minus 9', 'The Corner Deli', "Supremo's"];
  const timePeriods = ['Breakfast', 'Lunch', 'Dinner', 'Late Night'];
  const excludeAllergens = ['Fish', 'Shellfish', 'Soy', 'Eggs', 'Gluten', 'Dairy', 'Sesame', 'Pork', 'Spicy'];
  const preferences = ['Halal', 'Vegetarian', 'Vegan'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Fetch cycles, foods, and slideshow data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all cycles
        const cyclesResponse = await fetch(`${API_BASE_URL}/cycles`);
        if (!cyclesResponse.ok) {
          throw new Error('Failed to fetch cycles');
        }
        const cyclesData = await cyclesResponse.json();
        
        // Find the active cycle or error checking
        let active = cyclesData.find(cycle => cycle.is_active === true || cycle.is_active === 'true');
        
        if (!active) {
          console.warn('No is_active field found in API response. Using "Cycle 2" as default.');
          active = cyclesData.find(cycle => cycle.name === 'Cycle 2');
        }
        
        if (!active && cyclesData.length > 0) {
          console.warn('Could not find "Cycle 2". Using first available cycle.');
          active = cyclesData[0];
        }
        
        if (active) {
          setActiveCycle(active);
        } else {
          throw new Error('No cycles available. Please create a cycle in the admin panel.');
        }

        // Fetch all foods
        const foodsResponse = await fetch(`${API_BASE_URL}/foods`);
        if (!foodsResponse.ok) {
          throw new Error('Failed to fetch foods');
        }
        const foodsData = await foodsResponse.json();
        setAllFoods(foodsData || []);

        // Fetch slideshow images - ADD THIS SECTION
        const slideshowResponse = await fetch(`${API_BASE_URL}/slideshow`);
        if (slideshowResponse.ok) {
          const slideshowData = await slideshowResponse.json();
          const formattedImages = slideshowData
            .sort((a, b) => a.order - b.order)
            .map(img => ({
              url: img.url.startsWith('http') ? img.url : `${API_BASE_URL}${img.url}`,
              alt: img.caption,
              caption: img.caption,
              order: img.order,
              link: img.link,
            }));
          setSlideshowImages(formattedImages);
        }

      } catch (err) {
        setError(err.message || 'Failed to fetch data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get the current day's meals
  const getCurrentDayMeals = () => {
    if (!activeCycle || !activeCycle.days || activeCycle.days.length === 0) {
      return {};
    }

    const currentDayIndex = getCurrentDayIndex();
    console.log(currentDayIndex);
    const dayData = activeCycle.days[currentDayIndex];
    return dayData.meals || {};
  };

  // Flatten and filter menu
  const currentDayMeals = getCurrentDayMeals();
  const flattenedMenu = flattenMenuData(currentDayMeals, allFoods);
  const filteredMenu = filterMenuItems(flattenedMenu, filters, searchTerm);

  // Group filtered menu by station
  const menuByStation = filteredMenu.reduce((acc, item) => {
    if (!acc[item.station]) {
      acc[item.station] = [];
    }
    acc[item.station].push(item);
    return acc;
  }, {});

  const toggleFilter = (category, value) => {
    setFilters(prevFilters => {
      const currentValues = prevFilters[category];
      if (currentValues.includes(value)) {
        return { 
          ...prevFilters, 
          [category]: currentValues.filter(v => v !== value) 
        };
      } else {
        return { 
          ...prevFilters, 
          [category]: [...currentValues, value] 
        };
      }
    });
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '18px',
        color: '#6c757d'
      }}>
        Loading menu...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        textAlign: 'center'
      }}>
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #f5c6cb',
          maxWidth: '400px'
        }}>
          <h2 style={{ marginBottom: '10px' }}>Error</h2>
          <p>{error}</p>
          <p style={{ marginTop: '15px', fontSize: '14px', color: '#856404' }}>
            Please contact an administrator or visit the admin panel to set an active cycle.
          </p>
        </div>
      </div>
    );
  }

  const currentDayIndex = getCurrentDayIndex();

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', overflow: 'visible' }}>
      <Sidebar 
        stations={stations} 
        selectedStations={filters.stations} 
        onToggleStation={(station) => toggleFilter('stations', station)}
        timePeriods={timePeriods}
        selectedTimes={filters.times}
        onToggleTime={(time) => toggleFilter('times', time)}
        excludeAllergens={excludeAllergens}
        selectedExclude={filters.exclude}
        onToggleExclude={(allergen) => toggleFilter('exclude', allergen)}
        preferences={preferences}
        selectedPreferences={filters.preferences}
        onTogglePreference={(pref) => toggleFilter('preferences', pref)}
        onCollapse={setIsSidebarCollapsed}
      />
      <main style={{ 
        flex: 1, 
        padding: '30px', 
        backgroundColor: '#f8f9fa',
        marginLeft: isMobile ? '0' : (isSidebarCollapsed ? '120px' : '280px'),
        marginRight: isMobile ? '0' : (isSidebarCollapsed ? '120px' : '0px'),        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        minHeight: '100vh',
        overflow: 'visible'
      }}
      className="main-content"
      >
        <HeaderComponent />
        {slideshowImages.length > 0 && (
          <Slideshow images={slideshowImages} interval={5000} />
        )}
        {/* Currently viewing day indicator */}
        <div className="text-center mb-8 text-lg text-brand-green font-semibold">
        Menu for {days[currentDayIndex]} ({activeCycle?.name})
        </div>

        {/* Search Bar */}
        <div style={{
          maxWidth: '600px',
          margin: '0 auto 40px',
          position: 'relative'
        }}>
          <input
            type="text"
            placeholder="Search menu items, ingredients, or stations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 50px 16px 20px',
              fontSize: '16px',
              border: '2px solid #e5e5e5',
              borderRadius: '30px',
              outline: 'none',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#16a34a';
              e.target.style.boxShadow = '0 4px 12px rgba(22, 163, 74, 0.15)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e5e5';
              e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
            }}
          />
          <span style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '20px',
            color: '#9ca3af',
            pointerEvents: 'none'
          }}>
            🔍
          </span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '50px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                color: '#9ca3af',
                cursor: 'pointer',
                padding: '5px'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Menu Sections */}
        {filteredMenu.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🍽️</div>
            <h2 style={{ color: '#6c757d', fontWeight: '600', marginBottom: '10px' }}>
              No items match your filters
            </h2>
            <p style={{ color: '#adb5bd' }}>
              Try adjusting your filter settings to see more items
            </p>
          </div>
        ) : (
          stations.map(station => (
            menuByStation[station] && menuByStation[station].length > 0 && (
              <section key={station} style={{ marginBottom: '50px' }}>
                <h2 className="text-2xl mb-5 text-brand-green font-bold flex items-center gap-2.5">
                  {station}
                  {/* <span style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#6c757d',
                    backgroundColor: '#e9ecef',
                    padding: '4px 12px',
                    borderRadius: '12px'
                  }}>
                    {menuByStation[station].length}
                  </span> */}
                </h2>
                <div style={{
                  position: 'relative',
                  overflow: 'visible'
                }}>
                  <div 
                    className="menu-carousel"
                    style={{
                      display: 'flex',
                      gap: '20px',
                      overflowX: 'auto',
                      overflowY: 'visible',
                      scrollBehavior: 'smooth',
                      WebkitOverflowScrolling: 'touch',
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#cbd5e0 #f1f5f9'
                    }}
                  >
                    {menuByStation[station].map((item, index) => (
                      <div
                        key={`${item.name}-${index}`}
                        style={{
                          minWidth: '280px',
                          maxWidth: '280px',
                          flexShrink: 0
                        }}
                      >
                        <MenuGrid items={[item]} />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )
          ))
        )}
      </main>
    </div>
  );
}

export default App;