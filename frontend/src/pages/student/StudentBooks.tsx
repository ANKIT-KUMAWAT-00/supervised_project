import React, { useEffect, useState } from 'react';
import { booksApi, discoveryApi } from '../../services/api';
import { Book, DigitalDiscoveryBook } from '../../types';
import { DigitalBookReader, DigitalBook } from '../../components/reader/DigitalBookReader';
import {
  Search, BookOpen, Sparkles, Filter, Check, AlertTriangle,
  Globe, Database, ExternalLink, Bookmark, Layers, Eye, RefreshCw, BookMarked
} from 'lucide-react';

export const StudentBooks: React.FC = () => {
  // Tab state: 'digital' (Google/Gutenberg/OpenLib) vs 'physical' (Campus stacks)
  const [catalogMode, setCatalogMode] = useState<'digital' | 'physical'>('digital');

  // Digital discovery state
  const [digitalBooks, setDigitalBooks] = useState<DigitalDiscoveryBook[]>([]);
  const [digitalQuery, setDigitalQuery] = useState<string>('computer science artificial intelligence');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [loadingDigital, setLoadingDigital] = useState<boolean>(false);
  const [activeReadingBook, setActiveReadingBook] = useState<DigitalBook | null>(null);

  // Physical campus inventory state
  const [physicalBooks, setPhysicalBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [physicalSearch, setPhysicalSearch] = useState<string>('');
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [sortByDemand, setSortByDemand] = useState<boolean>(false);
  const [loadingPhysical, setLoadingPhysical] = useState<boolean>(true);

  // Fetch digital books via real API proxy
  const searchDigitalCatalog = async (queryToSearch: string, provider: string = providerFilter) => {
    if (!queryToSearch.trim()) return;
    setLoadingDigital(true);
    try {
      const results = await discoveryApi.search(queryToSearch, provider, 18);
      setDigitalBooks(results);
    } catch (err) {
      console.error('Error fetching digital discovery books:', err);
    } finally {
      setLoadingDigital(false);
    }
  };

  // Fetch physical campus collection
  const fetchPhysicalBooks = async () => {
    setLoadingPhysical(true);
    try {
      const [bData, cData] = await Promise.all([
        booksApi.list(physicalSearch || undefined, selectedCat || undefined, sortByDemand),
        booksApi.getCategories(),
      ]);
      setPhysicalBooks(bData);
      setCategories(cData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPhysical(false);
    }
  };

  useEffect(() => {
    searchDigitalCatalog(digitalQuery, providerFilter);
  }, [providerFilter]);

  useEffect(() => {
    fetchPhysicalBooks();
  }, [selectedCat, sortByDemand]);

  const handleDigitalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchDigitalCatalog(digitalQuery, providerFilter);
  };

  const handlePhysicalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPhysicalBooks();
  };

  const quickSearchPrompts = [
    'Artificial Intelligence',
    'Quantum Computing',
    'Data Structures & Algorithms',
    'Distributed Systems',
    'Calculus & Linear Algebra',
    'Autonomous Robotics'
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-cyan tracking-wider flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-cyan animate-pulse" />
            ACADEMIC RESOURCE & DIGITAL LIBRARY INTELLIGENCE
          </span>
          <h1 className="font-display font-bold text-3xl text-softwhite mt-1">
            Global Knowledge Stacks & University Collection
          </h1>
          <p className="text-xs font-mono text-subtlegrey mt-1 max-w-2xl">
            Live multi-provider federation querying Google Books, Open Library, and Project Gutenberg alongside campus reserve physical stacks with AI demand forecasting.
          </p>
        </div>

        {/* Catalog Mode Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-navy/80 border border-white/10 self-start md:self-auto">
          <button
            onClick={() => setCatalogMode('digital')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
              catalogMode === 'digital'
                ? 'bg-cyan text-midnight shadow-cyan-glow'
                : 'text-subtlegrey hover:text-softwhite'
            }`}
          >
            <Globe className="w-4 h-4" />
            Digital Stacks (Online Reader)
          </button>
          <button
            onClick={() => setCatalogMode('physical')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
              catalogMode === 'physical'
                ? 'bg-violet text-softwhite shadow-violet-glow'
                : 'text-subtlegrey hover:text-softwhite'
            }`}
          >
            <Database className="w-4 h-4" />
            Campus Stacks (Physical Copies)
          </button>
        </div>
      </div>

      {/* ===================== MODE 1: DIGITAL GLOBAL STACKS ===================== */}
      {catalogMode === 'digital' && (
        <div className="space-y-6">
          {/* Digital Search & Filters */}
          <div className="glass-panel p-5 rounded-2xl border border-cyan/20 space-y-4">
            <form onSubmit={handleDigitalSubmit} className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-cyan absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={digitalQuery}
                  onChange={(e) => setDigitalQuery(e.target.value)}
                  placeholder="Search books, authors, topics across Google Books, Gutenberg, Open Library..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy/90 border border-white/10 focus:border-cyan text-xs font-mono text-softwhite focus:outline-none focus:ring-1 focus:ring-cyan"
                />
              </div>
              <button
                type="submit"
                disabled={loadingDigital}
                className="px-6 py-2.5 rounded-xl bg-cyan text-midnight font-mono font-bold text-xs hover:bg-ice transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-cyan-glow"
              >
                {loadingDigital ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Federating APIs...
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    Search Stacks
                  </>
                )}
              </button>
            </form>

            {/* Provider Filter Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono text-subtlegrey mr-1">Provider:</span>
                {[
                  { id: 'all', label: 'All Repositories (Federated)' },
                  { id: 'gutenberg', label: 'Project Gutenberg (Full In-App Read)' },
                  { id: 'google', label: 'Google Books (Interactive Preview)' },
                  { id: 'openlibrary', label: 'Open Library (Lending Stacks)' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setProviderFilter(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                      providerFilter === p.id
                        ? 'bg-cyan/20 border border-cyan text-cyan font-bold'
                        : 'glass-panel text-subtlegrey hover:text-softwhite'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Quick topics */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-mono text-subtlegrey/70">Trending:</span>
                {quickSearchPrompts.slice(0, 3).map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setDigitalQuery(prompt);
                      searchDigitalCatalog(prompt, providerFilter);
                    }}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-subtlegrey hover:text-ice hover:bg-white/10 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Legal Compliance / Live Access Notice */}
          <div className="p-3.5 rounded-xl bg-cyan/5 border border-cyan/20 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2.5 text-ice">
              <Sparkles className="w-4 h-4 text-cyan flex-shrink-0" />
              <span>
                <strong>Integrated Academic Reader Engine:</strong> Public-domain volumes can be fully read inside the custom distraction-free reader. Modern copyright titles offer authorized sample previews and lending integration.
              </span>
            </div>
            <span className="hidden md:inline-block px-2.5 py-1 rounded bg-navy text-[10px] text-cyan border border-cyan/30 uppercase font-mono">
              Live APIs Connected
            </span>
          </div>

          {/* Digital Books Grid */}
          {loadingDigital ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="glass-panel p-5 rounded-2xl border border-white/5 animate-pulse h-80 space-y-4">
                  <div className="h-4 bg-white/5 rounded w-1/3"></div>
                  <div className="h-6 bg-white/10 rounded w-4/5"></div>
                  <div className="h-4 bg-white/5 rounded w-1/2"></div>
                  <div className="h-28 bg-white/5 rounded"></div>
                  <div className="h-8 bg-white/10 rounded"></div>
                </div>
              ))}
            </div>
          ) : digitalBooks.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-2xl border border-white/10 space-y-3">
              <BookOpen className="w-12 h-12 text-subtlegrey mx-auto opacity-50" />
              <h3 className="text-base font-display text-softwhite">No digital volumes found</h3>
              <p className="text-xs font-mono text-subtlegrey">Try searching for other academic subjects or clearing provider filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {digitalBooks.map((b) => {
                const isFullText = b.access_type === 'public_domain_full' || Boolean(b.full_text_url);
                const isPreview = b.access_type === 'google_preview' || Boolean(b.preview_url);
                const isLending = b.access_type === 'controlled_lending';

                return (
                  <div
                    key={b.id}
                    className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-cyan/40 transition-all hover:shadow-cyan-glow flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Header & Access Badge */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-navy border border-white/10 text-subtlegrey">
                          {b.source}
                        </span>

                        {isFullText ? (
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Full Text Free
                          </span>
                        ) : isPreview ? (
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan/10 border border-cyan/30 text-cyan font-bold flex items-center gap-1">
                            <Eye className="w-3 h-3" /> Preview Available
                          </span>
                        ) : isLending ? (
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-violet/10 border border-violet/30 text-violet font-bold flex items-center gap-1">
                            <BookMarked className="w-3 h-3" /> Digital Lending
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">
                            Catalog Record
                          </span>
                        )}
                      </div>

                      {/* Main Book Card Info */}
                      <div className="flex gap-4">
                        {b.cover_url ? (
                          <img
                            src={b.cover_url}
                            alt={b.title}
                            className="w-16 h-24 object-cover rounded-lg border border-white/10 flex-shrink-0 shadow-md group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-16 h-24 rounded-lg bg-navy/80 border border-white/10 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-6 h-6 text-subtlegrey/50" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h3 className="font-display font-bold text-sm text-softwhite group-hover:text-cyan transition-colors leading-snug line-clamp-2">
                            {b.title}
                          </h3>
                          <p className="text-xs text-subtlegrey font-sans mt-1 line-clamp-1">
                            by {b.authors?.join(', ') || 'Academic Specialist'}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-subtlegrey/80">
                            {b.published_year && <span>{b.published_year}</span>}
                            {b.page_count && <span>• {b.page_count} pages</span>}
                            {b.download_count ? <span>• {b.download_count.toLocaleString()} downloads</span> : null}
                          </div>
                        </div>
                      </div>

                      {/* Synopsis / Description */}
                      <p className="text-xs text-subtlegrey/90 font-sans mt-3 line-clamp-3 leading-relaxed">
                        {b.description || 'Comprehensive peer-reviewed academic resource curated for university research.'}
                      </p>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                      {isFullText ? (
                        <button
                          onClick={() => setActiveReadingBook(b as unknown as DigitalBook)}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-xs hover:bg-emerald-500/30 transition-all flex items-center justify-center gap-2 shadow-emerald-glow"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          Read Full Text
                        </button>
                      ) : isPreview ? (
                        <button
                          onClick={() => setActiveReadingBook(b as unknown as DigitalBook)}
                          className="flex-1 py-2 px-3 rounded-xl bg-cyan/20 border border-cyan/40 text-cyan font-mono font-bold text-xs hover:bg-cyan/30 transition-all flex items-center justify-center gap-2"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Interactive Preview
                        </button>
                      ) : b.borrow_url ? (
                        <a
                          href={b.borrow_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-2 px-3 rounded-xl bg-violet/20 border border-violet/40 text-violet font-mono font-bold text-xs hover:bg-violet/30 transition-all flex items-center justify-center gap-2 text-center"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Borrow on Open Library
                        </a>
                      ) : (
                        <a
                          href={b.info_link || `https://www.google.com/search?q=${encodeURIComponent(b.title)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-subtlegrey font-mono font-medium text-xs hover:text-softwhite transition-all flex items-center justify-center gap-2 text-center"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View Metadata Record
                        </a>
                      )}

                      {b.buy_link && (
                        <a
                          href={b.buy_link}
                          target="_blank"
                          rel="noreferrer"
                          title="Purchase physical edition"
                          className="p-2 rounded-xl bg-white/5 border border-white/10 text-subtlegrey hover:text-amber-400 hover:border-amber-400/30 transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================== MODE 2: CAMPUS PHYSICAL STACKS ===================== */}
      {catalogMode === 'physical' && (
        <div className="space-y-6">
          {/* Physical Search & Filter Bar */}
          <div className="glass-panel p-4 rounded-2xl border border-violet/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <form onSubmit={handlePhysicalSubmit} className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-violet absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                value={physicalSearch}
                onChange={(e) => setPhysicalSearch(e.target.value)}
                placeholder="Search campus title, author, or ISBN..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-navy/80 border border-white/10 focus:border-violet text-xs font-mono text-softwhite focus:outline-none"
              />
            </form>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setSelectedCat(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  selectedCat === null
                    ? 'bg-violet text-softwhite font-bold shadow-violet-glow'
                    : 'glass-panel text-subtlegrey hover:text-softwhite'
                }`}
              >
                All Subjects
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCat(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    selectedCat === c.id
                      ? 'bg-violet text-softwhite font-bold shadow-violet-glow'
                      : 'glass-panel text-subtlegrey hover:text-softwhite'
                  }`}
                >
                  {c.name.split(' ')[0]}
                </button>
              ))}

              <button
                onClick={() => setSortByDemand(!sortByDemand)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                  sortByDemand
                    ? 'bg-cyan text-midnight font-bold shadow-cyan-glow'
                    : 'glass-panel text-subtlegrey hover:text-cyan'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Sort By AI Demand
              </button>
            </div>
          </div>

          {/* Physical Books Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {physicalBooks.map((b) => (
              <div
                key={b.id}
                className="glass-panel p-5 rounded-2xl border border-violet/15 hover:border-violet/40 transition-all hover:shadow-violet-glow flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-violet uppercase font-semibold">{b.category}</span>
                    <span className="text-subtlegrey bg-navy px-2 py-0.5 rounded border border-white/5">{b.call_number}</span>
                  </div>
                  <h3 className="font-display font-bold text-base text-softwhite group-hover:text-violet transition-colors leading-snug">
                    {b.title}
                  </h3>
                  <p className="text-xs text-subtlegrey font-sans mt-1">
                    by {b.author}
                  </p>

                  {/* Demand Score Meter */}
                  <div className="mt-4 p-3 rounded-xl bg-navy/60 border border-white/5 space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-subtlegrey">AI Borrowing Velocity:</span>
                      <span className="text-ice font-bold">
                        {Math.round(b.demand_score * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-navy rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full ${
                          b.demand_score >= 0.8
                            ? 'bg-rose-500'
                            : b.demand_score >= 0.6
                            ? 'bg-amber-400'
                            : 'bg-cyan'
                        }`}
                        style={{ width: `${b.demand_score * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-subtlegrey">Physical Shelf Copies: </span>
                      <strong
                        className={
                          b.available_copies > 0 ? 'text-emerald-400' : 'text-rose-400'
                        }
                      >
                        {b.available_copies} of {b.total_copies}
                      </strong>
                    </div>
                    <button
                      disabled={b.available_copies === 0}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-navy border border-violet/30 text-violet hover:bg-violet hover:text-softwhite transition-all disabled:opacity-30 disabled:pointer-events-none"
                    >
                      {b.available_copies > 0 ? 'RESERVE COPY' : 'CHECKED OUT'}
                    </button>
                  </div>

                  {/* When 0 copies, recommend searching digital stacks! */}
                  {b.available_copies === 0 && (
                    <button
                      onClick={() => {
                        setCatalogMode('digital');
                        setDigitalQuery(b.title);
                        searchDigitalCatalog(b.title, 'all');
                      }}
                      className="w-full py-1.5 px-2 rounded-lg bg-cyan/10 border border-cyan/30 text-cyan text-[11px] font-mono hover:bg-cyan/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Globe className="w-3 h-3" />
                      Find Free Digital Edition in Online Stacks
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FULL-SCREEN IN-APP DIGITAL BOOK READER MODAL */}
      <DigitalBookReader
        book={activeReadingBook}
        onClose={() => setActiveReadingBook(null)}
      />
    </div>
  );
};
