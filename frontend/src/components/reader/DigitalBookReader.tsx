import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  X, ChevronLeft, ChevronRight, Bookmark, Search,
  Sun, Moon, BookOpen, ExternalLink, Sliders, Type,
  Check, Maximize2, Minimize2, AlertCircle, ShoppingCart
} from 'lucide-react';

export interface DigitalBook {
  id: string;
  source: string;
  access_type: 'public_domain_full' | 'google_preview' | 'controlled_lending' | 'official_catalog';
  title: string;
  authors: string[];
  published_year?: string | number;
  cover_url?: string;
  description?: string;
  full_text_url?: string | null;
  preview_url?: string | null;
  borrow_url?: string | null;
  buy_link?: string | null;
  info_link?: string;
  google_book_id?: string;
  is_embeddable?: boolean;
}

interface DigitalBookReaderProps {
  book: DigitalBook | null;
  onClose: () => void;
}

export const DigitalBookReader: React.FC<DigitalBookReaderProps> = ({ book, onClose }) => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [theme, setTheme] = useState<'dark' | 'sepia' | 'light'>('dark');
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'mono'>('serif');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Fetch full text if book has legal full-text stream
  useEffect(() => {
    if (!book) return;

    // Reset state
    setCurrentPage(0);
    setSearchQuery('');

    // Load saved bookmarks for this book
    const saved = localStorage.getItem(`libra_bookmark_${book.id}`);
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch (e) {}
    }

    if (book.full_text_url) {
      setLoading(true);
      axios
        .get(`/api/discovery/read-content?url=${encodeURIComponent(book.full_text_url)}`)
        .then((res) => {
          if (res.data.pages && res.data.pages.length > 0) {
            setPages(res.data.pages);
          } else {
            setPages([book.description || 'Public domain volume preview ready for reading.']);
          }
        })
        .catch(() => {
          setPages([
            `# ${book.title}\n\nBy ${book.authors.join(', ')}\n\n${book.description || ''}\n\n[Full public domain volume available via Project Gutenberg Archive at ${book.info_link}]`,
          ]);
        })
        .finally(() => setLoading(false));
    } else {
      setPages([]);
    }
  }, [book]);

  const toggleBookmark = (pageIdx: number) => {
    if (!book) return;
    let updated: number[];
    if (bookmarks.includes(pageIdx)) {
      updated = bookmarks.filter((p) => p !== pageIdx);
    } else {
      updated = [...bookmarks, pageIdx].sort((a, b) => a - b);
    }
    setBookmarks(updated);
    localStorage.setItem(`libra_bookmark_${book.id}`, JSON.stringify(updated));
  };

  if (!book) return null;

  // Search filtered pages
  const matchingPages = useMemo(() => {
    if (!searchQuery.trim() || pages.length === 0) return [];
    const query = searchQuery.toLowerCase();
    const matches: number[] = [];
    pages.forEach((pageText, idx) => {
      if (pageText.toLowerCase().includes(query)) {
        matches.push(idx);
      }
    });
    return matches;
  }, [pages, searchQuery]);

  // Theme styles
  const themeStyles = {
    dark: 'bg-[#070B18] text-[#EAF4FF]',
    sepia: 'bg-[#FBF0D9] text-[#2D2B28]',
    light: 'bg-[#FFFFFF] text-[#1A202C]',
  };

  const fontSizes = {
    sm: 'text-sm leading-relaxed',
    md: 'text-base leading-relaxed',
    lg: 'text-lg leading-loose',
    xl: 'text-xl leading-loose',
  };

  const fontFamilies = {
    serif: 'font-serif',
    sans: 'font-sans',
    mono: 'font-mono',
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-midnight/95 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <header className="h-14 px-4 sm:px-6 border-b border-white/10 flex items-center justify-between bg-midnight/80">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-subtlegrey hover:text-softwhite hover:bg-white/5 transition-colors"
            title="Exit Reader"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="hidden sm:block">
            <h2 className="text-sm font-display font-bold text-softwhite truncate max-w-md">
              {book.title}
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-mono text-subtlegrey">
              <span>{book.authors.join(', ')}</span>
              <span>•</span>
              <span className="text-cyan font-bold">{book.source}</span>
            </div>
          </div>
        </div>

        {/* Access Rights Pill */}
        <div className="flex items-center gap-2">
          {book.access_type === 'public_domain_full' && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase">
              ✓ Public Domain Full Access
            </span>
          )}
          {book.access_type === 'google_preview' && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase">
              Google Books Preview
            </span>
          )}
          {book.access_type === 'controlled_lending' && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan/15 text-cyan border border-cyan/30 uppercase">
              Controlled Digital Lending
            </span>
          )}
          {book.access_type === 'official_catalog' && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-violet/15 text-violet border border-violet/30 uppercase">
              Academic Reference
            </span>
          )}

          {/* Reader Preferences Toggles */}
          {pages.length > 0 && (
            <div className="flex items-center gap-1.5 ml-4 p-1 rounded-xl bg-navy/80 border border-white/10">
              {/* Theme Selector */}
              <button
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-lg text-xs font-mono transition-all ${
                  theme === 'dark' ? 'bg-cyan text-midnight font-bold' : 'text-subtlegrey'
                }`}
                title="Dark Theme"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('sepia')}
                className={`p-1.5 rounded-lg text-xs font-mono transition-all ${
                  theme === 'sepia' ? 'bg-[#FBF0D9] text-[#2D2B28] font-bold' : 'text-subtlegrey'
                }`}
                title="Sepia Warm Theme"
              >
                <span className="font-serif font-bold text-xs">S</span>
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-lg text-xs font-mono transition-all ${
                  theme === 'light' ? 'bg-white text-midnight font-bold' : 'text-subtlegrey'
                }`}
                title="Light Theme"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>

              {/* Font Size Toggle */}
              <button
                onClick={() => {
                  const sizes: Array<'sm' | 'md' | 'lg' | 'xl'> = ['sm', 'md', 'lg', 'xl'];
                  const next = sizes[(sizes.indexOf(fontSize) + 1) % sizes.length];
                  setFontSize(next);
                }}
                className="px-2 py-1 rounded-lg text-xs font-mono text-cyan hover:bg-white/5"
                title="Adjust Font Size"
              >
                A<span className="text-[10px] uppercase font-bold">{fontSize}</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Reader Viewport */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar Table of Contents & Search Drawer */}
        {isSidebarOpen && pages.length > 0 && (
          <aside className="w-80 border-r border-white/10 glass-panel p-4 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-sm text-softwhite">
                  Table of Contents & Search
                </h3>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 rounded text-subtlegrey hover:text-softwhite"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search Box */}
              <div className="relative mb-4">
                <Search className="w-4 h-4 text-cyan absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in full text..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-navy/80 border border-white/10 focus:border-cyan text-xs font-mono text-softwhite focus:outline-none"
                />
              </div>

              {/* Search Results if query exists */}
              {searchQuery && (
                <div className="mb-4 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-cyan block mb-1">
                    {matchingPages.length} MATCHING PAGES:
                  </span>
                  <div className="max-h-40 overflow-y-auto space-y-1 text-xs font-mono">
                    {matchingPages.map((pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => {
                          setCurrentPage(pIdx);
                          setIsSidebarOpen(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded bg-white/5 hover:bg-cyan/15 text-softwhite transition-colors"
                      >
                        Page {pIdx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Saved Bookmarks */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-subtlegrey block mb-1">
                  SAVED BOOKMARKS ({bookmarks.length}):
                </span>
                {bookmarks.map((bm) => (
                  <button
                    key={bm}
                    onClick={() => {
                      setCurrentPage(bm);
                      setIsSidebarOpen(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded text-xs font-mono text-cyan hover:bg-cyan/10 flex items-center justify-between"
                  >
                    <span>Page {bm + 1}</span>
                    <Bookmark className="w-3.5 h-3.5 fill-cyan" />
                  </button>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Center Content Stage */}
        <main
          className={`flex-1 overflow-y-auto p-6 sm:p-12 transition-colors duration-200 ${
            themeStyles[theme]
          }`}
        >
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-3 font-mono text-xs text-cyan">
                <div className="w-8 h-8 rounded-full border-2 border-cyan border-t-transparent animate-spin mx-auto" />
                <span>Decrypting & streaming full text from archive...</span>
              </div>
            </div>
          ) : book.access_type === 'public_domain_full' && pages.length > 0 ? (
            /* Public Domain Clean Text Reader */
            <article className={`max-w-3xl mx-auto ${fontSizes[fontSize]} ${fontFamilies[fontFamily]}`}>
              <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4 mb-8">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="text-xs font-mono text-cyan hover:underline flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Table of Contents ({pages.length} Pages)
                </button>

                <button
                  onClick={() => toggleBookmark(currentPage)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    bookmarks.includes(currentPage)
                      ? 'border-cyan bg-cyan/15 text-cyan'
                      : 'border-black/10 dark:border-white/10 text-subtlegrey'
                  }`}
                  title="Bookmark this page"
                >
                  <Bookmark
                    className={`w-4 h-4 ${
                      bookmarks.includes(currentPage) ? 'fill-cyan' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Rendered Book Text */}
              <div className="whitespace-pre-line tracking-normal font-normal">
                {pages[currentPage]}
              </div>
            </article>
          ) : book.access_type === 'google_preview' && book.google_book_id ? (
            /* Google Books Official Embedded Viewer */
            <div className="max-w-5xl mx-auto h-full flex flex-col items-center justify-center">
              <iframe
                title="Google Books Preview"
                src={`https://books.google.com/books?id=${book.google_book_id}&lpg=PP1&pg=PP1&output=embed`}
                className="w-full h-[80vh] rounded-2xl border border-white/10 shadow-2xl"
                allowFullScreen
              />
            </div>
          ) : (
            /* Controlled Lending or Reference Metadata Display */
            <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
              {book.cover_url && (
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="w-44 h-64 object-cover rounded-xl shadow-2xl mx-auto border border-white/10"
                />
              )}
              <div>
                <h1 className="text-2xl font-display font-bold text-softwhite">
                  {book.title}
                </h1>
                <p className="text-sm font-mono text-cyan mt-1">
                  by {book.authors.join(', ')} ({book.published_year})
                </p>
              </div>

              <p className="text-xs text-subtlegrey font-sans leading-relaxed text-left p-6 rounded-2xl glass-panel">
                {book.description || 'Verified academic library volume.'}
              </p>

              {/* Action Buttons for Controlled Lending or Purchase */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                {book.borrow_url && (
                  <a
                    href={book.borrow_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-xl font-mono text-xs font-bold bg-cyan text-midnight hover:bg-ice hover:shadow-cyan-glow transition-all flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    BORROW ON OPEN LIBRARY
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {book.preview_url && (
                  <a
                    href={book.preview_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-xl font-mono text-xs font-bold glass-panel border border-violet/30 text-violet hover:border-violet transition-all flex items-center gap-2"
                  >
                    READ PREVIEW ARCHIVE
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {book.buy_link && (
                  <a
                    href={book.buy_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 rounded-xl font-mono text-xs font-bold bg-navy border border-white/10 text-softwhite hover:border-cyan transition-all flex items-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4 text-cyan" />
                    OFFICIAL PURCHASE LINK
                  </a>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Bottom Pagination Bar for Paginated Books */}
      {pages.length > 1 && (
        <footer className="h-14 px-6 border-t border-white/10 flex items-center justify-between bg-midnight/90 font-mono text-xs">
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="px-3.5 py-1.5 rounded-xl border border-white/10 hover:border-cyan text-softwhite disabled:opacity-30 flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" /> PREVIOUS
          </button>

          <div className="flex items-center gap-3">
            <span className="text-subtlegrey">
              Page <strong className="text-cyan">{currentPage + 1}</strong> of {pages.length}
            </span>
            <input
              type="range"
              min="0"
              max={pages.length - 1}
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              className="w-32 sm:w-48 accent-cyan cursor-pointer"
            />
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(pages.length - 1, p + 1))}
            disabled={currentPage === pages.length - 1}
            className="px-3.5 py-1.5 rounded-xl border border-white/10 hover:border-cyan text-softwhite disabled:opacity-30 flex items-center gap-1.5"
          >
            NEXT <ChevronRight className="w-4 h-4" />
          </button>
        </footer>
      )}
    </div>
  );
};
