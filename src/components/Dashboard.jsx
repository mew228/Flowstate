import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Circle, CheckCircle2, Calendar, Search, Menu, Edit2, Flag, ChevronDown, ChevronRight } from 'lucide-react';
import { format, isAfter, parseISO, isToday, isTomorrow } from 'date-fns';
import StatsPanel from './StatsPanel';
import './Dashboard.css';

const priorityColors = {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#ef4444',
};

const Dashboard = ({
    activeCategory,
    tasks,
    onAddTask,
    onDeleteTask,
    onToggleTask,
    onEditTask,
    user,
    onMenuClick,
    onOpenTaskModal
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'active' | 'completed'
    const [expandedTasks, setExpandedTasks] = useState({});

    const filteredTasks = useMemo(() => {
        let result = tasks.filter(task => {
            // Category filter
            if (activeCategory === 'all') return true;
            if (activeCategory === 'important') return task.important || task.priority === 'high';
            return task.category === activeCategory;
        });

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(t =>
                t.text.toLowerCase().includes(query) ||
                t.category?.toLowerCase().includes(query)
            );
        }

        // Status filter
        if (filterStatus === 'active') {
            result = result.filter(t => !t.completed);
        } else if (filterStatus === 'completed') {
            result = result.filter(t => t.completed);
        }

        // Sort by priority (high first), then by due date
        result.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            const aPriority = priorityOrder[a.priority] ?? 1;
            const bPriority = priorityOrder[b.priority] ?? 1;
            if (aPriority !== bPriority) return aPriority - bPriority;

            if (a.dueDate && b.dueDate) {
                return new Date(a.dueDate) - new Date(b.dueDate);
            }
            return a.dueDate ? -1 : 1;
        });

        return result;
    }, [tasks, activeCategory, searchQuery, filterStatus]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const firstName = user?.displayName ? user.displayName.split(' ')[0] : 'there';

    const formatDueDate = (dateStr) => {
        if (!dateStr) return null;
        const date = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
        if (isToday(date)) return 'Today';
        if (isTomorrow(date)) return 'Tomorrow';
        return format(date, 'MMM d');
    };

    const isOverdue = (dateStr) => {
        if (!dateStr) return false;
        const date = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
        return isAfter(new Date(), date) && !isToday(date);
    };

    const toggleExpand = (taskId) => {
        setExpandedTasks(prev => ({
            ...prev,
            [taskId]: !prev[taskId]
        }));
    };

    const handleSubtaskToggle = (taskId, subtaskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const updatedSubtasks = task.subtasks.map(st =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );

        onEditTask(taskId, { subtasks: updatedSubtasks });
    };

    return (
        <main className="dashboard">
            <header className="dashboard-header">
                <button className="mobile-menu-btn" onClick={onMenuClick}>
                    <Menu size={24} />
                </button>
                <div className="header-greeting">
                    <h2>{getGreeting()}, {firstName}</h2>
                    <p>You have {filteredTasks.filter(t => !t.completed).length} pending tasks</p>
                </div>
                <div className="header-actions">
                    <div className="search-bar">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="filter-dropdown">
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="all">All</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>
            </header>

            <StatsPanel tasks={tasks} />

            <div className="task-input-container">
                <button className="task-input-wrapper" onClick={() => onOpenTaskModal()}>
                    <div className="add-icon">
                        <Plus size={24} />
                    </div>
                    <span className="input-placeholder">Add a new task...</span>
                    <span className="add-btn-text">Add Task</span>
                </button>
            </div>

            <div className="task-list">
                {filteredTasks.length === 0 ? (
                    <div className="empty-state">
                        <p>
                            {searchQuery
                                ? `No tasks matching "${searchQuery}"`
                                : 'No tasks found. Click above to add one! 🎯'}
                        </p>
                    </div>
                ) : (
                    filteredTasks.map(task => (
                        <div
                            key={task.id}
                            className={`task-item ${task.completed ? 'completed' : ''} ${isOverdue(task.dueDate) && !task.completed ? 'overdue' : ''}`}
                        >
                            <button
                                className="check-btn"
                                onClick={() => onToggleTask(task.id)}
                            >
                                {task.completed ? (
                                    <CheckCircle2 size={24} className="checked-icon" />
                                ) : (
                                    <Circle size={24} className="unchecked-icon" />
                                )}
                            </button>

                            <div className="task-main" onClick={() => task.subtasks?.length > 0 && toggleExpand(task.id)}>
                                <div className="task-content">
                                    <div className="task-header">
                                        <span className="task-text">{task.text}</span>
                                        {task.priority && (
                                            <span
                                                className="priority-badge"
                                                style={{ '--priority-color': priorityColors[task.priority] }}
                                            >
                                                <Flag size={12} /> {task.priority}
                                            </span>
                                        )}
                                    </div>
                                    <div className="task-meta">
                                        <span className="task-category-tag">{task.category}</span>
                                        {task.dueDate && (
                                            <span className={`due-date ${isOverdue(task.dueDate) ? 'overdue' : ''}`}>
                                                <Calendar size={12} /> {formatDueDate(task.dueDate)}
                                            </span>
                                        )}
                                        {task.subtasks?.length > 0 && (
                                            <span className="subtask-count">
                                                {expandedTasks[task.id] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                                {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="task-actions">
                                <button
                                    className="edit-btn"
                                    onClick={() => onOpenTaskModal(task)}
                                    aria-label="Edit task"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    className="delete-btn"
                                    onClick={() => onDeleteTask(task.id)}
                                    aria-label="Delete task"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            {/* Subtasks Expansion */}
                            {expandedTasks[task.id] && task.subtasks?.length > 0 && (
                                <div className="subtasks-expanded">
                                    {task.subtasks.map(st => (
                                        <div key={st.id} className="subtask-row">
                                            <input
                                                type="checkbox"
                                                checked={st.completed}
                                                onChange={() => handleSubtaskToggle(task.id, st.id)}
                                            />
                                            <span className={st.completed ? 'completed' : ''}>{st.text}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </main>
    );
};

export default Dashboard;
