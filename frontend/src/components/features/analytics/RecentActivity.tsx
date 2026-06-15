import React from 'react';

interface Activity {
  id: number;
  template_name: string | null;
  center_name: string | null;
  status: string;
  percentage: number | null;
  updated_at: string;
}

interface RecentActivityProps {
  data: Activity[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ data }) => {
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-slate-100 text-slate-600',
      in_progress: 'bg-blue-50 text-blue-700',
      completed: 'bg-emerald-50 text-emerald-700',
      archived: 'bg-purple-50 text-purple-700',
    };
    return styles[status] || 'bg-slate-100 text-slate-600';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Draft',
      in_progress: 'In Progress',
      completed: 'Completed',
      archived: 'Archived',
    };
    return labels[status] || status;
  };

  const getScoreColor = (percentage: number | null) => {
    if (!percentage) return 'text-slate-400';
    if (percentage >= 80) return 'text-emerald-600';
    if (percentage >= 60) return 'text-amber-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-rose-600';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
          <p className="text-sm text-slate-500">Latest evaluation updates</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-slate-400">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">No recent activity</p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {data.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-5 hover:bg-gradient-to-r hover:from-cyan-50/50 hover:to-teal-50/50 transition-colors duration-200"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusBadge(activity.status)}`}>
                  {activity.status === 'completed' ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : activity.status === 'in_progress' ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{activity.template_name || 'Untitled'}</p>
                  <p className="text-sm text-slate-500">{activity.center_name || 'No center'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {activity.percentage !== null && (
                  <span className={`text-sm font-bold ${getScoreColor(activity.percentage)}`}>
                    {activity.percentage}%
                  </span>
                )}
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(activity.status)}`}>
                  {getStatusLabel(activity.status)}
                </span>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {formatDate(activity.updated_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
