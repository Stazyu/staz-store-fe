'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ReactNode, useEffect, useState } from 'react';

export default function ThemeProvider({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Set mounted to true once component is mounted on the client
        setMounted(true);
        
        // Add transition classes after a short delay to prevent initial flash
        const timer = setTimeout(() => {
            document.documentElement.classList.add('transition-colors');
            document.documentElement.classList.add('duration-300');
        }, 10);
        
        // Cleanup function
        return () => {
            clearTimeout(timer);
            document.documentElement.classList.remove('transition-colors', 'duration-300');
        };
    }, []);

    // Don't render the theme provider until we're on the client to prevent hydration mismatch
    if (!mounted) {
        return <div style={{ visibility: 'hidden' }}>{children}</div>;
    }

    return (
        <NextThemesProvider 
            attribute="class" 
            defaultTheme="light" 
            enableSystem={false}
            storageKey="theme"
            disableTransitionOnChange
        >
            {children}
        </NextThemesProvider>
    );
}