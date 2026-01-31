import React, { useState, useEffect } from 'react';
import { X, Calendar, Flag, List, Mic, MicOff, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import './TaskModal.css';

const priorityOptions = [
    { value: 'low', label: 'Low', color: '#22c55e' },
    { value: 'medium', label: 'Medium', color: '#f59e0b' },
    { value: 'high', label: 'High', color: '#ef4444' },
];

const TaskModal = ({ isOpen, onClose, onSave, task, categories, activeCategory }) => {
    const [text, setText] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState('medium');
    const [category, setCategory] = useState('personal');
    const [subtasks, setSubtasks] = useState([]);
    const [newSubtask, setNewSubtask] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

    useEffect(() => {
        if (task) {
            setText(task.text || '');
            setDueDate(task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '');
            setPriority(task.priority || 'medium');
            setCategory(task.category || 'personal');
            setSubtasks(task.subtasks || []);
        } else {
            setText('');
            setDueDate('');
            setPriority('medium');
            setCategory(activeCategory === 'all' || activeCategory === 'important' ? 'personal' : activeCategory);
            setSubtasks([]);
        }
    }, [task, isOpen, activeCategory]);

    const handleAddSubtask = () => {
        if (!newSubtask.trim()) return;
        setSubtasks([...subtasks, { id: Date.now(), text: newSubtask, completed: false }]);
        setNewSubtask('');
    };

    const handleToggleSubtask = (id) => {
        setSubtasks(subtasks.map(st =>
            st.id === id ? { ...st, completed: !st.completed } : st
        ));
    };

    const handleRemoveSubtask = (id) => {
        setSubtasks(subtasks.filter(st => st.id !== id));
    };

    const handleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Voice recognition not supported in this browser.');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setText(prev => prev + (prev ? ' ' : '') + transcript);
        };

        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        onSave({
            text,
            dueDate: dueDate ? new Date(dueDate).toISOString() : null,
            priority,
            category,
            subtasks,
            important: activeCategory === 'important' || priority === 'high',
        });

        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <h2>{task ? 'Edit Task' : 'New Task'}</h2>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Task</label>
                        <div className="text-input-wrapper">
                            <input
                                type="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="What needs to be done?"
                                autoFocus
                            />
                            <button
                                type="button"
                                className={`voice-btn ${isListening ? 'listening' : ''}`}
                                onClick={handleVoiceInput}
                            >
                                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="input-row">
                        <div className="input-group">
                            <label><Calendar size={14} /> Due Date</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>

                        <div className="input-group">
                            <label><Flag size={14} /> Priority</label>
                            <div className="priority-buttons">
                                {priorityOptions.map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        className={`priority-btn ${priority === opt.value ? 'active' : ''}`}
                                        style={{ '--priority-color': opt.color }}
                                        onClick={() => setPriority(opt.value)}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Category</label>
                        <div className="custom-dropdown">
                            <button
                                type="button"
                                className={`dropdown-trigger ${isCategoryDropdownOpen ? 'active' : ''}`}
                                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                            >
                                <div className="selected-category">
                                    {(() => {
                                        const selectedCat = categories.find(c => c.id === category);
                                        const Icon = selectedCat?.icon || List;
                                        return (
                                            <>
                                                <Icon size={16} />
                                                <span>{selectedCat?.label || 'Select Category'}</span>
                                            </>
                                        );
                                    })()}
                                </div>
                                <ChevronDown size={16} className={`arrow ${isCategoryDropdownOpen ? 'up' : ''}`} />
                            </button>

                            {isCategoryDropdownOpen && (
                                <div className="dropdown-options">
                                    {categories.map(cat => {
                                        const Icon = cat.icon || List;
                                        return (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                className={`option-item ${category === cat.id ? 'selected' : ''}`}
                                                onClick={() => {
                                                    setCategory(cat.id);
                                                    setIsCategoryDropdownOpen(false);
                                                }}
                                            >
                                                <Icon size={16} />
                                                <span>{cat.label}</span>
                                                {category === cat.id && <div className="dot" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="input-group">
                        <label><List size={14} /> Subtasks</label>
                        <div className="subtasks-list">
                            {subtasks.map(st => (
                                <div key={st.id} className="subtask-item">
                                    <input
                                        type="checkbox"
                                        checked={st.completed}
                                        onChange={() => handleToggleSubtask(st.id)}
                                    />
                                    <span className={st.completed ? 'completed' : ''}>{st.text}</span>
                                    <button type="button" onClick={() => handleRemoveSubtask(st.id)}>
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            <div className="add-subtask">
                                <input
                                    type="text"
                                    value={newSubtask}
                                    onChange={(e) => setNewSubtask(e.target.value)}
                                    placeholder="Add a subtask..."
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                                />
                                <button type="button" onClick={handleAddSubtask}>Add</button>
                            </div>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="save-btn" disabled={!text.trim()}>
                            {task ? 'Update Task' : 'Add Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;
