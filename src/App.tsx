import React, { useState, useEffect } from 'react';
import { LibraryProvider } from './context/LibraryContext';
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
import { NexlabLogo } from './components/NexlabLogo';
import { Book, Category } from './types';

export function AppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('explore');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [readerBook, setReaderBook] = useState<Book | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<Category | undefined>(undefined);

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

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col font-sans selection:bg-[#FF3700]/20 selection:text-[#FF3700]">
      {/* Top Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSearchModal={() => setIsSearchModalOpen(true)}
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
          />
        )}
      </main>

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

      {/* Minimal Footer */}
      <footer className="border-t border-zinc-200 bg-white py-12 px-4 sm:px-6 lg:px-8 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <NexlabLogo className="w-6 h-6" glow={false} />
            <div>
              <span className="font-extrabold text-zinc-950 tracking-tight">NEXLAB</span>
              <span className="text-[11px] text-zinc-500 ml-2 font-normal">Knowledge for What You’re Building</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-zinc-600 font-semibold text-xs">
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
              My Library
            </button>
          </div>

          <div className="text-[11px] text-zinc-500 font-medium text-center md:text-right">
            Verified Legal Literature · Zero Pirated Content
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
