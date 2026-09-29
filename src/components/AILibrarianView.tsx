import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  Clock,
  Briefcase,
  Layers,
  ArrowRight,
  ArrowLeft,
  Bookmark,
  Check,
  RotateCcw,
  BookOpen,
  SlidersHorizontal,
  ChevronDown,
  X
} from 'lucide-react';
import { LibrarianMessage, Book } from '../types';
import { useLibrary } from '../context/LibraryContext';
import { BookCover } from './BookCover';

interface AILibrarianViewProps {
  onSelectBook: (book: Book) => void;
  onOpenReader?: (book: Book) => void;
  onGoBack?: () => void;
}

export const AILibrarianView: React.FC<AILibrarianViewProps> = ({
  onSelectBook,
  onOpenReader,
  onGoBack
}) => {
  const { state, allBooks, isBookSaved, toggleSaveBook, updateProfile } = useLibrary();

  const [messages, setMessages] = useState<LibrarianMessage[]>([
    {
      id: 'm-welcome',
      sender: 'assistant',
      content: `Welcome to **NEXLAB AI**. I am your personal digital librarian for technology, creative crafts, and engineering literature.\n\nTell me what you are currently learning, building, or aiming to master. I tailor every recommendation to your project goals, skill level, and available daily reading time.`,
      timestamp: new Date().toISOString(),
      recommendedBooks: [
        {
          bookId: 'crafting-interpreters',
          rationale: 'Build two complete programming languages from scratch (C and Java). The gold standard for understanding runtime machinery.'
        },
        {
          bookId: 'designing-data-intensive-applications',
          rationale: 'Essential systems architecture for scalable storage engines, replication, and distributed consensus.'
        }
      ],
      suggestedQuestions: [
        'What should I read for backend scalability?',
        'Recommend books for game shaders & 3D.',
        'I am beginner in UI/UX design.',
        'Best books for founding a SaaS startup.',
        'I only have 30 mins a day.'
      ]
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dailyMinutes, setDailyMinutes] = useState(state.profile.dailyReadingMinutes || 30);
  const [currentProjectInput, setCurrentProjectInput] = useState(state.profile.currentProject || '');
  const [showConfig, setShowConfig] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: LibrarianMessage = {
      id: 'm-' + Date.now(),
      sender: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/librarian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          userProfile: {
            ...state.profile,
            dailyReadingMinutes: dailyMinutes,
            currentProject: currentProjectInput
          },
          currentGoal: text,
          readingHistory: state.history.slice(0, 10),
          savedBooks: state.savedBookIds
        })
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMsg: LibrarianMessage = {
          id: 'm-resp-' + Date.now(),
          sender: 'assistant',
          content: data.reply,
          timestamp: new Date().toISOString(),
          recommendedBooks: (data.recommendedBookIds || []).map((id: string) => {
            const b = allBooks.find(item => item.id === id);
            return {
              bookId: id,
              rationale: b?.aiRecommendationExplanation || 'Matched to your goal.'
            };
          }),
          suggestedQuestions: data.suggestedQuestions
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        throw new Error('API response not ok');
      }
    } catch (err) {
      console.error('Error contacting NEXLAB AI librarian:', err);
      // Client-side fallback response so user is never left hanging
      const fallbackMsg: LibrarianMessage = {
        id: 'm-fallback-' + Date.now(),
        sender: 'assistant',
        content: `I've analyzed your goal: "${text}".\n\nHere are the highest-signal literature recommendations for this learning track:\n\n1. **Designing Data-Intensive Applications** by Martin Kleppmann: Indispensable for scalable systems architecture, storage engines, and distributed data flow.\n2. **Crafting Interpreters** by Robert Nystrom (**Free & Open Access**): Outstanding guide to understanding code execution, compiler passes, and virtual machines.\n3. **Refactoring UI** by Adam Wathan & Steve Schoger: Tactical design and visual spacing rules for software builders.`,
        timestamp: new Date().toISOString(),
        recommendedBooks: [
          { bookId: 'designing-data-intensive-applications', rationale: 'Core architectural mental models for distributed state and data flow.' },
          { bookId: 'crafting-interpreters', rationale: 'Deep understanding of language implementation and bytecode execution.' },
          { bookId: 'refactoring-ui', rationale: 'Tactical layout, typography, and visual hierarchy guidelines.' }
        ],
        suggestedQuestions: [
          'What should I read for backend scalability?',
          'Recommend books for game shaders & 3D.',
          'Best books for founding a SaaS startup.'
        ]
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfileContext = () => {
    updateProfile({
      dailyReadingMinutes: dailyMinutes,
      currentProject: currentProjectInput
    });
    setShowConfig(false);
  };

  const handleResetConversation = () => {
    setMessages([
      {
        id: 'm-welcome-' + Date.now(),
        sender: 'assistant',
        content: `Conversation refreshed. Tell me what technical or creative subject you are diving into next!`,
        timestamp: new Date().toISOString(),
        suggestedQuestions: [
          'What should I read for backend scalability?',
          'Recommend books for game shaders & 3D.',
          'I am beginner in UI/UX design.',
          'Best books for founding a SaaS startup.'
        ]
      }
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-3 sm:py-6 h-[calc(100dvh-4rem-3.8rem)] md:h-[calc(100vh-5rem)] flex flex-col gap-3 bg-white">
      {/* ========================================================================= */}
      {/* TOP COMPACT HEADER & CONTEXT BAR                                          */}
      {/* ========================================================================= */}
      <div className="p-3 sm:p-4 bg-white border border-zinc-200 rounded-2xl flex items-center justify-between gap-2 sm:gap-4 shadow-sm shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onGoBack && (
            <button
              onClick={onGoBack}
              className="inline-flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 hover:border-[#FF3700]/40 text-xs font-bold text-zinc-800 hover:text-zinc-950 transition-all cursor-pointer shadow-xs group shrink-0"
              title="Go back"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#FF3700] group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden xs:inline">Go Back</span>
            </button>
          )}

          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FF3700]/10 border border-[#FF3700]/25 flex items-center justify-center text-[#FF3700] shrink-0">
            <Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </div>

          <div className="min-w-0">
            <h2 className="text-xs sm:text-base font-extrabold text-zinc-950 flex items-center gap-1.5 truncate">
              <span>NEXLAB AI</span>
              <span className="text-[9px] sm:text-[10px] text-[#FF3700] bg-[#FF3700]/10 px-1.5 sm:px-2 py-0.5 rounded-full font-bold shrink-0">
                Librarian
              </span>
            </h2>
            <p className="text-[10px] sm:text-xs text-zinc-500 font-normal truncate hidden xs:block">
              Tailored book intelligence for what you're building
            </p>
          </div>
        </div>

        {/* User Context & Reset Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs shrink-0">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-xl border text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
              showConfig
                ? 'bg-[#FF3700] text-white border-[#FF3700] shadow-sm'
                : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-700 hover:border-[#FF3700]/40'
            }`}
            title="Configure reading context"
          >
            <Clock className={`w-3.5 h-3.5 ${showConfig ? 'text-white' : 'text-[#FF3700]'}`} />
            <span>{dailyMinutes}m/d</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showConfig ? 'rotate-180' : ''}`} />
          </button>

          <button
            onClick={handleResetConversation}
            className="p-2 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CONTEXT CONFIGURATION DRAWER                                              */}
      {/* ========================================================================= */}
      {showConfig && (
        <div className="p-4 sm:p-5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-200 shadow-sm shrink-0">
          <div className="flex items-center justify-between text-xs font-bold text-[#FF3700]">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Personalize Librarian Recommendations</span>
            </div>
            <button
              onClick={() => setShowConfig(false)}
              className="p-1 text-zinc-400 hover:text-zinc-900 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
            <div className="space-y-1.5 bg-white p-3 rounded-xl border border-zinc-200">
              <div className="flex items-center justify-between text-zinc-800 font-bold">
                <span>Daily Reading Pace</span>
                <span className="text-[#FF3700] font-mono">{dailyMinutes} mins / day</span>
              </div>
              <input
                type="range"
                min="15"
                max="120"
                step="15"
                value={dailyMinutes}
                onChange={e => setDailyMinutes(parseInt(e.target.value, 10))}
                className="w-full accent-[#FF3700] h-2 bg-zinc-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                <span>15m</span>
                <span>45m</span>
                <span>1h</span>
                <span>2h</span>
              </div>
            </div>

            <div className="space-y-1 bg-white p-3 rounded-xl border border-zinc-200">
              <label className="text-zinc-800 font-bold block">
                Current Goal or Project
              </label>
              <input
                type="text"
                value={currentProjectInput}
                onChange={e => setCurrentProjectInput(e.target.value)}
                placeholder="e.g. Distributed database, Indie SaaS, Game shaders..."
                className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 text-xs font-normal focus:outline-none focus:border-[#FF3700] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={handleUpdateProfileContext}
              className="w-full sm:w-auto py-2 px-5 bg-[#FF3700] hover:bg-[#E53100] text-white rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-[#FF3700]/25 transition-all text-center"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CHAT MESSAGES SCROLL CONTAINER                                            */}
      {/* ========================================================================= */}
      <div className="flex-1 overflow-y-auto overscroll-contain space-y-4 sm:space-y-6 pr-1 sm:pr-2 scrollbar-none">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* Sender Tag */}
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono text-zinc-400 mb-1 px-1">
              <span className="font-bold">{msg.sender === 'user' ? (state.profile.name || 'You') : 'NEXLAB AI'}</span>
              <span>·</span>
              <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[94%] sm:max-w-2xl rounded-2xl p-3.5 sm:p-5 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#FF3700] text-white rounded-tr-xs shadow-md shadow-[#FF3700]/20 font-medium'
                  : 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-xs space-y-3 shadow-sm'
              }`}
            >
              <div className="whitespace-pre-line font-sans space-y-2 break-words">
                {msg.content}
              </div>

              {/* Inline Recommended Books */}
              {msg.recommendedBooks && msg.recommendedBooks.length > 0 && (
                <div className="mt-4 pt-3 border-t border-zinc-100 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono font-bold text-[#FF3700] uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    <span>Recommended Literature:</span>
                  </div>

                  <div className="grid gap-2.5">
                    {msg.recommendedBooks.map(({ bookId, rationale }) => {
                      const book = allBooks.find(b => b.id === bookId);
                      if (!book) return null;
                      const saved = isBookSaved(book.id);

                      return (
                        <div
                          key={book.id}
                          className="p-3 bg-zinc-50 hover:bg-zinc-100/90 border border-zinc-200/90 hover:border-[#FF3700] rounded-xl transition-all flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 group"
                        >
                          {/* Book Details Clickable Area */}
                          <div
                            onClick={() => onSelectBook(book)}
                            className="flex items-center gap-3 cursor-pointer min-w-0 flex-1 w-full"
                          >
                            <div className="shrink-0">
                              <BookCover book={book} size="sm" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono text-[#FF3700] font-bold">
                                <span>{book.category}</span>
                                <span>·</span>
                                <span>{book.estimatedReadTime}</span>
                              </div>
                              <h5 className="text-xs sm:text-sm font-bold text-zinc-950 group-hover:text-[#FF3700] transition-colors truncate">
                                {book.title}
                              </h5>
                              <p className="text-[10px] sm:text-[11px] text-zinc-500 line-clamp-2 mt-0.5 leading-snug">
                                {rationale}
                              </p>
                            </div>
                          </div>

                          {/* Mobile-Friendly Action Buttons Row */}
                          <div className="flex items-center gap-1.5 shrink-0 self-end xs:self-center pt-1 xs:pt-0 border-t xs:border-t-0 border-zinc-200/60 w-full xs:w-auto justify-end">
                            {book.isLegallyFree && (book.readOnlineUrl || book.ebookFileData) && onOpenReader && (
                              <button
                                onClick={() => onOpenReader(book)}
                                className="inline-flex items-center gap-1 py-1.5 px-2.5 text-[#FF3700] hover:text-[#E53100] bg-white border border-zinc-200 hover:border-[#FF3700]/40 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                                title="Read Online"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span className="xs:hidden sm:inline text-[11px]">Read</span>
                              </button>
                            )}

                            <button
                              onClick={() => toggleSaveBook(book.id)}
                              className={`inline-flex items-center gap-1 py-1.5 px-2.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                                saved
                                  ? 'bg-[#FF3700] border-[#FF3700] text-white'
                                  : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-950'
                              }`}
                              title={saved ? 'Saved in library' : 'Save to shelf'}
                            >
                              {saved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                              <span className="xs:hidden sm:inline text-[11px]">{saved ? 'Saved' : 'Save'}</span>
                            </button>

                            <button
                              onClick={() => onSelectBook(book)}
                              className="p-1.5 text-zinc-500 hover:text-zinc-900 bg-white border border-zinc-200 hover:border-[#FF3700] rounded-lg transition-colors cursor-pointer"
                              title="View full syllabus"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Suggested Follow-up Questions (Smooth Horizontal Scroller on Mobile) */}
            {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2 max-w-full overflow-x-auto scrollbar-none py-1 px-0.5">
                {msg.suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(q)}
                    className="text-[10px] sm:text-[11px] font-medium text-zinc-600 hover:text-[#FF3700] bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-[#FF3700]/50 rounded-full py-1 px-3 whitespace-nowrap transition-colors cursor-pointer shadow-2xs shrink-0 active:scale-95"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2.5 text-xs font-mono font-semibold text-[#FF3700] p-3 bg-zinc-50 rounded-2xl border border-zinc-200 max-w-xs animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-[#FF3700] shrink-0" />
            <span className="truncate">NEXLAB AI is synthesizing catalog...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ========================================================================= */}
      {/* MESSAGE INPUT FORM (Docked cleanly at bottom)                              */}
      {/* ========================================================================= */}
      <div className="shrink-0 pt-1">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center bg-white border border-zinc-300 rounded-2xl p-1.5 sm:p-2 shadow-lg focus-within:border-[#FF3700] focus-within:ring-2 focus-within:ring-[#FF3700]/20 transition-all gap-1.5"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask anything: 'Game dev with 30m a day', 'Scalable systems'..."
            className="flex-1 bg-transparent border-none text-xs sm:text-sm text-zinc-950 placeholder-zinc-400 pl-2.5 sm:pl-3 pr-1 focus:outline-none min-h-[38px] sm:min-h-[42px]"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-[#FF3700] hover:bg-[#E53100] disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl shadow-md shadow-[#FF3700]/25 transition-all cursor-pointer shrink-0 active:scale-95"
            aria-label="Send query"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};

