import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent
} from '@dnd-kit/core';
import { Search, Sparkles, Plus, Filter, Tag, Download, Command, LayoutGrid, List } from 'lucide-react';
import type { Task, ColumnId } from './types/kanban';
import { useKanbanStore, COLUMNS } from './store/useKanbanStore';
import { KanbanColumn } from './components/board/KanbanColumn';
import { TaskCard } from './components/board/TaskCard';
import { SprintAnalyticsBar } from './components/analytics/SprintAnalyticsBar';
import { TaskListView } from './components/list/TaskListView';
import { QuickCreateModal } from './components/modals/QuickCreateModal';
import { TaskDetailModal } from './components/modals/TaskDetailModal';
import { CommandPalette } from './components/modals/CommandPalette';

export const App: React.FC = () => {
  const {
    tasks,
    movetask,
    searchquery,
    setsearchquery,
    selectedpriority,
    setselectedpriority,
    selectedlabel,
    setselectedlabel
  } = useKanbanStore();

  const [activetaskitem, setactivetaskitem] = useState<Task | null>(null);
  const [isquickopenflag, setisquickopenflag] = useState(false);
  const [viewmodestate, setviewmodestate] = useState<'board' | 'list'>('board');
  const [iscmdopenflag, setiscmdopenflag] = useState(false);
  const [cmdquerystr, setcmdquerystr] = useState('');
  const [selectedtaskitem, setselectedtaskitem] = useState<Task | null>(null);

  const alltasklabels = React.useMemo(() => {
    const lblset = new Set<string>();
    tasks.forEach((t) => t.labels?.forEach((l) => lblset.add(l)));
    return Array.from(lblset);
  }, [tasks]);

  const sprintstatsdata = React.useMemo(() => {
    const totalpoints = tasks.reduce((s, t) => s + (t.points || 0), 0);
    const donetasks = tasks.filter((t) => t.columnId === 'done');
    const donepoints = donetasks.reduce((s, t) => s + (t.points || 0), 0);
    const inprogresstasks = tasks.filter((t) => t.columnId === 'in-progress');
    const inprogresspoints = inprogresstasks.reduce((s, t) => s + (t.points || 0), 0);
    const todotasks = tasks.filter((t) => t.columnId === 'todo');
    const todopoints = todotasks.reduce((s, t) => s + (t.points || 0), 0);
    const backlogtasks = tasks.filter((t) => t.columnId === 'backlog');
    const backlogpoints = backlogtasks.reduce((s, t) => s + (t.points || 0), 0);
    const percentval = totalpoints > 0 ? Math.round((donepoints / totalpoints) * 100) : 0;
    return {
      totalpoints,
      donepoints,
      inprogresspoints,
      todopoints,
      backlogpoints,
      percentval
    };
  }, [tasks]);

  const filteredtaskslist = tasks.filter((t) => {
    const matchessrch =
      t.title.toLowerCase().includes(searchquery.toLowerCase()) ||
      t.identifier.toLowerCase().includes(searchquery.toLowerCase());
    const matchesprior = selectedpriority === 'all' || t.priority === selectedpriority;
    const matcheslbl = selectedlabel === 'all' || t.labels?.includes(selectedlabel);
    return matchessrch && matchesprior && matcheslbl;
  });

  const exportjsonhandler = () => {
    const datastr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const dlanchelem = document.createElement('a');
    dlanchelem.setAttribute('href', datastr);
    dlanchelem.setAttribute('download', `kanban-export-${new Date().toISOString().slice(0, 10)}.json`);
    dlanchelem.click();
  };

  const exportcsvhandler = () => {
    const csvhdrs = ['ID', 'Identifier', 'Title', 'Column', 'Priority', 'Points', 'Assignee', 'Labels'];
    const csvrows = tasks.map((t) => [
      `"${t.id}"`,
      `"${t.identifier}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.columnId}"`,
      `"${t.priority}"`,
      `"${t.points || 1}"`,
      `"${t.assignee.name}"`,
      `"${t.labels.join('; ')}"`
    ]);
    const csvrawcontent =
      'data:text/csv;charset=utf-8,' +
      encodeURIComponent([csvhdrs.join(','), ...csvrows.map((r) => r.join(','))].join('\n'));
    const dlanchelem = document.createElement('a');
    dlanchelem.setAttribute('href', csvrawcontent);
    dlanchelem.setAttribute('download', `kanban-export-${new Date().toISOString().slice(0, 10)}.csv`);
    dlanchelem.click();
  };

  useEffect(() => {
    const keydownhandler = (e: KeyboardEvent) => {
      const activeelem = document.activeElement;
      const isinputfocused =
        activeelem instanceof HTMLInputElement ||
        activeelem instanceof HTMLTextAreaElement ||
        activeelem instanceof HTMLSelectElement ||
        (activeelem as HTMLElement)?.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K' || e.key === 'л' || e.key === 'Л')) {
        e.preventDefault();
        setiscmdopenflag((prev) => !prev);
        return;
      }

      if (
        (e.key === 'c' || e.key === 'C' || e.key === 'с' || e.key === 'С') &&
        !isinputfocused &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !selectedtaskitem &&
        !iscmdopenflag
      ) {
        e.preventDefault();
        setisquickopenflag(true);
      } else if (e.key === 'Escape') {
        if (iscmdopenflag) setiscmdopenflag(false);
        if (isquickopenflag) setisquickopenflag(false);
        if (selectedtaskitem) setselectedtaskitem(null);
      }
    };

    window.addEventListener('keydown', keydownhandler);
    return () => window.removeEventListener('keydown', keydownhandler);
  }, [isquickopenflag, selectedtaskitem, iscmdopenflag]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const dragstarthandler = (event: DragStartEvent) => {
    const foundtask = tasks.find((t) => t.id === event.active.id);
    if (foundtask) setactivetaskitem(foundtask);
  };

  const dragendhandler = (event: DragEndEvent) => {
    const { active, over } = event;
    setactivetaskitem(null);
    if (!over) return;

    const activetaskid = active.id as string;
    let targetcolid: ColumnId | undefined;

    if (COLUMNS.some((c) => c.id === over.id)) {
      targetcolid = over.id as ColumnId;
    } else {
      const overtaskitem = tasks.find((t) => t.id === over.id);
      if (overtaskitem) targetcolid = overtaskitem.columnId;
    }

    if (targetcolid) movetask(activetaskid, targetcolid);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-linear-bg text-linear-text">
      <header className="h-14 border-b border-linear-border px-6 flex items-center justify-between select-none bg-linear-bg">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-linear-purple flex items-center justify-center font-bold text-white text-xs">
              L
            </div>
            <span className="font-semibold text-sm tracking-tight text-white">Инженерный спринт</span>
            <span className="px-2 py-0.5 rounded text-[11px] bg-linear-subtle border border-linear-border text-linear-muted font-mono">
              Активен
            </span>
          </div>
          <div className="h-4 w-px bg-linear-border" />
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-linear-muted" />
            <input
              type="text"
              placeholder="Поиск задач..."
              value={searchquery}
              onChange={(e) => setsearchquery(e.target.value)}
              className="w-56 bg-linear-subtle border border-linear-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-linear-text placeholder-linear-muted focus:outline-none focus:border-linear-purple/80"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setiscmdopenflag(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-linear-card hover:bg-linear-subtle border border-linear-border hover:border-linear-borderHover text-xs text-slate-300 transition"
          >
            <Command className="w-3.5 h-3.5 text-linear-purple" />
            <span>Команды</span>
            <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-linear-subtle border border-linear-border text-slate-400">
              Ctrl+K
            </kbd>
          </button>

          <div className="flex items-center rounded-lg border border-linear-border bg-linear-card p-0.5">
            <button
              type="button"
              onClick={() => setviewmodestate('board')}
              className={`p-1.5 rounded transition ${
                viewmodestate === 'board' ? 'bg-linear-purple text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Вид: Доска"
              aria-label="Переключить на вид канбан-доски"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setviewmodestate('list')}
              className={`p-1.5 rounded transition ${
                viewmodestate === 'list' ? 'bg-linear-purple text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Вид: Список"
              aria-label="Переключить на вид списка"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center rounded-lg border border-linear-border bg-linear-card p-0.5">
            <button
              type="button"
              onClick={exportjsonhandler}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-slate-300 hover:text-white hover:bg-linear-subtle transition"
            >
              <Download className="w-3.5 h-3.5 text-linear-purple" />
              <span>JSON</span>
            </button>
            <div className="h-3 w-px bg-linear-border" />
            <button
              type="button"
              onClick={exportcsvhandler}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-slate-300 hover:text-white hover:bg-linear-subtle transition"
            >
              <span>CSV</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setisquickopenflag(true)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-linear-card hover:bg-linear-subtle border border-linear-border hover:border-linear-borderHover text-xs text-slate-200 transition"
          >
            <Plus className="w-3.5 h-3.5 text-linear-purple" />
            <span>Новая задача</span>
            <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-linear-subtle border border-linear-border text-slate-400">
              C
            </kbd>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-linear-purple/15 text-linear-purple border border-linear-purple/30 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Linear Board</span>
          </div>
        </div>
      </header>

      <SprintAnalyticsBar stats={sprintstatsdata} />

      <section className="px-6 py-2 border-b border-linear-border/60 bg-linear-card/40 flex items-center justify-between text-xs overflow-x-auto select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-linear-muted font-medium pr-2 border-r border-linear-border/60">
            <Filter className="w-3.5 h-3.5 text-linear-purple" />
            <span>Фильтры:</span>
          </div>

          <div className="flex items-center gap-1">
            {(
              [
                { id: 'all', label: 'Все приоритеты' },
                { id: 'urgent', label: 'Срочные' },
                { id: 'high', label: 'Высокие' },
                { id: 'medium', label: 'Средние' },
                { id: 'low', label: 'Низкие' }
              ] as const
            ).map((p) => {
              const isactiveflag = selectedpriority === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setselectedpriority(p.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                    isactiveflag
                      ? 'bg-linear-purple text-white shadow-xs'
                      : 'bg-linear-subtle/60 text-slate-400 hover:text-white hover:bg-linear-subtle border border-linear-border/40'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="h-3.5 w-px bg-linear-border/60 mx-1" />

          <div className="flex items-center gap-1.5">
            <Tag className="w-3 h-3 text-slate-500" />
            <select
              value={selectedlabel}
              onChange={(e) => setselectedlabel(e.target.value)}
              className="bg-linear-subtle border border-linear-border/60 text-[11px] text-slate-300 rounded-md px-2 py-0.5 focus:outline-none focus:border-linear-purple"
            >
              <option value="all">Все теги</option>
              {alltasklabels.map((lbl) => (
                <option key={lbl} value={lbl}>
                  {lbl}
                </option>
              ))}
            </select>
          </div>

          {(selectedpriority !== 'all' || selectedlabel !== 'all' || searchquery) && (
            <button
              type="button"
              onClick={() => {
                setselectedpriority('all');
                setselectedlabel('all');
                setsearchquery('');
              }}
              className="text-[11px] text-slate-400 hover:text-red-400 transition ml-2"
            >
              Сбросить
            </button>
          )}
        </div>

        <div className="text-[11px] text-linear-muted font-mono">
          Показано: <span className="text-white font-medium">{filteredtaskslist.length}</span> из {tasks.length}
        </div>
      </section>

      <main className="flex-1 p-6 overflow-x-auto flex gap-4">
        {viewmodestate === 'board' ? (
          <DndContext sensors={sensors} onDragStart={dragstarthandler} onDragEnd={dragendhandler}>
            {COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={filteredtaskslist.filter((t) => t.columnId === column.id)}
                isDraggingActive={Boolean(activetaskitem)}
                onSelectTask={(t) => setselectedtaskitem(t)}
              />
            ))}
            <DragOverlay dropAnimation={{ duration: 220, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
              {activetaskitem ? <TaskCard task={activetaskitem} isOverlay /> : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <TaskListView
            tasks={filteredtaskslist}
            columns={COLUMNS}
            onSelectTask={(t) => setselectedtaskitem(t)}
          />
        )}
      </main>

      {isquickopenflag && (
        <QuickCreateModal columns={COLUMNS} onClose={() => setisquickopenflag(false)} />
      )}

      {selectedtaskitem && (
        <TaskDetailModal
          task={tasks.find((t) => t.id === selectedtaskitem.id) || selectedtaskitem}
          columns={COLUMNS}
          onClose={() => setselectedtaskitem(null)}
        />
      )}

      {iscmdopenflag && (
        <CommandPalette
          query={cmdquerystr}
          tasks={tasks}
          viewMode={viewmodestate}
          onQueryChange={(q) => setcmdquerystr(q)}
          onClose={() => setiscmdopenflag(false)}
          onOpenCreate={() => {
            setiscmdopenflag(false);
            setisquickopenflag(true);
          }}
          onToggleView={() => {
            setiscmdopenflag(false);
            setviewmodestate((v) => (v === 'board' ? 'list' : 'board'));
          }}
          onExportJson={() => {
            setiscmdopenflag(false);
            exportjsonhandler();
          }}
          onFilterUrgent={() => {
            setiscmdopenflag(false);
            setselectedpriority('urgent');
          }}
          onSelectTask={(t) => {
            setiscmdopenflag(false);
            setselectedtaskitem(t);
          }}
        />
      )}
    </div>
  );
};

export default App;
