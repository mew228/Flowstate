import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';
import './PomodoroTimer.css';

const PomodoroTimer = () => {
    const [mode, setMode] = useState('work'); // 'work' | 'break'
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [sessions, setSessions] = useState(0);

    const workTime = 25 * 60;
    const breakTime = 5 * 60;

    useEffect(() => {
        let interval = null;

        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            // Timer finished
            if (mode === 'work') {
                setSessions(prev => prev + 1);
                setMode('break');
                setTimeLeft(breakTime);
                // Play notification sound
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('Break time!', { body: 'Great work! Take a 5 minute break.' });
                }
            } else {
                setMode('work');
                setTimeLeft(workTime);
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('Back to work!', { body: 'Break is over. Let\'s focus!' });
                }
            }
            setIsRunning(false);
        }

        return () => clearInterval(interval);
    }, [isRunning, timeLeft, mode]);

    useEffect(() => {
        // Request notification permission on mount
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleTimer = () => {
        setIsRunning(!isRunning);
    };

    const resetTimer = () => {
        setIsRunning(false);
        setTimeLeft(mode === 'work' ? workTime : breakTime);
    };

    const switchMode = (newMode) => {
        setMode(newMode);
        setTimeLeft(newMode === 'work' ? workTime : breakTime);
        setIsRunning(false);
    };

    const progress = mode === 'work'
        ? ((workTime - timeLeft) / workTime) * 100
        : ((breakTime - timeLeft) / breakTime) * 100;

    return (
        <div className="pomodoro-container">
            <div className="pomodoro-header">
                <h3>Focus Timer</h3>
                <span className="session-count">{sessions} sessions</span>
            </div>

            <div className="mode-switcher">
                <button
                    className={`mode-btn ${mode === 'work' ? 'active' : ''}`}
                    onClick={() => switchMode('work')}
                >
                    <Brain size={14} /> Work
                </button>
                <button
                    className={`mode-btn ${mode === 'break' ? 'active' : ''}`}
                    onClick={() => switchMode('break')}
                >
                    <Coffee size={14} /> Break
                </button>
            </div>

            <div className="timer-display">
                <svg className="timer-ring" viewBox="0 0 100 100">
                    <circle
                        className="timer-ring-bg"
                        cx="50" cy="50" r="45"
                    />
                    <circle
                        className="timer-ring-progress"
                        cx="50" cy="50" r="45"
                        style={{
                            strokeDasharray: `${2 * Math.PI * 45}`,
                            strokeDashoffset: `${2 * Math.PI * 45 * (1 - progress / 100)}`,
                            stroke: mode === 'work' ? 'var(--primary)' : '#22c55e'
                        }}
                    />
                </svg>
                <span className="timer-text">{formatTime(timeLeft)}</span>
            </div>

            <div className="timer-controls">
                <button className="control-btn reset" onClick={resetTimer}>
                    <RotateCcw size={18} />
                </button>
                <button className="control-btn play" onClick={toggleTimer}>
                    {isRunning ? <Pause size={24} /> : <Play size={24} />}
                </button>
            </div>
        </div>
    );
};

export default PomodoroTimer;
