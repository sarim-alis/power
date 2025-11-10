import React from "react";
import { NavLink } from "react-router-dom";
import logoImage from "../assets/logo.png";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useEffect, useState } from "react";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";
import { formatStoreName } from "../utils/formatStoreName";

export default function TopBar() {
  const authenticatedFetch = useAuthenticatedFetch();
  const [storeInfo, setStoreInfo] = useState(null);

  useEffect(() => {
    // Shopify App Bridge v4 automatically handles authentication with fetch
    const fetchStoreInfo = async () => {
      try {
        const response = await authenticatedFetch('/api/store/info', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // Check if response is ok
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', response.status, errorText);
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        // Check if response has content
        const text = await response.text();
        if (!text) {
          console.error('Empty response from server');
          throw new Error('Empty response from server');
        }

        const data = JSON.parse(text);
        console.log('Store Info:', data);
        // Format store name: "reviews-sum-test-store" → "Review Sum Test Store"
        const formattedName = formatStoreName(data.storeInfo.name);
        setStoreInfo(formattedName);
      } catch (error) {
        console.error('Error fetching store info:', error);
        // Don't show error to user if it's just a network issue
        if (error.message && !error.message.includes('Failed to fetch')) {
          console.error('Error details:', error);
        }
      }
    };

    fetchStoreInfo();
  }, [authenticatedFetch]);

  return (
    <div className="w-full flex items-center justify-between border-l-5 border-button bg-white shadow-topbar px-4 py-3">
      {/* Left Section: Logo + Title */}
      <div className="flex gap-9">
        <div className="flex items-center gap-3">
          <img
            src={logoImage}
            alt="Shopify Logo"
            className="w-8 h-8 object-contain"
            style={{ width: "40px", height: "40px" }}
          />
          <h1 className="text-2xl font-semibold text-gray-800">
            {storeInfo || "Shop Dashboard"}
          </h1>
        </div>

        {/* Middle Section: Tabs */}
        <div className="flex items-center gap-6">
          <NavLink
            to="/sales"
            className={({ isActive }) =>
              `text-base font-medium transition-colors ${
                isActive
                  ? "text-button border-b-2 border-button pb-1"
                  : "text-gray-600 hover:text-gray-800"
              }`
            }
          >
            Sales
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `text-base font-medium transition-colors ${
                isActive
                  ? "text-button border-b-2 border-button pb-1"
                  : "text-gray-600 hover:text-gray-800"
              }`
            }
          >
            Products
          </NavLink>
        </div>
      </div>
      {/* Right Section: Icons */}
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <NotificationsIcon sx={{ fontSize: 24, color: "#4b5563" }} />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <MoreVertIcon sx={{ fontSize: 24, color: "#4b5563" }} />
        </button>
      </div>
    </div>
  );
}
