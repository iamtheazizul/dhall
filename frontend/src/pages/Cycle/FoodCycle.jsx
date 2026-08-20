import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FoodPickerModal from '../../components/Admin/FoodPickerModal';
import { API_BASE_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const mealPeriods = ['Breakfast', 'Lunch', 'Dinner', 'Late Night'];
const stations = ['Diner', "Emily's Garden", 'Global/Noodle Bar', 'Minus 9', 'The Corner Deli', "Supremo's"];

function FoodCycle() {
  const { cycleId } = useParams();
  const navigate = useNavigate();

  // State management
  const [cycle, setCycle] = useState(null);
  const [allFoods, setAllFoods] = useState([]);
  const [cycleDays, setCycleDays] = useState([]); // Now stores the days array structure
  const [expandedDays, setExpandedDays] = useState(new Set());
  const [expandedMeals, setExpandedMeals] = useState(new Set());
  const [modalData, setModalData] = useState({ open: false, dayIndex: null, meal: null, station: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const dayRefs = useRef({});
  const { getAuthHeader } = useAuth();

  useEffect(() => {
    if (!cycleId) {
      setError('No cycle ID provided');
      setLoading(false);
      return;
    }
    loadCycleData();
  }, [cycleId]);

  const loadCycleData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all cycles and find the one with matching ID
      const cyclesResponse = await fetch(`${API_BASE_URL}/cycles`);
      if (!cyclesResponse.ok) {
        throw new Error(`Failed to fetch cycles: HTTP ${cyclesResponse.status}`);
      }
      const allCycles = await cyclesResponse.json();
      const cycleData = allCycles.find(c => c.id === cycleId);

      if (!cycleData) {
        throw new Error(`Cycle with ID "${cycleId}" not found`);
      }

      setCycle(cycleData);
      // Use the days array from the new structure
      let daysArray = Array.isArray(cycleData.days) ? cycleData.days : [];
      daysArray = daysArray.map(day => ({
        ...day,
        meals: day.meals || {}
      }));

      setCycleDays(daysArray);

      // Fetch all available foods
      const foodsResponse = await fetch(`${API_BASE_URL}/foods`);
      if (!foodsResponse.ok) {
        throw new Error(`Failed to fetch foods: HTTP ${foodsResponse.status}`);
      }
      const foodsData = await foodsResponse.json();
      setAllFoods(foodsData || []);

      setUnsavedChanges(false);
    } catch (err) {
      setError(err.message);
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (dayIndex) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      newSet.has(dayIndex) ? newSet.delete(dayIndex) : newSet.add(dayIndex);
      return newSet;
    });
  };

  const toggleMeal = (dayIndex, meal) => {
    const key = `${dayIndex}--${meal}`;
    setExpandedMeals(prev => {
      const newSet = new Set(prev);
      newSet.has(key) ? newSet.delete(key) : newSet.add(key);
      return newSet;
    });
  };

  const addFoodToDay = (dayIndex, meal, station, foodId) => {
    setCycleDays(prev => {
      const newDays = [...prev];
      const dayMeals = newDays[dayIndex].meals || {};

      // Initialize meal if it doesn't exist
      if (!dayMeals[meal]) {
        dayMeals[meal] = {};
      }

      // Initialize station if it doesn't exist
      if (!dayMeals[meal][station]) {
        dayMeals[meal][station] = [];
      }

      // Check if food already exists
      if (dayMeals[meal][station].includes(foodId)) {
        return prev;
      }

      // Add the food
      dayMeals[meal][station].push(foodId);
      newDays[dayIndex].meals = dayMeals;

      return newDays;
    });

    setUnsavedChanges(true);
    console.log(`Added food ${foodId} to day ${dayIndex}, ${meal}, ${station}`);
  };

  const removeFoodFromDay = (dayIndex, meal, station, foodId) => {
    setCycleDays(prev => {
      const newDays = [...prev];
      const dayMeals = newDays[dayIndex].meals || {};

      if (dayMeals[meal] && dayMeals[meal][station]) {
        dayMeals[meal][station] = dayMeals[meal][station].filter(id => id !== foodId);
        newDays[dayIndex].meals = dayMeals;
      }

      return newDays;
    });

    setUnsavedChanges(true);
  };

  const getFoodsForDayMealStation = (dayIndex, meal, station) => {
    // Add safety checks
    if (!cycleDays || dayIndex < 0 || dayIndex >= cycleDays.length) {
      return [];
    }

    const dayData = cycleDays[dayIndex];
    if (!dayData || !dayData.meals) {
      return [];
    }

    if (!dayData.meals[meal]) {
      return [];
    }

    if (!dayData.meals[meal][station]) {
      return [];
    }

    return dayData.meals[meal][station];
  };

  const scrollToDay = (dayIndex) => {
    dayRefs.current[dayIndex]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const onSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const updatedCycle = {
        ...cycle,
        days: cycleDays
      };

      console.log('Saving cycle with days:', updatedCycle);

      const url = `${API_BASE_URL}/cycles?id=${cycleId}`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader() 
        },
        body: JSON.stringify(updatedCycle)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to save: HTTP ${response.status}`);
      }

      const savedCycle = await response.json();
      console.log('Cycle saved successfully:', savedCycle);

      setCycle(savedCycle);

      let savedDays = Array.isArray(savedCycle.days) ? savedCycle.days : [];
      savedDays = savedDays.map(day => ({
        ...day,
        meals: day.meals || {}
      }));

      setCycleDays(savedDays);      

      setUnsavedChanges(false);
      alert('Cycle saved successfully!');
    } catch (err) {
      setError(err.message);
      console.error('Save error:', err);
      alert(`Error saving cycle: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    setModalData({ open: false, dayIndex: null, meal: null, station: null });
  };

  if (!cycleId) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-semibold">Error: No cycle ID provided</p>
          <button
            onClick={() => navigate('/admin/cycle/manage')}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
          >
            Back to Cycles
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading cycle...</div>;
  }

  if (error && !cycle) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-semibold mb-2">Error loading cycle</p>
          <p className="text-sm mb-2">{error}</p>
          <p className="text-sm mb-4 text-gray-700">
            Cycle ID: <code className="bg-red-200 px-2 py-1">{cycleId}</code>
          </p>
          <div className="flex gap-2">
            <button
              onClick={loadCycleData}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
            >
              Retry
            </button>
            <button
              onClick={() => navigate('/admin/cycle/manage')}
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
            >
              Back to Cycles
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 max-w-6xl mx-auto mb-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{cycle?.name}</h1>
            {cycle?.description && <p className="text-gray-600 mt-1">{cycle.description}</p>}
            {unsavedChanges && <p className="text-yellow-600 mt-1 font-semibold">● Unsaved changes</p>}
          </div>
          <nav className="flex gap-2 flex-wrap">
            {days.map((dayName, index) => (
              <button
                key={index}
                onClick={() => scrollToDay(index)}
                className="text-gray-700 hover:text-blue-600 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-3 py-1 whitespace-nowrap"
              >
                {dayName}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {error && (
        <div className="p-6 max-w-6xl mx-auto mb-6">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}

  <div className="p-6 max-w-6xl mx-auto">
    {cycleDays.length > 0 ? (
      cycleDays.map((dayData, dayIndex) => (
        <section
          key={dayIndex}
          ref={el => (dayRefs.current[dayIndex] = el)}
          className="mb-10 scroll-mt-32"
        >
          <h2
            className="text-2xl font-semibold text-blue-700 mb-3 flex items-center justify-between cursor-pointer select-none hover:text-blue-800"
            onClick={() => toggleDay(dayIndex)}
            tabIndex={0}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && toggleDay(dayIndex)}
            role="button"
          >
            {days[dayIndex]} (Day {dayData.day_number})
            <span className="text-xl font-bold mr-2">{expandedDays.has(dayIndex) ? '−' : '+'}</span>
          </h2>

          {expandedDays.has(dayIndex) &&
            mealPeriods.map(meal => {
              const mKey = `${dayIndex}--${meal}`;
              const isMealExpanded = expandedMeals.has(mKey);

              return (
                <section key={meal} className="ml-6 mb-6">
                  <h3
                    className="text-xl font-semibold text-indigo-600 mb-2 flex items-center justify-between cursor-pointer select-none hover:text-indigo-700"
                    onClick={() => toggleMeal(dayIndex, meal)}
                    tabIndex={0}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && toggleMeal(dayIndex, meal)}
                    role="button"
                  >
                    {meal}
                    <span className="text-lg font-bold mr-2">{isMealExpanded ? '−' : '+'}</span>
                  </h3>

                  {isMealExpanded &&
                    stations.map(station => {
                      const foodIds = getFoodsForDayMealStation(dayIndex, meal, station);

                      return (
                        <div key={station} className="ml-6 mb-4">
                          <h4 className="font-medium text-gray-700 mb-2">{station}</h4>
                          <div className="flex flex-wrap gap-3 items-center">
                            {foodIds.map(foodId => {
                              const foodItem = allFoods.find(f => f.id === foodId);
                              return (
                                <div
                                  key={`${dayIndex}-${meal}-${station}-${foodId}`}
                                  className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded shadow-sm"
                                >
                                  <span>{foodItem?.name || foodId}</span>
                                  <button
                                    onClick={() => removeFoodFromDay(dayIndex, meal, station, foodId)}
                                    className="text-blue-600 hover:text-blue-900 focus:outline-none font-bold"
                                  >
                                    ×
                                  </button>
                                </div>
                              );
                            })}
                            <button
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                              onClick={() => setModalData({ open: true, dayIndex, meal, station })}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </section>
              );
            })}
        </section>
      ))
    ) : (
      <div className="text-center text-gray-500 py-8">
        <p>No days loaded. Please refresh the page.</p>
      </div>
    )}

    <div className="flex justify-center gap-4 mt-10 mb-10">
      <button
        onClick={onSave}
        disabled={saving || !unsavedChanges}
        className={`font-bold py-3 px-8 rounded-md shadow focus:outline-none focus:ring-2 transition ${
          saving || !unsavedChanges
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-400'
        }`}
      >
        {saving ? 'Saving...' : 'Save Cycle'}
      </button>
      <button
        onClick={() => navigate('/admin/cycle/manage')}
        className="font-bold py-3 px-8 rounded-md shadow focus:outline-none focus:ring-2 bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-400 transition"
      >
        Back to Cycles
      </button>
    </div>
  </div>

  {modalData.open && (
    <FoodPickerModal
      dayIndex={modalData.dayIndex}
      meal={modalData.meal}
      station={modalData.station}
      onClose={closeModal}
      onAddFood={(foodId) => addFoodToDay(modalData.dayIndex, modalData.meal, modalData.station, foodId)}
      existing={getFoodsForDayMealStation(modalData.dayIndex, modalData.meal, modalData.station)}
      foodList={allFoods}
    />
  )}
    </>
  );
}

export default FoodCycle;