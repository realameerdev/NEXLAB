import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  BookOpen,
  Image as ImageIcon,
  FileText,
  ShieldCheck,
  Sparkles,
  Check,
  AlertCircle,
  Layers,
  Palette,
  Eye,
  Link,
  Lock,
  Globe
} from 'lucide-react';
import { Book, Category, SkillLevel, BookFormat, LegalAvailability } from '../types';
import { useLibrary } from '../context/LibraryContext';
import { BookCover } from './BookCover';

interface UploadBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newBook: Book) => void;
}

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

  // Mode: Community submission (default) vs Admin verified
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');

  // Form State
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

  // Errors & UI
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

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
      return;
    }
    if (!author.trim()) {
      setErrorMsg('Author name is required.');
      return;
    }
    if (!shortDescription.trim()) {
      setErrorMsg('Please enter a brief short description.');
      return;
    }
    if (!readOnlineUrl.trim() && !downloadUrl.trim() && !ebookFileData && !sourceUrl.trim()) {
      setErrorMsg('Please provide either an ebook file, a read online link, or a source URL.');
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
      setIsSubmitting(false);
      onSuccess?.(newBook);
      onClose();
    } catch (err) {
      console.error('Failed to save book:', err);
      setErrorMsg('Failed to save book to library.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl bg-white border border-zinc-200 rounded-3xl shadow-2xl overflow-hidden text-zinc-900 flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#FF3700]/10 border border-[#FF3700]/20 text-[#FF3700]">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-zinc-950 tracking-tight">
                  {isAdminMode ? 'Admin Book Ingestion' : 'Upload Ebook to NEXLAB'}
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FF3700]/10 text-[#FF3700] border border-[#FF3700]/20">
                  {isAdminMode ? 'Admin Verified' : 'Public Submission'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-medium">
                No account required · Added directly to library with verified legal styling
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Admin Toggle */}
            <button
              type="button"
              onClick={() => setIsAdminMode(!isAdminMode)}
              className={`text-xs px-2.5 py-1 rounded-xl border font-mono transition-colors flex items-center gap-1.5 cursor-pointer ${
                isAdminMode
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                  : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-500 border-zinc-200'
              }`}
              title="Toggle Admin Mode"
            >
              <Lock className="w-3 h-3" />
              <span>{isAdminMode ? 'Admin Mode On' : 'Admin Mode'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-900 rounded-full hover:bg-zinc-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {isAdminMode && (
            <div className="p-4 rounded-2xl bg-zinc-900 text-white space-y-2 border border-zinc-800">
              <div className="flex items-center gap-2 text-xs font-bold text-[#FF3700]">
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Publishing Mode Active</span>
              </div>
              <p className="text-xs text-zinc-300">
                Books uploaded in Admin Mode will be tagged as <strong>Official Verified Resources</strong>.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form Fields (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Section 1: Basic Identity */}
              <div className="space-y-4">
                <div className="border-b border-zinc-200 pb-2">
                  <h3 className="text-sm font-extrabold text-zinc-950 uppercase tracking-wider font-mono flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FF3700]" />
                    1. Book Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-zinc-800">
                      Book Title <span className="text-[#FF3700]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Designing Scalable Architectures"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:border-[#FF3700] focus:ring-2 focus:ring-[#FF3700]/20 text-xs font-medium outline-none transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700">Subtitle (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., Practical guide for systems and backend engineers"
                      value={subtitle}
                      onChange={e => setSubtitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:border-[#FF3700] focus:ring-2 focus:ring-[#FF3700]/20 text-xs outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-800">
                      Author Name <span className="text-[#FF3700]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Martin Kleppmann"
                      value={author}
                      onChange={e => setAuthor(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:border-[#FF3700] focus:ring-2 focus:ring-[#FF3700]/20 text-xs font-medium outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700">Co-Authors (Optional)</label>
                    <input
                      type="text"
                      placeholder="Comma-separated names"
                      value={coAuthors}
                      onChange={e => setCoAuthors(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:border-[#FF3700] focus:ring-2 focus:ring-[#FF3700]/20 text-xs outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Taxonomy & Classifications */}
              <div className="space-y-4">
                <div className="border-b border-zinc-200 pb-2">
                  <h3 className="text-sm font-extrabold text-zinc-950 uppercase tracking-wider font-mono flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FF3700]" />
                    2. Classification & Specs
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-zinc-800">Category / Domain</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value as Category)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:border-[#FF3700] text-xs font-semibold bg-white outline-none"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-800">Skill Level</label>
                    <select
                      value={skillLevel}
                      onChange={e => setSkillLevel(e.target.value as SkillLevel)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:border-[#FF3700] text-xs font-semibold bg-white outline-none"
                    >
                      {SKILL_LEVELS.map(lvl => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3 space-y-1.5">
                    <label className="text-xs font-bold text-zinc-800">Topics & Keywords (Comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g., Compilers, Rust, Bytecode, Concurrency"
                      value={topicsInput}
                      onChange={e => setTopicsInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:border-[#FF3700] text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700">Format</label>
                    <select
                      value={format}
                      onChange={e => setFormat(e.target.value as BookFormat)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-white"
                    >
                      {FORMATS.map(f => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700">Publication Year</label>
                    <input
                      type="number"
                      value={publicationYear}
                      onChange={e => setPublicationYear(parseInt(e.target.value) || 2024)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700">Read Time / Pages</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g., 4 hrs"
                        value={estimatedReadTime}
                        onChange={e => setEstimatedReadTime(e.target.value)}
                        className="w-1/2 px-2.5 py-2 rounded-xl border border-zinc-300 text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Pages"
                        value={pageCount}
                        onChange={e => setPageCount(parseInt(e.target.value) || 100)}
                        className="w-1/2 px-2.5 py-2 rounded-xl border border-zinc-300 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Descriptions & Learning Outcomes */}
              <div className="space-y-4">
                <div className="border-b border-zinc-200 pb-2">
                  <h3 className="text-sm font-extrabold text-zinc-950 uppercase tracking-wider font-mono flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FF3700]" />
                    3. Description & Scope
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-800">
                      Short Overview / Pitch (1-2 sentences) <span className="text-[#FF3700]">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Concise overview displayed on book cards and search..."
                      value={shortDescription}
                      onChange={e => setShortDescription(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:border-[#FF3700] text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700">Full Description</label>
                    <textarea
                      rows={3}
                      placeholder="Detailed synopsis, context, and structural breakdown..."
                      value={fullDescription}
                      onChange={e => setFullDescription(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:border-[#FF3700] text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700">
                      What You Will Learn (One key takeaway per line)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="• Bytecode VM architecture and stack execution&#10;• Memory safety without garbage collection&#10;• High-performance concurrency primitives"
                      value={whatYouWillLearnInput}
                      onChange={e => setWhatYouWillLearnInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:border-[#FF3700] text-xs outline-none font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700">Target Audience</label>
                      <input
                        type="text"
                        placeholder="e.g., Software engineers and founders"
                        value={whoItIsFor}
                        onChange={e => setWhoItIsFor(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700">Difficulty & Prerequisites</label>
                      <input
                        type="text"
                        placeholder="e.g., Intermediate knowledge of C / Rust"
                        value={difficulty}
                        onChange={e => setDifficulty(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Source, License & File Upload */}
              <div className="space-y-4">
                <div className="border-b border-zinc-200 pb-2">
                  <h3 className="text-sm font-extrabold text-zinc-950 uppercase tracking-wider font-mono flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FF3700]" />
                    4. Ebook File & Legal Source
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Actual Ebook File Drag & Drop */}
                  <div className="p-4 rounded-2xl border-2 border-dashed border-zinc-300 hover:border-[#FF3700]/60 bg-zinc-50/50 transition-colors">
                    <div className="flex flex-col items-center justify-center text-center gap-2">
                      <FileText className="w-8 h-8 text-[#FF3700]" />
                      <div>
                        <p className="text-xs font-bold text-zinc-900">
                          {ebookFileName ? `Selected: ${ebookFileName}` : 'Upload Ebook File (PDF / EPUB / HTML)'}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          Max 25MB · Stored securely for immediate reading & downloads
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
                        className="mt-1 px-3 py-1.5 rounded-xl bg-white border border-zinc-300 hover:border-[#FF3700] text-xs font-bold text-zinc-800 transition-colors cursor-pointer"
                      >
                        {ebookFileName ? 'Replace File' : 'Browse Local Files'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-800">Authorized Read Online URL</label>
                      <input
                        type="url"
                        placeholder="https://example.com/read"
                        value={readOnlineUrl}
                        onChange={e => setReadOnlineUrl(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700">Direct Download Link</label>
                      <input
                        type="url"
                        placeholder="https://example.com/download.pdf"
                        value={downloadUrl}
                        onChange={e => setDownloadUrl(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-800">Legal Availability</label>
                      <select
                        value={availability}
                        onChange={e => setAvailability(e.target.value as LegalAvailability)}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-semibold bg-white"
                      >
                        {LEGAL_AVAILABILITIES.map(a => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-800">License Information</label>
                      <input
                        type="text"
                        placeholder="e.g., Creative Commons CC BY 4.0 / MIT"
                        value={licenseInfo}
                        onChange={e => setLicenseInfo(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700">Source Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Author Official Website / GitHub"
                        value={sourceName}
                        onChange={e => setSourceName(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700">Source URL</label>
                      <input
                        type="url"
                        placeholder="https://author.org/book"
                        value={sourceUrl}
                        onChange={e => setSourceUrl(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Book Card & Cover Generator (5 cols) */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-4">
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

          {/* Modal Footer / Action Bar */}
          <div className="pt-6 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-0 bg-white py-3">
            <div className="text-xs text-zinc-500">
              Zero account required. Ebook is immediately added to the catalog and personal library.
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-full border border-zinc-200 hover:bg-zinc-100 text-xs font-bold text-zinc-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial px-6 py-2.5 rounded-full bg-[#FF3700] hover:bg-[#E53100] text-white text-xs font-bold shadow-xl shadow-[#FF3700]/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Adding Ebook...' : 'Publish to Library'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
