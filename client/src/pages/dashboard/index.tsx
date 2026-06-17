import React, { useEffect, useState } from 'react';
import { apiService } from '../../api';
import type { ActivityLog } from '../../types';
import StatsCard from './components/StatsCard';
import DailyBarChart from './components/DailyBarChart';
import StatusDonut from './components/StatusDonut';
import ActivityTimeline from './components/ActivityTimeline';
import TopCampaignsList from './components/TopCampaignsList';

interface DashboardData {
  totalLeads: number;
  messagesSent: number;
  activeCampaigns: number;
  conversionRate: number;
  messagesPerDay: Record<string, number>;
  messagesTrend: Array<{ _id: string; count: number }>;
  leadStatusBreakdown: Record<string, number>;
  topCampaigns: { name: string; cr: string; sent: number }[];
  recentActivities: ActivityLog[];
}

export const DashboardIndex: React.FC = () => {
  const [analytics, setAnalytics] = useState<DashboardData | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const summary = await apiService.getAnalyticsSummary();
      setAnalytics(summary);
      setActivities(summary.recentActivities.slice(0, 5)); // show latest 5
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData();

    // Listen to changes in db to refresh analytics dynamically
    const handleUpdate = () => {
      fetchDashboardData();
    };
    window.addEventListener('ez_message_received', handleUpdate);
    return () => {
      window.removeEventListener('ez_message_received', handleUpdate);
    };
  }, []);

  if (loading || !analytics) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 bg-slate-50 dark:bg-slate-950 min-h-[500px] select-none">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs font-sans font-bold text-slate-500 dark:text-slate-400">
            Gathering real-time campaign insights...
          </span>
        </div>
      </div>
    );
  }

  // Sparkline mock trends for visual completeness, feeding real endpoint totals at the end
  const leadsSparkline = [10, 16, 12, 24, 21, 32, 28, analytics.totalLeads];
  const messagesSparkline = [120, 145, 130, 180, 165, 210, 195, analytics.messagesSent];
  const templatesSparkline = [3, 4, 4, 5, 5, 6, 6, analytics.activeCampaigns];
  const conversionSparkline = [0.8, 1.2, 1.0, 1.6, 1.4, 2.1, 1.8, analytics.conversionRate];

  return (
    <div className="p-6 max-w-[1440px] mx-auto animate-fade-in space-y-6 select-none">
      
      {/* Welcome Headline Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="text-left">
          <h2 className="font-sans font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Real-time performance metrics for your WhatsApp campaign and voice call ecosystem.
          </p>
        </div>
        <div className="flex gap-2.5 shrink-0">
          <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center gap-2 font-sans text-xs font-bold text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer">
            <span className="material-symbols-outlined text-[16px] text-slate-400">calendar_today</span>
            Last 30 Days
          </button>
          <button
            onClick={() => alert("Report Export: Your custom XLS summary log has been queued for download.")}
            className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 font-sans text-xs font-bold hover:opacity-95 transition-all shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export Report
          </button>
        </div>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Leads"
          value={analytics.totalLeads}
          percentage="+12.5%"
          trending="up"
          icon="groups"
          colorClass="blue"
          sparklineData={leadsSparkline}
        />
        <StatsCard
          title="Messages Sent"
          value={analytics.messagesSent}
          percentage="+8.2%"
          trending="up"
          icon="send"
          colorClass="green"
          sparklineData={messagesSparkline}
        />
        <StatsCard
          title="Active Templates"
          value={analytics.activeCampaigns}
          percentage="Stable"
          trending="stable"
          icon="campaign"
          colorClass="violet"
          sparklineData={templatesSparkline}
        />
        <StatsCard
          title="Conversion Rate"
          value={`${analytics.conversionRate}%`}
          percentage="+1.4%"
          trending="up"
          icon="conversion_path"
          colorClass="amber"
          sparklineData={conversionSparkline}
        />
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DailyBarChart messagesPerDay={analytics.messagesPerDay} messagesTrend={analytics.messagesTrend} />
        </div>
        <div>
          <StatusDonut leadStatusBreakdown={analytics.leadStatusBreakdown} totalLeads={analytics.totalLeads} />
        </div>
      </div>

      {/* Bottom Content Area: Recent Activity Feed & Campaigns tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityTimeline activities={activities} />
        </div>
        <div>
          <TopCampaignsList topCampaigns={analytics.topCampaigns} />
        </div>
      </div>

    </div>
  );
};

export default DashboardIndex;
