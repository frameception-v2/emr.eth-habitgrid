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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [weeklyStreak, setWeeklyStreak] = useState(0);

  const calculateWeeklyStreak = useCallback(() => {
    let streak = 0;
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const hasEntryInLastWeek = entries.some(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= oneWeekAgo && entryDate <= today;
    });

    if (hasEntryInLastWeek) {
      streak = 1;
      // Calculate additional weeks
      let currentWeekStart = new Date(oneWeekAgo);
      while (true) {
        currentWeekStart = new Date(currentWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
        const weekEnd = new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const hasEntryInWeek = entries.some(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= currentWeekStart && entryDate <= weekEnd;
        });

        if (hasEntryInWeek) {
          streak++;
        } else {
          break;
        }
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
    for (let i = 0; i < 90; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const hasEntry = entries.some(entry => entry.date === dateStr);
      
      days.unshift(
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
