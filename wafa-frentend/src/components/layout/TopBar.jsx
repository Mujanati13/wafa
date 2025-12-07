import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Menu, Sun, Moon, Bell, Search, X, BookOpen, FileText, Trophy, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import logoImage from "@/assets/logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import NotificationDropdown from "./NotificationDropdown";
import { userService } from "@/services/userService";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";

const TopBar = ({ onMenuClick, sidebarOpen }) => {
  const { t } = useTranslation(['dashboard', 'common']);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [user, setUser] = useState(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await userService.getUserProfile();
        setUser(userData);
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

  // Define searchable items
  const searchableItems = [
    // Pages
    { type: 'page', title: t('dashboard:dashboard'), icon: BookOpen, path: '/dashboard/home', description: t('dashboard:dashboard') },
    { type: 'page', title: t('dashboard:exams'), icon: FileText, path: '/dashboard/exams', description: t('dashboard:exams') },
    { type: 'page', title: t('dashboard:results'), icon: Trophy, path: '/dashboard/results', description: t('dashboard:results') },
    { type: 'page', title: t('dashboard:leaderboard'), icon: Trophy, path: '/dashboard/leaderboard', description: t('dashboard:leaderboard') },
    { type: 'page', title: t('dashboard:profile'), icon: User, path: '/dashboard/profile', description: t('dashboard:profile') },
    { type: 'page', title: t('dashboard:settings'), icon: User, path: '/dashboard/settings', description: t('dashboard:settings') },
    { type: 'page', title: t('dashboard:subscription'), icon: User, path: '/dashboard/subscription', description: t('dashboard:subscription') },
    { type: 'page', title: t('dashboard:my_playlists'), icon: BookOpen, path: '/dashboard/playlist', description: t('dashboard:my_playlists') },
    { type: 'page', title: t('dashboard:my_notes'), icon: FileText, path: '/dashboard/note', description: t('dashboard:my_notes') },
  ];

  // Get modules from localStorage and filter by user's semesters
  useEffect(() => {
    const storedModules = localStorage.getItem('modules');
    const storedUser = localStorage.getItem('user');
    
    let userSemesters = [];
    let userPlan = "Free";
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        userSemesters = userData.semesters || [];
        userPlan = userData.plan || "Free";
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    // Also use the fetched user data if available
    if (user?.semesters) {
      userSemesters = user.semesters;
    }
    if (user?.plan) {
      userPlan = user.plan;
    }

    if (storedModules) {
      try {
        const modules = JSON.parse(storedModules);
        // Filter modules based on user's subscribed semesters
        const filteredModules = modules.filter(module => {
          // If user has semesters defined, use those
          if (userSemesters && userSemesters.length > 0) {
            return userSemesters.includes(module.semester);
          }
          // For Free plan users with no semesters set, give access to S1 by default
          if (userPlan === "Free" || !userPlan) {
            return module.semester === "S1";
          }
          return false;
        });
        const moduleItems = filteredModules.map(module => ({
          type: 'module',
          title: module.name,
          icon: BookOpen,
          path: `/dashboard/subjects/${module._id}`,
          description: `Module - ${module.semester}`
        }));
        setSearchResults([...searchableItems, ...moduleItems]);
      } catch (error) {
        setSearchResults(searchableItems);
      }
    } else {
      setSearchResults(searchableItems);
    }
  }, [user]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && filteredResults.length > 0) {
      // Navigate to first result
      navigate(filteredResults[0].path);
      setSearchQuery("");
      setShowSearchResults(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchResults(value.trim().length > 0);
  };

  const handleResultClick = (path) => {
    navigate(path);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  const filteredResults = searchQuery.trim()
    ? searchResults.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm h-16">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <div className="flex items-center gap-4">
          {/* Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="flex-shrink-0"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo */}
          <img src={logoImage} alt="WAFA Logo" className="h-10 w-auto flex-shrink-0" />

          {/* Search Bar - Compact */}
          <div ref={searchRef} className="relative hidden md:block">
            <form onSubmit={handleSearch} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-200 focus-within:border-blue-500 focus-within:bg-white transition-all w-64">
              <Search className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <Input
                type="text"
                placeholder={t('common:search')}
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto text-sm flex-1"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setShowSearchResults(false);
                  }}
                  className="flex-shrink-0 hover:bg-slate-200 rounded p-0.5 transition-colors"
                >
                  <X className="h-3 w-3 text-slate-500" />
                </button>
              )}
            </form>

            {/* Search Results Dropdown */}
            {showSearchResults && filteredResults.length > 0 && createPortal(
              <div className="fixed mt-2 w-96" style={{
                top: '4rem',
                left: searchRef.current?.getBoundingClientRect().left,
                zIndex: 9999
              }}>
                <Card className="bg-white border border-slate-200 shadow-2xl">
                  <div className="max-h-[500px] overflow-y-auto">
                    <CardContent className="p-2">
                      {filteredResults.map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={index}
                            onClick={() => handleResultClick(item.path)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors text-left group"
                          >
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">
                                {item.title}
                              </p>
                              {item.description && (
                                <p className="text-xs text-slate-500 truncate">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <Badge variant="secondary" className="text-xs flex-shrink-0">
                              {item.type === 'module' ? t('dashboard:module') : t('dashboard:page')}
                            </Badge>
                          </button>
                        );
                      })}
                    </CardContent>
                  </div>
                </Card>
              </div>,
              document.body
            )}

            {showSearchResults && filteredResults.length === 0 && searchQuery.trim() && createPortal(
              <div className="fixed mt-2 w-96" style={{
                top: '4rem',
                left: searchRef.current?.getBoundingClientRect().left,
                zIndex: 9999
              }}>
                <Card className="bg-white border border-slate-200 shadow-2xl">
                  <CardContent className="p-8 text-center">
                    <Search className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-900 mb-1">{t('common:no_results')}</p>
                    <p className="text-xs text-slate-500">{t('common:try_different_keywords')}</p>
                  </CardContent>
                </Card>
              </div>,
              document.body
            )}
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle theme"
          >
            {darkMode ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-blue-600" />
            )}
          </Button>

          {/* Notifications */}
          <NotificationDropdown />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.profilePicture} alt={user?.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-teal-500 text-white">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 max-h-[400px] overflow-y-auto" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || t('common:user')}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || ''}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>
                {t('dashboard:profile')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
                {t('dashboard:settings')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/dashboard/subscription")}>
                {t('dashboard:subscription')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
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
