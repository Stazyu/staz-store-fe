'use client';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            className={`
                relative w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300
                ${isDark ? 'bg-blue-500' : 'bg-gray-200'}
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                overflow-hidden shadow-md
            `}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            <div
                className={`
                    absolute w-6 h-6 rounded-full bg-white dark:bg-yellow-200 shadow-md
                    transform transition-transform duration-300 ease-in-out
                    ${isDark ? 'translate-x-6' : 'translate-x-0'}
                    flex items-center justify-center
                `}
            >
                {isDark ? (
                    <FiMoon className="text-indigo-800 w-4 h-4" />
                ) : (
                    <FiSun className="text-yellow-500 w-4 h-4" />
                )}
            </div>
            <div className="w-full flex justify-between px-1.5">
                <FiSun className={`w-4 h-4 ${!isDark ? 'text-yellow-500' : 'text-gray-200'}`} />
                <FiMoon className={`w-4 h-4 ${isDark ? 'text-indigo-200' : 'text-gray-600'}`} />
            </div>
            <span className="sr-only">
                {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            </span>
        </button>
    );
}
