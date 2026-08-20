import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api'; 
import { useAuth } from '../../context/AuthContext'; 

function AdminDashboard() {
  const { user, logout } = useAuth(); // Add this
  const [adminName, setAdminName] = useState('');
  const [activeCycle, setActiveCycle] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Use Okta user name if available
    if (user && user.name) {
      setAdminName(user.name);
    } else {
      const storedAdminName = localStorage.getItem('adminName') || 'Admin';
      setAdminName(storedAdminName);
    }
    // const storedAdminName = localStorage.getItem('adminName') || 'Admin';
    // setAdminName(storedAdminName);


    // Fetch active cycle from API
    const fetchActiveCycle = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/cycles`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch cycles');
        }
        
        const cyclesData = await response.json();
        
        // Find the active cycle
        const active = cyclesData.find(cycle => 
          cycle.is_active === true || cycle.is_active === 'true'
        );
        
        if (active) {
          setActiveCycle(active.name);
        } else {
          setActiveCycle('No active cycle');
        }
      } catch (error) {
        console.error('Error fetching active cycle:', error);
        setActiveCycle('Error loading cycle');
      } finally {
        setLoading(false);
      }
    };

    fetchActiveCycle();
  }, [user]);
  // }, []);


  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout(); // Use Okta logout
    }
  };


  // const handleLogout = () => {
  //   if (window.confirm('Are you sure you want to logout?')) {
  //     localStorage.removeItem('adminName');
  //     localStorage.removeItem('adminToken');
  //     navigate('/');
  //   }
  // };


  const dashboardOptions = [
    {
      id: 1,
      title: 'Add New Food',
      description: 'Create new menu items with ingredients and dietary restrictions',
      icon: '🍽️',
      link: '/admin/food/add',
      category: 'Food'
    },
    {
      id: 2,
      title: 'Manage Existing Food',
      description: 'Edit or delete existing menu items',
      icon: '📝',
      link: '/admin/food/manage',
      category: 'Food'
    },
    {
      id: 3,
      title: 'Add New Cycle',
      description: 'Create a new menu cycle',
      icon: '➕',
      link: '/admin/cycle/add',
      category: 'Cycle'
    },
    {
      id: 4,
      title: 'Manage Existing Cycle',
      description: 'Edit or delete existing menu cycles',
      icon: '⚙️',
      link: '/admin/cycle/manage',
      category: 'Cycle'
    }
  ];

  const foodOptions = dashboardOptions.filter(opt => opt.category === 'Food');
  const cycleOptions = dashboardOptions.filter(opt => opt.category === 'Cycle');

  return (
    <div className="min-h-screen bg-gray-50 p-8 relative">
      {/* Logout Button in Top Right */}
      <div className="absolute top-6 right-6">
        <button
          onClick={handleLogout}
          className="bg-brand-green hover:bg-brand-yellow text-white py-2 px-4 rounded font-semibold transition shadow-md"
          aria-label="Logout from admin panel"
        >
          Logout
        </button>
      </div>

      {/* Welcome Section */}
      <div className="max-w-6xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-brand-green to-brand-green-dark text-white rounded-lg shadow-lg p-8">          <h1 className="text-4xl font-bold mb-2">
            Hello {adminName}, welcome to admin panel!
          </h1>
          <p className="text-lg opacity-90">
            Manage your menu items and cycles from here
          </p>
        </div>

        {/* Active Cycle Info */}
        <div className="mt-6 bg-white rounded-lg shadow p-6 border-l-4 border-brand-green">
          <p className="text-gray-600">
            <span className="font-semibold">Current Active Cycle:</span>
          </p>
          {loading ? (
            <p className="text-xl text-gray-500 mt-2 italic">Loading...</p>
          ) : (
            <p className="text-2xl font-bold text-brand-green-700 mt-2">
              {activeCycle}
            </p>
          )}
        </div>
      </div>

      {/* Dashboard Options */}
      <div className="max-w-6xl mx-auto">
        {/* Food Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-brand-green">
            Food Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {foodOptions.map(option => (
              <Link
                key={option.id}
                to={option.link}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-t-4 border-brand-green hover:border-brand-yellow"
              >
                <div className="text-4xl mb-4">{option.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {option.title}
                </h3>
                <p className="text-gray-600">
                  {option.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Cycle Section */}
        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-brand-green">
            Cycle Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cycleOptions.map(option => (
              <Link
                key={option.id}
                to={option.link}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-t-4 border-brand-green hover:border-brand-yellow"
              >
                <div className="text-4xl mb-4">{option.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {option.title}
                </h3>
                <p className="text-gray-600">
                  {option.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;