import React from 'react';
import { CalendarDays, GitBranch, Layers, Milestone } from 'lucide-react';
import { Task, Workspace } from '../types';

interface ProjectGanttViewProps {
  tasks: Task[];
  workspaces: Workspace[];
  onViewDetails: (task: Task) => void;
}

function toDate(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function inferStartDate(task: Task) {
  if (task.startDate) return task.startDate;

  const firstLog = task.history?.[0]?.createdAt?.split(' ')[0];
  if (firstLog && /^\d{4}-\d{2}-\d{2}$/.test(firstLog)) return firstLog;

  return formatDate(addDays(toDate(task.deadline), -7));
}

function getTaskProgress(task: Task) {
  if (task.status === 'HOAN_THANH') return 100;
  if (task.checklist && task.checklist.length > 0) {
    return Math.round((task.checklist.filter(item => item.done).length / task.checklist.length) * 100);
  }
  if (task.status === 'CHO_DUYET') return 80;
  if (task.status === 'DANG_TIEN_HANH') return 45;
  return 10;
}

function dateDiffDays(from: Date, to: Date) {
  return Math.max(0, Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)));
}

export default function ProjectGanttView({ tasks, workspaces, onViewDetails }: ProjectGanttViewProps) {
  const activeTasks = tasks.filter(task => task.deadline);

  if (activeTasks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm font-semibold text-slate-500">
        Chưa có công việc đủ dữ liệu ngày bắt đầu và hạn chót để dựng Gantt.
      </div>
    );
  }

  const ganttTasks = activeTasks.map(task => ({
    task,
    start: toDate(inferStartDate(task)),
    end: toDate(task.deadline),
    progress: getTaskProgress(task),
  }));

  const minDate = ganttTasks.reduce((min, item) => item.start < min ? item.start : min, ganttTasks[0].start);
  const maxDate = ganttTasks.reduce((max, item) => item.end > max ? item.end : max, ganttTasks[0].end);
  const timelineStart = addDays(minDate, -1);
  const timelineEnd = addDays(maxDate, 2);
  const totalDays = Math.max(1, dateDiffDays(timelineStart, timelineEnd));

  const workspaceMap = new Map(workspaces.map(workspace => [workspace.id, workspace.name]));
  const taskById = new Map(tasks.map(task => [task.id, task]));

  const groups = ganttTasks.reduce<Record<string, typeof ganttTasks>>((acc, item) => {
    const key = item.task.projectId || item.task.workspaceId || 'GENERAL';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-black text-slate-900">
            <CalendarDays className="h-4 w-4 text-indigo-600" />
            Gantt dự án và tiến độ công việc
          </h3>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Theo dõi quan hệ dự án, công việc cha-con, ngày bắt đầu, hạn chót và tiến độ hoàn thành.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-slate-600">
          <span className="rounded-lg border border-slate-200 bg-white px-2 py-1">{Object.keys(groups).length} dự án/nhóm</span>
          <span className="rounded-lg border border-slate-200 bg-white px-2 py-1">{activeTasks.length} công việc</span>
          <span className="rounded-lg border border-slate-200 bg-white px-2 py-1">{totalDays} ngày</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="min-w-[920px]">
          <div className="grid grid-cols-[320px_1fr] border-b border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-wide text-slate-500">
            <div className="border-r border-slate-200 px-4 py-3">Công việc</div>
            <div className="relative px-4 py-3">
              <div className="flex justify-between">
                <span>{formatDate(timelineStart)}</span>
                <span>{formatDate(timelineEnd)}</span>
              </div>
            </div>
          </div>

          {Object.entries(groups).map(([groupId, items]) => {
            const label = items[0].task.projectName || workspaceMap.get(groupId) || workspaceMap.get(items[0].task.workspaceId) || groupId;
            const sortedItems = [...items].sort((a, b) => a.start.getTime() - b.start.getTime());

            return (
              <div key={groupId} className="border-b border-slate-100 last:border-b-0">
                <div className="grid grid-cols-[320px_1fr] bg-slate-50/70">
                  <div className="flex items-center gap-2 border-r border-slate-200 px-4 py-2 text-xs font-black text-slate-800">
                    <Layers className="h-3.5 w-3.5 text-indigo-500" />
                    {label}
                  </div>
                  <div className="px-4 py-2 text-[10px] font-bold text-slate-400">
                    {sortedItems.length} công việc trong nhóm
                  </div>
                </div>

                {sortedItems.map(({ task, start, end, progress }) => {
                  const left = (dateDiffDays(timelineStart, start) / totalDays) * 100;
                  const width = Math.max(3, (Math.max(1, dateDiffDays(start, end)) / totalDays) * 100);
                  const parentTask = task.parentTaskId ? taskById.get(task.parentTaskId) : null;
                  const childCount = tasks.filter(child => child.parentTaskId === task.id).length;
                  const isOverdue = task.status !== 'HOAN_THANH' && task.deadline < formatDate(new Date());

                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => onViewDetails(task)}
                      className="grid w-full grid-cols-[320px_1fr] text-left transition-colors hover:bg-indigo-50/35"
                    >
                      <div className="border-r border-slate-100 px-4 py-3">
                        <div className="flex items-start gap-2">
                          <Milestone className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`} />
                          <div className="min-w-0">
                            <div className="truncate text-xs font-bold text-slate-850">{task.title}</div>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                              <span>{task.assignedName}</span>
                              {parentTask && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-1.5 py-0.5 text-indigo-700">
                                  <GitBranch className="h-3 w-3" />
                                  Con của: {parentTask.title}
                                </span>
                              )}
                              {childCount > 0 && (
                                <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-emerald-700">
                                  {childCount} việc con
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="relative px-4 py-3">
                        <div className="absolute inset-x-4 top-1/2 h-px bg-slate-100" />
                        <div
                          className={`relative h-7 rounded-lg border shadow-3xs ${isOverdue ? 'border-rose-300 bg-rose-50' : 'border-indigo-200 bg-indigo-50'}`}
                          style={{ marginLeft: `${left}%`, width: `${Math.min(width, 100 - left)}%` }}
                          title={`${formatDate(start)} -> ${task.deadline}`}
                        >
                          <div
                            className={`h-full rounded-lg ${isOverdue ? 'bg-rose-500/80' : 'bg-indigo-500/80'}`}
                            style={{ width: `${progress}%` }}
                          />
                          <span className="absolute inset-0 flex items-center justify-center truncate px-2 text-[10px] font-black text-slate-800">
                            {progress}% | {formatDate(start)} - {task.deadline}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
