import React, { useEffect, useState } from 'react';
import { recommendationsApi } from '../../services/api';
import { ZoneRecommendation, BookRecommendation } from '../../types';
import {
  Sparkles, Layers, BookOpen, Clock, Check,
  Volume2, Compass, ShieldCheck, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentRecommendations: React.FC = () => {
  const [noisePref, setNoisePref] = useState('quiet');
  const [studyType, setStudyType] = useState('individual');
  const [zoneRecs, setZoneRecs] = useState<ZoneRecommendation[]>([]);
  const [bookRecs, setBookRecs] = useState<BookRecommendation[]>([]);
  const [optimalTimes, setOptimalTimes] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchRecommendations = async () => {
    try {
      const [zData, bData, tData] = await Promise.all([
        recommendationsApi.getZones(noisePref, studyType),
        recommendationsApi.getBooks(),
        recommendationsApi.getOptimalTimes(),
      ]);
      setZoneRecs(zData);
      setBookRecs(bData);
      setOptimalTimes(tData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [noisePref, studyType]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <span className="text-xs font-mono uppercase text-cyan tracking-wider">
          AI MULTI-FACTOR MATCHING ENGINE
        </span>
        <h1 className="font-display font-bold text-3xl text-softwhite mt-1">
          Intelligent Resource & Study Space Allocations
        </h1>
        <p className="text-xs font-mono text-subtlegrey mt-1">
          Curated with weighted scoring across real-time occupancy, noise level preference, and content filtering
        </p>
      </div>

      {/* Preferences Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-cyan/20 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono uppercase text-cyan">Noise Preference:</span>
          {['silent', 'quiet', 'collaborative'].map((n) => (
            <button
              key={n}
              onClick={() => setNoisePref(n)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-all ${
                noisePref === n
                  ? 'bg-cyan text-midnight font-bold shadow-cyan-glow'
                  : 'glass-panel text-subtlegrey hover:text-softwhite'
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono uppercase text-violet">Study Type:</span>
          {[
            { id: 'individual', label: 'Individual Focus' },
            { id: 'group', label: 'Group Project' },
            { id: 'computer', label: 'Tech & GPU Terminal' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setStudyType(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                studyType === s.id
                  ? 'bg-violet text-softwhite font-bold shadow-violet-glow'
                  : 'glass-panel text-subtlegrey hover:text-softwhite'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section 1: Study Zones Recommendations */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-cyan" />
          <h2 className="font-display font-bold text-xl text-softwhite">
            Top Recommended Study Sections
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {zoneRecs.map((zone, idx) => (
            <div
              key={zone.section_id}
              className="glass-panel p-6 rounded-2xl border border-cyan/15 hover:border-cyan/40 transition-all hover:shadow-cyan-glow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-cyan">
                    RANK #{idx + 1}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {Math.round(zone.match_score * 100)}% Fit
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-softwhite">
                  {zone.section_name}
                </h3>
                <div className="text-xs font-mono text-subtlegrey mt-1">
                  Level {zone.floor_number} • {zone.floor_name}
                </div>

                <div className="mt-4 p-3 rounded-xl bg-navy/60 border border-white/5 space-y-1 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-subtlegrey">Occupancy:</span>
                    <span className="text-softwhite">{Math.round(zone.occupancy_rate * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-subtlegrey">Free Seats:</span>
                    <span className="text-emerald-400 font-bold">{zone.available_seats} ready</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-subtlegrey">Noise Atmosphere:</span>
                    <span className="text-ice capitalize">{zone.noise_level}</span>
                  </div>
                </div>

                {/* Algorithmic Reason */}
                <div className="mt-4">
                  <span className="text-[10px] font-mono uppercase text-subtlegrey tracking-wider block mb-1">
                    WHY THIS WAS CHOSEN:
                  </span>
                  <ul className="space-y-1">
                    {zone.reasons.map((r, i) => (
                      <li key={i} className="text-xs text-subtlegrey flex items-start gap-1.5">
                        <span className="text-cyan font-bold">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Link
                to="/student/library-map"
                className="w-full mt-6 py-2.5 rounded-xl text-xs font-mono font-bold bg-cyan/15 text-cyan border border-cyan/30 hover:bg-cyan hover:text-midnight transition-all text-center flex items-center justify-center gap-1.5"
              >
                VIEW SECTION IN 3D TWIN <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Optimal Time Windows */}
      {optimalTimes && (
        <div className="glass-panel p-6 rounded-2xl border border-violet/20">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-violet" />
            <h2 className="font-display font-bold text-xl text-softwhite">
              AI Predicted Best Study Times Today
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {optimalTimes.recommended_windows.map((w: any) => (
              <div
                key={w.time_slot}
                className="p-4 rounded-xl bg-navy/60 border border-violet/30 space-y-2"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-violet font-bold">{w.label}</span>
                  <span className="text-emerald-400">~{w.avg_occupancy_percent}% Crowd</span>
                </div>
                <div className="text-lg font-display font-bold text-softwhite">
                  {w.time_slot}
                </div>
                <p className="text-xs text-subtlegrey leading-relaxed">
                  {w.advantage}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: Recommended Books (Content-Based Filtering) */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-cyan" />
          <h2 className="font-display font-bold text-xl text-softwhite">
            Curated Books & Research Monograph Recommendations
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bookRecs.map((b) => (
            <div
              key={b.book_id}
              className="glass-panel p-5 rounded-2xl border border-cyan/15 hover:border-cyan/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-cyan uppercase">{b.category}</span>
                  <span className="text-emerald-400 font-bold">{Math.round(b.match_score * 100)}% Fit</span>
                </div>
                <h3 className="font-display font-bold text-base text-softwhite leading-snug">
                  {b.title}
                </h3>
                <p className="text-xs text-subtlegrey mt-1">by {b.author}</p>

                <div className="mt-3">
                  {b.reasons.map((r, i) => (
                    <div key={i} className="text-xs text-subtlegrey font-mono mt-1 flex items-center gap-1.5">
                      <span className="text-cyan">✓</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                <span className="text-subtlegrey">
                  {b.available_copies > 0 ? (
                    <strong className="text-emerald-400">{b.available_copies} available</strong>
                  ) : (
                    <strong className="text-rose-400">All copies out</strong>
                  )}
                </span>
                <Link
                  to="/student/books"
                  className="text-xs text-cyan hover:underline font-mono"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
