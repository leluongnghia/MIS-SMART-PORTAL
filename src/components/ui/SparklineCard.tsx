"use client";

import React from "react";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { cn } from "@/src/lib/utils";

interface SparklineCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  data: { value: number }[];
  color?: "blue" | "emerald" | "rose" | "amber" | "indigo" | "purple" | "sky";
  className?: string;
}

const colorMap = {
  blue: { text: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", stroke: "#2563eb" },
  emerald: { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", stroke: "#10b981" },
  rose: { text: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-900/20", stroke: "#e11d48" },
  amber: { text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", stroke: "#f59e0b" },
  indigo: { text: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-900/20", stroke: "#4f46e5" },
  purple: { text: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20", stroke: "#9333ea" },
  sky: { text: "text-sky-600 dark:text-sky-400", bg: "bg-sky-50 dark:bg-sky-900/20", stroke: "#0ea5e9" },
};

export function SparklineCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendValue, 
  data, 
  color = "blue",
  className
}: SparklineCardProps) {
  const theme = colorMap[color];

  return (
    <div className={cn("relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col group", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</h3>
        {icon && (
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", theme.bg, theme.text)}>
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-baseline gap-2 z-10">
        <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{value}</div>
        {trendValue && (
          <div className={cn(
            "text-xs font-bold",
            trend === "up" ? "text-emerald-600" : trend === "down" ? "text-rose-600" : "text-slate-500"
          )}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "−"} {trendValue}
          </div>
        )}
      </div>
      
      {subtitle && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 z-10">{subtitle}</p>}

      {/* Sparkline overlay */}
      {data && data.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 group-hover:opacity-60 transition-opacity pointer-events-none">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <YAxis domain={['dataMin', 'dataMax']} hide />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={theme.stroke} 
                strokeWidth={2} 
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
