"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from "next/link";
import { Search, Menu, X, UserPlus, LogIn, User, LogOut, Home, BookOpen, ChevronDown, Heart, Snowflake } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/api/useAuth';
import { useTheme } from '@/hooks/useTheme';
import NotificationDropdown from '@/components/features/NotificationDropdown/NotificationDropdown';
import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { showToast } from "@/lib/utils/toast";

const Nav = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggle } = useTheme();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setShowMobileSearch(false);
    }
  };

  const toggleMobileSearch = () => {
    setShowMobileSearch(!showMobileSearch);
    if (!showMobileSearch) {
      setIsOpen(false);
    }
  };

  interface SearchEvent extends React.KeyboardEvent<HTMLInputElement> {}

  const handleSearch = (e: SearchEvent): void => {
    if (e.key === 'Enter') {
      router.push(`/main/manga?search=${encodeURIComponent(search)}`);
      setIsOpen(false);
      setShowMobileSearch(false);
    }
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <User className="w-4 h-4" />,
      label: <Link href="/main/profile">Profil</Link>,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogOut className="w-4 h-4" />,
      label: 'Chiqish',
      onClick: () => {
        logout();
        router.push('/');
        showToast("Muvaffaqiyatli chiqildi!", "success");
      },
    },
  ];

  return (
    <>
      {/* Fixed Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50
                  bg-gradient-to-r from-[#020617]/95 via-black/95 to-[#0b1120]/95
                  backdrop-blur-md border-b border-[#1f2937]
                  shadow-[0_0_25px_rgba(56,189,248,0.35)]
                  transition-all duration-300 w-full"
        style={{ imageRendering: 'crisp-edges', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
      >

        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-1.5 sm:py-3">

          {/* Main Row */}
          <div className="flex items-center">
            {/* Left Side - Logo */}
            {/* <div className="flex items-center flex-shrink-0">
              <Link href="/main" className="flex items-center group">
                <img 
                  src="/images/logo.png" 
                  alt="Topmanga Logo" 
                  className="h-8 sm:h-10 md:h-12 w-auto group-hover:scale-105 transition-transform"
                  style={{ imageRendering: 'crisp-edges', imageRendering: '-webkit-optimize-contrast' }}
                />
              </Link>
            </div> */}
            <div className="flex items-center flex-shrink-0">
              <Link href="/main" className="flex items-center group relative">
                {/* Logo + Santa shapkasi */}
                <div className="relative">
                  <img
                    src="/images/logo.png"
                    alt="Topmanga Logo"
                    className="h-8 sm:h-10 md:h-12 w-auto group-hover:scale-105 transition-transform"
                    style={{ imageRendering: 'crisp-edges', imageRendering: '-webkit-optimize-contrast' }}
                  />
                  {/* 🎅 Santa hat – emoji-based, rasmsiz */}
                  <span className="absolute -top-2 -right-1 text-xl sm:text-2xl rotate-12 drop-shadow-[0_0_6px_rgba(0,0,0,0.6)]">
                    🎅
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1 ml-8">
              <Link 
                href="/main" 
                className={`flex items-center px-3 py-2 hover:bg-[#1a1a1a] rounded-md transition-all duration-200 font-medium ${pathname === '/main' ? 'text-[#ff9900] bg-[#1a1a1a]' : 'text-[#a0a0a0] hover:text-[#ff9900]'}`}
              >
                <Home className="w-5 h-5 mr-2" />
                <span>Bosh sahifa</span>
              </Link>
              <Link 
                href="/main/manga" 
                className={`flex items-center px-3 py-2 hover:bg-[#1a1a1a] rounded-md transition-all duration-200 font-medium ${pathname.includes('/main/manga') ? 'text-[#ff9900] bg-[#1a1a1a]' : 'text-[#a0a0a0] hover:text-[#ff9900]'}`}
              >
                <BookOpen className="w-5 h-5 mr-2" />
                <span>Katalog</span>
              </Link>
              {isAuthenticated && (
                <Link 
                  href="/main/favorites" 
                  className={`flex items-center px-3 py-2 hover:bg-[#1a1a1a] rounded-md transition-all duration-200 font-medium ${pathname.includes('/main/favorites') ? 'text-[#ff9900] bg-[#1a1a1a]' : 'text-[#a0a0a0] hover:text-[#ff9900]'}`}
                >
                  <Heart className="w-5 h-5 mr-2" />
                  <span>Sevimlilar</span>
                </Link>
              )}

            </div>

            {/* Search Bar - md va undan katta ekranlar uchun */}
            <div className="hidden lg:flex items-center flex-1 mx-4">
              <div className="relative w-full max-w-md ml-auto group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-[#a0a0a0] group-focus-within:text-[#ff9900] transition-colors" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleSearch}
                  className="w-full py-2.5 pl-10 pr-4 bg-[#121212] border border-[#1a1a1a] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff9900]/50 focus:border-[#ff9900] text-white text-sm placeholder-[#666] hover:border-[#333] transition-all duration-200 shadow-sm"
                  placeholder="Manga, manhva qidirish..."
                  style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility' }}
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#a0a0a0] hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Search Bar - md va undan kichik ekranlar uchun (to'liq kenglikda) */}
            <div className="flex lg:hidden items-center flex-1 mx-2 sm:mx-3">
              <div className="relative w-full group">
                {/* Search icon */}
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
                  <Search className="w-4 h-4 text-[#a0a0a0]" />
                </div>

                {/* Fake moving placeholder */}
                {!search && (
                  <div className="absolute inset-y-0 left-10 right-4 flex items-center overflow-hidden pointer-events-none">
                    <div className="animate-marquee whitespace-nowrap text-sm text-[#666]">
                      Tezkor qidiruv...
                    </div>
                  </div>
                )}

                {/* Real input */}
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleSearch}
                  className="w-full py-1 sm:py-1.5 pl-10 pr-4 bg-[#121212] border border-[#1a1a1a] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff9900]/50 focus:border-[#ff9900] text-white text-sm placeholder-transparent hover:border-[#333] transition-all duration-200 shadow-sm"
                  placeholder=""
                />

                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#a0a0a0] hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>


            {/* Right Side - User Actions and Controls */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Desktop - Notifications va User Menu */}
              <div className="hidden lg:flex items-center space-x-2">
                {isAuthenticated && (
                  <NotificationDropdown />
                )}
                
                {!isAuthenticated ? (
                  <>
                    <Link 
                      href="/auth/login" 
                      className="flex items-center px-3 py-2 text-[#a0a0a0] hover:text-[#ff9900] hover:bg-[#1a1a1a] rounded-md transition-all duration-200 text-sm font-medium"
                    >
                      <LogIn className="w-5 h-5 mr-2" />
                      <span>Kirish</span>
                    </Link>
                    <Link 
                      href="/auth/register" 
                      className="flex items-center bg-gradient-to-r from-[#ff9900] to-[#ff6600] text-white px-3 py-2 rounded-md font-medium hover:from-[#ff6600] hover:to-[#ff9900] transition-all duration-200 text-sm shadow-lg"
                    >
                      <UserPlus className="w-5 h-5 mr-2" />
                      <span>Ro'yxatdan o'tish</span>
                    </Link>
                  </>
                ) : (
                  <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                    <button className="flex items-center px-3 py-2 text-[#a0a0a0] hover:text-[#ff9900] hover:bg-[#1a1a1a] rounded-md transition-all duration-200 text-sm font-medium group">
                      <User className="w-5 h-5 mr-2" />
                      <span className="max-w-20 lg:max-w-24 truncate">
                        {user?.username || user?.email || 'Foydalanuvchi'}
                      </span>
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </button>
                  </Dropdown>
                )}
              </div>

              {/* Mobile/Tablet - Notifications, Kirish va Menu */}
              <div className="flex lg:hidden items-center space-x-1">
                {/* Notifications icon - faqat authenticated bo'lsa */}
                {isAuthenticated && <NotificationDropdown />}

                {/* Kirish – faqat guestlar uchun */}
                {!isAuthenticated && (
                  <Link 
                      href="/auth/login" 
                      className="flex bg-[#ff9900] text-black text-sm font-medium px-3 py-1.5 rounded-md hover:bg-[#e68a00] transition-colors"
                    >
                      <LogIn className="w-5 h-5 mr-2" />
                      <span>Kirish</span>
                    </Link>
                )}

                {/* Menu tugmasi */}
                <button 
                  onClick={toggleMenu} 
                  className={`p-2 rounded-md transition-all duration-200 ${
                    isOpen 
                      ? 'bg-[#ff9900] text-white' 
                      : 'text-[#a0a0a0] hover:text-[#ff9900] hover:bg-[#1a1a1a]'
                  }`}
                >
                  {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Mobile Menu */}
        {isMounted && isOpen && (
          <div className="lg:hidden bg-[#0a0a0a]/95 backdrop-blur-md border-t border-[#1a1a1a] shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="max-w-7xl mx-auto px-3 py-4">
              <div className="flex flex-col space-y-1">
                <Link 
                  href="/main" 
                  className={`flex items-center px-3 py-3 hover:bg-[#1a1a1a] rounded-md transition-all duration-200 font-medium ${pathname === '/main' ? 'text-[#ff9900] bg-[#1a1a1a]' : 'text-[#a0a0a0] hover:text-[#ff9900]'}`}
                  onClick={() => setIsOpen(false)}
                >
                  <Home className="w-5 h-5 mr-3" />
                  <span>Bosh sahifa</span>
                </Link>
                <Link 
                  href="/main/manga" 
                  className={`flex items-center px-3 py-3 hover:bg-[#1a1a1a] rounded-md transition-all duration-200 font-medium ${pathname.includes('/main/manga') ? 'text-[#ff9900] bg-[#1a1a1a]' : 'text-[#a0a0a0] hover:text-[#ff9900]'}`}
                  onClick={() => setIsOpen(false)}
                >
                  <BookOpen className="w-5 h-5 mr-3" />
                  <span>Katalog</span>
                </Link>
                {isAuthenticated && (
                  <Link 
                    href="/main/favorites" 
                    className={`flex items-center px-3 py-3 hover:bg-[#1a1a1a] rounded-md transition-all duration-200 font-medium ${pathname.includes('/main/favorites') ? 'text-[#ff9900] bg-[#1a1a1a]' : 'text-[#a0a0a0] hover:text-[#ff9900]'}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Heart className="w-5 h-5 mr-3" />
                    <span>Sevimlilar</span>
                  </Link>
                )}
       
                
                <div className="border-t border-[#1a1a1a] my-2"></div>
                
                {!isAuthenticated ? (
                  <>
                    <Link 
                      href="/auth/login" 
                      className="flex items-center px-3 py-3 text-[#a0a0a0] hover:text-[#ff9900] hover:bg-[#1a1a1a] rounded-md transition-all duration-200 font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      <LogIn className="w-5 h-5 mr-3" />
                      <span>Kirish</span>
                    </Link>
                    <Link 
                      href="/auth/register" 
                      className="flex items-center px-3 py-3 bg-gradient-to-r from-[#ff9900] to-[#ff6600] text-white rounded-md font-medium hover:from-[#ff6600] hover:to-[#ff9900] transition-all duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      <UserPlus className="w-5 h-5 mr-3" />
                      <span>Ro'yxatdan o'tish</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/main/profile"
                      className="flex items-center px-3 py-3 text-[#a0a0a0] hover:text-[#ff9900] hover:bg-[#1a1a1a] rounded-md transition-all duration-200 font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="w-5 h-5 mr-3" />
                      <span>Profil</span>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        router.push('/');
                        showToast("Muvaffaqiyatli chiqildi!", "success");
                        setIsOpen(false);
                      }}
                      className="flex items-center px-3 py-3 text-[#a0a0a0] hover:text-[#ff9900] hover:bg-[#1a1a1a] rounded-md transition-all duration-200 font-medium w-full text-left"
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      <span>Chiqish</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
            </nav>

      {/* Mobile bottom navigation (faqat telefon/planshetlarda) */}
      {isMounted && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 border-t border-[#1a1a1a] lg:hidden">
          <div className="max-w-7xl mx-auto px-2">
            <div className="grid grid-cols-4">
              {/* Bosh sahifa */}
              <Link
                href="/main"
                className={`flex flex-col items-center justify-center py-2 ${
                  pathname === "/main"
                    ? "text-[#ff9900]"
                    : "text-[#a0a0a0]"
                }`}
              >
                <Home className="w-5 h-5 mb-0.5" />
                <span className="text-[11px] leading-none">Bosh sahifa</span>
              </Link>

              {/* Katalog */}
              <Link
                href="/main/manga"
                className={`flex flex-col items-center justify-center py-2 ${
                  pathname.includes("/main/manga")
                    ? "text-[#ff9900]"
                    : "text-[#a0a0a0]"
                }`}
              >
                <BookOpen className="w-5 h-5 mb-0.5" />
                <span className="text-[11px] leading-none">Katalog</span>
              </Link>

              {/* Sevimlilar – faqat tizimga kirgan bo‘lsa */}
              {isAuthenticated ? (
                <Link
                  href="/main/favorites"
                  className={`flex flex-col items-center justify-center py-2 ${
                    pathname.includes("/main/favorites")
                      ? "text-[#ff9900]"
                      : "text-[#a0a0a0]"
                  }`}
                >
                  <Heart className="w-5 h-5 mb-0.5" />
                  <span className="text-[11px] leading-none">Sevimlilar</span>
                </Link>
              ) : (
                // Agar kirmagan bo‘lsa, bosganda login sahifasiga olib boramiz
                <Link
                  href="/auth/login"
                  className="flex flex-col items-center justify-center py-2 text-[#a0a0a0]"
                >
                  <Heart className="w-5 h-5 mb-0.5" />
                  <span className="text-[11px] leading-none">Sevimlilar</span>
                </Link>
              )}

              {/* Profil – login bo‘lmasa login sahifasiga olib boradi */}
              <Link
                href={isAuthenticated ? "/main/profile" : "/auth/login"}
                className={`flex flex-col items-center justify-center py-2 ${
                  pathname.includes("/main/profile")
                    ? "text-[#ff9900]"
                    : "text-[#a0a0a0]"
                }`}
              >
                <User className="w-5 h-5 mb-0.5" />
                <span className="text-[11px] leading-none">Profil</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Spacer to prevent content from being hidden under fixed navbar (top + bottom) */}
      {/* Faqat yuqori nav uchun bo'sh joy – biroz kichikroq qildik */}
    <div className="h-[50px] md:h-[50px]" />
    <div className="h-[px] md:h-0" />


    </>
  );
};


export default Nav;