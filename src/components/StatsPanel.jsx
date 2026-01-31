import React from 'react';
import { BarChart3, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { format, subDays, isAfter, parseISO } from 'date-fns';
import './StatsPanel.css';

const StatsPanel = ({ tasks }) => {
    // Calculate statistics
    const completedTasks = tasks.filter(t => t.completed);
    const pendingTasks = tasks.filter(t => !t.completed);

    // Tasks completed in the last 7 days
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dayName = format(date, 'EEE');
        const count = completedTasks.filter(t => {
            if (!t.completedAt) return false;
            const taskDate = typeof t.completedAt === 'string'
                ? parseISO(t.completedAt)
                : t.completedAt.toDate?.() || new Date(t.completedAt);
            return format(taskDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
        }).length;
        weeklyData.push({ day: dayName, count });
    }

    const maxCount = Math.max(...weeklyData.map(d => d.count), 1);

    // Overdue tasks
    const overdueTasks = pendingTasks.filter(t => {
        if (!t.dueDate) return false;
        const dueDate = typeof t.dueDate === 'string'
            ? parseISO(t.dueDate)
            : t.dueDate.toDate?.() || new Date(t.dueDate);
        return isAfter(new Date(), dueDate);
    });

    const completionRate = tasks.length > 0
        ? Math.round((completedTasks.length / tasks.length) * 100)
        : 0;

    return (
        <div className="stats-panel">
            <div className="stats-header">
                <BarChart3 size={18} />
                <h3>Productivity Stats</h3>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon completed">
                        <CheckCircle size={16} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{completedTasks.length}</span>
                        <span className="stat-label">Completed</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon pending">
                        <Clock size={16} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{pendingTasks.length}</span>
                        <span className="stat-label">Pending</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon rate">
                        <TrendingUp size={16} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{completionRate}%</span>
                        <span className="stat-label">Rate</span>
                    </div>
                </div>
            </div>

            <div className="weekly-chart">
                <h4>This Week</h4>
                <div className="chart-bars">
                    {weeklyData.map((d, i) => (
                        <div key={i} className="bar-container">
                            <div
                                className="bar"
                                style={{ height: `${(d.count / maxCount) * 100}%` }}
                            >
                                {d.count > 0 && <span className="bar-value">{d.count}</span>}
                            </div>
                            <span className="bar-label">{d.day}</span>
                        </div>
                    ))}
                </div>
            </div>

            {overdueTasks.length > 0 && (
                <div className="overdue-alert">
                    <span>⚠️ {overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''}</span>
                </div>
            )}
        </div>
    );
};

export default StatsPanel;
