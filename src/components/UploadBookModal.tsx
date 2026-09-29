import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  BookOpen,
  Image as ImageIcon,
  FileText,
  ShieldCheck,
  Check,
  AlertCircle,
  Palette,
  Eye,
  Lock,
  RotateCcw,
  Sparkles,
  Smartphone,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ArrowLeft
} from 'lucide-react';
import { Book, Category, SkillLevel, BookFormat, LegalAvailability } from '../types';
import { useLibrary } from '../context/LibraryContext';
import { BookCover } from './BookCover';

interface UploadBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newBook: Book) => void;
}

const DRAFT_STORAGE_KEY = 'nexlab_upload_draft_v1';

const CATEGORIES: Category[] = [
  'Development',
  'AI & Machine Learning',
  'Game Development',
  'Design',
  'Cybersecurity',
  'Data & Analytics',
  'Content Creation',
  'Business',
  'Startups',
  'Marketing',
  'Product',
  'Leadership',
  'Creativity',
  'Science',
  'Technology'
];

const SKILL_LEVELS: SkillLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
const FORMATS: BookFormat[] = ['PDF', 'EPUB', 'Web Interactive', 'Paperback', 'Hardcover', 'Audio'];
const LEGAL_AVAILABILITIES: LegalAvailability[] = [
  'Free & Open Access',
  'Creative Commons',
  'Author Authorized Free',
  'Public Domain',
  'Publisher Open Edition',
  'Commercial Edition'
];

const GRADIENT_PRESETS = [
  { name: 'Vermilion Ember', from: '#18181b', to: '#FF3700', accent: '#ff7a59', pattern: 'circuits' },
  { name: 'Cyan Pulse', from: '#082f49', to: '#0284c7', accent: '#38bdf8', pattern: 'mesh' },
  { name: 'Deep Midnight', from: '#09090b', to: '#27272a', accent: '#FF3700', pattern: 'grid' },
  { name: 'Emerald Tech', from: '#064e3b', to: '#059669', accent: '#34d399', pattern: 'circuits' },
  { name: 'Purple Nebula', from: '#3b0764', to: '#7c3aed', accent: '#c084fc', pattern: 'neural' },
  { name: 'Cyber Indigo', from: '#1e1b4b', to: '#4f46e5', accent: '#818cf8', pattern: 'waves' },
  { name: 'Amber Gold', from: '#451a03', to: '#d97706', accent: '#fbbf24', pattern: 'geometric' },
  { name: 'Rose Obsidian', from: '#4c0519', to: '#e11d48', accent: '#fb7185', pattern: 'neural' }
];

export const UploadBookModal: React.FC<UploadBookModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { addCustomBook } = useLibrary();

  // Mobile active tab view ('form' | 'preview')
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');
  // Mobile step navigator ('details' | 'specs' | 'desc' | 'files' | 'cover')
  const [activeStep, setActiveStep] = useState<'details' | 'specs' | 'desc' | 'files' | 'cover'>('details');

  // Mode: Community submission (default) vs Admin verified
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Form States
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coAuthors, setCoAuthors] = useState('');
  const [category, setCategory] = useState<Category>('Development');
  const [topicsInput, setTopicsInput] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('Intermediate');
  const [format, setFormat] = useState<BookFormat>('PDF');
  const [language, setLanguage] = useState('English');
  const [publicationYear, setPublicationYear] = useState<number>(new Date().getFullYear());
  const [estimatedReadTime, setEstimatedReadTime] = useState('4 hrs');
  const [pageCount, setPageCount] = useState<number>(240);

  // Description & Learnings
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [whatYouWillLearnInput, setWhatYouWillLearnInput] = useState('');
  const [whoItIsFor, setWhoItIsFor] = useState('');
  const [difficulty, setDifficulty] = useState('');

  // Source & Legal
  const [availability, setAvailability] = useState<LegalAvailability>('Free & Open Access');
  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [licenseInfo, setLicenseInfo] = useState('Creative Commons CC-BY 4.0');
  const [verifiedNote, setVerifiedNote] = useState('Authorized open distribution by author / rights holder.');
  const [readOnlineUrl, setReadOnlineUrl] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  // Cover Customization
  const [coverMode, setCoverMode] = useState<'preset' | 'custom'>('preset');
  const [selectedGradientIndex, setSelectedGradientIndex] = useState(0);
  const [customCoverImage, setCustomCoverImage] = useState<string | null>(null);

  // Ebook File Attachment
  const [ebookFileName, setEbookFileName] = useState<string | null>(null);
  const [ebookFileData, setEbookFileData] = useState<string | null>(null);

  // Draft status & errors
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // 1. Load Draft from localStorage on mount or whenever modal opens
  useEffect(() => {
    if (!isOpen) return;
    try {
      const savedDraftRaw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraftRaw) {
        const draft = JSON.parse(savedDraftRaw);
        if (draft.title || draft.author || draft.shortDescription || draft.ebookFileName) {
          setTitle(draft.title || '');
          setSubtitle(draft.subtitle || '');
          setAuthor(draft.author || '');
          setCoAuthors(draft.coAuthors || '');
          if (draft.category) setCategory(draft.category);
          setTopicsInput(draft.topicsInput || '');
          if (draft.skillLevel) setSkillLevel(draft.skillLevel);
          if (draft.format) setFormat(draft.format);
          setLanguage(draft.language || 'English');
          setPublicationYear(draft.publicationYear || new Date().getFullYear());
          setEstimatedReadTime(draft.estimatedReadTime || '4 hrs');
          setPageCount(draft.pageCount || 240);
          setShortDescription(draft.shortDescription || '');
          setFullDescription(draft.fullDescription || '');
          setWhatYouWillLearnInput(draft.whatYouWillLearnInput || '');
          setWhoItIsFor(draft.whoItIsFor || '');
          setDifficulty(draft.difficulty || '');
          if (draft.availability) setAvailability(draft.availability);
          setSourceName(draft.sourceName || '');
          setSourceUrl(draft.sourceUrl || '');
          setLicenseInfo(draft.licenseInfo || 'Creative Commons CC-BY 4.0');
          setVerifiedNote(draft.verifiedNote || 'Authorized open distribution by author / rights holder.');
          setReadOnlineUrl(draft.readOnlineUrl || '');
          setDownloadUrl(draft.downloadUrl || '');
          if (draft.coverMode) setCoverMode(draft.coverMode);
          if (typeof draft.selectedGradientIndex === 'number') setSelectedGradientIndex(draft.selectedGradientIndex);
          if (draft.customCoverImage) setCustomCoverImage(draft.customCoverImage);
          if (draft.ebookFileName) setEbookFileName(draft.ebookFileName);
          if (draft.ebookFileData) setEbookFileData(draft.ebookFileData);
          if (typeof draft.isAdminMode === 'boolean') setIsAdminMode(draft.isAdminMode);
          if (draft.savedAt) setLastSavedTime(draft.savedAt);
          setHasDraft(true);
        }
      }
    } catch (e) {
      console.warn('Failed to parse upload draft from localStorage:', e);
    }
  }, [isOpen]);

  // 2. Auto-save Draft to localStorage on every change
  useEffect(() => {
    // Only save if there's meaningful content
    const hasContent = !!(
      title.trim() ||
      author.trim() ||
      shortDescription.trim() ||
      fullDescription.trim() ||
      ebookFileName ||
      readOnlineUrl.trim() ||
      sourceUrl.trim() ||
      customCoverImage
    );

    if (!hasContent) return;

    const draftData = {
      isAdminMode,
      title,
      subtitle,
      author,
      coAuthors,
      category,
      topicsInput,
      skillLevel,
      format,
      language,
      publicationYear,
      estimatedReadTime,
      pageCount,
      shortDescription,
      fullDescription,
      whatYouWillLearnInput,
      whoItIsFor,
      difficulty,
      availability,
      sourceName,
      sourceUrl,
      licenseInfo,
      verifiedNote,
      readOnlineUrl,
      downloadUrl,
      coverMode,
      selectedGradientIndex,
      customCoverImage,
      ebookFileName,
      ebookFileData,
      savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
        setLastSavedTime(draftData.savedAt);
        setHasDraft(true);
      } catch (e) {
        console.warn('LocalStorage quota limit reached while saving upload draft:', e);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [
    isAdminMode,
    title,
    subtitle,
    author,
    coAuthors,
    category,
    topicsInput,
    skillLevel,
    format,
    language,
    publicationYear,
    estimatedReadTime,
    pageCount,
    shortDescription,
    fullDescription,
    whatYouWillLearnInput,
    whoItIsFor,
    difficulty,
    availability,
    sourceName,
    sourceUrl,
    licenseInfo,
    verifiedNote,
    readOnlineUrl,
    downloadUrl,
    coverMode,
    selectedGradientIndex,
    customCoverImage,
    ebookFileName,
    ebookFileData
  ]);

  // Clear Draft Function
  const handleClearDraft = () => {
    if (window.confirm('Clear all draft fields and start over with a blank form?')) {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setTitle('');
      setSubtitle('');
      setAuthor('');
      setCoAuthors('');
      setCategory('Development');
      setTopicsInput('');
      setSkillLevel('Intermediate');
      setFormat('PDF');
      setLanguage('English');
      setPublicationYear(new Date().getFullYear());
      setEstimatedReadTime('4 hrs');
      setPageCount(240);
      setShortDescription('');
      setFullDescription('');
      setWhatYouWillLearnInput('');
      setWhoItIsFor('');
      setDifficulty('');
      setAvailability('Free & Open Access');
      setSourceName('');
      setSourceUrl('');
      setLicenseInfo('Creative Commons CC-BY 4.0');
      setVerifiedNote('Authorized open distribution by author / rights holder.');
      setReadOnlineUrl('');
      setDownloadUrl('');
      setCoverMode('preset');
      setSelectedGradientIndex(0);
      setCustomCoverImage(null);
      setEbookFileName(null);
      setEbookFileData(null);
      setIsAdminMode(false);
      setHasDraft(false);
      setLastSavedTime(null);
      setErrorMsg(null);
    }
  };

  if (!isOpen) return null;

  // Handle Cover Image Upload
  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Cover image must be under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setCustomCoverImage(reader.result as string);
        setCoverMode('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Ebook File Upload
  const handleEbookFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        setErrorMsg('Ebook file must be under 25MB.');
        return;
      }
      setEbookFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setEbookFileData(reader.result as string);
        // Auto-fill download / read URL if empty
        if (!downloadUrl) {
          setDownloadUrl(reader.result as string);
        }
        if (!readOnlineUrl && (file.type.includes('pdf') || file.name.endsWith('.pdf'))) {
          setReadOnlineUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const previewBook: Book = {
    id: 'preview-id',
    title: title.trim() || 'Untitled Book',
    subtitle: subtitle.trim() || undefined,
    author: author.trim() || 'Author Name',
    coAuthors: coAuthors ? coAuthors.split(',').map(s => s.trim()).filter(Boolean) : undefined,
    category,
    topics: topicsInput ? topicsInput.split(',').map(s => s.trim()).filter(Boolean) : ['Technology'],
    skillLevel,
    format,
    publicationYear: publicationYear || new Date().getFullYear(),
    language: language.trim() || 'English',
    rating: 5.0,
    ratingsCount: 1,
    estimatedReadTime: estimatedReadTime.trim() || '3 hrs',
    pageCount: pageCount || 100,
    shortDescription: shortDescription.trim() || 'A high-impact technical guide.',
    fullDescription: fullDescription.trim() || 'Comprehensive handbook for builders.',
    whatYouWillLearn: whatYouWillLearnInput ? whatYouWillLearnInput.split('\n').map(s => s.trim()).filter(Boolean) : ['Key foundational principles'],
    whoItIsFor: whoItIsFor.trim() || 'Engineers and designers',
    difficulty: difficulty.trim() || 'Clear and accessible',
    aiRecommendationExplanation: 'Recently submitted open resource.',
    availability,
    isLegallyFree: availability !== 'Commercial Edition',
    officialSource: {
      name: sourceName.trim() || 'Author Free Edition',
      url: sourceUrl.trim() || readOnlineUrl.trim() || '#',
      license: licenseInfo.trim() || 'Creative Commons',
      verifiedNote: verifiedNote.trim() || 'Verified legal distribution'
    },
    readOnlineUrl: readOnlineUrl.trim() || (ebookFileData || undefined),
    downloadUrl: downloadUrl.trim() || (ebookFileData || undefined),
    coverGradient: GRADIENT_PRESETS[selectedGradientIndex],
    coverImage: customCoverImage || undefined,
    ebookFileName: ebookFileName || undefined,
    ebookFileData: ebookFileData || undefined,
    isCommunitySubmission: !isAdminMode,
    sourceType: isAdminMode ? 'official' : 'community',
    uploadedAt: new Date().toISOString(),
    isAdminVerified: isAdminMode
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!title.trim()) {
      setErrorMsg('Book title is required.');
      setActiveStep('details');
      setMobileTab('form');
      return;
    }
    if (!author.trim()) {
      setErrorMsg('Author name is required.');
      setActiveStep('details');
      setMobileTab('form');
      return;
    }
    if (!shortDescription.trim()) {
      setErrorMsg('Please enter a brief short description.');
      setActiveStep('desc');
      setMobileTab('form');
      return;
    }
    if (!readOnlineUrl.trim() && !downloadUrl.trim() && !ebookFileData && !sourceUrl.trim()) {
      setErrorMsg('Please provide either an ebook file, a read online link, or a source URL.');
      setActiveStep('files');
      setMobileTab('form');
      return;
    }

    setIsSubmitting(true);

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'book';
    
    const uniqueId = `custom-${slug}-${Date.now()}`;

    const newBook: Book = {
      ...previewBook,
      id: uniqueId,
      coverGradient: GRADIENT_PRESETS[selectedGradientIndex],
      coverImage: customCoverImage || undefined,
      ebookFileData: ebookFileData || undefined,
      ebookFileName: ebookFileName || undefined,
      isCommunitySubmission: !isAdminMode,
      sourceType: isAdminMode ? 'official' : 'community',
      uploadedAt: new Date().toISOString(),
      isAdminVerified: isAdminMode
    };

    try {
      addCustomBook(newBook);
      // Clean up the draft now that it's successfully added!
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setIsSubmitting(false);
      onSuccess?.(newBook);
      onClose();
    } catch (err) {
      console.error('Failed to save book:', err);
      setErrorMsg('Failed to save book to library.');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-start sm:items-center justify-center p-0 sm:p-4 lg:p-6 animate-in fade-in duration-200">
      <div
        className="relative w-full h-[100dvh] sm:h-auto sm:max-h-[92vh] sm:max-w-5xl bg-white sm:border sm:border-zinc-200 sm:rounded-3xl shadow-2xl overflow-hidden text-zinc-900 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* ========================================================================= */}
        {/* MODAL HEADER                                                              */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-zinc-200 bg-white shrink-0 z-20">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition-all cursor-pointer group shrink-0"
              title="Go back"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#FF3700] group-hover:-translate-x-0.5 transition-transform" />
              <span>Go Back</span>
            </button>

            <div className="p-1.5 sm:p-2 rounded-xl bg-[#FF3700]/10 border border-[#FF3700]/20 text-[#FF3700] shrink-0 hidden xs:flex">
              <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-lg font-extrabold text-zinc-950 tracking-tight truncate">
                  {isAdminMode ? 'Admin Ingestion' : 'Upload Ebook'}
                </h2>
                <span className="hidden sm:inline text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FF3700]/10 text-[#FF3700] border border-[#FF3700]/20 shrink-0">
                  {isAdminMode ? 'Official' : 'Public'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-zinc-500 font-medium">
                {lastSavedTime ? (
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    Auto-saved ({lastSavedTime})
                  </span>
                ) : (
                  <span>Auto-saves as you type</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Clear Draft button if draft active */}
            {hasDraft && (
              <button
                type="button"
                onClick={handleClearDraft}
                className="text-[11px] text-zinc-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors flex items-center gap-1 cursor-pointer"
                title="Discard draft and reset form"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden md:inline">Reset Form</span>
              </button>
            )}

            {/* Admin Toggle */}
            <button
              type="button"
              onClick={() => setIsAdminMode(!isAdminMode)}
              className={`text-[11px] px-2 sm:px-2.5 py-1 rounded-xl border font-mono transition-colors flex items-center gap-1 cursor-pointer ${
                isAdminMode
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                  : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border-zinc-200'
              }`}
              title="Toggle Admin Mode"
            >
              <Lock className="w-3 h-3" />
              <span className="hidden sm:inline">{isAdminMode ? 'Admin Mode' : 'Admin'}</span>
            </button>

            {/* Close / Cancel Button */}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-zinc-400 hover:text-zinc-900 rounded-full hover:bg-zinc-100 transition-colors cursor-pointer"
              aria-label="Close modal (Draft remains saved)"
              title="Close (Draft auto-saved)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile View Switcher (Form vs Live Preview) */}
        <div className="lg:hidden flex items-center border-b border-zinc-200 bg-zinc-50/80 p-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setMobileTab('form')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === 'form'
                ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#FF3700]" />
            <span>Upload Form</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === 'preview'
                ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-[#FF3700]" />
            <span>Live Card Preview</span>
          </button>
        </div>

        {/* Mobile Step Navigator (Quick Jump on small screens) */}
        {mobileTab === 'form' && (
          <div className="lg:hidden flex items-center gap-1.5 px-4 py-2 bg-white border-b border-zinc-100 overflow-x-auto scrollbar-none text-[11px] font-semibold shrink-0">
            {(
              [
                { id: 'details', label: '1. Details' },
                { id: 'specs', label: '2. Specs' },
                { id: 'desc', label: '3. Scope' },
                { id: 'files', label: '4. Files' },
                { id: 'cover', label: '5. Cover' }
              ] as const
            ).map(step => (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  setActiveStep(step.id);
                  const el = document.getElementById(`step-section-${step.id}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors ${
                  activeStep === step.id
                    ? 'bg-[#FF3700]/10 text-[#FF3700] font-bold border border-[#FF3700]/20'
                    : 'text-zinc-500 hover:text-zinc-800 bg-zinc-50'
                }`}
              >
                {step.label}
              </button>
            ))}
          </div>
        )}

        {/* ========================================================================= */}
        {/* FORM BODY / SCROLLABLE CONTENT                                           */}
        {/* ========================================================================= */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8"
        >
          {errorMsg && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 shadow-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {/* Mobile Preview View */}
          {mobileTab === 'preview' ? (
            <div className="space-y-6 max-w-sm mx-auto py-2">
              <div className="text-center space-y-1">
                <span className="text-xs font-mono text-[#FF3700] uppercase tracking-wider font-bold">
                  Card & Cover Appearance
                </span>
                <h3 className="text-base font-extrabold text-zinc-950">
                  {title.trim() || 'Untitled Book'}
                </h3>
              </div>

              {/* Exact Card Preview */}
              <div className="p-5 rounded-3xl bg-zinc-50 border border-zinc-200 flex flex-col items-center gap-4 shadow-sm">
                <BookCover book={previewBook} size="md" className="shadow-2xl" />

                <div className="w-full text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-zinc-500">
                    <span className="text-[#FF3700] font-bold">{previewBook.category}</span>
                    <span>·</span>
                    <span>{previewBook.skillLevel}</span>
                    <span>·</span>
                    <span>{previewBook.format}</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-zinc-950 truncate max-w-full">
                    {previewBook.title}
                  </h4>
                  <p className="text-xs text-zinc-500">
                    by {previewBook.author}
                  </p>
                </div>

                <div className="w-full pt-3 border-t border-zinc-200 flex items-center justify-between text-[11px]">
                  <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium border border-purple-200">
                    {isAdminMode ? 'Verified Official' : 'Community Upload'}
                  </span>
                  <span className="font-mono text-zinc-500">
                    ~{previewBook.estimatedReadTime}
                  </span>
                </div>
              </div>

              {/* Quick Jump back to Form */}
              <button
                type="button"
                onClick={() => setMobileTab('form')}
                className="w-full py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4 text-[#FF3700]" />
                <span>Return to Editing Form</span>
              </button>
            </div>
          ) : (
            /* Main Form Grid */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* Left Column: Form Fields (7 cols on desktop, full width on mobile) */}
              <div className="lg:col-span-7 space-y-6 sm:space-y-8">
                {/* SECTION 1: BOOK DETAILS */}
                <div id="step-section-details" className="space-y-3 sm:space-y-4">
                  <div className="border-b border-zinc-200 pb-2">
                    <h3 className="text-xs sm:text-sm font-extrabold text-zinc-950 uppercase tracking-wider font-mono flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#FF3700]" />
                      1. Book Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-zinc-800 block">
                        Book Title <span className="text-[#FF3700]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Designing Scalable Architectures"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-zinc-300 focus:border-[#FF3700] focus:ring-2 focus:ring-[#FF3700]/20 text-sm sm:text-xs font-medium outline-none transition-all"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-zinc-700 block">Subtitle (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g., Practical guide for systems and backend engineers"
                        value={subtitle}
                        onChange={e => setSubtitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-zinc-300 focus:border-[#FF3700] focus:ring-2 focus:ring-[#FF3700]/20 text-sm sm:text-xs outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-800 block">
                        Author Name <span className="text-[#FF3700]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Martin Kleppmann"
                        value={author}
                        onChange={e => setAuthor(e.target.value)}
                        className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-zinc-300 focus:border-[#FF3700] focus:ring-2 focus:ring-[#FF3700]/20 text-sm sm:text-xs font-medium outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 block">Co-Authors (Optional)</label>
                      <input
                        type="text"
                        placeholder="Comma-separated names"
                        value={coAuthors}
                        onChange={e => setCoAuthors(e.target.value)}
                        className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-zinc-300 focus:border-[#FF3700] focus:ring-2 focus:ring-[#FF3700]/20 text-sm sm:text-xs outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: SPECIFICATIONS */}
                <div id="step-section-specs" className="space-y-3 sm:space-y-4">
                  <div className="border-b border-zinc-200 pb-2">
                    <h3 className="text-xs sm:text-sm font-extrabold text-zinc-950 uppercase tracking-wider font-mono flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#FF3700]" />
                      2. Domain & Specs
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-zinc-800 block">Category / Domain</label>
                      <select
                        value={category}
                        onChange={e => setCategory(e.target.value as Category)}
                        className="w-full px-3 py-2.5 sm:py-2 rounded-xl border border-zinc-300 focus:border-[#FF3700] text-sm sm:text-xs font-semibold bg-white outline-none"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-800 block">Skill Level</label>
                      <select
                        value={skillLevel}
                        onChange={e => setSkillLevel(e.target.value as SkillLevel)}
                        className="w-full px-3 py-2.5 sm:py-2 rounded-xl border border-zinc-300 focus:border-[#FF3700] text-sm sm:text-xs font-semibold bg-white outline-none"
                      >
                        {SKILL_LEVELS.map(lvl => (
                          <option key={lvl} value={lvl}>
                            {lvl}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-xs font-bold text-zinc-800 block">Topics & Keywords</label>
                      <input
                        type="text"
                        placeholder="e.g., Compilers, Rust, Bytecode, Concurrency"
                        value={topicsInput}
                        onChange={e => setTopicsInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-zinc-300 focus:border-[#FF3700] text-sm sm:text-xs outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 block">Format</label>
                      <select
                        value={format}
                        onChange={e => setFormat(e.target.value as BookFormat)}
                        className="w-full px-3 py-2.5 sm:py-2 rounded-xl border border-zinc-300 text-sm sm:text-xs bg-white"
                      >
                        {FORMATS.map(f => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 block">Publication Year</label>
                      <input
                        type="number"
                        value={publicationYear}
                        onChange={e => setPublicationYear(parseInt(e.target.value) || 2024)}
                        className="w-full px-3 py-2.5 sm:py-2 rounded-xl border border-zinc-300 text-sm sm:text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 block">Read Time / Pages</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. 4 hrs"
                          value={estimatedReadTime}
                          onChange={e => setEstimatedReadTime(e.target.value)}
                          className="w-1/2 px-2.5 py-2.5 sm:py-2 rounded-xl border border-zinc-300 text-sm sm:text-xs"
                        />
                        <input
                          type="number"
                          placeholder="Pages"
                          value={pageCount}
                          onChange={e => setPageCount(parseInt(e.target.value) || 100)}
                          className="w-1/2 px-2.5 py-2.5 sm:py-2 rounded-xl border border-zinc-300 text-sm sm:text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: DESCRIPTION & SCOPE */}
                <div id="step-section-desc" className="space-y-3 sm:space-y-4">
                  <div className="border-b border-zinc-200 pb-2">
                    <h3 className="text-xs sm:text-sm font-extrabold text-zinc-950 uppercase tracking-wider font-mono flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#FF3700]" />
                      3. Description & Scope
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-800 block">
                        Short Overview / Pitch (1-2 sentences) <span className="text-[#FF3700]">*</span>
                      </label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Concise overview displayed on book cards and search..."
                        value={shortDescription}
                        onChange={e => setShortDescription(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:border-[#FF3700] text-sm sm:text-xs outline-none font-sans"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 block">Full Description</label>
                      <textarea
                        rows={3}
                        placeholder="Detailed synopsis, context, and architectural breakdown..."
                        value={fullDescription}
                        onChange={e => setFullDescription(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:border-[#FF3700] text-sm sm:text-xs outline-none font-sans"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 block">
                        What You Will Learn (One key takeaway per line)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="• Bytecode VM architecture and stack execution&#10;• Memory safety without garbage collection&#10;• High-performance concurrency primitives"
                        value={whatYouWillLearnInput}
                        onChange={e => setWhatYouWillLearnInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:border-[#FF3700] text-sm sm:text-xs outline-none font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-700 block">Target Audience</label>
                        <input
                          type="text"
                          placeholder="e.g., Software engineers and founders"
                          value={whoItIsFor}
                          onChange={e => setWhoItIsFor(e.target.value)}
                          className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-zinc-300 text-sm sm:text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-700 block">Difficulty / Prerequisites</label>
                        <input
                          type="text"
                          placeholder="e.g., Intermediate knowledge of C / Rust"
                          value={difficulty}
                          onChange={e => setDifficulty(e.target.value)}
                          className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-zinc-300 text-sm sm:text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 4: EBOOK FILE & SOURCE */}
                <div id="step-section-files" className="space-y-3 sm:space-y-4">
                  <div className="border-b border-zinc-200 pb-2">
                    <h3 className="text-xs sm:text-sm font-extrabold text-zinc-950 uppercase tracking-wider font-mono flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#FF3700]" />
                      4. Ebook File & Legal Source
                    </h3>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    {/* Ebook File Upload Box */}
                    <div className="p-4 sm:p-5 rounded-2xl border-2 border-dashed border-zinc-300 hover:border-[#FF3700]/60 bg-zinc-50/50 transition-colors">
                      <div className="flex flex-col items-center justify-center text-center gap-2">
                        <FileText className="w-8 h-8 text-[#FF3700]" />
                        <div>
                          <p className="text-xs font-bold text-zinc-900">
                            {ebookFileName ? `Selected: ${ebookFileName}` : 'Upload Ebook File (PDF / EPUB / HTML)'}
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            Max 25MB · Auto-persisted in local browser storage
                          </p>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.epub,.txt,.html,.md"
                          onChange={handleEbookFileChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-1 px-4 py-2 rounded-xl bg-white border border-zinc-300 hover:border-[#FF3700] text-xs font-bold text-zinc-800 transition-colors cursor-pointer shadow-2xs"
                        >
                          {ebookFileName ? 'Replace Ebook File' : 'Browse Local Files'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-800 block">Authorized Read Online URL</label>
                        <input
                          type="url"
                          placeholder="https://example.com/read"
                          value={readOnlineUrl}
                          onChange={e => setReadOnlineUrl(e.target.value)}
                          className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-zinc-300 text-sm sm:text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-700 block">Direct Download Link</label>
                        <input
                          type="url"
                          placeholder="https://example.com/download.pdf"
                          value={downloadUrl}
                          onChange={e => setDownloadUrl(e.target.value)}
                          className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-zinc-300 text-sm sm:text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-800 block">Legal Availability</label>
                        <select
                          value={availability}
                          onChange={e => setAvailability(e.target.value as LegalAvailability)}
                          className="w-full px-3 py-2.5 sm:py-2 rounded-xl border border-zinc-300 text-sm sm:text-xs font-semibold bg-white"
                        >
                          {LEGAL_AVAILABILITIES.map(a => (
                            <option key={a} value={a}>
                              {a}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-800 block">License Information</label>
                        <input
                          type="text"
                          placeholder="e.g., Creative Commons CC BY 4.0 / MIT"
                          value={licenseInfo}
                          onChange={e => setLicenseInfo(e.target.value)}
                          className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-zinc-300 text-sm sm:text-xs font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-700 block">Source Name</label>
                        <input
                          type="text"
                          placeholder="e.g., Author Official Website / GitHub"
                          value={sourceName}
                          onChange={e => setSourceName(e.target.value)}
                          className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-zinc-300 text-sm sm:text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-700 block">Source URL</label>
                        <input
                          type="url"
                          placeholder="https://author.org/book"
                          value={sourceUrl}
                          onChange={e => setSourceUrl(e.target.value)}
                          className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-zinc-300 text-sm sm:text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 5: COVER CUSTOMIZATION ON MOBILE */}
                <div id="step-section-cover" className="space-y-3 sm:space-y-4 lg:hidden">
                  <div className="border-b border-zinc-200 pb-2">
                    <h3 className="text-xs sm:text-sm font-extrabold text-zinc-950 uppercase tracking-wider font-mono flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#FF3700]" />
                      5. Cover Artwork
                    </h3>
                  </div>

                  {/* Cover Mode Switcher */}
                  <div className="bg-zinc-100 p-1 rounded-2xl flex items-center gap-1 border border-zinc-200">
                    <button
                      type="button"
                      onClick={() => setCoverMode('preset')}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        coverMode === 'preset'
                          ? 'bg-white text-zinc-950 shadow-xs'
                          : 'text-zinc-600'
                      }`}
                    >
                      Gradient Presets
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverMode('custom')}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        coverMode === 'custom'
                          ? 'bg-white text-zinc-950 shadow-xs'
                          : 'text-zinc-600'
                      }`}
                    >
                      Upload Cover Image
                    </button>
                  </div>

                  {coverMode === 'preset' ? (
                    <div className="grid grid-cols-4 gap-2">
                      {GRADIENT_PRESETS.map((preset, idx) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setSelectedGradientIndex(idx)}
                          className={`h-12 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex items-center justify-center ${
                            selectedGradientIndex === idx
                              ? 'ring-2 ring-[#FF3700] border-transparent scale-105'
                              : 'border-zinc-200'
                          }`}
                          style={{ background: `linear-gradient(135deg, ${preset.from}, ${preset.to})` }}
                          title={preset.name}
                        >
                          {selectedGradientIndex === idx && (
                            <Check className="w-4 h-4 text-white drop-shadow" />
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCoverFileChange}
                        className="hidden"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => coverInputRef.current?.click()}
                          className="flex-1 py-2.5 px-3 rounded-xl border border-zinc-300 hover:border-[#FF3700] text-xs font-bold text-zinc-800 bg-white cursor-pointer"
                        >
                          {customCoverImage ? 'Change Image' : 'Select Cover Image'}
                        </button>
                        {customCoverImage && (
                          <button
                            type="button"
                            onClick={() => {
                              setCustomCoverImage(null);
                              setCoverMode('preset');
                            }}
                            className="py-2.5 px-3 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Live Book Card & Cover Generator (Desktop 5 cols) */}
              <div className="hidden lg:block lg:col-span-5 space-y-6 lg:sticky lg:top-4">
                <div className="border-b border-zinc-200 pb-2 flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-zinc-950 uppercase tracking-wider font-mono flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#FF3700]" />
                    Live Preview
                  </h3>
                  <span className="text-[11px] font-mono text-zinc-500">
                    Exact NEXLAB Design
                  </span>
                </div>

                {/* Cover Mode Switcher */}
                <div className="bg-zinc-100 p-1 rounded-2xl flex items-center gap-1 border border-zinc-200">
                  <button
                    type="button"
                    onClick={() => setCoverMode('preset')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      coverMode === 'preset'
                        ? 'bg-white text-zinc-950 shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-950'
                    }`}
                  >
                    Gradient Presets
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverMode('custom')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      coverMode === 'custom'
                        ? 'bg-white text-zinc-950 shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-950'
                    }`}
                  >
                    Custom Cover Image
                  </button>
                </div>

                {/* Preset Palette Picker */}
                {coverMode === 'preset' ? (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-[#FF3700]" />
                      Choose Editorial Cover Theme
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {GRADIENT_PRESETS.map((preset, idx) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setSelectedGradientIndex(idx)}
                          className={`h-10 rounded-xl p-1 border transition-all cursor-pointer relative overflow-hidden flex items-center justify-center ${
                            selectedGradientIndex === idx
                              ? 'ring-2 ring-[#FF3700] border-transparent scale-105'
                              : 'border-zinc-200 hover:opacity-90'
                          }`}
                          style={{ background: `linear-gradient(135deg, ${preset.from}, ${preset.to})` }}
                          title={preset.name}
                        >
                          {selectedGradientIndex === idx && (
                            <Check className="w-4 h-4 text-white drop-shadow" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#FF3700]" />
                      Upload Cover Image (PNG / JPG)
                    </label>
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCoverFileChange}
                      className="hidden"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        className="flex-1 py-2 px-3 rounded-xl border border-zinc-300 hover:border-[#FF3700] text-xs font-bold text-zinc-800 bg-white cursor-pointer"
                      >
                        {customCoverImage ? 'Change Image' : 'Select Cover Image'}
                      </button>
                      {customCoverImage && (
                        <button
                          type="button"
                          onClick={() => {
                            setCustomCoverImage(null);
                            setCoverMode('preset');
                          }}
                          className="py-2 px-3 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Exact Card Preview */}
                <div className="p-4 rounded-3xl bg-zinc-50 border border-zinc-200 flex flex-col items-center gap-4">
                  <BookCover book={previewBook} size="md" className="shadow-2xl" />

                  <div className="w-full text-center space-y-1">
                    <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-zinc-500">
                      <span className="text-[#FF3700] font-bold">{previewBook.category}</span>
                      <span>·</span>
                      <span>{previewBook.skillLevel}</span>
                      <span>·</span>
                      <span>{previewBook.format}</span>
                    </div>
                    <h4 className="text-sm font-extrabold text-zinc-950 truncate max-w-full">
                      {previewBook.title}
                    </h4>
                    <p className="text-xs text-zinc-500">
                      by {previewBook.author}
                    </p>
                  </div>

                  <div className="w-full pt-3 border-t border-zinc-200 flex items-center justify-between text-[11px]">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                      {previewBook.availability}
                    </span>
                    <span className="font-mono text-zinc-500">
                      {isAdminMode ? 'Official Resource' : 'Community Submission'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODAL FOOTER / ACTION BAR                                                 */}
          {/* ========================================================================= */}
          <div className="pt-4 sm:pt-6 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 sticky bottom-0 bg-white py-3 -mx-4 px-4 sm:mx-0 sm:px-0 z-10 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="text-[11px] sm:text-xs text-zinc-500 text-center sm:text-left">
              <span>Auto-saved locally. </span>
              <span className="text-zinc-700 font-medium">Safe to close and resume anytime.</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-full border border-zinc-200 hover:bg-zinc-100 text-xs font-bold text-zinc-700 transition-colors cursor-pointer"
              >
                Cancel / Close
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial px-6 py-2.5 rounded-full bg-[#FF3700] hover:bg-[#E53100] text-white text-xs font-bold shadow-xl shadow-[#FF3700]/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Publishing...' : 'Publish to Library'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
