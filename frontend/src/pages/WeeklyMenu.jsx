import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '../config/api';

// Cycles rotate weekly, and day_number 1 of every cycle template lines up
// with a Saturday.
const DAY_NAMES = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DAY_NAMES_SHORT = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

// Preferred left-to-right / top-to-bottom order for meal periods. Anything
// found in the data that isn't listed here is appended alphabetically.
const MEAL_PERIOD_ORDER = ['Breakfast', 'Lunch', 'Dinner', 'Late Night'];

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDate(date) {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getMostRecentSaturday(date) {
  const d = new Date(date);
  const dayOfWeek = d.getDay(); // 0 = Sunday, 6 = Saturday
  const daysBack = dayOfWeek === 6 ? 0 : (dayOfWeek + 1) % 7;
  d.setDate(d.getDate() - daysBack);
  return startOfDay(d);
}

function orderMealPeriods(periodNames) {
  const known = MEAL_PERIOD_ORDER.filter(p => periodNames.includes(p));
  const unknown = periodNames.filter(p => !MEAL_PERIOD_ORDER.includes(p)).sort();
  return [...known, ...unknown];
}

const MIN_WEEK_OFFSET = -3;
const MAX_WEEK_OFFSET = 3;

function WeeklyMenu() {
  const [cycles, setCycles] = useState([]);
  const [foodsById, setFoodsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // weekOffset: 0 = the live/current cycle, +1 = next, -1 = previous, and so on.
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      setLoading(true);
      setError(null);
      const [cyclesRes, foodsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/cycles`),
        fetch(`${API_BASE_URL}/foods`)
      ]);
      if (!cyclesRes.ok) throw new Error(`HTTP ${cyclesRes.status}`);
      if (!foodsRes.ok) throw new Error(`HTTP ${foodsRes.status}`);

      const cyclesData = await cyclesRes.json();
      const foodsData = await foodsRes.json();

      setCycles(cyclesData || []);
      const map = {};
      (foodsData || []).forEach(f => { map[f.id] = f; });
      setFoodsById(map);
    } catch (err) {
      console.error(err);
      setError("Couldn't load this week's menu. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sortedCycles = useMemo(
    () => [...cycles].sort((a, b) => a.order - b.order),
    [cycles]
  );

  const activeIndex = sortedCycles.findIndex(c => c.is_active);
  const activeCycle = activeIndex >= 0 ? sortedCycles[activeIndex] : null;
  const len = sortedCycles.length;

  const viewIndex = len > 0
    ? (((activeIndex >= 0 ? activeIndex : 0) + weekOffset) % len + len) % len
    : -1;
  const viewedCycle = viewIndex >= 0 ? sortedCycles[viewIndex] : null;

  const today = startOfDay(new Date());

  // Current week always starts on the most recent Saturday on or before today.
  // Other weeks offset from that anchor point.
  const weekStart = useMemo(() => {
    const currentWeekStart = getMostRecentSaturday(today);
    return addDays(currentWeekStart, weekOffset * 7);
  }, [weekOffset, today]);

  const relationLabel =
    weekOffset === 0 ? 'Current Week'
    : weekOffset === 1 ? 'Next Week'
    : weekOffset === -1 ? 'Previous Week'
    : weekOffset > 1 ? `${weekOffset} Weeks Ahead`
    : `${Math.abs(weekOffset)} Weeks Ago`;

  const canGoBack = weekOffset > MIN_WEEK_OFFSET;
  const canGoForward = weekOffset < MAX_WEEK_OFFSET;

  const handlePreviousWeek = () => {
    if (canGoBack) {
      setWeekOffset(w => w - 1);
    }
  };

  const handleNextWeek = () => {
    if (canGoForward) {
      setWeekOffset(w => w + 1);
    }
  };

  const days = viewedCycle?.days ? [...viewedCycle.days].sort((a, b) => a.day_number - b.day_number) : [];

  const mealPeriods = useMemo(() => {
    const set = new Set();
    days.forEach(day => Object.keys(day.meals || {}).forEach(p => set.add(p)));
    return orderMealPeriods([...set]);
  }, [days]);

  const dayDates = days.map(day => addDays(weekStart, day.day_number - 1));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1F3D2B' }}>
        <p className="text-[#F2EFE4] tracking-widest uppercase text-sm">Setting the table…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1F3D2B' }}>
      <div className="max-w-6xl mx-auto px-4 py-10 sm:py-14">

        {/* ---- Header / board sign ---- */}
        <div className="mb-8">
          <p className="text-[#E7B33E] text-xs sm:text-sm font-bold tracking-[0.3em] uppercase mb-2">
            This Week's Menu
          </p>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-[#F7F3E8] text-3xl sm:text-4xl font-black tracking-tight">
                {viewedCycle ? viewedCycle.name : 'No cycle scheduled'}
              </h1>
              {days.length > 0 && (
                <p className="text-[#BFD2C3] text-sm mt-1">
                  {formatDate(dayDates[0])} – {formatDate(dayDates[dayDates.length - 1])}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span
                className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-sm"
                style={{
                  backgroundColor: weekOffset === 0 ? '#C1503D' : 'transparent',
                  color: weekOffset === 0 ? '#F7F3E8' : '#BFD2C3',
                  border: weekOffset === 0 ? 'none' : '1px solid #3E5D4A'
                }}
              >
                {relationLabel}
              </span>
              <button
                onClick={handlePreviousWeek}
                disabled={!canGoBack}
                aria-label="Previous week"
                className={`w-9 h-9 flex items-center justify-center rounded-sm border border-[#3E5D4A] transition ${
                  canGoBack
                    ? 'text-[#F7F3E8] hover:bg-[#2A4A38] cursor-pointer'
                    : 'text-[#5A7768] cursor-not-allowed opacity-50'
                }`}
              >
                ←
              </button>
              <button
                onClick={handleNextWeek}
                disabled={!canGoForward}
                aria-label="Next week"
                className={`w-9 h-9 flex items-center justify-center rounded-sm border border-[#3E5D4A] transition ${
                  canGoForward
                    ? 'text-[#F7F3E8] hover:bg-[#2A4A38] cursor-pointer'
                    : 'text-[#5A7768] cursor-not-allowed opacity-50'
                }`}
              >
                →
              </button>
              {weekOffset !== 0 && (
                <button
                  onClick={() => setWeekOffset(0)}
                  className="text-xs font-semibold text-[#E7B33E] underline underline-offset-4 hover:text-[#F7F3E8] transition ml-1"
                >
                  Back to today
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-[#C1503D] text-[#F7F3E8] px-4 py-3 rounded-sm mb-6 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={loadMenu} className="underline font-semibold">Retry</button>
          </div>
        )}

        {!error && !viewedCycle && (
          <div className="bg-[#2A4A38] text-[#BFD2C3] rounded-sm p-10 text-center">
            No menu cycle is set up yet. Check back soon.
          </div>
        )}

        {/* ---- The board ---- */}
        {viewedCycle && (
          <div className="overflow-x-auto rounded-sm border border-[#3E5D4A]">
            <div className="min-w-[900px]">
              {/* Day header row */}
              <div className="grid" style={{ gridTemplateColumns: '140px repeat(7, 1fr)' }}>
                <div className="bg-[#16302A]" />
                {days.map((day, i) => {
                  const date = dayDates[i];
                  const isToday = weekOffset === 0 && isSameDay(date, today);
                  return (
                    <div
                      key={day.day_number}
                      className="relative bg-[#16302A] px-3 py-3 text-center border-l border-[#3E5D4A]"
                    >
                      {isToday && (
                        <span
                          className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
                          style={{ backgroundColor: '#E7B33E', boxShadow: '0 2px 4px rgba(0,0,0,0.4)' }}
                        />
                      )}
                      <p
                        className="text-xs font-bold uppercase tracking-widest"
                        style={{ color: isToday ? '#E7B33E' : '#F2EFE4' }}
                      >
                        {DAY_NAMES_SHORT[day.day_number - 1] || DAY_NAMES[day.day_number - 1]}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: isToday ? '#E7B33E' : '#8CA391' }}>
                        {formatDate(date)}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Meal period rows */}
              {mealPeriods.map((period, rowIdx) => (
                <div
                  key={period}
                  className="grid"
                  style={{
                    gridTemplateColumns: '140px repeat(7, 1fr)',
                    backgroundColor: rowIdx % 2 === 0 ? '#274A38' : '#213F2F'
                  }}
                >
                  <div className="px-3 py-3 flex items-center border-t border-[#3E5D4A]">
                    <p className="text-[#F2EFE4] text-sm font-bold uppercase tracking-wide">
                      {period}
                    </p>
                  </div>
                  {days.map(day => {
                    const stations = day.meals?.[period] || {};
                    const stationNames = Object.keys(stations).filter(s => (stations[s] || []).length > 0);
                    return (
                      <div
                        key={day.day_number}
                        className="border-t border-l border-[#3E5D4A] px-2.5 py-2.5"
                      >
                        {stationNames.length === 0 ? (
                          <span className="text-[#5A7768] text-xs">—</span>
                        ) : (
                          <div className="space-y-2">
                            {stationNames.map(station => (
                              <div key={station}>
                                <p className="text-[#E7B33E] text-[10px] font-bold uppercase tracking-wider mb-0.5">
                                  {station}
                                </p>
                                <ul>
                                  {stations[station].map((foodId, idx) => (
                                    <li key={`${foodId}-${idx}`} className="text-[#F7F3E8] text-[13px] leading-snug">
                                      {foodsById[foodId]?.name || 'Item unavailable'}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WeeklyMenu;