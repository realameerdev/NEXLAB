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
  MapPin,
  Upload
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { NexlabLogo } from './NexlabLogo';

export type ActiveTab = 'explore' | 'library' | 'categories' | 'free' | 'paths' | 'ai' | 'dashboard';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSearchModal: () => void;
  onOpenUploadModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSearchModal,
  onOpenUploadModal
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

        {/* Right Side: Quick Search, Upload Book, My Library */}
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

          {/* Upload Book Frontend Action */}
          <button
            onClick={onOpenUploadModal}
            className="inline-flex items-center gap-1.5 py-1.5 px-3 sm:px-3.5 rounded-xl bg-[#FF3700] hover:bg-[#E53100] text-white border border-[#FF3700] text-xs font-bold shadow-md shadow-[#FF3700]/25 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            title="Upload Ebook (No account required)"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload Book</span>
            <span className="sm:hidden">Upload</span>
          </button>

          {/* My Library Button */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                : 'bg-white hover:bg-zinc-50 text-zinc-800 border-zinc-200 hover:border-zinc-300'
            }`}
            title="My Reading Shelf & Saved Books"
          >
            <Bookmark className={`w-3.5 h-3.5 ${activeTab === 'dashboard' ? 'text-[#FF3700]' : 'text-[#FF3700]'}`} />
            <span className="hidden sm:inline">My Shelf</span>
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

            <button
              onClick={() => {
                setActiveTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-[#FF3700]/10 text-[#FF3700] border border-[#FF3700]/25'
                  : 'text-zinc-800 hover:bg-zinc-50'
              }`}
            >
              <Bookmark className="w-4 h-4 text-[#FF3700]" />
              <span>My Shelf ({savedCount})</span>
            </button>
          </div>

          <div className="pt-3 border-t border-zinc-100 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenUploadModal();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#FF3700] text-xs font-bold text-white shadow-md shadow-[#FF3700]/20"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Book (No Auth Required)</span>
            </button>

            <button
              onClick={() => {
                onOpenSearchModal();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-zinc-50 text-xs font-bold text-zinc-800 border border-zinc-200 hover:border-[#FF3700]/40 transition-colors"
            >
              <Search className="w-4 h-4 text-[#FF3700]" />
              <span>Intelligent Search (⌘K)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
