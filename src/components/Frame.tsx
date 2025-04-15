"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useFrameSDK } from "~/hooks/useFrameSDK";

interface HabitEntry {
  date: string;
  completed: boolean;
}

interface HabitCardProps {
  habit: string | null;
  entries: HabitEntry[];
  onLogEntry: (date: string) => void;
  onCreateHabit: (name: string) => void;
}

function HabitCard({ habit, entries, onLogEntry, onCreateHabit }: HabitCardProps) {
  const [habitName, setHabitName] = useState("");
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]);
  const [weeklyStreak, setWeeklyStreak] = useState(0);

  const calculateWeeklyStreak = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if there's an entry in the current week
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay());
    
    const hasEntryThisWeek = entries.some(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= currentWeekStart && entryDate <= today;
    });

    if (!hasEntryThisWeek) {
      setWeeklyStreak(0);
      return;
    }

    // Calculate streak by checking previous weeks
    let streak = 1;
    let weekStart = new Date(currentWeekStart);
    weekStart.setDate(weekStart.getDate() - 7);
    
    while (true) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const hasEntryInWeek = entries.some(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= weekStart && entryDate <= weekEnd;
      });

      if (hasEntryInWeek) {
        streak++;
        weekStart.setDate(weekStart.getDate() - 7);
      } else {
        break;
      }
    }

    setWeeklyStreak(streak);
  }, [entries]);

  useEffect(() => {
    calculateWeeklyStreak();
  }, [calculateWeeklyStreak]);

  const renderGrid = () => {
    const today = new Date();
    const days = [];
    const totalDays = Math.max(90, entries.length + 90);
    
    // Start from the earliest date needed
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (totalDays - 1));
    
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const hasEntry = entries.some(entry => entry.date === dateStr);
      
      days.push(
        <div
          key={dateStr}
          className={`w-4 h-4 rounded-sm ${
            hasEntry ? 'bg-green-500' : 'bg-gray-700'
          }`}
          title={dateStr}
        />
      );
    }
    return (
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
    );
  };

  if (!habit) {
    return (
      <Card className="bg-gray-900 text-white">
        <CardHeader>
          <CardTitle>Create New Habit</CardTitle>
          <CardDescription className="text-gray-400">
            Name your new habit to start tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Enter habit name"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              className="bg-gray-800 border-gray-700"
            />
            <Button
              onClick={() => onCreateHabit(habitName)}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Create Habit
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 text-white">
      <CardHeader>
        <CardTitle>{habit}</CardTitle>
        <CardDescription className="text-gray-400">
          Weekly Streak: {weeklyStreak} weeks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-gray-800 border-gray-700"
          />
          <Button
            onClick={() => onLogEntry(selectedDate)}
            className="bg-green-600 hover:bg-green-700"
          >
            Log Entry
          </Button>
        </div>
        <div className="mt-4">
          {renderGrid()}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Frame() {
  const { isSDKLoaded } = useFrameSDK();
  const [habit, setHabit] = useState<string | null>(null);
  const [entries, setEntries] = useState<HabitEntry[]>([]);

  const handleCreateHabit = (name: string) => {
    setHabit(name);
  };

  const handleLogEntry = (date: string) => {
    setEntries(prev => {
      // Remove any existing entry for this date
      const filtered = prev.filter(entry => entry.date !== date);
      return [...filtered, { date, completed: true }];
    });
  };

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-4 px-4">
      <HabitCard
        habit={habit}
        entries={entries}
        onLogEntry={handleLogEntry}
        onCreateHabit={handleCreateHabit}
      />
    </div>
  );
}
