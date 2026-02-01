"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Calendar,
  ChevronLeft,
  LayoutDashboard,
  CheckSquare,
  X,
  PlusCircle,
  Clock,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Frequency = "daily" | "weekly" | "once";

interface Task {
  id: string;
  title: string;
  frequency: Frequency;
  days?: number[]; // 0-6 (Sunday-Saturday)
  date?: string; // YYYY-MM-DD
  createdAt: number;
}

interface Completion {
  taskId: string;
  date: string; // YYYY-MM-DD
}

const DAYS_NAME = [
  "Ahad",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

export default function IstiqomahPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"today" | "summary">("today");

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newFrequency, setNewFrequency] = useState<Frequency>("daily");
  const [newDays, setNewDays] = useState<number[]>([]);
  const [newDate, setNewDate] = useState("");

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const toLocalDateStr = useCallback((date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const todayStr = useMemo(() => toLocalDateStr(new Date()), [toLocalDateStr]);
  const selectedDateStr = useMemo(() => toLocalDateStr(selectedDate), [selectedDate, toLocalDateStr]);

  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem("istiqomah_tasks");
      const savedCompletions = localStorage.getItem("istiqomah_completions");
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedCompletions) setCompletions(JSON.parse(savedCompletions));
    } catch (error) {
      console.error("Failed to load istiqomah data:", error);
    } finally {
      setHasMounted(true);
    }
  }, []);

  useEffect(() => {
    if (hasMounted) {
      localStorage.setItem("istiqomah_tasks", JSON.stringify(tasks));
    }
  }, [tasks, hasMounted]);

  useEffect(() => {
    if (hasMounted) {
      localStorage.setItem("istiqomah_completions", JSON.stringify(completions));
    }
  }, [completions, hasMounted]);

  const addTask = () => {
    if (!newTitle.trim()) return;

    const newTask: Task = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2) + Date.now().toString(36),
      title: newTitle,
      frequency: newFrequency,
      days: newFrequency === "weekly" ? newDays : undefined,
      date: newFrequency === "once" ? newDate : undefined,
      createdAt: Date.now(),
    };

    setTasks([...tasks, newTask]);
    setNewTitle("");
    setNewFrequency("daily");
    setNewDays([]);
    setNewDate("");
    setIsAdding(false);
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
    setCompletions(completions.filter((c) => c.taskId !== id));
  };

  const toggleComplete = (taskId: string) => {
    const exists = completions.find(
      (c) => c.taskId === taskId && c.date === selectedDateStr
    );
    if (exists) {
      setCompletions(
        completions.filter((c) => !(c.taskId === taskId && c.date === selectedDateStr))
      );
    } else {
      setCompletions([...completions, { taskId, date: selectedDateStr }]);
    }
  };

  const isTaskDueOnDate = useCallback((task: Task, date: Date) => {
    if (task.frequency === "daily") return true;
    if (task.frequency === "weekly") {
      const day = date.getDay();
      return task.days?.includes(day);
    }
    if (task.frequency === "once") {
      const dStr = toLocalDateStr(date);
      return task.date === dStr;
    }
    return false;
  }, [toLocalDateStr]);

  const currentTasks = useMemo(() => tasks.filter(task => isTaskDueOnDate(task, selectedDate)), [tasks, isTaskDueOnDate, selectedDate]);
  const completedCount = useMemo(() => currentTasks.filter((t) =>
    completions.some((c) => c.taskId === t.id && c.date === selectedDateStr)
  ).length, [currentTasks, completions, selectedDateStr]);

  const getDayCompletionRate = useCallback((dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    // Use noon to avoid any DST issues when calculating local day parts
    const date = new Date(y, m - 1, d, 12, 0, 0); 
    const tasksOnDate = tasks.filter((t) => isTaskDueOnDate(t, date));

    if (tasksOnDate.length === 0) return 0;
    
    const completedOnDate = completions.filter((c) => 
      c.date === dateStr && tasksOnDate.some(t => t.id === c.taskId)
    ).length;

    return (completedOnDate / tasksOnDate.length) * 100;
  }, [tasks, completions, isTaskDueOnDate]);

  const getRangeStats = (start: string, end: string) => {
    if (!start || !end) return null;
    let totalScheduled = 0;
    let totalCompleted = 0;
    let curr = new Date(start);
    const last = new Date(end);
    
    while (curr <= last) {
      const dStr = toLocalDateStr(curr);
      const tasksOnDate = tasks.filter((t) => isTaskDueOnDate(t, curr));
      totalScheduled += tasksOnDate.length;
      totalCompleted += completions.filter((c) => c.date === dStr).length;
      curr.setDate(curr.getDate() + 1);
    }
    
    const rate = totalScheduled > 0 ? (totalCompleted / totalScheduled) * 100 : 0;
    return { totalScheduled, totalCompleted, rate };
  };


  if (!hasMounted) return null;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-700">
      <header className="flex items-center gap-4">
        <Link
          href="/"
          className="p-2 hover:bg-accent rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Catatan Istiqomah</h1>
          <p className="text-sm text-muted-foreground italic">
            "Amalan yang paling dicintai Allah adalah yang rutin meskipun sedikit"
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex p-1 bg-muted rounded-xl">
        <button
          onClick={() => setActiveTab("today")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all",
            activeTab === "today"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <CheckSquare className="w-4 h-4" />
          Harian
        </button>
        <button
          onClick={() => setActiveTab("summary")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all",
            activeTab === "summary"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <LayoutDashboard className="w-4 h-4" />
          Ringkasan
        </button>
      </div>

      {activeTab === "today" ? (
        <div className="space-y-6">
          {/* Date Selector */}
          <div className="flex items-center justify-between p-2 bg-muted/50 rounded-2xl border border-border">
            <button
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(newDate.getDate() - 1);
                setSelectedDate(newDate);
              }}
              className="p-2 hover:bg-accent rounded-xl transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                {selectedDateStr === todayStr ? "HARI INI" : selectedDate.toLocaleDateString('id-ID', { weekday: 'long' })}
              </span>
              <div className="relative">
                <input
                  type="date"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  value={selectedDateStr}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                />
                <button className="text-sm font-medium flex items-center gap-2">
                  {selectedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(newDate.getDate() + 1);
                setSelectedDate(newDate);
              }}
              className="p-2 hover:bg-accent rounded-xl transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Card */}
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-sm text-emerald-600 font-medium mb-1">
                  Progress {selectedDateStr === todayStr ? "Hari Ini" : "Tanggal Ini"}
                </p>
                <h2 className="text-3xl font-bold text-emerald-700">
                  {completedCount}/{currentTasks.length}
                </h2>
              </div>
            </div>
            <div className="h-2 bg-emerald-500/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{
                  width: `${
                    currentTasks.length > 0
                      ? (completedCount / currentTasks.length) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                Daftar Amalan
                <span className="text-xs font-normal text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
                  {currentTasks.length}
                </span>
              </h3>
              <button
                onClick={() => setIsAdding(true)}
                className="text-primary hover:text-primary/80 transition-colors"
                title="Tambah amalan"
              >
                <PlusCircle className="w-6 h-6" />
              </button>
            </div>

            {currentTasks.length === 0 ? (
              <div className="text-center py-12 bg-card border border-dashed rounded-2xl">
                <p className="text-muted-foreground text-sm italic">
                  Belum ada amalan yang dijadwalkan pada tanggal ini.
                </p>
                <button
                  onClick={() => setIsAdding(true)}
                  className="mt-4 text-primary text-sm font-medium hover:underline"
                >
                  Tambah Amalan Baru
                </button>
              </div>
            ) : (
              <div className="grid gap-3">
                {currentTasks.map((task) => {
                  const isCompleted = completions.some(
                    (c) => c.taskId === task.id && c.date === selectedDateStr
                  );
                  return (
                    <div
                      key={task.id}
                      className={cn(
                        "group flex items-center gap-4 p-4 rounded-xl border transition-all",
                        isCompleted
                          ? "bg-emerald-500/5 border-emerald-500/10 opacity-75"
                          : "bg-card border-border hover:border-primary/50"
                      )}
                    >
                      <button
                        onClick={() => toggleComplete(task.id)}
                        className={cn(
                          "transition-colors",
                          isCompleted ? "text-emerald-500" : "text-muted-foreground"
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : (
                          <Circle className="w-6 h-6" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <h4
                          className={cn(
                            "font-medium truncate",
                            isCompleted && "line-through text-muted-foreground"
                          )}
                        >
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                          {task.frequency === "daily" && "Setiap Hari"}
                          {task.frequency === "weekly" &&
                            task.days
                              ?.map((d) => DAYS_NAME[d].slice(0, 3))
                              .join(", ")}
                          {task.frequency === "once" && task.date}
                        </div>
                      </div>
                      <button
                        onClick={() => setTaskToDelete(task)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Summary Tab */
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-card border border-border">
              <p className="text-xs text-muted-foreground mb-1">Total Amalan</p>
              <p className="text-2xl font-bold">{tasks.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border">
              <p className="text-xs text-muted-foreground mb-1">Total Selesai</p>
              <p className="text-2xl font-bold text-emerald-600">{completions.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border col-span-2 shadow-sm">
              <p className="text-xs text-muted-foreground mb-1">Rata-rata Disiplin (7 Hari)</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-blue-600">
                  {(() => {
                    let totalRate = 0;
                    let daysWithTasks = 0;
                    for(let i=0; i<7; i++) {
                      const d = new Date();
                      d.setDate(d.getDate() - i);
                      const dStr = toLocalDateStr(d);
                      const [year, month, day] = dStr.split('-').map(Number);
                      const tasksOnDate = tasks.filter(t => isTaskDueOnDate(t, new Date(year, month-1, day, 12, 0, 0)));
                      
                      if (tasksOnDate.length > 0) {
                        totalRate += getDayCompletionRate(dStr);
                        daysWithTasks++;
                      }
                    }
                    return daysWithTasks > 0 ? Math.round(totalRate / daysWithTasks) : 0;
                  })()}%
                </p>
                <p className="text-[10px] text-muted-foreground italic">hanya menghitung hari dengan jadwal</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* 7 Day View */}
            <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
              <h3 className="font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Aktivitas 7 Hari
              </h3>
              <div className="flex justify-between items-end h-32 gap-3 px-2">
                {[...Array(7)].map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (6 - i));
                  const dStr = toLocalDateStr(date);
                  const rate = getDayCompletionRate(dStr);
                  const isToday = i === 6;
                  
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full">
                      <div className="w-full bg-muted/50 rounded-xl relative flex items-end overflow-hidden h-full">
                        <div 
                          className={cn(
                            "w-full transition-all duration-700",
                            isToday ? "bg-primary shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-primary/40"
                          )}
                          style={{ height: `${rate}%` }}
                        />
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold uppercase",
                        isToday ? "text-primary" : "text-muted-foreground"
                      )}>
                        {date.toLocaleDateString('id-ID', { weekday: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Monthly Heatmap */}
            <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
              <h3 className="font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                30 Hari Terakhir
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {[...Array(35)].map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (34 - i));
                  const dStr = toLocalDateStr(date);
                  const rate = getDayCompletionRate(dStr);
                  const isVoid = i < 5 && new Date().getDate() < 5; // Simplified logic for start of grid
                  
                  return (
                    <div
                      key={i}
                      title={`${dStr}: ${Math.round(rate)}%`}
                      className={cn(
                        "aspect-square rounded-md transition-all duration-300",
                        rate === 0 ? "bg-muted/30" :
                        rate < 30 ? "bg-emerald-500/20" :
                        rate < 60 ? "bg-emerald-500/40" :
                        rate < 90 ? "bg-emerald-500/70" :
                        "bg-emerald-600"
                      )}
                    />
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Kurang</span>
                <div className="flex gap-1 items-center">
                  <div className="w-2 h-2 rounded-sm bg-muted/30" />
                  <div className="w-2 h-2 rounded-sm bg-emerald-500/20" />
                  <div className="w-2 h-2 rounded-sm bg-emerald-500/40" />
                  <div className="w-2 h-2 rounded-sm bg-emerald-500/70" />
                  <div className="w-2 h-2 rounded-sm bg-emerald-600" />
                </div>
                <span>Sempurna</span>
              </div>
            </div>
          </div>

          {/* Custom Range Analysis */}
          <div className="p-6 rounded-3xl bg-card border border-border space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="font-bold flex items-center gap-2 text-lg">
                <LayoutDashboard className="w-5 h-5 text-primary" />
                Analisis Rentang Waktu
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="date"
                  className="p-2 rounded-xl border border-border bg-muted/30 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                  value={rangeStart}
                  onChange={(e) => setRangeStart(e.target.value)}
                />
                <span className="text-muted-foreground">s/d</span>
                <input
                  type="date"
                  className="p-2 rounded-xl border border-border bg-muted/30 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                  value={rangeEnd}
                  onChange={(e) => setRangeEnd(e.target.value)}
                />
              </div>
            </div>

            {rangeStart && rangeEnd ? (
              (() => {
                const stats = getRangeStats(rangeStart, rangeEnd);
                if (!stats) return null;
                return (
                  <div className="grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="p-4 rounded-2xl bg-muted/30 flex flex-col items-center">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Terjadwal</p>
                      <p className="text-xl font-bold">{stats.totalScheduled}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-500/5 flex flex-col items-center">
                      <p className="text-[10px] uppercase font-bold text-emerald-600 mb-1">Selesai</p>
                      <p className="text-xl font-bold text-emerald-600">{stats.totalCompleted}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-blue-500/5 flex flex-col items-center">
                      <p className="text-[10px] uppercase font-bold text-blue-600 mb-1">Rasio</p>
                      <p className="text-xl font-bold text-blue-600">{Math.round(stats.rate)}%</p>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="text-center py-8 bg-muted/20 border border-dashed rounded-2xl">
                <p className="text-sm text-muted-foreground italic">
                  Pilih rentang tanggal untuk melihat analisis mendalam amalan Anda.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Daftar Semua Amalan</h3>
              <p className="text-xs text-muted-foreground font-medium px-2 py-1 bg-muted rounded-lg">
                {tasks.length} total item
              </p>
            </div>
            <div className="grid gap-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="group p-4 rounded-2xl bg-card border border-border flex items-center justify-between hover:border-primary/50 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm transition-transform group-hover:scale-110",
                      task.frequency === 'daily' ? "bg-blue-500/10 text-blue-600" :
                      task.frequency === 'weekly' ? "bg-purple-500/10 text-purple-600" :
                      "bg-amber-500/10 text-amber-600"
                    )}>
                      {task.title.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{task.title}</h4>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">
                        {task.frequency === "daily" && "Setiap Hari"}
                        {task.frequency === "weekly" &&
                          task.days?.map((d) => DAYS_NAME[d]).join(", ")}
                        {task.frequency === "once" && `Sekali: ${task.date}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setTaskToDelete(task)}
                    className="p-2 text-destructive opacity-0 group-hover:opacity-100 hover:bg-destructive/10 rounded-xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="text-center py-12 bg-muted/10 border border-dashed rounded-3xl">
                  <p className="text-muted-foreground text-sm italic">
                    Belum ada daftar amalan yang dibuat. Mulailah perjalanan istiqomah Anda hari ini!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-bold">Tambah Amalan Baru</h3>
              <button
                onClick={() => setIsAdding(false)}
                className="p-1 hover:bg-muted rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Amalan</label>
                <input
                  type="text"
                  placeholder="Contoh: Sholat Tahajud"
                  className="w-full p-3 rounded-xl border border-border bg-muted/50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Frekuensi</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["daily", "weekly", "once"] as Frequency[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setNewFrequency(f)}
                      className={cn(
                        "py-2 text-xs font-medium rounded-lg border transition-all capitalize",
                        newFrequency === f
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/50 border-border text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {f === "daily" ? "Harian" : f === "weekly" ? "Mingguan" : "Sekali"}
                    </button>
                  ))}
                </div>
              </div>

              {newFrequency === "weekly" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pilih Hari</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_NAME.map((name, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          if (newDays.includes(i)) {
                            setNewDays(newDays.filter((d) => d !== i));
                          } else {
                            setNewDays([...newDays, i]);
                          }
                        }}
                        className={cn(
                          "w-10 h-10 text-xs font-bold rounded-full border transition-all flex items-center justify-center",
                          newDays.includes(i)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/50 border-border text-muted-foreground hover:bg-muted"
                        )}
                      >
                        {name.slice(0, 1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {newFrequency === "once" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pilih Tanggal</label>
                  <input
                    type="date"
                    className="w-full p-3 rounded-xl border border-border bg-muted/50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    min={todayStr}
                  />
                </div>
              )}

              <button
                onClick={addTask}
                disabled={!newTitle.trim()}
                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
              >
                Simpan Amalan
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-card border border-border rounded-3xl shadow-2xl p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">Hapus Amalan?</h3>
              <p className="text-sm text-muted-foreground">
                Apakah Anda yakin ingin menghapus <strong>"{taskToDelete.title}"</strong>? Seluruh riwayat penyelesaian juga akan dihapus.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTaskToDelete(null)}
                className="py-3 rounded-xl border border-border font-medium hover:bg-muted transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  deleteTask(taskToDelete.id);
                  setTaskToDelete(null);
                }}
                className="py-3 rounded-xl bg-destructive text-destructive-foreground font-bold shadow-lg shadow-destructive/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
