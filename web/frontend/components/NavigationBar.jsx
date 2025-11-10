import React from 'react'
import { NavLink } from 'react-router-dom'
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import ChatIcon from '@mui/icons-material/Chat';
import InfoIcon from '@mui/icons-material/Info';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupIcon from '@mui/icons-material/Group';
import SettingsIcon from '@mui/icons-material/Settings';

export default function NavigationBar() {
  return (
    <div className='w-full'>
      <ul className='flex flex-col justify-center py-1'>
        <li title='Home' className='w-full'>
          <NavLink 
            to="/" 
            className={({isActive}) => 
              `block text-center py-4 no-underline transition-all duration-200 ${
                isActive 
                  ? "bg-graylight border-button" 
                  : "hover:bg-graylight"
              }`
            }
          > 
            {({ isActive }) => (
              <HomeIcon 
                className="mx-auto filter drop-shadow-[0px_0px_10px_#A9A9A9]"
                sx={{ 
                  fontSize: 24,
                  color: isActive ? '#008170' : '#000000'
                }} 
              />
            )}
          </NavLink>
        </li>
        
        <li title='Menu' className='w-full'>
          <NavLink 
            to="/menu" 
            className={({isActive}) => 
              `block text-center py-4 no-underline transition-all duration-200 ${
                isActive 
                  ? "bg-graylight border-r-4 border-button" 
                  : "hover:bg-graylight"
              }`
            }
          > 
            {({ isActive }) => (
              <MenuIcon 
                className="mx-auto filter drop-shadow-[0px_0px_10px_#A9A9A9]"
                sx={{ 
                  fontSize: 24,
                  color: isActive ? '#008170' : '#000000'
                }} 
              />
            )}
          </NavLink>
        </li>
        
        <li title='Search' className='w-full'>
          <NavLink 
            to="/search" 
            className={({isActive}) => 
              `block text-center py-4 no-underline transition-all duration-200 ${
                isActive 
                  ? "bg-graylight border-r-4 border-button" 
                  : "hover:bg-graylight"
              }`
            }
          > 
            {({ isActive }) => (
              <SearchIcon 
                className="mx-auto filter drop-shadow-[0px_0px_10px_#A9A9A9]"
                sx={{ 
                  fontSize: 24,
                  color: isActive ? '#008170' : '#000000'
                }} 
              />
            )}
          </NavLink>
        </li>
        
        <li title='Chat' className='w-full'>
          <NavLink 
            to="/chat" 
            className={({isActive}) => 
              `block text-center py-4 no-underline transition-all duration-200 ${
                isActive 
                  ? "bg-graylight border-r-4 border-button" 
                  : "hover:bg-graylight"
              }`
            }
          > 
            {({ isActive }) => (
              <ChatIcon 
                className="mx-auto filter drop-shadow-[0px_0px_10px_#A9A9A9]"
                sx={{ 
                  fontSize: 24,
                  color: isActive ? '#008170' : '#000000'
                }} 
              />
            )}
          </NavLink>
        </li>
        
        <li title='About us' className='w-full'>
          <NavLink 
            to="/about" 
            className={({isActive}) => 
              `block text-center py-4 no-underline transition-all duration-200 ${
                isActive 
                  ? "bg-graylight border-r-4 border-button" 
                  : "hover:bg-graylight"
              }`
            }
          > 
            {({ isActive }) => (
              <InfoIcon 
                className="mx-auto filter drop-shadow-[0px_0px_10px_#A9A9A9]"
                sx={{ 
                  fontSize: 24,
                  color: isActive ? '#008170' : '#000000'
                }} 
              />
            )}
          </NavLink>
        </li>
        
        <li title='Graphs' className='w-full'>
          <NavLink 
            to="/graph" 
            className={({isActive}) => 
              `block text-center py-4 no-underline transition-all duration-200 ${
                isActive 
                  ? "bg-graylight border-r-4 border-button" 
                  : "hover:bg-graylight"
              }`
            }
          > 
            {({ isActive }) => (
              <BarChartIcon 
                className="mx-auto filter drop-shadow-[0px_0px_10px_#A9A9A9]"
                sx={{ 
                  fontSize: 24,
                  color: isActive ? '#008170' : '#000000'
                }} 
              />
            )}
          </NavLink>
        </li>
        
        <li title='Statistics' className='w-full'>
          <NavLink 
            to="/statistics" 
            className={({isActive}) => 
              `block text-center py-4 no-underline transition-all duration-200 ${
                isActive 
                  ? "bg-graylight border-r-4 border-button" 
                  : "hover:bg-graylight"
              }`
            }
          > 
            {({ isActive }) => (
              <TrendingUpIcon 
                className="mx-auto filter drop-shadow-[0px_0px_10px_#A9A9A9]"
                sx={{ 
                  fontSize: 24,
                  color: isActive ? '#008170' : '#000000'
                }} 
              />
            )}
          </NavLink>
        </li>
        
        <li title='Users' className='w-full'>
          <NavLink 
            to="/user" 
            className={({isActive}) => 
              `block text-center py-4 no-underline transition-all duration-200 ${
                isActive 
                  ? "bg-graylight border-r-4 border-button" 
                  : "hover:bg-graylight"
              }`
            }
          > 
            {({ isActive }) => (
              <GroupIcon 
                className="mx-auto filter drop-shadow-[0px_0px_10px_#A9A9A9]"
                sx={{ 
                  fontSize: 24,
                  color: isActive ? '#008170' : '#000000'
                }} 
              />
            )}
          </NavLink>
        </li>
        
        <li title='Settings' className='w-full'>
          <NavLink 
            to="/settings" 
            className={({isActive}) => 
              `block text-center py-4 no-underline transition-all duration-200 ${
                isActive 
                  ? "bg-graylight border-r-4 border-button" 
                  : "hover:bg-graylight"
              }`
            }
          > 
            {({ isActive }) => (
              <SettingsIcon 
                className="mx-auto filter drop-shadow-[0px_0px_10px_#A9A9A9]"
                sx={{ 
                  fontSize: 24,
                  color: isActive ? '#008170' : '#000000'
                }} 
              />
            )}
          </NavLink>
        </li>
      </ul>
    </div>
  );
}
