import React, { useState } from 'react';
import { Settings, Moon, Sun, X } from 'lucide-react';

const SettingsMenu = ({ isOpen, onClose, darkMode, onDarkModeToggle, position }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Settings Dropdown */}
      <div 
        className={`fixed z-50 rounded-2xl shadow-2xl border overflow-hidden ${
          darkMode 
            ? 'bg-gray-950 border-gray-800' 
            : 'bg-white border-gray-200'
        }`}
        style={{
          top: position?.top || 80,
          left: position?.left || 20,
          minWidth: '280px',
          maxWidth: '320px'
        }}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          darkMode ? 'border-gray-800' : 'border-gray-200'
        }`}>
          <h2 className={`text-lg font-semibold ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>Settings</h2>
          <button
            className={`p-2 rounded-lg transition-colors ${
              darkMode 
                ? 'hover:bg-gray-800 text-gray-400' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Settings Content */}
        <div className="p-4 space-y-4">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                darkMode ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                {darkMode ? (
                  <Moon size={18} className="text-blue-400" />
                ) : (
                  <Sun size={18} className="text-yellow-600" />
                )}
              </div>
              <div>
                <h3 className={`font-medium ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>Dark Mode</h3>
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>Toggle dark theme</p>
              </div>
            </div>
            
            {/* Toggle Switch */}
            <button
              onClick={onDarkModeToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                darkMode ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {/* Additional Settings (Placeholder for future features) */}
          <div className={`pt-4 border-t ${
            darkMode ? 'border-gray-800' : 'border-gray-200'
          }`}>
            <p className={`text-sm text-center ${
              darkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>
              More settings coming soon...
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsMenu;
