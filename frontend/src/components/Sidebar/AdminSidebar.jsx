import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function AdminSidebar() {
  const navigate = useNavigate();

  return (
    <nav className="w-64 bg-brand-green-dark text-white min-h-screen p-4 flex flex-col">
      <h2 className="text-xl font-bold mb-8 text-center border-b border-gray-700 pb-4">
        Admin Panel
      </h2>

      <ul className="space-y-6 flex-1">
        {/* Dashboard */}
        <li>
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              isActive
                ? 'block px-3 py-2 bg-brand-green rounded font-semibold'
                : 'block px-3 py-2 hover:bg-gray-700 rounded'
            }
          >
            Dashboard
          </NavLink>
        </li>

        {/* Food Section */}
        <li>
          <div className="px-3 py-2 text-sm font-bold text-gray-400 uppercase tracking-wider">
              Food
          </div>
          <ul className="mt-2 space-y-2 ml-2 border-l border-gray-600 pl-3">
            <li>
              <NavLink
                to="/admin/food/add"
                className={({ isActive }) =>
                  isActive
                    ? 'block px-3 py-2 bg-brand-green rounded text-sm'
                    : 'block px-3 py-2 hover:bg-gray-700 rounded text-sm'
                }
              >
                Add New Food
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/food/manage"
                className={({ isActive }) =>
                  isActive
                    ? 'block px-3 py-2 bg-brand-green rounded text-sm'
                    : 'block px-3 py-2 hover:bg-gray-700 rounded text-sm'
                }
              >
                Manage Food
              </NavLink>
            </li>
          </ul>
        </li>

        {/* Cycle Section */}
        <li>
          <div className="px-3 py-2 text-sm font-bold text-gray-400 uppercase tracking-wider">
           Cycle
          </div>
          <ul className="mt-2 space-y-2 ml-2 border-l border-gray-600 pl-3">
            <li>
              <NavLink
                to="/admin/cycle/add"
                className={({ isActive }) =>
                  isActive
                    ? 'block px-3 py-2 bg-brand-green rounded text-sm'
                    : 'block px-3 py-2 hover:bg-gray-700 rounded text-sm'
                }
              >
                Add New Cycle
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/cycle/manage"
                className={({ isActive }) =>
                  isActive
                    ? 'block px-3 py-2 bg-brand-green rounded text-sm'
                    : 'block px-3 py-2 hover:bg-gray-700 rounded text-sm'
                }
              >
                Manage Cycle
              </NavLink>
            </li>
          </ul>
        </li>

        {/* Features Section */}
        <li>
          <div className="px-3 py-2 text-sm font-bold text-gray-400 uppercase tracking-wider">
            Features
          </div>
          <ul className="mt-2 space-y-2 ml-2 border-l border-gray-600 pl-3">
            <li>
              <NavLink
                to="/admin/hours"
                className={({ isActive }) =>
                  isActive
                    ? 'block px-3 py-2 bg-brand-green rounded text-sm'
                    : 'block px-3 py-2 hover:bg-gray-700 rounded text-sm'
                }
              >
                Hours
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/slideshow"
                className={({ isActive }) =>
                  isActive
                    ? 'block px-3 py-2 bg-brand-green rounded text-sm'
                    : 'block px-3 py-2 hover:bg-gray-700 rounded text-sm'
                }
              >
                Slideshow
              </NavLink>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  );
}