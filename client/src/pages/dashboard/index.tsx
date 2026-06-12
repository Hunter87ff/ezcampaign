import React, { useEffect, useState } from 'react';
import { apiService } from '../../api';
import type { ActivityLog } from '../../types';

interface DashboardData {
  totalLeads: number;
  messagesSent: number;
  activeCampaigns: number;
  conversionRate: number;
  messagesPerDay: Record<string, number>;
  leadStatusBreakdown: Record<string, number>;
  topCampaigns: { name: string; cr: string; sent: number }[];
}

export const DashboardIndex: React.FC = () => {
  const [analytics, setAnalytics] = useState<DashboardData | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const summary = await apiService.getAnalyticsSummary();
      const logs = await apiService.getActivityLogs();
      setAnalytics(summary);
      setActivities(logs.slice(0, 5)); // show latest 5
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
      <div className="flex-1 flex items-center justify-center p-12 bg-surface-background min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-body-md text-on-surface-variant font-medium">Gathering real-time campaign insights...</span>
        </div>
      </div>
    );
  }

  // Calculate conic gradient slice positions for status chart
  const statusValues = Object.entries(analytics.leadStatusBreakdown);
  const totalStatusCount = statusValues.reduce((sum, [, val]) => sum + val, 0);
  
  // Status Colors mapping
  const statusColorsMap: Record<string, string> = {
    new: '#3B82F6',        // status-new
    contacted: '#8B5CF6',  // status-contacted
    responded: '#F59E0B',  // status-responded
    converted: '#22C55E',  // status-converted
    closed: '#64748B',     // status-closed
  };

  let conicGradientString = '';
  if (totalStatusCount > 0) {
    let accumulatedPercentage = 0;
    const slices = statusValues.map(([key, val]) => {
      const percentage = (val / totalStatusCount) * 100;
      const start = accumulatedPercentage;
      accumulatedPercentage += percentage;
      return `${statusColorsMap[key]} ${start.toFixed(1)}% ${accumulatedPercentage.toFixed(1)}%`;
    });
    conicGradientString = `conic-gradient(${slices.join(', ')})`;
  } else {
    conicGradientString = 'conic-gradient(#e2e8f0 0% 100%)';
  }

  // Find max message count for bar chart scaling
  const messagesPerDayArray = Object.entries(analytics.messagesPerDay);
  const maxMessages = Math.max(...messagesPerDayArray.map(([, val]) => val), 1);

  // Time formatter for activity feed
  const formatActivityTime = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 600);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'message_sent':
        return { name: 'send', bg: 'bg-primary/10 text-primary' };
      case 'call_initiated':
        return { name: 'call', bg: 'bg-status-contacted/10 text-status-contacted' };
      case 'lead_created':
        return { name: 'person_add', bg: 'bg-status-new/10 text-status-new' };
      case 'reply_received':
        return { name: 'chat_bubble', bg: 'bg-status-converted/10 text-status-converted' };
      default:
        return { name: 'info', bg: 'bg-surface-container text-on-surface' };
    }
  };

  return (
    <div className="p-container-padding max-w-max-width mx-auto animate-fade-in select-none">
      
      {/* Welcome Headline Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-text-primary dark:text-text-primary">
            Dashboard Overview
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Real-time performance metrics for your WhatsApp campaign and voice call ecosystem.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-surface-container-lowest border border-surface-border rounded-lg flex items-center gap-2 font-label-md text-label-md hover:bg-surface-container-low transition-colors dark:text-on-surface">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            Last 30 Days
          </button>
          <button className="px-4 py-2 bg-primary text-on-primary rounded-lg flex items-center gap-2 font-label-md text-label-md hover:opacity-90 transition-colors shadow-xs">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Report
          </button>
        </div>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter mb-8">
        {/* Total Leads Card */}
        <div className="bg-surface-container-lowest p-container-padding rounded-xl border border-surface-border hover:border-primary transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-status-new/10 text-status-new rounded-lg group-hover:bg-status-new group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[22px]">groups</span>
            </div>
            <span className="text-status-converted font-label-md text-label-md flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              +12.5%
            </span>
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Total Leads</p>
          <h3 className="font-headline-lg text-headline-lg text-text-primary dark:text-text-primary font-bold">
            {analytics.totalLeads}
          </h3>
          <div className="mt-4 h-1 w-full bg-surface-container-low rounded-full overflow-hidden">
            <div className="h-full bg-status-new w-[75%] rounded-full" />
          </div>
        </div>

        {/* Outbound Messages Card */}
        <div className="bg-surface-container-lowest p-container-padding rounded-xl border border-surface-border hover:border-primary transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary/10 text-primary rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[22px]">send</span>
            </div>
            <span className="text-status-converted font-label-md text-label-md flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              +8.2%
            </span>
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Messages Sent</p>
          <h3 className="font-headline-lg text-headline-lg text-text-primary dark:text-text-primary font-bold">
            {analytics.messagesSent}
          </h3>
          <div className="mt-4 h-1 w-full bg-surface-container-low rounded-full overflow-hidden">
            <div className="h-full bg-primary w-[85%] rounded-full" />
          </div>
        </div>

        {/* Active Campaigns Card */}
        <div className="bg-surface-container-lowest p-container-padding rounded-xl border border-surface-border hover:border-primary transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-status-contacted/10 text-status-contacted rounded-lg group-hover:bg-status-contacted group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[22px]">campaign</span>
            </div>
            <span className="text-on-surface-variant font-label-md text-label-md flex items-center gap-1">
              Stable
            </span>
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Active Templates</p>
          <h3 className="font-headline-lg text-headline-lg text-text-primary dark:text-text-primary font-bold">
            {analytics.activeCampaigns}
          </h3>
          <div className="mt-4 h-1 w-full bg-surface-container-low rounded-full overflow-hidden">
            <div className="h-full bg-status-contacted w-[50%] rounded-full" />
          </div>
        </div>

        {/* Conversion Rate Card */}
        <div className="bg-surface-container-lowest p-container-padding rounded-xl border border-surface-border hover:border-primary transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-status-responded/10 text-status-responded rounded-lg group-hover:bg-status-responded group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[22px]">conversion_path</span>
            </div>
            <span className="text-status-converted font-label-md text-label-md flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              +1.4%
            </span>
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Conversion Rate</p>
          <h3 className="font-headline-lg text-headline-lg text-text-primary dark:text-text-primary font-bold">
            {analytics.conversionRate}%
          </h3>
          <div className="mt-4 h-1 w-full bg-surface-container-low rounded-full overflow-hidden">
            <div
              className="h-full bg-status-responded rounded-full"
              style={{ width: `${Math.min(analytics.conversionRate * 3, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-8">
        {/* Messages Per Day Bar Chart */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-container-padding rounded-xl border border-surface-border flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-headline-md text-headline-md text-text-primary dark:text-text-primary font-bold">
              Messages per Day
            </h4>
            <select className="bg-surface-container-low border border-surface-border rounded-lg font-label-md text-label-md py-1 px-3 focus:ring-1 focus:ring-primary text-on-surface">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="relative h-64 flex items-end justify-between gap-3 px-2 mt-auto">
            {messagesPerDayArray.map(([day, count]) => {
              const heightPct = Math.max((count / maxMessages) * 100, 10);
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                  {/* Tooltip */}
                  <div className="absolute bottom-[calc(100%-10px)] opacity-0 group-hover:opacity-100 transition-opacity bg-inverse-surface text-inverse-on-surface px-2 py-1 rounded text-label-sm font-bold shadow-md z-10 pointer-events-none mb-10">
                    {count} Msg
                  </div>
                  <div
                    className="w-full bg-primary/25 rounded-t-md hover:bg-primary transition-all duration-300 shadow-xs"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lead Status Conic Gradient Donut Chart */}
        <div className="bg-surface-container-lowest p-container-padding rounded-xl border border-surface-border flex flex-col justify-between">
          <h4 className="font-headline-md text-headline-md text-text-primary dark:text-text-primary font-bold mb-6">
            Lead Status
          </h4>
          <div className="flex-1 flex items-center justify-center relative py-4">
            <div
              className="w-36 h-36 rounded-full relative shadow-md transition-transform duration-500 hover:scale-105"
              style={{ background: conicGradientString }}
            >
              <div className="absolute inset-4 bg-surface-container-lowest rounded-full flex flex-col items-center justify-center">
                <p className="text-headline-md font-bold text-text-primary dark:text-text-primary">
                  {analytics.totalLeads}
                </p>
                <p className="text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Leads</p>
              </div>
            </div>
          </div>
          <div className="space-y-2.5 mt-4">
            {statusValues.map(([key, val]) => {
              const pct = totalStatusCount > 0 ? ((val / totalStatusCount) * 100).toFixed(0) : '0';
              return (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: statusColorsMap[key] }}
                    />
                    <span className="text-body-md capitalize text-on-surface dark:text-on-surface font-medium">{key}</span>
                  </div>
                  <span className="font-bold text-text-primary dark:text-text-primary text-body-md">
                    {val} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Content Area: Recent Activity Feed & Campaigns tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Activity Feed Box */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-surface-border flex flex-col">
          <div className="p-container-padding border-b border-surface-border flex justify-between items-center">
            <h4 className="font-headline-md text-headline-md text-text-primary dark:text-text-primary font-bold">
              Recent Activity
            </h4>
            <span className="text-label-sm font-bold bg-primary-container/20 text-primary dark:text-primary-container px-3 py-1 rounded-full">
              Live updates
            </span>
          </div>
          <div className="overflow-y-auto max-h-[350px] divide-y divide-surface-border">
            {activities.length > 0 ? (
              activities.map((act) => {
                const icon = getActivityIcon(act.action);
                return (
                  <div key={act._id} className="p-container-padding flex gap-4 hover:bg-surface-container-low transition-colors duration-150 animate-fade-in">
                    <div className={`mt-1 p-2 ${icon.bg} rounded-full shrink-0 h-fit flex items-center justify-center`}>
                      <span className="material-symbols-outlined text-[18px]">{icon.name}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-body-md text-body-md text-on-surface dark:text-on-surface">
                          {act.details?.message || (
                            <>
                              Action <span className="font-bold">{act.action}</span> triggered.
                            </>
                          )}
                        </p>
                        <span className="text-label-sm text-on-surface-variant opacity-75 shrink-0 whitespace-nowrap ml-4">
                          {formatActivityTime(act.createdAt)}
                        </span>
                      </div>
                      {act.details?.body && (
                        <p className="text-label-md text-on-surface-variant font-normal italic mt-1 line-clamp-1">
                          "{act.details.body}"
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-on-surface-variant">
                No recent admin activity recorded.
              </div>
            )}
          </div>
        </div>

        {/* Top Campaigns / Online Team status */}
        <div className="bg-surface-container-lowest rounded-xl border border-surface-border flex flex-col justify-between">
          <div className="p-container-padding border-b border-surface-border">
            <h4 className="font-headline-md text-headline-md text-text-primary dark:text-text-primary font-bold">
              Top Campaigns
            </h4>
          </div>
          <div className="p-container-padding space-y-5 flex-1">
            {analytics.topCampaigns.map((camp) => (
              <div key={camp.name}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-body-md font-bold text-on-surface">{camp.name}</span>
                  <span className="text-label-md font-bold text-status-converted">{camp.cr} CR</span>
                </div>
                <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: camp.cr === '24%' ? '85%' : camp.cr === '18%' ? '60%' : '45%' }}
                  />
                </div>
                <p className="text-label-sm text-on-surface-variant mt-1">{camp.sent} Messages dispatched</p>
              </div>
            ))}

            <div className="pt-4 border-t border-surface-border">
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-3 font-bold">
                Agents Online
              </p>
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-2.5">
                  <img
                    className="w-8 h-8 rounded-full border-2 border-surface-container-lowest"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkfkIzKpgRhwj6A8UzZWUVivvmbEAxHLshbV2BrKyzJCkTbhxPrgCf9r0UFkvfot8DkhnuqVRu2lxb2VU2R1oyKtUdiaGbf0Vnctoqp2zjoawZPbhj35a3LR2skZtk_YQBUE4UVM1JtuTtxFm1truGCYl2JcUyynUUCGBtU78QenOCHF84yRY7W8iaFEYJzgL1toPhl_HCew_mI4Yf4-Clpn4WIX7ADefX-xmutHMyihst_Mt-aWLzZZsAcLqMF1HlZLN7IFQJfSQ"
                    alt="Agent portrait"
                  />
                  <img
                    className="w-8 h-8 rounded-full border-2 border-surface-container-lowest"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKBCTOZJhxGeppRuqANtu7EHmcmPiXwPvwjkjNG2Zwc35h1qSU4CfL1s6eamw6Nl7ekQrF40U4L2LO_3WVjiRu7edRER203fFslYxpn_jEYUqO8KuXD2zPl0kEPZpu_Jh0U7GfDv-bniXzG2MaBt8WLzIruIZ89kE9NNQFqec-mZJqZ6VKbkioct_b825V_43G5ZuviSjAjMiNMpvp6Cli2F8M1P7FW3Kpjn1AINNklsj9va5By_hzIGLHKbTOyUcNgKdoSZ1b3Wg"
                    alt="Agent portrait"
                  />
                  <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-on-surface">
                    +6
                  </div>
                </div>
                <span className="text-label-sm text-on-surface-variant font-medium ml-2">Active now</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
export default DashboardIndex;
