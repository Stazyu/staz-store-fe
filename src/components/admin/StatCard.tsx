"use client";

import { Card, CardContent } from "@/components/ui/card";

// Reusable StatCard component with blue theme
const StatCard = ({ label, value, icon, trend, trendType }: {
    label: string;
    value: string | number;
    icon: string;
    trend: string;
    trendType: 'up' | 'down';
}) => (
    <Card
        key={label}
        className="hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
    >
        <CardContent className="p-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                        {value}
                    </p>
                </div>
                <div className="p-3 rounded-xl bg-linear-to-br from-blue-50 to-sky-50 dark:from-blue-900/30 dark:to-sky-900/30 border border-blue-100 dark:border-blue-800/30">
                    <span className="text-2xl">{icon}</span>
                </div>
            </div>
            <div className={`mt-3 text-sm flex items-center ${trendType === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full mr-1.5 ${trendType === 'up' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    {trendType === 'up' ? '↑' : '↓'}
                </span>
                <span className="font-medium">{trend}</span>
                <span className="ml-1.5 text-gray-500 dark:text-gray-400 text-xs">vs kemarin</span>
            </div>
        </CardContent>
    </Card>
);

export default StatCard;