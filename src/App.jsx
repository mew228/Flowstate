import { useState, useEffect } from 'react'
import { auth, db } from './firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'

import Sidebar, { defaultCategories } from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Login from './components/Login'
import TaskModal from './components/TaskModal'
import './App.css'

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [hasPaid, setHasPaid] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Theme state
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('flowstate-theme');
    return saved || 'dark';
  });

  // Custom categories
  const [customCategories, setCustomCategories] = useState(() => {
    const saved = localStorage.getItem('flowstate-categories');
    return saved ? JSON.parse(saved) : [];
  });

  // Task modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('flowstate-theme', theme);
  }, [theme]);

  // Save custom categories
  useEffect(() => {
    localStorage.setItem('flowstate-categories', JSON.stringify(customCategories));
  }, [customCategories]);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Check URL for Payment Success
  useEffect(() => {
    const urlQuery = new URLSearchParams(window.location.search);
    if (urlQuery.get('success') === 'true') {
      setHasPaid(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Fetch Tasks for User
  useEffect(() => {
    if (!user || !hasPaid) {
      setTasks([]);
      return;
    }

    const q = query(collection(db, 'tasks'), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(tasksData);
    });

    return () => unsubscribe();
  }, [user, hasPaid]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleAddCategory = () => {
    const name = prompt('Enter category name:');
    if (!name?.trim()) return;

    const id = name.toLowerCase().replace(/\s+/g, '-');
    if (defaultCategories.some(c => c.id === id) || customCategories.some(c => c.id === id)) {
      alert('Category already exists!');
      return;
    }

    setCustomCategories(prev => [...prev, { id, label: name.trim() }]);
  };

  const openTaskModal = (task = null) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleSaveTask = async (taskData) => {
    if (!user) return;

    if (editingTask) {
      // Update existing task
      await updateDoc(doc(db, 'tasks', editingTask.id), {
        ...taskData,
        updatedAt: serverTimestamp()
      });
    } else {
      // Create new task
      await addDoc(collection(db, 'tasks'), {
        ...taskData,
        completed: false,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
    }
    closeTaskModal();
  };

  const deleteTask = async (id) => {
    await deleteDoc(doc(db, 'tasks', id));
  };

  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      await updateDoc(doc(db, 'tasks', id), {
        completed: !task.completed,
        completedAt: !task.completed ? new Date().toISOString() : null
      });
    }
  };

  const editTask = async (id, updates) => {
    await updateDoc(doc(db, 'tasks', id), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  };

  const handleLogout = () => {
    signOut(auth);
    setHasPaid(false);
  };

  if (loading) return <div className="app-loading">Loading...</div>;

  if (!user || !hasPaid) {
    return <Login user={user} onSkipPayment={() => setHasPaid(true)} />;
  }

  const allCategories = [...defaultCategories.filter(c => !['all', 'important'].includes(c.id)), ...customCategories];

  return (
    <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {isSidebarOpen && <div className="mobile-overlay" onClick={() => setIsSidebarOpen(false)} />}

      <Sidebar
        activeCategory={activeCategory}
        setActiveCategory={(cat) => {
          setActiveCategory(cat);
          setIsSidebarOpen(false);
        }}
        user={user}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
        customCategories={customCategories}
        onAddCategory={handleAddCategory}
      />

      <Dashboard
        activeCategory={activeCategory}
        tasks={tasks}
        onAddTask={() => openTaskModal()}
        onDeleteTask={deleteTask}
        onToggleTask={toggleTask}
        onEditTask={editTask}
        user={user}
        onMenuClick={() => setIsSidebarOpen(true)}
        onOpenTaskModal={openTaskModal}
      />

      <TaskModal
        isOpen={isModalOpen}
        onClose={closeTaskModal}
        onSave={handleSaveTask}
        task={editingTask}
        categories={allCategories}
        activeCategory={activeCategory}
      />
    </div>
  )
}

export default App
