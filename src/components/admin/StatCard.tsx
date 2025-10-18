"use client";

import { Card, CardContent } from "@/components/ui/card";

// Reusable StatCard component
const StatCard = ({ label, value, icon, trend, trendType }: {
    label: string;
    value: string | number;
    icon: string;
    trend: string;
    trendType: 'up' | 'down';
}) => (
    <Card key={label} className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{label}</p>
                    <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                        {value}
                    </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                    <span className="text-2xl">{icon}</span>
                </div>
            </div>
            <div className={`mt-2 text-sm flex items-center ${trendType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trendType === 'up' ? '↑' : '↓'} {trend}
                <span className="ml-1 text-gray-500 text-xs">vs kemarin</span>
            </div>
        </CardContent>
    </Card>
);

export default StatCard;