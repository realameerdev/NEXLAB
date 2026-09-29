export type Category =
  | 'Development'
  | 'AI & Machine Learning'
  | 'Game Development'
  | 'Design'
  | 'Cybersecurity'
  | 'Data & Analytics'
  | 'Content Creation'
  | 'Business'
  | 'Startups'
  | 'Marketing'
  | 'Product'
  | 'Leadership'
  | 'Creativity'
  | 'Science'
  | 'Technology';

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';

export type BookFormat =
  | 'Hardcover'
  | 'Paperback'
  | 'EPUB'
  | 'PDF'
  | 'Web Interactive'
  | 'Audio';

export type LegalAvailability =
  | 'Free & Open Access'
  | 'Public Domain'
  | 'Creative Commons'
  | 'Author Authorized Free'
  | 'Publisher Open Edition'
  | 'Commercial Edition';

export interface OfficialSource {
  name: string;
  url: string;
  license: string;
  verifiedNote: string;
}

export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  coAuthors?: string[];
  category: Category;
  topics: string[];
  skillLevel: SkillLevel;
  format: BookFormat;
  publicationYear: number;
  language: string;
  rating: number;
  ratingsCount: number;
  estimatedReadTime: string;
  pageCount: number;
  shortDescription: string;
  fullDescription: string;
  whatYouWillLearn: string[];
  whoItIsFor: string;
  difficulty: string;
  aiRecommendationExplanation: string;
  availability: LegalAvailability;
  isLegallyFree: boolean;
  officialSource: OfficialSource;
  readOnlineUrl?: string;
  downloadUrl?: string;
  coverGradient: {
    from: string;
    to: string;
    accent: string;
    pattern: string;
  };
  coverIcon?: string;
  isbn?: string;
  tableOfContents?: string[];
  sampleExcerpt?: string;
  isTrending?: boolean;
  isRecentlyAdded?: boolean;
  recommendedForProject?: string;
  targetCareer?: string;
}

export interface ReadingPathStage {
  order: number;
  name: string;
  summary: string;
  recommendedBookIds: string[];
  milestoneGoal: string;
  estimatedHours: number;
}

export interface ReadingPath {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: Category;
  estimatedTotalHours: number;
  targetRole: string;
  stages: ReadingPathStage[];
}

export interface BookNote {
  id: string;
  text: string;
  page?: number;
  createdAt: string;
}

export interface BookReadingRecord {
  status: 'want_to_read' | 'reading' | 'completed';
  progressPercent: number;
  currentPage: number;
  totalPages: number;
  updatedAt: string;
  rating?: number;
  review?: string;
  notes: BookNote[];
}

export interface ReadingList {
  id: string;
  name: string;
  description: string;
  bookIds: string[];
  createdAt: string;
  icon?: string;
}

export interface UserHistoryItem {
  id: string;
  bookId: string;
  action: 'viewed' | 'started' | 'updated_progress' | 'completed' | 'rated' | 'saved';
  timestamp: string;
  detail?: string;
}

export interface UserProfile {
  name: string;
  handle: string;
  role: string;
  interests: string[];
  dailyReadingMinutes: number;
  currentProject: string;
  skillLevel: SkillLevel;
}

export interface UserLibraryState {
  savedBookIds: string[];
  readingStatus: Record<string, BookReadingRecord>;
  readingLists: ReadingList[];
  history: UserHistoryItem[];
  enrolledPathIds: string[];
  pathProgress: Record<string, { currentStage: number; completedStages: number[] }>;
  profile: UserProfile;
}

export interface LibrarianMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  recommendedBooks?: { bookId: string; rationale: string }[];
  suggestedQuestions?: string[];
}
