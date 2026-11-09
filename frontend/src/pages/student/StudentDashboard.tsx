import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { occupancyApi, predictionsApi, reservationsApi, recommendationsApi } from '../../services/api';
import { OccupancySummary, OccupancyForecast, Reservation, ZoneRecommendation } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { HourlyDemandChart } from '../../components/charts/HourlyDemandChart';
import {
  Activity, Users, BookmarkCheck, Box, Sparkles,
  ArrowRight, Clock, MapPin, Zap, Bot, ChevronRight
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [occupancy, setOccupancy] = useState<OccupancySummary | null>(null);
  const [forecast, setForecast] = useState<OccupancyForecast | null>(null);
  const [hourlyTrend, setHourlyTrend] = useState<any[]>([]);
  const [myReservations, setMyReservations] = useState<Reservation[]>([]);
  const [recommendedZones, setRecommendedZones] = useState<ZoneRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [occ, fc, trend, res, zones] = await Promise.all([
          occupancyApi.getCurrent(),
          predictionsApi.getForecast(),
          occupancyApi.getHourlyTrend(),
          reservationsApi.getMyReservations(),
          recommendationsApi.getZones(),
        ]);
        setOccupancy(occ);
        setForecast(fc);
        setHourlyTrend(trend);
        setMyReservations(res);
        setRecommendedZones(zones);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const activeReservation = myReservations.find((r) => r.status === 'active');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Hero Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass-panel rounded-2xl border border-cyan/20 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>STUDENT INTELLIGENCE DASHBOARD</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-softwhite">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Scholar'}
          </h1>
          <p className="text-xs font-mono text-subtlegrey mt-1">
            Current Library Atmosphere: <strong className="text-emerald-400">Optimal (Quiet Study)</strong> • Midterm Exam Footfall Active
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Link
            to="/student/library-map"
            className="px-4 py-2.5 rounded-xl font-mono text-xs font-bold bg-cyan text-midnight hover:bg-ice hover:shadow-cyan-glow transition-all flex items-center gap-2"
          >
            <Box className="w-4 h-4" />
            OPEN 3D TWIN
          </Link>
          <Link
            to="/student/assistant"
            className="px-4 py-2.5 rounded-xl font-mono text-xs font-bold glass-panel border border-violet/30 text-violet hover:border-violet hover:shadow-violet-glow transition-all flex items-center gap-2"
          >
            <Bot className="w-4 h-4" />
            ASK AI
          </Link>
        </div>
      </div>

      {/* Real-Time Metrics Row */}
      {occupancy && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="TOTAL OCCUPANCY"
            value={`${occupancy.occupancy_percentage}%`}
            subtitle={`${occupancy.occupied_seats} of ${occupancy.total_capacity} seats in use`}
            icon={<Activity className="w-5 h-5" />}
            trend={{ value: occupancy.current_status, isPositive: occupancy.occupancy_percentage < 70 }}
            accentColor="cyan"
          />
          <StatCard
            title="SEATS AVAILABLE"
            value={occupancy.available_seats}
            subtitle="Ready for 1-click booking"
            icon={<BookmarkCheck className="w-5 h-5" />}
            accentColor="emerald"
          />
          <StatCard
            title="ACTIVE RESERVED"
            value={occupancy.reserved_seats}
            subtitle="Held for students"
            icon={<Users className="w-5 h-5" />}
            accentColor="violet"
          />
          <StatCard
            title="PEAK HOUR PREDICTION"
            value={occupancy.peak_hour_today}
            subtitle="Forecasted by XGBoost"
            icon={<Clock className="w-5 h-5" />}
            accentColor="amber"
          />
        </div>
      )}

      {/* Active Reservation Banner if any */}
      {activeReservation && (
        <div className="p-5 glass-panel rounded-2xl border border-cyan/40 bg-gradient-to-r from-navy/90 to-cyan/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-cyan-glow">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan animate-ping" />
              <span className="text-xs font-mono font-bold text-cyan tracking-wider uppercase">
                Active Seat Reservation
              </span>
            </div>
            <div className="text-xl font-display font-bold text-softwhite mt-1">
              Seat {activeReservation.seat_number} — Level {activeReservation.floor_number} ({activeReservation.section_name})
            </div>
            <div className="text-xs font-mono text-subtlegrey mt-1">
              Valid until {new Date(activeReservation.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Code:{' '}
              <span className="text-ice font-bold">{activeReservation.reservation_code}</span>
            </div>
          </div>
          <Link
            to="/student/reservations"
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-navy border border-cyan/40 text-cyan hover:bg-cyan hover:text-midnight transition-all self-start sm:self-auto"
          >
            MANAGE BOOKING
          </Link>
        </div>
      )}

      {/* Two-Column Analytics & 3D Spatial Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 24-Hour Diurnal Demand Curve */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-cyan/15">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-mono uppercase text-cyan">DIURNAL RHYTHM</span>
              <h2 className="text-lg font-display font-bold text-softwhite">
                Today's Library Occupancy & Demand Curve
              </h2>
            </div>
            <Link
              to="/student/occupancy"
              className="text-xs font-mono text-cyan hover:underline flex items-center gap-1"
            >
              Floor Breakdown <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <HourlyDemandChart data={hourlyTrend} isForecast={false} />
        </div>

        {/* Right Col: AI Zone Recommendations */}
        <div className="glass-panel p-6 rounded-2xl border border-cyan/15 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-mono uppercase text-violet">RECOMMENDED SPACES</span>
                <h2 className="text-lg font-display font-bold text-softwhite">
                  Optimal Study Zones
                </h2>
              </div>
              <Sparkles className="w-4 h-4 text-violet" />
            </div>

            <div className="space-y-3">
              {recommendedZones.slice(0, 3).map((zone) => (
                <div
                  key={zone.section_id}
                  className="p-3.5 rounded-xl bg-navy/60 border border-white/5 hover:border-cyan/30 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-semibold text-sm text-softwhite">
                      {zone.section_name}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {Math.round(zone.match_score * 100)}% Match
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono text-subtlegrey mt-1.5">
                    <span>L{zone.floor_number}</span>
                    <span>•</span>
                    <span className="capitalize">{zone.noise_level} Noise</span>
                    <span>•</span>
                    <span className="text-cyan">{zone.available_seats} Free Seats</span>
                  </div>
                  {zone.reasons[0] && (
                    <p className="text-[11px] text-subtlegrey mt-2 line-clamp-1">
                      💡 {zone.reasons[0]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/student/recommendations"
            className="w-full mt-4 py-2.5 rounded-xl text-xs font-mono font-bold text-center border border-cyan/30 text-cyan hover:bg-cyan/10 transition-all block"
          >
            VIEW ALL RECOMMENDATIONS
          </Link>
        </div>
      </div>

      {/* Digital Stacks & Instant Reading Portal Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-cyan/20 bg-gradient-to-r from-navy/90 via-midnight to-cyan/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan/10 border border-cyan/30 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-cyan" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                Live Open Access
              </span>
              <span className="text-xs font-mono text-cyan">GOOGLE BOOKS • GUTENBERG • OPEN LIBRARY</span>
            </div>
            <h3 className="font-display font-bold text-base text-softwhite mt-0.5">
              Read Academic Textbooks & Classic Papers Instantly
            </h3>
            <p className="text-xs font-mono text-subtlegrey mt-0.5">
              No physical waitlists. Access thousands of public-domain books and preview chapters with our integrated distraction-free reader.
            </p>
          </div>
        </div>

        <Link
          to="/student/books"
          className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold bg-cyan text-midnight hover:bg-ice hover:shadow-cyan-glow transition-all whitespace-nowrap flex items-center gap-2"
        >
          BROWSE DIGITAL STACKS <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
