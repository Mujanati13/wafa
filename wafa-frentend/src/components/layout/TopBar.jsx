import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Menu, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import NotificationDropdown from "./NotificationDropdown";
import { userService } from "@/services/userService";

const TopBar = ({ onMenuClick, sidebarOpen }) => {
  const { t } = useTranslation(['dashboard', 'common']);
  const [user, setUser] = useState(() => {
    // Initialize from localStorage for instant display
    const cached = localStorage.getItem('userProfile');
    return cached ? JSON.parse(cached) : null;
  });
  const navigate = useNavigate();

  // Fetch user profile on mount (force refresh to get latest data)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Force refresh on component mount to ensure we have latest data
        const userData = await userService.getUserProfile(true);
        setUser(userData);
        // Sync both localStorage keys
        localStorage.setItem('userProfile', JSON.stringify(userData));
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (error) {
        console.error('Failed to fetch user in TopBar:', error);
      }
    };
    fetchUser();
  }, []);

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const parts = user.name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    // Clear all auth and user data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userProfile");
    userService.clearProfileCache();
    navigate("/login");
  };

  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm h-14 sm:h-16">
      <div className="flex items-center justify-between h-full px-3 sm:px-4 md:px-6 gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          {/* Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10"
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          {/* Logo - Hidden on mobile, visible on sm and up */}
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-bold text-gray-900 leading-none">WAFA</span>
              <span className="text-xs text-gray-500">v1.1</span>
            </div>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Notifications */}
          <NotificationDropdown />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full p-0">
                <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
                  <AvatarImage src={user?.profilePicture?.startsWith('http') ? user.profilePicture : user?.profilePicture ? `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}${user.profilePicture}` : undefined} alt={user?.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-teal-500 text-white">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-60 sm:w-64 max-h-[400px] overflow-y-auto" align="end" forceMount>
              <DropdownMenuLabel className="font-normal p-3 sm:p-4">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm sm:text-base font-semibold leading-none">{user?.name || t('common:user')}</p>
                  <p className="text-xs sm:text-sm leading-none text-muted-foreground truncate">
                    {user?.email || ''}
                  </p>
                  {/* User Stats Row */}
                  <div className="flex items-center gap-2 sm:gap-3 pt-2 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">⚡</span>
                      <span className="font-medium">{user?.totalPoints || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">⭐</span>
                      <span className="font-medium">{user?.stars || 0}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 flex-shrink-0">
                      {user?.totalPoints || 0} pts
                    </Badge>
                  </div>
                  {/* Level and Progress */}
                  <div className="pt-2 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">Niveau {Math.floor((user?.totalPoints || 0) / 50)}</span>
                      <span className="text-slate-500">{((user?.totalPoints || 0) % 50)}/50 XP</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(((user?.totalPoints || 0) % 50) / 50) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-500">
                      {user?.percentageAnswered ? `${user.percentageAnswered.toFixed(1)}% répondues` : '0% répondues'}
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/dashboard/profile")} className="cursor-pointer">
                {t('dashboard:profile')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/dashboard/settings")} className="cursor-pointer">
                {t('dashboard:settings')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/dashboard/subscription")} className="cursor-pointer">
                {t('dashboard:subscription')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                {t('common:logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
