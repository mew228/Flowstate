import React from 'react';
import { LayoutDashboard, User, Briefcase, ShoppingCart, Star, LogOut, X, Sun, Moon, Plus } from 'lucide-react';
import PomodoroTimer from './PomodoroTimer';
import './Sidebar.css';

const defaultCategories = [
    { id: 'all', label: 'Dashboard', icon: LayoutDashboard, isDefault: true },
    { id: 'personal', label: 'Personal', icon: User, isDefault: true },
    { id: 'work', label: 'Work', icon: Briefcase, isDefault: true },
    { id: 'shopping', label: 'Shopping', icon: ShoppingCart, isDefault: true },
    { id: 'important', label: 'Important', icon: Star, isDefault: true },
];

const Sidebar = ({
    activeCategory,
    setActiveCategory,
    user,
    onLogout,
    isOpen,
    onClose,
    theme,
    onToggleTheme,
    customCategories = [],
    onAddCategory
}) => {
    const allCategories = [...defaultCategories, ...customCategories];

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <button className="mobile-close-btn" onClick={onClose}>
                <X size={24} />
            </button>

            <div className="logo-container">
                <div className="logo-icon">
                    <div className="logo-dot"></div>
                </div>
                <h1>FlowState</h1>
                <button className="theme-toggle" onClick={onToggleTheme} title="Toggle theme">
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
            </div>

            <nav className="nav-menu">
                {allCategories.map((cat) => {
                    const Icon = cat.icon || LayoutDashboard;
                    return (
                        <button
                            key={cat.id}
                            className={`nav-item ${activeCategory === cat.id ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat.id)}
                        >
                            <Icon size={20} strokeWidth={2} />
                            <span>{cat.label}</span>
                            {activeCategory === cat.id && <div className="active-indicator" />}
                        </button>
                    );
                })}

                <button className="nav-item add-category" onClick={onAddCategory}>
                    <Plus size={20} strokeWidth={2} />
                    <span>Add Category</span>
                </button>
            </nav>

            <PomodoroTimer />

            <div className="sidebar-footer">
                <button className="user-profile" onClick={onLogout} title="Click to Logout">
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt="Avatar" className="avatar-img" />
                    ) : (
                        <div className="avatar">{user?.email?.[0]?.toUpperCase()}</div>
                    )}
                    <div className="user-info">
                        <span className="name">{user?.displayName || 'User'}</span>
                        <span className="role">Logout</span>
                    </div>
                    <LogOut size={16} className="logout-icon" />
                </button>
            </div>
        </aside>
    );
};

export { defaultCategories };
export default Sidebar;
