import React, { useState } from 'react';
import {
  Compass,
  Layers,
  Sparkles,
  Bookmark,
  Search,
  BookOpen,
  Menu,
  X,
  MapPin
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { NexlabLogo } from './NexlabLogo';

export type ActiveTab = 'explore' | 'library' | 'categories' | 'free' | 'paths' | 'ai' | 'dashboard';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSearchModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSearchModal
}) => {
  const { state } = useLibrary();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const savedCount = state.savedBookIds.length;
  const readingCount = Object.values(state.readingStatus).filter(r => r.status === 'reading').length;

  const navLinks: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'free', label: 'Free Library', icon: BookOpen },
    { id: 'paths', label: 'Reading Paths', icon: MapPin },
    { id: 'ai', label: 'NEXLAB AI', icon: Sparkles }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-xl border-b border-zinc-200/80 transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Wordmark */}
        <div
          onClick={() => setActiveTab('explore')}
          className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
        >
          {/* Vermilion Ribbon-Book Logo Icon */}
          <div className="p-1 rounded-xl bg-zinc-50 border border-zinc-200 group-hover:border-[#FF3700]/50 group-hover:bg-[#FF3700]/5 transition-all duration-300 shadow-xs">
            <NexlabLogo className="w-7 h-7 group-hover:scale-105 transition-transform duration-300" glow={false} />
          </div>

          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-zinc-950 group-hover:text-[#FF3700] transition-colors font-sans">
              NEXLAB
            </span>
            <span className="text-[9px] font-mono tracking-wider uppercase text-zinc-600 -mt-1 hidden sm:block">
              Knowledge · Library
            </span>
          </div>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`relative text-xs lg:text-sm font-semibold tracking-[-0.01em] transition-all duration-200 cursor-pointer flex items-center gap-1.5 py-1 ${
                  isActive
                    ? 'text-[#FF3700]'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-[#FF3700]' : 'text-zinc-600'}`} />
                <span>{label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF3700] rounded-full shadow-[0_0_8px_rgba(255,55,0,0.4)]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Side: Quick Search, Library Badge, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search Shortcut Trigger */}
          <button
            onClick={onOpenSearchModal}
            className="hidden sm:inline-flex items-center gap-2 py-1.5 px-3 rounded-xl bg-zinc-100/80 hover:bg-zinc-100 border border-zinc-200 hover:border-[#FF3700]/40 text-xs font-bold text-zinc-700 hover:text-zinc-950 transition-all cursor-pointer"
            title="Search books (Ctrl/Cmd + K)"
          >
            <Search className="w-3.5 h-3.5 text-[#FF3700]" />
            <span>Search</span>
            <kbd className="hidden lg:inline text-[10px] font-mono font-semibold text-zinc-600 bg-white px-1.5 py-0.5 rounded border border-zinc-200 shadow-2xs">
              ⌘K
            </kbd>
          </button>

          {/* My Library Button */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[#FF3700] text-white border-[#FF3700] shadow-md shadow-[#FF3700]/25'
                : 'bg-white hover:bg-zinc-50 text-zinc-800 border-zinc-200 hover:border-zinc-300'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${activeTab === 'dashboard' ? 'text-white' : 'text-[#FF3700]'}`} />
            <span>Library</span>
            {(savedCount > 0 || readingCount > 0) && (
              <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-full border ${
                activeTab === 'dashboard'
                  ? 'bg-white/20 text-white border-white/30'
                  : 'bg-[#FF3700]/10 text-[#FF3700] border-[#FF3700]/20'
              }`}>
                {savedCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-[#FF3700]/30 text-xs text-zinc-800 font-semibold transition-colors cursor-pointer"
            title="View Profile & Dashboard"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#FF3700] to-[#E62800] border border-white/20 flex items-center justify-center text-[10px] font-mono font-bold text-white shadow-xs">
              {state.profile.name.charAt(0)}
            </div>
            <span className="hidden xl:inline text-xs text-zinc-800 font-semibold truncate max-w-[100px]">
              {state.profile.name.split(' ')[0]}
            </span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-700 hover:text-zinc-950 rounded-xl transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-zinc-200 px-4 py-4 space-y-2 animate-in slide-in-from-top duration-200 shadow-lg">
          <div className="space-y-1">
            {navLinks.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === id
                    ? 'bg-[#FF3700]/10 text-[#FF3700] border border-[#FF3700]/25'
                    : 'text-zinc-800 hover:bg-zinc-50'
                }`}
              >
                <Icon className="w-4 h-4 text-[#FF3700]" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
            <button
              onClick={() => {
                onOpenSearchModal();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-zinc-50 text-xs font-bold text-zinc-800 border border-zinc-200 hover:border-[#FF3700]/40 transition-colors"
            >
              <Search className="w-4 h-4 text-[#FF3700]" />
              <span>Intelligent Search</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
