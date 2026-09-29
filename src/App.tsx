import React, { useState, useEffect } from 'react';
import { Coffee, Upload } from 'lucide-react';
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
  const { buyMeACoffeeUrl } = useLibrary();
  const [activeTab, setActiveTab] = useState<ActiveTab>('explore');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [readerBook, setReaderBook] = useState<Book | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
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
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={newBook => {
          setSelectedBook(newBook);
        }}
      />

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
                My Shelf
              </button>
            </div>

            {/* Buy Me a Coffee / Support NEXLAB Button */}
            <div className="flex items-center gap-3">
              <a
                href={buyMeACoffeeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 py-2 px-3.5 rounded-full bg-zinc-50 hover:bg-[#FF3700] hover:text-white border border-zinc-200 hover:border-[#FF3700] text-zinc-800 text-xs font-bold transition-all shadow-xs group"
                title="Support NEXLAB on Buy Me a Coffee"
              >
                <Coffee className="w-4 h-4 text-[#FF3700] group-hover:text-white transition-colors" />
                <span>Buy Me a Coffee</span>
              </a>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400">
            <span>Verified Open Literature · Zero Pirated Content</span>
            <span>Independent Open Knowledge Platform</span>
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
