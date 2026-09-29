import React, { useState } from 'react';
import {
  MapPin,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  BookOpen,
  Plus,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ReadingPath, Book } from '../types';
import { READING_PATHS_DATA } from '../data/readingPathsData';
import { useLibrary } from '../context/LibraryContext';
import { BookCover } from './BookCover';

interface ReadingPathsViewProps {
  onSelectBook: (book: Book) => void;
  onGoBack?: () => void;
}

export const ReadingPathsView: React.FC<ReadingPathsViewProps> = ({ onSelectBook, onGoBack }) => {
  const { state, allBooks, enrollInPath, completePathStage } = useLibrary();

  const [selectedPathId, setSelectedPathId] = useState<string>(READING_PATHS_DATA[0].id);
  const [pathsList, setPathsList] = useState<ReadingPath[]>(READING_PATHS_DATA);
  const [expandedStage, setExpandedStage] = useState<number | null>(1);

  // Custom AI path generation modal state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [customGoal, setCustomGoal] = useState('');
  const [customLevel, setCustomLevel] = useState('Intermediate');
  const [customWeeklyHours, setCustomWeeklyHours] = useState(6);
  const [isGeneratingPath, setIsGeneratingPath] = useState(false);

  const selectedPath = pathsList.find(p => p.id === selectedPathId) || pathsList[0];
  const isEnrolled = state.enrolledPathIds.includes(selectedPath.id);
  const pathProgress = state.pathProgress[selectedPath.id] || { currentStage: 1, completedStages: [] };

  const handleGenerateCustomPath = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoal.trim() || isGeneratingPath) return;

    setIsGeneratingPath(true);
    try {
      const response = await fetch('/api/gemini/generate-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: customGoal,
          currentLevel: customLevel,
          weeklyHours: customWeeklyHours
        })
      });

      if (response.ok) {
        const data = await response.json();
        const newPath: ReadingPath = {
          id: 'custom-' + Date.now(),
          title: data.title || `Mastery in ${customGoal}`,
          tagline: data.tagline || 'AI-generated curriculum tailored to your goal',
          description: data.description || `Specialized progression generated for ${customGoal}`,
          category: 'Technology',
          estimatedTotalHours: data.estimatedTotalHours || 50,
          targetRole: customGoal,
          stages: data.stages || []
        };

        setPathsList(prev => [newPath, ...prev]);
        setSelectedPathId(newPath.id);
        setShowGenerateModal(false);
        setCustomGoal('');
      }
    } catch (err) {
      console.error('Failed to generate custom path:', err);
    } finally {
      setIsGeneratingPath(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 bg-white">
      {/* Top Navigation / Go Back Bar */}
      {onGoBack && (
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onGoBack}
            className="inline-flex items-center gap-2 py-2 px-3.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 hover:border-[#FF3700]/40 text-xs font-bold text-zinc-800 hover:text-zinc-950 transition-all cursor-pointer shadow-xs group"
            title="Go back to previous view"
          >
            <ArrowLeft className="w-4 h-4 text-[#FF3700] group-hover:-translate-x-0.5 transition-transform" />
            <span>Go Back</span>
          </button>
        </div>
      )}

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#FF3700] mb-1">
            <MapPin className="w-4 h-4 text-[#FF3700]" />
            <span>Structured Knowledge Roadmaps</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950">
            Curated Reading Paths
          </h1>
          <p className="text-sm text-zinc-600 mt-1 max-w-2xl leading-relaxed font-normal">
            Sequential, milestone-based reading curricula designed to take you from foundational principles to production-grade architecture.
          </p>
        </div>

        <button
          onClick={() => setShowGenerateModal(true)}
          className="inline-flex items-center justify-center gap-2 py-3 px-5 bg-[#FF3700] hover:bg-[#E53100] text-white rounded-full text-xs sm:text-sm font-bold shadow-xl shadow-[#FF3700]/25 transition-all cursor-pointer shrink-0 hover:scale-105 active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate Custom Path with AI</span>
        </button>
      </div>

      {/* Path Selector Tabs (Interactive horizontal list) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none max-w-full">
        {pathsList.map(path => {
          const isSelected = path.id === selectedPath.id;
          const enrolled = state.enrolledPathIds.includes(path.id);

          return (
            <button
              key={path.id}
              onClick={() => {
                setSelectedPathId(path.id);
                setExpandedStage(1);
              }}
              className={`py-2 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#FF3700] border-[#FF3700] text-white shadow-md shadow-[#FF3700]/20'
                  : 'bg-white border-zinc-200 hover:border-[#FF3700]/50 text-zinc-700 hover:text-zinc-950'
              }`}
            >
              <span>{path.title}</span>
              {enrolled && (
                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-[#FF3700]'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Path Hero Card */}
      <div className="p-6 sm:p-8 bg-gradient-to-br from-white via-zinc-50 to-[#FF3700]/[0.03] border border-[#FF3700]/30 rounded-3xl relative overflow-hidden shadow-xl shadow-[#FF3700]/5">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#FF3700]">
              <span>{selectedPath.category}</span>
              <span>·</span>
              <span>Target Role: {selectedPath.targetRole}</span>
              <span>·</span>
              <span className="flex items-center gap-1 text-zinc-500 font-medium">
                <Clock className="w-3.5 h-3.5" />
                ~{selectedPath.estimatedTotalHours} hours total
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
              {selectedPath.title}
            </h2>

            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
              {selectedPath.description}
            </p>
          </div>

          <div className="shrink-0 flex flex-col gap-2 min-w-[180px]">
            {isEnrolled ? (
              <div className="p-3 bg-white border border-[#FF3700]/30 rounded-2xl space-y-1 shadow-sm">
                <div className="flex items-center justify-between text-xs text-[#FF3700] font-bold">
                  <span>Enrolled In Path</span>
                  <CheckCircle2 className="w-4 h-4 text-[#FF3700]" />
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-500 font-medium">
                  <span>Stage {pathProgress.currentStage} of {selectedPath.stages.length}</span>
                  <span>{Math.round((pathProgress.completedStages.length / selectedPath.stages.length) * 100)}%</span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => enrollInPath(selectedPath.id)}
                className="py-3 px-6 bg-[#FF3700] hover:bg-[#E53100] text-white rounded-full text-xs sm:text-sm font-bold shadow-xl shadow-[#FF3700]/25 transition-all cursor-pointer text-center"
              >
                Enroll in Path
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sequential Stages Timeline */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
          Path Milestones & Reading Stages
        </h3>

        <div className="space-y-3">
          {selectedPath.stages.map(stage => {
            const isCompleted = pathProgress.completedStages.includes(stage.order);
            const isCurrent = pathProgress.currentStage === stage.order;
            const isExpanded = expandedStage === stage.order;

            // Books recommended for this stage
            const stageBooks = stage.recommendedBookIds
              .map(id => allBooks.find(b => b.id === id))
              .filter(Boolean) as Book[];

            return (
              <div
                key={stage.order}
                className={`bg-white border rounded-2xl transition-all duration-300 overflow-hidden shadow-sm ${
                  isCurrent
                    ? 'border-[#FF3700] ring-1 ring-[#FF3700]/20 shadow-md'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                {/* Stage Header Accordion Toggle */}
                <div
                  onClick={() => setExpandedStage(isExpanded ? null : stage.order)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-50/70"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    {/* Status Icon */}
                    <div className="shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-[#FF3700]" />
                      ) : isCurrent ? (
                        <div className="w-5 h-5 rounded-full border-2 border-[#FF3700] flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-[#FF3700] animate-pulse" />
                        </div>
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-300" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-0.5">
                        <span className="text-[#FF3700] font-bold">Stage {stage.order}</span>
                        <span>·</span>
                        <span>{stage.estimatedHours} hours</span>
                        {isCurrent && (
                          <span className="text-[#FF3700] font-semibold">· Current Milestone</span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-zinc-950 truncate">
                        {stage.name}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    )}
                  </div>
                </div>

                {/* Stage Details (Expanded) */}
                {isExpanded && (
                  <div className="p-4 sm:p-6 pt-0 border-t border-zinc-100 space-y-5 bg-zinc-50/50">
                    <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-sans pt-4">
                      {stage.summary}
                    </p>

                    {/* Milestone Project Objective */}
                    <div className="p-4 bg-white border border-[#FF3700]/30 rounded-xl space-y-1 shadow-sm">
                      <span className="text-[11px] font-mono text-[#FF3700] uppercase tracking-wider block font-bold">
                        Milestone Project / Practical Proof:
                      </span>
                      <p className="text-xs text-zinc-800">
                        {stage.milestoneGoal}
                      </p>
                    </div>

                    {/* Recommended Books for Stage */}
                    <div className="space-y-3">
                      <span className="text-xs font-mono font-semibold text-zinc-500 uppercase tracking-wider block">
                        Required Reading for this Milestone:
                      </span>

                      <div className="grid sm:grid-cols-2 gap-3">
                        {stageBooks.map(book => (
                          <div
                            key={book.id}
                            onClick={() => onSelectBook(book)}
                            className="p-3 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-[#FF3700] rounded-xl cursor-pointer transition-all flex items-center gap-3 group shadow-sm hover:shadow-md"
                          >
                            <BookCover book={book} size="sm" />
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-mono text-[#FF3700] block font-bold">
                                {book.category} · {book.estimatedReadTime}
                              </span>
                              <h5 className="text-xs font-bold text-zinc-950 group-hover:text-[#FF3700] transition-colors truncate">
                                {book.title}
                              </h5>
                              <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                                by {book.author}
                              </p>
                              {book.isLegallyFree && (
                                <span className="text-[10px] text-[#FF3700] font-mono font-semibold">
                                  Free Open Access
                                </span>
                              )}
                            </div>
                            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-[#FF3700] group-hover:translate-x-0.5 transition-all" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stage Completion Button */}
                    {isEnrolled && (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => completePathStage(selectedPath.id, stage.order)}
                          className={`inline-flex items-center gap-1.5 py-2 px-4 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                            isCompleted
                              ? 'bg-zinc-100 border border-zinc-300 text-zinc-700'
                              : 'bg-[#FF3700] hover:bg-[#E53100] text-white shadow-lg shadow-[#FF3700]/20'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isCompleted ? 'Milestone Completed' : 'Mark Milestone Complete'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Custom Path Generator Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#FF3700]">
              <Sparkles className="w-4 h-4 text-[#FF3700]" />
              <span>NEXLAB AI Curriculum Architect</span>
            </div>

            <h3 className="text-xl font-bold text-zinc-950">
              Generate a Custom Reading Path
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Describe any ambitious technical goal or domain. NEXLAB AI will synthesize a multi-stage curriculum with milestone projects and book matches.
            </p>

            <form onSubmit={handleGenerateCustomPath} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-mono font-semibold text-zinc-800 block mb-1">
                  What is your learning or engineering goal?
                </label>
                <input
                  type="text"
                  required
                  value={customGoal}
                  onChange={e => setCustomGoal(e.target.value)}
                  placeholder="e.g. Build an autonomous drone flight controller in Rust..."
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#FF3700] focus:ring-1 focus:ring-[#FF3700]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-zinc-600 block mb-1 font-medium">Current Skill Level</label>
                  <select
                    value={customLevel}
                    onChange={e => setCustomLevel(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 focus:outline-none focus:border-[#FF3700]"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-600 block mb-1 font-medium">Weekly Time: {customWeeklyHours} hrs</label>
                  <input
                    type="range"
                    min="3"
                    max="20"
                    value={customWeeklyHours}
                    onChange={e => setCustomWeeklyHours(parseInt(e.target.value, 10))}
                    className="w-full accent-[#FF3700] mt-2"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="py-2 px-4 text-xs font-medium text-zinc-600 hover:text-zinc-900 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingPath || !customGoal.trim()}
                  className="inline-flex items-center gap-2 py-2.5 px-5 bg-[#FF3700] hover:bg-[#E53100] disabled:opacity-40 text-white rounded-full text-xs font-semibold cursor-pointer shadow-lg shadow-[#FF3700]/25 transition-all"
                >
                  {isGeneratingPath ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Roadmap</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
