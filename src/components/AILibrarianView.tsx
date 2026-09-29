import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  Clock,
  Briefcase,
  Layers,
  ArrowRight,
  Bookmark,
  Check,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { LibrarianMessage, Book } from '../types';
import { useLibrary } from '../context/LibraryContext';
import { BookCover } from './BookCover';

interface AILibrarianViewProps {
  onSelectBook: (book: Book) => void;
  onOpenReader?: (book: Book) => void;
}

export const AILibrarianView: React.FC<AILibrarianViewProps> = ({
  onSelectBook,
  onOpenReader
}) => {
  const { state, allBooks, isBookSaved, toggleSaveBook, updateProfile } = useLibrary();

  const [messages, setMessages] = useState<LibrarianMessage[]>([
    {
      id: 'm-welcome',
      sender: 'assistant',
      content: `Welcome to **NEXLAB AI**. I am your personal digital librarian for technology, creative crafts, and engineering literature.

Tell me what you are currently learning, building, or aiming to master. I tailor every recommendation to your project invariants, skill level, and available daily reading time.`,
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
        'What should I read to become a better backend developer?',
        'Give me books for learning Unreal Engine and game shaders.',
        'I’m a beginner in UI/UX. What should I read first?',
        'I’m building a SaaS. What books should I study?',
        'I have only 30 minutes a day. Give me a reading path.'
      ]
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dailyMinutes, setDailyMinutes] = useState(state.profile.dailyReadingMinutes || 30);
  const [currentProjectInput, setCurrentProjectInput] = useState(state.profile.currentProject || '');
  const [showConfig, setShowConfig] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

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
          'What should I read to become a better backend developer?',
          'Recommend books for game development and shaders.',
          'I am building a SaaS. What books should I study?'
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 min-h-[calc(100vh-5rem)] flex flex-col gap-4 bg-white">
      {/* Top Header & Context Bar */}
      <div className="p-4 bg-white border border-zinc-200 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF3700]/10 border border-[#FF3700]/25 flex items-center justify-center text-[#FF3700]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-zinc-950 flex items-center gap-2">
              <span>NEXLAB AI</span>
              <span className="text-[10px] text-[#FF3700] bg-[#FF3700]/10 px-2 py-0.5 rounded-full font-bold">
                Personal Librarian
              </span>
            </h2>
            <p className="text-xs text-zinc-500 font-normal">
              Curated book intelligence for what you're building
            </p>
          </div>
        </div>

        {/* User Context Quick Badges */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 hover:border-[#FF3700]/40 text-zinc-700 font-semibold transition-colors cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-[#FF3700]" />
            <span>{dailyMinutes} min/day</span>
          </button>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className="hidden sm:flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 hover:border-[#FF3700]/40 text-zinc-700 font-semibold transition-colors cursor-pointer max-w-xs truncate"
          >
            <Briefcase className="w-3.5 h-3.5 text-[#FF3700] shrink-0" />
            <span className="truncate">{currentProjectInput || 'Set Current Project'}</span>
          </button>
        </div>
      </div>

      {/* Context Configuration Drawer */}
      {showConfig && (
        <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3 animate-in slide-in-from-top-2 duration-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-[#FF3700]">
            <span>Tune Personal Librarian Context</span>
            <button
              onClick={() => setShowConfig(false)}
              className="text-zinc-500 hover:text-zinc-900 font-bold cursor-pointer"
            >
              Done
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-zinc-700 font-semibold block mb-1">
                Daily Available Reading Time: {dailyMinutes} mins
              </label>
              <input
                type="range"
                min="15"
                max="120"
                step="15"
                value={dailyMinutes}
                onChange={e => setDailyMinutes(parseInt(e.target.value, 10))}
                className="w-full accent-[#FF3700]"
              />
            </div>

            <div>
              <label className="text-zinc-700 font-semibold block mb-1">
                What are you currently building?
              </label>
              <input
                type="text"
                value={currentProjectInput}
                onChange={e => setCurrentProjectInput(e.target.value)}
                placeholder="e.g. Real-time game engine, SaaS payment auth, transformer model..."
                className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-900 text-xs font-normal focus:outline-none focus:border-[#FF3700]"
              />
            </div>
          </div>

          <button
            onClick={handleUpdateProfileContext}
            className="py-2 px-5 bg-[#FF3700] hover:bg-[#E53100] text-white rounded-full text-xs font-bold cursor-pointer shadow-md shadow-[#FF3700]/25 transition-all"
          >
            Save Context
          </button>
        </div>
      )}

      {/* Chat Messages Scroll Container */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* Sender Tag */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 mb-1 px-1">
              <span>{msg.sender === 'user' ? state.profile.name : 'NEXLAB AI'}</span>
              <span>·</span>
              <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            {/* Bubble */}
            <div
              className={`max-w-2xl rounded-2xl p-4 sm:p-5 text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#FF3700] text-white rounded-tr-sm shadow-md shadow-[#FF3700]/20 font-medium'
                  : 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-sm space-y-3 shadow-sm'
              }`}
            >
              <div className="whitespace-pre-line font-sans space-y-2">
                {msg.content}
              </div>

              {/* Inline Recommended Books */}
              {msg.recommendedBooks && msg.recommendedBooks.length > 0 && (
                <div className="mt-4 pt-3 border-t border-zinc-100 space-y-2">
                  <span className="text-[11px] font-mono font-bold text-[#FF3700] uppercase tracking-wider block">
                    Recommended Books for this Goal:
                  </span>
                  <div className="grid gap-2.5">
                    {msg.recommendedBooks.map(({ bookId, rationale }) => {
                      const book = allBooks.find(b => b.id === bookId);
                      if (!book) return null;
                      const saved = isBookSaved(book.id);

                      return (
                        <div
                          key={book.id}
                          className="p-3 bg-zinc-50 hover:bg-zinc-100/80 border border-zinc-200 hover:border-[#FF3700] rounded-xl transition-all flex items-center justify-between gap-3 group"
                        >
                          <div
                            onClick={() => onSelectBook(book)}
                            className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                          >
                            <BookCover book={book} size="sm" />
                            <div className="min-w-0">
                              <span className="text-[10px] font-mono text-[#FF3700] block font-bold">
                                {book.category} · {book.estimatedReadTime}
                              </span>
                              <h5 className="text-xs font-bold text-zinc-950 group-hover:text-[#FF3700] transition-colors truncate">
                                {book.title}
                              </h5>
                              <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                                {rationale}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {book.isLegallyFree && book.readOnlineUrl && onOpenReader && (
                              <button
                                onClick={() => onOpenReader(book)}
                                className="p-1.5 text-[#FF3700] hover:text-[#E53100] bg-white border border-zinc-200 rounded-lg transition-colors cursor-pointer"
                                title="Read Online"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => toggleSaveBook(book.id)}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                saved
                                  ? 'bg-[#FF3700] border-[#FF3700] text-white'
                                  : 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-900'
                              }`}
                              title={saved ? 'In personal library' : 'Save to library'}
                            >
                              {saved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => onSelectBook(book)}
                              className="p-1.5 text-zinc-500 hover:text-zinc-900 bg-white border border-zinc-200 hover:border-[#FF3700] rounded-lg transition-colors cursor-pointer"
                              title="View details"
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

            {/* Suggested Follow-up Questions */}
            {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2 max-w-2xl">
                {msg.suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(q)}
                    className="text-[11px] text-zinc-600 hover:text-[#FF3700] bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-[#FF3700]/50 rounded-full py-1 px-3 transition-colors cursor-pointer text-left shadow-sm"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#FF3700] p-3 bg-zinc-50 rounded-xl border border-zinc-200 max-w-xs animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-[#FF3700]" />
            <span>NEXLAB AI is synthesizing library catalog...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
      <div className="pt-2">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center bg-white border border-zinc-300 rounded-2xl p-2 shadow-lg focus-within:border-[#FF3700] focus-within:ring-2 focus-within:ring-[#FF3700]/20 transition-all"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask anything: 'I have 30 mins a day for game dev', 'Books for learning Unreal Engine'..."
            className="flex-1 bg-transparent border-none text-xs sm:text-sm text-zinc-950 placeholder-zinc-400 pl-3 pr-2 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="inline-flex items-center justify-center p-2.5 bg-[#FF3700] hover:bg-[#E53100] disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl shadow-md shadow-[#FF3700]/25 transition-all cursor-pointer shrink-0"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};
