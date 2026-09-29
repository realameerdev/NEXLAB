import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { UserLibraryState, UserProfile, ReadingList, BookNote, UserHistoryItem, Book } from '../types';
import { BOOKS_DATA } from '../data/booksData';

const STORAGE_KEY = 'nexlab_user_library_v1';
const CUSTOM_BOOKS_KEY = 'nexlab_custom_uploaded_books_v1';
const BUY_ME_COFFEE_URL_KEY = 'nexlab_bmc_url_v1';
export const DEFAULT_BMC_URL = 'https://devameer.xyz/buy-me-a-coffee';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Reader',
  handle: '@reader',
  role: 'Software Engineer & Builder',
  interests: ['Distributed Systems', 'Game Engines', 'UI Architecture', 'Foundation Models'],
  dailyReadingMinutes: 30,
  currentProject: 'Reading & Building with NEXLAB',
  skillLevel: 'Intermediate'
};

const DEFAULT_INITIAL_STATE: UserLibraryState = {
  savedBookIds: ['crafting-interpreters', 'the-book-of-shaders', 'shape-up', 'refactoring-ui'],
  readingStatus: {
    'crafting-interpreters': {
      status: 'reading',
      progressPercent: 42,
      currentPage: 268,
      totalPages: 640,
      updatedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
      notes: [
        {
          id: 'note-1',
          text: 'The recursive descent parser for expressions naturally reflects the operator precedence grammar rules.',
          page: 84,
          createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
        },
        {
          id: 'note-2',
          text: 'Lox bytecode VM stack layout: frames pointer tracks function call boundaries cleanly.',
          page: 215,
          createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
        }
      ],
      rating: 5,
      review: 'One of the most clear, engaging software engineering books ever written.'
    },
    'designing-data-intensive-applications': {
      status: 'completed',
      progressPercent: 100,
      currentPage: 616,
      totalPages: 616,
      updatedAt: new Date(Date.now() - 3600000 * 120).toISOString(),
      rating: 5,
      review: 'Seminal guide. Chapters 3 (storage engines) and 9 (consensus) are pure gold.',
      notes: [
        {
          id: 'note-3',
          text: 'SSTables and LSM-trees trade write amplification for rapid sequential disk writes.',
          page: 78,
          createdAt: new Date(Date.now() - 3600000 * 130).toISOString()
        }
      ]
    },
    'the-book-of-shaders': {
      status: 'reading',
      progressPercent: 65,
      currentPage: 142,
      totalPages: 220,
      updatedAt: new Date(Date.now() - 3600000 * 28).toISOString(),
      notes: []
    }
  },
  readingLists: [
    {
      id: 'list-1',
      name: 'High Performance & Systems',
      description: 'Books focused on low-level performance, compiler construction, and storage internals.',
      bookIds: ['crafting-interpreters', 'designing-data-intensive-applications', 'game-programming-patterns'],
      createdAt: new Date(Date.now() - 3600000 * 200).toISOString()
    },
    {
      id: 'list-2',
      name: 'Modern Product & Design Stack',
      description: 'Core literature for founders and product engineers shipping polished user experiences.',
      bookIds: ['refactoring-ui', 'the-design-of-everyday-things', 'shape-up', 'the-mom-test'],
      createdAt: new Date(Date.now() - 3600000 * 150).toISOString()
    }
  ],
  history: [
    {
      id: 'h-1',
      bookId: 'crafting-interpreters',
      action: 'updated_progress',
      timestamp: new Date(Date.now() - 3600000 * 14).toISOString(),
      detail: 'Read to page 268 (42%)'
    },
    {
      id: 'h-2',
      bookId: 'the-book-of-shaders',
      action: 'started',
      timestamp: new Date(Date.now() - 3600000 * 28).toISOString(),
      detail: 'Started reading chapter 6: Colors and Vectors'
    },
    {
      id: 'h-3',
      bookId: 'designing-data-intensive-applications',
      action: 'completed',
      timestamp: new Date(Date.now() - 3600000 * 120).toISOString(),
      detail: 'Finished book and rated 5 stars'
    }
  ],
  enrolledPathIds: ['full-stack-developer', 'game-development'],
  pathProgress: {
    'full-stack-developer': {
      currentStage: 3,
      completedStages: [1, 2]
    },
    'game-development': {
      currentStage: 2,
      completedStages: [1]
    }
  },
  profile: DEFAULT_PROFILE
};

interface LibraryContextType {
  state: UserLibraryState;
  allBooks: Book[];
  customBooks: Book[];
  buyMeACoffeeUrl: string;
  setBuyMeACoffeeUrl: (url: string) => void;
  addCustomBook: (book: Book) => void;
  deleteCustomBook: (bookId: string) => void;
  getBookById: (id: string) => Book | undefined;
  isBookSaved: (bookId: string) => boolean;
  toggleSaveBook: (bookId: string) => void;
  setReadingStatus: (bookId: string, status: 'want_to_read' | 'reading' | 'completed', currentPage?: number, totalPages?: number) => void;
  updateBookProgress: (bookId: string, currentPage: number, totalPages?: number) => void;
  addBookNote: (bookId: string, text: string, page?: number) => void;
  deleteBookNote: (bookId: string, noteId: string) => void;
  rateBook: (bookId: string, rating: number, review?: string) => void;
  createReadingList: (name: string, description: string, initialBookIds?: string[]) => string;
  addBookToList: (listId: string, bookId: string) => void;
  removeBookFromList: (listId: string, bookId: string) => void;
  deleteReadingList: (listId: string) => void;
  enrollInPath: (pathId: string) => void;
  completePathStage: (pathId: string, stageOrder: number) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  recordHistory: (bookId: string, action: UserHistoryItem['action'], detail?: string) => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<UserLibraryState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load user library from localStorage:', e);
    }
    return DEFAULT_INITIAL_STATE;
  });

  const [customBooks, setCustomBooks] = useState<Book[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_BOOKS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load custom books from localStorage:', e);
    }
    return [];
  });

  const [buyMeACoffeeUrl, setBuyMeACoffeeUrlState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(BUY_ME_COFFEE_URL_KEY);
      if (saved && !saved.includes('buymeacoffee.com/nexlab')) {
        return saved;
      }
      return DEFAULT_BMC_URL;
    } catch (e) {
      return DEFAULT_BMC_URL;
    }
  });

  const setBuyMeACoffeeUrl = (url: string) => {
    setBuyMeACoffeeUrlState(url);
    try {
      localStorage.setItem(BUY_ME_COFFEE_URL_KEY, url);
    } catch (e) {
      console.error('Failed to save Buy Me a Coffee URL:', e);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to persist user library:', e);
    }
  }, [state]);

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_BOOKS_KEY, JSON.stringify(customBooks));
    } catch (e) {
      console.error('Failed to persist custom books:', e);
    }
  }, [customBooks]);

  const allBooks = useMemo(() => {
    // Custom uploaded books first, then canonical library
    return [...customBooks, ...BOOKS_DATA];
  }, [customBooks]);

  const getBookById = (id: string): Book | undefined => {
    return allBooks.find(b => b.id === id);
  };

  const addCustomBook = (newBook: Book) => {
    setCustomBooks(prev => {
      const filtered = prev.filter(b => b.id !== newBook.id);
      return [newBook, ...filtered];
    });
    recordHistory(newBook.id, 'saved', `Uploaded "${newBook.title}" to library`);
  };

  const deleteCustomBook = (bookId: string) => {
    setCustomBooks(prev => prev.filter(b => b.id !== bookId));
    setState(prev => ({
      ...prev,
      savedBookIds: prev.savedBookIds.filter(id => id !== bookId),
      readingLists: prev.readingLists.map(list => ({
        ...list,
        bookIds: list.bookIds.filter(id => id !== bookId)
      }))
    }));
  };

  const isBookSaved = (bookId: string) => {
    return state.savedBookIds.includes(bookId);
  };

  const recordHistory = (bookId: string, action: UserHistoryItem['action'], detail?: string) => {
    const newItem: UserHistoryItem = {
      id: 'h-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      bookId,
      action,
      timestamp: new Date().toISOString(),
      detail
    };
    setState(prev => ({
      ...prev,
      history: [newItem, ...prev.history.slice(0, 49)]
    }));
  };

  const toggleSaveBook = (bookId: string) => {
    setState(prev => {
      const isSaved = prev.savedBookIds.includes(bookId);
      const newSaved = isSaved
        ? prev.savedBookIds.filter(id => id !== bookId)
        : [...prev.savedBookIds, bookId];

      return {
        ...prev,
        savedBookIds: newSaved
      };
    });
    recordHistory(bookId, isBookSaved(bookId) ? 'viewed' : 'saved', isBookSaved(bookId) ? 'Removed from saved' : 'Saved to personal shelf');
  };

  const setReadingStatus = (bookId: string, status: 'want_to_read' | 'reading' | 'completed', currentPage?: number, totalPages: number = 300) => {
    setState(prev => {
      const existing = prev.readingStatus[bookId] || {
        status,
        progressPercent: status === 'completed' ? 100 : 0,
        currentPage: currentPage || (status === 'completed' ? totalPages : 0),
        totalPages,
        updatedAt: new Date().toISOString(),
        notes: []
      };

      const currPage = currentPage !== undefined ? currentPage : (status === 'completed' ? totalPages : existing.currentPage);
      const progressPercent = totalPages > 0 ? Math.min(100, Math.round((currPage / totalPages) * 100)) : 0;

      return {
        ...prev,
        readingStatus: {
          ...prev.readingStatus,
          [bookId]: {
            ...existing,
            status,
            currentPage: currPage,
            totalPages,
            progressPercent,
            updatedAt: new Date().toISOString()
          }
        }
      };
    });
    recordHistory(bookId, status === 'completed' ? 'completed' : 'started', `Marked as ${status.replace('_', ' ')}`);
  };

  const updateBookProgress = (bookId: string, currentPage: number, totalPages?: number) => {
    setState(prev => {
      const existing = prev.readingStatus[bookId];
      const maxPages = totalPages || existing?.totalPages || 300;
      const progressPercent = Math.min(100, Math.round((currentPage / maxPages) * 100));
      const status = progressPercent >= 100 ? 'completed' : 'reading';

      return {
        ...prev,
        readingStatus: {
          ...prev.readingStatus,
          [bookId]: {
            status,
            progressPercent,
            currentPage,
            totalPages: maxPages,
            updatedAt: new Date().toISOString(),
            notes: existing?.notes || [],
            rating: existing?.rating,
            review: existing?.review
          }
        }
      };
    });
    recordHistory(bookId, 'updated_progress', `Page ${currentPage}`);
  };

  const addBookNote = (bookId: string, text: string, page?: number) => {
    if (!text.trim()) return;
    const newNote: BookNote = {
      id: 'note-' + Date.now(),
      text: text.trim(),
      page,
      createdAt: new Date().toISOString()
    };

    setState(prev => {
      const existing = prev.readingStatus[bookId] || {
        status: 'reading',
        progressPercent: 0,
        currentPage: page || 0,
        totalPages: 300,
        updatedAt: new Date().toISOString(),
        notes: []
      };

      return {
        ...prev,
        readingStatus: {
          ...prev.readingStatus,
          [bookId]: {
            ...existing,
            notes: [newNote, ...existing.notes],
            updatedAt: new Date().toISOString()
          }
        }
      };
    });
  };

  const deleteBookNote = (bookId: string, noteId: string) => {
    setState(prev => {
      const existing = prev.readingStatus[bookId];
      if (!existing) return prev;
      return {
        ...prev,
        readingStatus: {
          ...prev.readingStatus,
          [bookId]: {
            ...existing,
            notes: existing.notes.filter(n => n.id !== noteId)
          }
        }
      };
    });
  };

  const rateBook = (bookId: string, rating: number, review?: string) => {
    setState(prev => {
      const existing = prev.readingStatus[bookId] || {
        status: 'completed',
        progressPercent: 100,
        currentPage: 300,
        totalPages: 300,
        updatedAt: new Date().toISOString(),
        notes: []
      };

      return {
        ...prev,
        readingStatus: {
          ...prev.readingStatus,
          [bookId]: {
            ...existing,
            rating,
            review: review?.trim() || existing.review,
            updatedAt: new Date().toISOString()
          }
        }
      };
    });
    recordHistory(bookId, 'rated', `Rated ${rating} stars`);
  };

  const createReadingList = (name: string, description: string, initialBookIds: string[] = []) => {
    const id = 'list-' + Date.now();
    const newList: ReadingList = {
      id,
      name,
      description,
      bookIds: initialBookIds,
      createdAt: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      readingLists: [newList, ...prev.readingLists]
    }));
    return id;
  };

  const addBookToList = (listId: string, bookId: string) => {
    setState(prev => ({
      ...prev,
      readingLists: prev.readingLists.map(list => {
        if (list.id === listId && !list.bookIds.includes(bookId)) {
          return { ...list, bookIds: [...list.bookIds, bookId] };
        }
        return list;
      })
    }));
  };

  const removeBookFromList = (listId: string, bookId: string) => {
    setState(prev => ({
      ...prev,
      readingLists: prev.readingLists.map(list => {
        if (list.id === listId) {
          return { ...list, bookIds: list.bookIds.filter(id => id !== bookId) };
        }
        return list;
      })
    }));
  };

  const deleteReadingList = (listId: string) => {
    setState(prev => ({
      ...prev,
      readingLists: prev.readingLists.filter(list => list.id !== listId)
    }));
  };

  const enrollInPath = (pathId: string) => {
    setState(prev => {
      if (prev.enrolledPathIds.includes(pathId)) return prev;
      return {
        ...prev,
        enrolledPathIds: [...prev.enrolledPathIds, pathId],
        pathProgress: {
          ...prev.pathProgress,
          [pathId]: prev.pathProgress[pathId] || { currentStage: 1, completedStages: [] }
        }
      };
    });
  };

  const completePathStage = (pathId: string, stageOrder: number) => {
    setState(prev => {
      const currentProgress = prev.pathProgress[pathId] || { currentStage: 1, completedStages: [] };
      const completed = currentProgress.completedStages.includes(stageOrder)
        ? currentProgress.completedStages
        : [...currentProgress.completedStages, stageOrder];

      return {
        ...prev,
        pathProgress: {
          ...prev.pathProgress,
          [pathId]: {
            currentStage: Math.max(currentProgress.currentStage, stageOrder + 1),
            completedStages: completed
          }
        }
      };
    });
  };

  const updateProfile = (profileUpdate: Partial<UserProfile>) => {
    setState(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...profileUpdate
      }
    }));
  };

  return (
    <LibraryContext.Provider
      value={{
        state,
        allBooks,
        customBooks,
        buyMeACoffeeUrl,
        setBuyMeACoffeeUrl,
        addCustomBook,
        deleteCustomBook,
        getBookById,
        isBookSaved,
        toggleSaveBook,
        setReadingStatus,
        updateBookProgress,
        addBookNote,
        deleteBookNote,
        rateBook,
        createReadingList,
        addBookToList,
        removeBookFromList,
        deleteReadingList,
        enrollInPath,
        completePathStage,
        updateProfile,
        recordHistory
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
