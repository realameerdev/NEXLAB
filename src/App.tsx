import React, { useState, useEffect } from 'react';
import {
  Coffee,
  Upload,
  Compass,
  Layers,
  BookOpen,
  Sparkles,
  Bookmark,
  CheckCircle2,
  X
} from 'lucide-react';
import { LibraryProvider, useLibrary } from './context/LibraryContext';
import { Navbar, ActiveTab } from './components/Navbar';
import { ExploreView } from './components/ExploreView';
import { CategoriesView } from './components/CategoriesView';
import { FreeLibraryView } from './components/FreeLibraryView';
import { ReadingPathsView } from './components/ReadingPathsView';
import { AILibrarianView } from './components/AILibrarianView';
import { DashboardView } from './components/DashboardView';
import { BookDetailModal } from './components/BookDetailModal';
import { ReaderModal } from './components/ReaderModal';
import { SearchModal } from './components/SearchModal';
import { UploadBookModal } from './components/UploadBookModal';
import { NexlabLogo } from './components/NexlabLogo';
import { Book, Category } from './types';

export function AppContent() {
  const { buyMeACoffeeUrl, state } = useLibrary();
  const [activeTab, setActiveTab] = useState<ActiveTab>('explore');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [readerBook, setReaderBook] = useState<Book | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<Category | undefined>(undefined);
  const [draftToastVisible, setDraftToastVisible] = useState(false);

  const savedCount = state.savedBookIds.length;

  // Global keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenBook = (book: Book) => {
    setSelectedBook(book);
  };

  const handleOpenReader = (book: Book) => {
    setReaderBook(book);
  };

  const handleFilterCategory = (category: Category) => {
    setFilterCategory(category);
    setActiveTab('categories');
  };

  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
    // Check if there is an active draft in localStorage
    try {
      const savedDraftRaw = localStorage.getItem('nexlab_upload_draft_v1');
      if (savedDraftRaw) {
        const d = JSON.parse(savedDraftRaw);
        if (d.title || d.author || d.shortDescription || d.ebookFileName) {
          setDraftToastVisible(true);
          setTimeout(() => setDraftToastVisible(false), 4500);
        }
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col font-sans selection:bg-[#FF3700]/20 selection:text-[#FF3700] pb-20 md:pb-0">
      {/* Top Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSearchModal={() => setIsSearchModalOpen(true)}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeTab === 'explore' && (
          <ExploreView
            onSelectBook={handleOpenBook}
            onOpenReader={handleOpenReader}
            setActiveTab={setActiveTab}
            onFilterCategory={handleFilterCategory}
          />
        )}

        {activeTab === 'categories' && (
          <CategoriesView
            onSelectBook={handleOpenBook}
            onOpenReader={handleOpenReader}
            initialCategory={filterCategory}
          />
        )}

        {activeTab === 'free' && (
          <FreeLibraryView
            onSelectBook={handleOpenBook}
            onOpenReader={handleOpenReader}
          />
        )}

        {activeTab === 'paths' && (
          <ReadingPathsView
            onSelectBook={handleOpenBook}
          />
        )}

        {activeTab === 'ai' && (
          <AILibrarianView
            onSelectBook={handleOpenBook}
            onOpenReader={handleOpenReader}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            onSelectBook={handleOpenBook}
            onOpenReader={handleOpenReader}
            onNavigateToPaths={() => setActiveTab('paths')}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
          />
        )}
      </main>

      {/* Auto-save Notification Toast */}
      {draftToastVisible && (
        <div className="fixed bottom-22 md:bottom-6 right-4 sm:right-6 z-50 max-w-sm w-[calc(100vw-2rem)] bg-zinc-950 text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-zinc-800 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="min-w-0 text-xs">
              <p className="font-bold text-white leading-snug">Upload Draft Saved</p>
              <p className="text-zinc-400 text-[11px] truncate">Your form progress is auto-saved locally.</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => {
                setDraftToastVisible(false);
                setIsUploadModalOpen(true);
              }}
              className="px-2.5 py-1 rounded-lg bg-[#FF3700] hover:bg-[#E53100] text-white text-[11px] font-bold transition-colors cursor-pointer"
            >
              Resume
            </button>
            <button
              onClick={() => setDraftToastVisible(false)}
              className="p-1 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Book Details Modal */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onSelectBook={b => setSelectedBook(b)}
          onOpenReader={b => {
            setSelectedBook(null);
            setReaderBook(b);
          }}
        />
      )}

      {/* Legal Open Reader Modal */}
      {readerBook && (
        <ReaderModal
          book={readerBook}
          onClose={() => setReaderBook(null)}
        />
      )}

      {/* Global Quick Search Modal (Cmd+K) */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectBook={handleOpenBook}
      />

      {/* Upload Book Modal */}
      <UploadBookModal
        isOpen={isUploadModalOpen}
        onClose={handleCloseUploadModal}
        onSuccess={newBook => {
          setSelectedBook(newBook);
        }}
      />

      {/* ========================================================================= */}
      {/* MOBILE BOTTOM NAVIGATION BAR (Thumb Zone Optimized for Small Viewports)   */}
      {/* ========================================================================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-xl border-t border-zinc-200/90 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 px-2">
        <div className="grid grid-cols-5 items-center h-14 max-w-lg mx-auto">
          {/* 1. Explore Tab */}
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex flex-col items-center justify-center min-h-[44px] py-1 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'explore' ? 'text-[#FF3700]' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Compass className={`w-5 h-5 transition-transform ${activeTab === 'explore' ? 'scale-110' : ''}`} />
            <span className="text-[10px] font-bold tracking-tight mt-0.5">Explore</span>
          </button>

          {/* 2. Categories Tab */}
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex flex-col items-center justify-center min-h-[44px] py-1 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'categories' ? 'text-[#FF3700]' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Layers className={`w-5 h-5 transition-transform ${activeTab === 'categories' ? 'scale-110' : ''}`} />
            <span className="text-[10px] font-bold tracking-tight mt-0.5">Domains</span>
          </button>

          {/* 3. Center Elevated Upload CTA */}
          <div className="flex flex-col items-center justify-center">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="w-11 h-11 -mt-4 rounded-full bg-[#FF3700] hover:bg-[#E53100] text-white flex items-center justify-center shadow-lg shadow-[#FF3700]/30 transition-transform active:scale-95 cursor-pointer border-2 border-white"
              title="Upload Ebook (No account needed)"
              aria-label="Upload Ebook"
            >
              <Upload className="w-5 h-5" />
            </button>
            <span className="text-[9px] font-bold text-zinc-700 tracking-tight mt-0.5">Upload</span>
          </div>

          {/* 4. NEXLAB AI Tab */}
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex flex-col items-center justify-center min-h-[44px] py-1 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'ai' ? 'text-[#FF3700]' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Sparkles className={`w-5 h-5 transition-transform ${activeTab === 'ai' ? 'scale-110' : ''}`} />
            <span className="text-[10px] font-bold tracking-tight mt-0.5">AI Lib</span>
          </button>

          {/* 5. My Shelf Tab */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center min-h-[44px] py-1 rounded-xl transition-colors cursor-pointer relative ${
              activeTab === 'dashboard' ? 'text-[#FF3700]' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <div className="relative">
              <Bookmark className={`w-5 h-5 transition-transform ${activeTab === 'dashboard' ? 'scale-110' : ''}`} />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-[#FF3700] text-white text-[9px] font-mono font-bold flex items-center justify-center border border-white">
                  {savedCount > 9 ? '9+' : savedCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold tracking-tight mt-0.5">Shelf</span>
          </button>
        </div>
      </nav>

      {/* Footer with Support NEXLAB / Buy Me a Coffee */}
      <footer className="border-t border-zinc-200 bg-white py-12 px-4 sm:px-6 lg:px-8 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <NexlabLogo className="w-6 h-6" glow={false} />
              <div>
                <span className="font-extrabold text-zinc-950 tracking-tight">NEXLAB</span>
                <span className="text-[11px] text-zinc-500 ml-2 font-normal">Knowledge for What You’re Building</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-zinc-600 font-semibold text-xs">
              <button onClick={() => setActiveTab('explore')} className="hover:text-[#FF3700] transition-colors cursor-pointer">
                Explore
              </button>
              <button onClick={() => setActiveTab('categories')} className="hover:text-[#FF3700] transition-colors cursor-pointer">
                Categories
              </button>
              <button onClick={() => setActiveTab('free')} className="hover:text-[#FF3700] transition-colors cursor-pointer">
                Free Library
              </button>
              <button onClick={() => setActiveTab('paths')} className="hover:text-[#FF3700] transition-colors cursor-pointer">
                Reading Paths
              </button>
              <button onClick={() => setActiveTab('ai')} className="hover:text-[#FF3700] transition-colors cursor-pointer">
                NEXLAB AI
              </button>
              <button onClick={() => setActiveTab('dashboard')} className="hover:text-[#FF3700] transition-colors cursor-pointer">
                My Shelf
              </button>
            </div>

            {/* Buy Me a Coffee / Support NEXLAB Button */}
            <div className="flex items-center gap-3">
              <a
                href={buyMeACoffeeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 py-2 px-3.5 rounded-full bg-zinc-50 hover:bg-[#FF3700] hover:text-white border border-zinc-200 hover:border-[#FF3700] text-zinc-800 text-xs font-bold transition-all shadow-xs group cursor-pointer"
                title="Support NEXLAB on Buy Me a Coffee"
              >
                <Coffee className="w-4 h-4 text-[#FF3700] group-hover:text-white transition-colors" />
                <span>Buy Me a Coffee</span>
              </a>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400 text-center sm:text-left">
            <span>Verified Open Literature · Zero Pirated Content</span>
            <span>Independent Open Knowledge Platform · No Auth Required</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LibraryProvider>
      <AppContent />
    </LibraryProvider>
  );
}
