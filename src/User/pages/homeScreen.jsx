import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Heart,
  Home,
  Calendar,
  Bell,
  User
} from 'lucide-react';


const UserHomeScreen = () => {
  const [activeTab, setActiveTab] = useState('All room');
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Search Bar */}
      <div className="px-4 py-3 w-full max-w-5xl mx-auto">
        <div className="relative">
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-3">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Where are you going?"
              className="flex-1 bg-transparent text-gray-600 placeholder-gray-400 outline-none"
            />
          </div>
          <button className="absolute right-2 top-2 bg-black text-white rounded-full px-4 py-2 flex items-center space-x-1">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm">Filter</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 mb-4 w-full max-w-5xl mx-auto">
        <div className="flex flex-wrap gap-2">
          {['All room', 'Available room'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Room Card */}
      <div className="flex-1 px-4 w-full max-w-5xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
          <div className="relative h-60 bg-gray-200 flex items-center justify-center">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="absolute top-3 right-3 p-2"
            >
              <Heart
                className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`}
              />
            </button>
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg">iOURI Room</h3>
              <div className="flex items-center space-x-1">
                <span className="text-yellow-400">★</span>
                <span className="text-sm text-gray-600">4.95</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
              <span>Meeting room</span>
              <span>•</span>
              <span>Floor 2</span>
            </div>

            <div className="flex items-center space-x-1 mb-3">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm text-red-500">Unavailable Now</span>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              This room is equipped with all the necessary equipment for lectures, these rooms are negotiable.
            </p>
          </div>
        </div>

        <div className="relative rounded-lg overflow-hidden mb-6">
          <div className="h-64 bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-center relative">
            <button className="absolute top-3 right-3 p-2">
              <Heart className="w-5 h-5 text-white" />
            </button>
            <div className="text-center">
              <div className="text-white text-6xl font-bold mb-2">DO</div>
              <div className="text-white text-2xl">GOOD</div>
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <div className="w-2 h-2 bg-white/50 rounded-full"></div>
              <div className="w-2 h-2 bg-white/50 rounded-full"></div>
              <div className="w-2 h-2 bg-white/50 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
          
      
    </div>
  );
};

export default UserHomeScreen;
