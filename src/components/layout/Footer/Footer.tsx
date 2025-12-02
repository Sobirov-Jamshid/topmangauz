"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Github, Smartphone, Mail, Globe, Heart, MessageCircle } from 'lucide-react';

const Footer = () => {
  const [currentYear, setCurrentYear] = useState('');

  useEffect(() => {
    setCurrentYear(new Date().getFullYear().toString());
  }, []);

  return (
    <footer className="bg-[#0a0a0a] border-t border-[#1a1a1a] mt-auto">
      <div className="container mx-auto py-8 px-4">
        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Logo and social */}
          <div>
            <img 
              src="/images/logo.png" 
              alt="Topmanga Logo" 
              className="h-8 w-auto mb-3"
            />
            <p className="text-[#a0a0a0] text-sm mb-4 leading-relaxed">
              Eng mashhur va qiziqarli manga, manhva va manhua'larni o'zbek tilida o'qing.
            </p>
            <div className="flex space-x-2">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
                className="h-8 w-8 flex items-center justify-center rounded-full bg-[#1a1a1a] hover:bg-[#ff9900] text-[#a0a0a0] hover:text-white transition-colors">
                <Facebook size={16} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" 
                className="h-8 w-8 flex items-center justify-center rounded-full bg-[#1a1a1a] hover:bg-[#ff9900] text-[#a0a0a0] hover:text-white transition-colors">
                <Twitter size={16} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" 
                className="h-8 w-8 flex items-center justify-center rounded-full bg-[#1a1a1a] hover:bg-[#ff9900] text-[#a0a0a0] hover:text-white transition-colors">
                <Instagram size={16} />
              </a>
              {/* Telegram icon qo'shildi */}
              <a href="https://t.me/TopMangaUz" target="_blank" rel="noopener noreferrer" 
                className="h-8 w-8 flex items-center justify-center rounded-full bg-[#1a1a1a] hover:bg-[#0088cc] text-[#a0a0a0] hover:text-white transition-colors">
                <img 
                  src="/images/tg.svg" 
                  alt="Topmanga Logo" 
                  className="h-6 w-6 text-[#ff9900] mr"
                />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-white text-sm font-semibold mb-3">Navigatsiya</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/main" className="text-[#a0a0a0] hover:text-[#ff9900] transition-colors text-sm">
                    Bosh sahifa
                  </Link>
                </li>
                <li>
                  <Link href="/main/manga" className="text-[#a0a0a0] hover:text-[#ff9900] transition-colors text-sm">
                    Katalog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white text-sm font-semibold mb-3">Janrlar</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/main/manga?genre=action" className="text-[#a0a0a0] hover:text-[#ff9900] transition-colors text-sm">
                    Jang
                  </Link>
                </li>
                <li>
                  <Link href="/main/manga?genre=romance" className="text-[#a0a0a0] hover:text-[#ff9900] transition-colors text-sm">
                    Romantika
                  </Link>
                </li>
                <li>
                  <Link href="/main/manga?genre=fantasy" className="text-[#a0a0a0] hover:text-[#ff9900] transition-colors text-sm">
                    Fantaziya
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-3">Aloqa</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-sm">
                <Mail className="w-4 h-4 text-[#ff9900] mr-2" />
                <a href="mailto:info@Topmanga.uz" className="text-[#a0a0a0] hover:text-[#ff9900] transition-colors">
                  info@Topmanga.uz
                </a>
              </li>
              {/* Telegram aloqa qo'shildi */}
              <li className="flex items-center text-sm">
                <img 
                  src="/images/tg.svg" 
                  alt="Topmanga Logo" 
                  className="h-4 w-4 text-[#ff9900] mr-2"
                />
                <a href="https://t.me/TopMangaUz" target="_blank" rel="noopener noreferrer" 
                   className="text-[#a0a0a0] hover:text-[#0088cc] transition-colors">
                   Telegram
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        {/* <div className="border-t border-[#1a1a1a] pt-4 flex flex-col sm:flex-row items-center justify-between text-xs">
          <p className="text-[#a0a0a0] text-center sm:text-left mb-2 sm:mb-0">
            © {currentYear || '2025'} Topmanga. Barcha huquqlar himoyalangan.
          </p>
          <div className="flex items-center text-[#a0a0a0]">
            <span>Sevgi bilan yaratilgan</span>
            <Heart className="w-3 h-3 mx-1 text-[#ff9900]" />
            <span>O'zbekistonda</span>
          </div>
        </div> */}
      </div>
    </footer>
  );
};

export default Footer;