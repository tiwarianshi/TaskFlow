import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import TaskModal from "../components/task/TaskModal";
import { getTaskById } from "../api/taskApi";
import { useBoardMembers } from "../hooks/useBoardMembers";
import { useBoards } from "../hooks/useBoards";
import useCalendar from "../hooks/useCalendar";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const CALENDAR_CELL_COUNT = 42;
const MAX_VISIBLE_TASKS = 3;
const PRIORITY_CLASSES = {
  urgent: "border-red-500/30 bg-red-500/15 text-red-200",
  high: "border-orange-500/30 bg-orange-500/15 text-orange-200",
  medium: "border-yellow-500/30 bg-yellow-500/15 text-yellow-100",
  low: "border-gray-600 bg-gray-800 text-gray-300",
};
const PRIORITY_DOT_CLASSES = {
  urgent: "bg-red-400",
  high: "bg-orange-400",
  medium: "bg-yellow-300",
  low: "bg-gray-400",
};
const TASK_TIMING_CLASSES = {
  overdue: {
    chip: "border-red-500/50 bg-red-500/20 text-red-100 shadow-[inset_3px_0_0_rgba(248,113,113,0.95)]",
    card: "border-red-500/40 bg-red-500/10 hover:border-red-400/60 hover:bg-red-500/15",
    badge: "border-red-500/40 bg-red-500/15 text-red-200",
    dot: "bg-red-400",
    label: "Overdue",
  },
  today: {
    chip: "border-indigo-400/50 bg-indigo-500/20 text-indigo-100 shadow-[inset_3px_0_0_rgba(129,140,248,0.95)]",
    card: "border-indigo-400/40 bg-indigo-500/10 hover:border-indigo-300/60 hover:bg-indigo-500/15",
    badge: "border-indigo-400/40 bg-indigo-500/15 text-indigo-100",
    dot: "bg-indigo-300",
    label: "Due today",
  },
  upcoming: {
    chip: "border-cyan-400/25 bg-cyan-400/10 text-cyan-100 shadow-[inset_3px_0_0_rgba(34,211,238,0.55)]",
    card: "border-cyan-400/20 bg-cyan-400/5 hover:border-cyan-300/40 hover:bg-cyan-400/10",
    badge: "border-cyan-400/25 bg-cyan-400/10 text-cyan-100",
    dot: "bg-cyan-300",
    label: "Upcoming",
  },
};
const FILTER_DEFAULTS = {
  board: "all",
  assignee: "all",
  priority: "all",
  status: "all",
};

function getMonthLabel(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getCalendarDays(activeDate) {
  const year = activeDate.getFullYear();
  const month = activeDate.getMonth();
  const firstDate = new Date(year, month, 1);
  const gridStartDate = new Date(year, month, 1 - firstDate.getDay());

  return Array.from({ length: CALENDAR_CELL_COUNT }, (_, index) => {
    const date = new Date(gridStartDate);
    date.setDate(gridStartDate.getDate() + index);

    return {
      date,
      isCurrentMonth: date.getMonth() === month,
    };
  });
}

function getDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function getStartOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getTaskTiming(task, today) {
  if (!task?.dueDate) {
    return "upcoming";
  }

  const dueDate = new Date(task.dueDate);

  if (Number.isNaN(dueDate.getTime())) {
    return "upcoming";
  }

  const dueDay = getStartOfDay(dueDate).getTime();
  const todayStart = getStartOfDay(today).getTime();

  if (task.status !== "done" && dueDay < todayStart) {
    return "overdue";
  }

  if (dueDay === todayStart) {
    return "today";
  }

  return "upcoming";
}

function groupTasksByDate(tasks) {
  return tasks.reduce((groups, task) => {
    if (!task.dueDate) {
      return groups;
    }

    const dueDate = new Date(task.dueDate);

    if (Number.isNaN(dueDate.getTime())) {
      return groups;
    }

    const dateKey = getDateKey(dueDate);

    return {
      ...groups,
      [dateKey]: [...(groups[dateKey] || []), task],
    };
  }, {});
}

function getSelectedDateLabel(date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getAssigneeName(task) {
  return (
    task.assigneeName ||
    task.assignee?.name ||
    task.assignedTo?.name ||
    task.assignee?.email ||
    task.assignedTo?.email ||
    ""
  );
}

function getAssigneeValue(task) {
  return (
    task.assignee?._id ||
    task.assignedTo?._id ||
    task.assigneeId ||
    task.assignedTo ||
    getAssigneeName(task)
  );
}

function getBoardName(task) {
  return (
    task.board?.title ||
    task.board?.name ||
    task.boardName ||
    task.project?.title ||
    task.project?.name ||
    ""
  );
}

function getBoardValue(task) {
  return (
    task.board?._id ||
    task.boardId ||
    task.project?._id ||
    task.projectId ||
    getBoardName(task)
  );
}

function getUniqueOptions(tasks, getValue, getLabel) {
  const options = new Map();

  tasks.forEach((task) => {
    const value = getValue(task);

    if (!value) {
      return;
    }

    options.set(String(value), getLabel(task) || String(value));
  });

  return Array.from(options, ([value, label]) => ({ value, label }))
    .sort((firstOption, secondOption) => (
      firstOption.label.localeCompare(secondOption.label)
    ));
}

function filterTasks(tasks, filters) {
  return tasks.filter((task) => {
    const boardValue = String(getBoardValue(task) || "");
    const assigneeValue = String(getAssigneeValue(task) || "");
    const priority = task.priority || "";
    const status = task.status || "";

    return (
      (filters.board === "all" || boardValue === filters.board) &&
      (filters.assignee === "all" || assigneeValue === filters.assignee) &&
      (filters.priority === "all" || priority === filters.priority) &&
      (filters.status === "all" || status === filters.status)
    );
  });
}

function getDateButtonClass({ isCurrentMonth, isSelected, isToday }) {
  const base =
    "inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition";

  if (isSelected) {
    return `${base} bg-white text-gray-950 ring-2 ring-indigo-400 ring-offset-2 ring-offset-gray-900`;
  }

  if (isToday) {
    return `${base} bg-indigo-600 text-white hover:bg-indigo-500`;
  }

  if (isCurrentMonth) {
    return `${base} text-gray-200 hover:bg-gray-800 hover:text-white`;
  }

  return `${base} text-gray-600 hover:bg-gray-800/70 hover:text-gray-300`;
}

function getCellClass(isSelected) {
  const base =
    "min-h-20 border-b border-r border-gray-800 p-2 sm:min-h-28 sm:p-3 lg:min-h-32 [&:nth-child(7n)]:border-r-0 [&:nth-last-child(-n+7)]:border-b-0";

  return isSelected ? `${base} bg-indigo-500/10` : base;
}

function FilterSelect({ label, value, options, onChange }) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1.5 sm:min-w-40 sm:flex-none">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-lg border border-gray-800 bg-gray-900 px-3 text-sm font-medium text-gray-200 outline-none transition hover:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function CalendarFilters({ filters, options, onChange, onClear }) {
  const hasActiveFilters = Object.values(filters).some((value) => value !== "all");

  return (
    <div className="mb-6 rounded-xl border border-gray-800 bg-gray-900/70 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <FilterSelect
            label="Board"
            value={filters.board}
            options={options.boards}
            onChange={(value) => onChange("board", value)}
          />
          <FilterSelect
            label="Assignee"
            value={filters.assignee}
            options={options.assignees}
            onChange={(value) => onChange("assignee", value)}
          />
          <FilterSelect
            label="Priority"
            value={filters.priority}
            options={options.priorities}
            onChange={(value) => onChange("priority", value)}
          />
          <FilterSelect
            label="Status"
            value={filters.status}
            options={options.statuses}
            onChange={(value) => onChange("status", value)}
          />
        </div>

        <button
          type="button"
          onClick={onClear}
          disabled={!hasActiveFilters}
          className="h-10 rounded-lg border border-gray-800 px-4 text-sm font-medium text-gray-300 transition hover:border-gray-700 hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

function CalendarStatus({ loading, error, onRefresh }) {
  if (!loading && !error) {
    return null;
  }

  return (
    <div className="mb-6 rounded-xl border border-gray-800 bg-gray-900/70 px-4 py-3">
      {loading ? (
        <p className="text-sm font-medium text-gray-400">Loading calendar tasks...</p>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-red-300">{error}</p>
          <button
            type="button"
            onClick={onRefresh}
            className="h-9 rounded-lg border border-red-500/30 bg-red-500/10 px-3 text-sm font-medium text-red-200 transition hover:bg-red-500/20"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}

function CalendarLegend() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {Object.entries(TASK_TIMING_CLASSES).map(([key, config]) => (
        <span
          key={key}
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${config.badge}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
          {config.label}
        </span>
      ))}
    </div>
  );
}

function TaskChip({ task, onClick, today }) {
  const timing = getTaskTiming(task, today);
  const timingClass = TASK_TIMING_CLASSES[timing] || TASK_TIMING_CLASSES.upcoming;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(task);
      }}
      className={`block w-full truncate rounded-md border px-2 py-1 text-left text-[11px] font-medium leading-none transition hover:brightness-125 ${timingClass.chip}`}
      title={task.title}
    >
      {task.title}
    </button>
  );
}

function TaskDetailCard({ task, onClick, today }) {
  const priority = task.priority || "low";
  const priorityClass = PRIORITY_CLASSES[priority] || PRIORITY_CLASSES.low;
  const priorityDotClass = PRIORITY_DOT_CLASSES[priority] || PRIORITY_DOT_CLASSES.low;
  const timing = getTaskTiming(task, today);
  const timingClass = TASK_TIMING_CLASSES[timing] || TASK_TIMING_CLASSES.upcoming;
  const assigneeName = getAssigneeName(task);

  return (
    <button
      type="button"
      onClick={() => onClick?.(task)}
      className={`w-full rounded-xl border p-4 text-left transition ${timingClass.card}`}
    >
      <h4 className="truncate text-sm font-semibold text-white" title={task.title}>
        {task.title}
      </h4>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${timingClass.badge}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${timingClass.dot}`} />
          {timingClass.label}
        </span>

        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${priorityClass}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${priorityDotClass}`} />
          {priority}
        </span>

        <span className="inline-flex rounded-full border border-gray-700 bg-gray-900 px-2.5 py-1 text-xs font-medium capitalize text-gray-300">
          {task.status || "No status"}
        </span>
      </div>

      {assigneeName && (
        <p className="mt-3 text-xs text-gray-400">
          Assigned to <span className="font-medium text-gray-200">{assigneeName}</span>
        </p>
      )}
    </button>
  );
}

function DateTasksPanel({
  date,
  tasks,
  isOpen,
  onClose,
  onTaskClick,
  onCreateTask,
  boards,
  selectedBoardId,
  onBoardChange,
  boardLocked,
  today,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <aside className="relative flex h-full w-full max-w-md flex-col border-l border-gray-800 bg-gray-950 shadow-2xl shadow-black/40 sm:w-96">
        <div className="flex items-start justify-between gap-4 border-b border-gray-800 px-5 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Selected Date
            </p>
            <h3 className="mt-1 text-lg font-semibold text-white">
              {getSelectedDateLabel(date)}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition"
            aria-label="Close date details"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="border-b border-gray-800 px-5 py-4">
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-gray-500">Board</span>
              <select
                value={selectedBoardId}
                onChange={(event) => onBoardChange(event.target.value)}
                disabled={boardLocked || boards.length === 0}
                className="h-10 rounded-lg border border-gray-800 bg-gray-900 px-3 text-sm font-medium text-gray-200 outline-none transition hover:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {boards.length === 0 ? (
                  <option value="">No boards available</option>
                ) : (
                  boards.map((board) => (
                    <option key={board._id} value={board._id}>
                      {board.title}
                    </option>
                  ))
                )}
              </select>
            </label>

            <button
              type="button"
              onClick={() => onCreateTask(date)}
              disabled={!selectedBoardId}
              className="h-10 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              New task
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskDetailCard key={task._id} task={task} onClick={onTaskClick} today={today} />
              ))}
            </div>
          ) : (
            <div className="flex h-full min-h-64 items-center justify-center rounded-xl border border-dashed border-gray-800 bg-gray-900/50 px-6 text-center">
              <p className="text-sm font-medium text-gray-400">No tasks scheduled</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function CalendarDay({
  date,
  isCurrentMonth,
  isSelected,
  isToday,
  onSelect,
  tasks,
  onTaskClick,
  today,
}) {
  const visibleTasks = tasks.slice(0, MAX_VISIBLE_TASKS);
  const hiddenTaskCount = Math.max(tasks.length - MAX_VISIBLE_TASKS, 0);

  return (
    <div className={getCellClass(isSelected)}>
      <button
        type="button"
        onClick={() => onSelect(date)}
        className={getDateButtonClass({ isCurrentMonth, isSelected, isToday })}
        aria-label={`Select ${date.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}`}
        aria-pressed={isSelected}
      >
        {date.getDate()}
      </button>

      {tasks.length > 0 && (
        <div className="mt-2 space-y-1">
          {visibleTasks.map((task) => (
            <TaskChip key={task._id} task={task} onClick={onTaskClick} today={today} />
          ))}

          {hiddenTaskCount > 0 && (
            <div className="text-[11px] font-medium text-gray-500">
              +{hiddenTaskCount} more
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function isSameDay(firstDate, secondDate) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

function CalendarPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [detailsPanelOpen, setDetailsPanelOpen] = useState(false);
  const [activeDate, setActiveDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [filters, setFilters] = useState(FILTER_DEFAULTS);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingBoardId, setEditingBoardId] = useState(null);
  const [defaultDueDate, setDefaultDueDate] = useState("");
  const [selectedCreateBoardId, setSelectedCreateBoardId] = useState("");
  const today = useMemo(() => new Date(), []);
  const calendarQuery = useMemo(() => ({
    month: activeDate.getMonth() + 1,
    year: activeDate.getFullYear(),
    board: filters.board,
    assignee: filters.assignee,
    priority: filters.priority,
    status: filters.status,
  }), [activeDate, filters]);
  const { tasks, loading, error, refresh } = useCalendar(calendarQuery);
  const { boards } = useBoards();
  const { members } = useBoardMembers(taskModalOpen ? editingBoardId : null);

  const calendarDays = useMemo(() => getCalendarDays(activeDate), [activeDate]);
  const monthLabel = useMemo(() => getMonthLabel(activeDate), [activeDate]);
  const filterOptions = useMemo(() => ({
    boards: [
      { value: "all", label: "All boards" },
      ...getUniqueOptions(tasks, getBoardValue, getBoardName),
    ],
    assignees: [
      { value: "all", label: "All assignees" },
      ...getUniqueOptions(tasks, getAssigneeValue, getAssigneeName),
    ],
    priorities: [
      { value: "all", label: "All priorities" },
      ...getUniqueOptions(tasks, (task) => task.priority, (task) => task.priority),
    ],
    statuses: [
      { value: "all", label: "All statuses" },
      ...getUniqueOptions(tasks, (task) => task.status, (task) => task.status),
    ],
  }), [tasks]);
  const filteredTasks = useMemo(() => filterTasks(tasks, filters), [tasks, filters]);
  const tasksByDate = useMemo(() => groupTasksByDate(filteredTasks), [filteredTasks]);
  const selectedDateTasks = useMemo(
    () => tasksByDate[getDateKey(selectedDate)] || [],
    [selectedDate, tasksByDate]
  );
  const effectiveCreateBoardId = useMemo(() => {
    if (filters.board !== "all") {
      return filters.board;
    }

    return selectedCreateBoardId || boards[0]?._id || "";
  }, [boards, filters.board, selectedCreateBoardId]);

  function goToPreviousMonth() {
    setActiveDate((currentDate) => (
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    ));
  }

  function goToNextMonth() {
    setActiveDate((currentDate) => (
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    ));
  }

  function goToCurrentMonth() {
    const currentDate = new Date();
    setActiveDate(currentDate);
    setSelectedDate(currentDate);
    setDetailsPanelOpen(true);
  }

  function handleSelectDate(date) {
    setSelectedDate(date);
    setActiveDate(new Date(date.getFullYear(), date.getMonth(), 1));
    setDetailsPanelOpen(true);
  }

  function handleFilterChange(name, value) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  }

  async function handleTaskClick(task) {
    if (!task?._id) {
      return;
    }

    const boardId = getBoardValue(task);
    setEditingBoardId(boardId);
    setDetailsPanelOpen(false);

    try {
      const fullTask = await getTaskById(task._id);
      setEditingTask({
        ...fullTask,
        board: fullTask.board || task.board,
      });
      setTaskModalOpen(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to open task");
    }
  }

  function handleTaskModalClose() {
    setTaskModalOpen(false);
    setEditingTask(null);
    setEditingBoardId(null);
    setDefaultDueDate("");
  }

  function handleTaskSaved() {
    handleTaskModalClose();
    refresh();
  }

  function handleTaskDeleted() {
    handleTaskModalClose();
    refresh();
  }

  function handleCreateTask(date) {
    if (!effectiveCreateBoardId) {
      toast.error("Select a board before creating a task");
      return;
    }

    setEditingTask(null);
    setEditingBoardId(effectiveCreateBoardId);
    setDefaultDueDate(getDateKey(date));
    setTaskModalOpen(true);
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full z-50">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar title="Calendar" onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Calendar</h2>
              <p className="text-sm text-gray-400 mt-1">
                Plan your month and keep upcoming work in view.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-800 bg-gray-900 text-gray-300 hover:border-gray-700 hover:bg-gray-800 hover:text-white transition"
                aria-label="Previous month"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                type="button"
                onClick={goToCurrentMonth}
                className="h-10 rounded-lg border border-gray-800 bg-gray-900 px-4 text-sm font-medium text-gray-300 hover:border-gray-700 hover:bg-gray-800 hover:text-white transition"
              >
                Today
              </button>

              <button
                type="button"
                onClick={goToNextMonth}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-800 bg-gray-900 text-gray-300 hover:border-gray-700 hover:bg-gray-800 hover:text-white transition"
                aria-label="Next month"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <CalendarFilters
            filters={filters}
            options={filterOptions}
            onChange={handleFilterChange}
            onClear={() => setFilters(FILTER_DEFAULTS)}
          />

          <CalendarStatus
            loading={loading}
            error={error}
            onRefresh={refresh}
          />

          <section className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-gray-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h3 className="text-lg font-semibold text-white">{monthLabel}</h3>
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  Monthly View
                </span>
              </div>
              <CalendarLegend />
            </div>

            <div className="grid grid-cols-7 border-b border-gray-800 bg-gray-950/50">
              {WEEK_DAYS.map((day) => (
                <div
                  key={day}
                  className="px-2 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500 sm:text-xs"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarDays.map(({ date, isCurrentMonth }) => {
                const isToday = isSameDay(date, today);
                const isSelected = isSameDay(date, selectedDate);
                const dateTasks = tasksByDate[getDateKey(date)] || [];

                return (
                  <CalendarDay
                    key={getDateKey(date)}
                    date={date}
                    isCurrentMonth={isCurrentMonth}
                    isSelected={isSelected}
                    isToday={isToday}
                    onSelect={handleSelectDate}
                    tasks={dateTasks}
                    onTaskClick={handleTaskClick}
                    today={today}
                  />
                );
              })}
            </div>
          </section>
        </main>
      </div>

      <DateTasksPanel
        date={selectedDate}
        tasks={selectedDateTasks}
        isOpen={detailsPanelOpen}
        onClose={() => setDetailsPanelOpen(false)}
        onTaskClick={handleTaskClick}
        onCreateTask={handleCreateTask}
        boards={boards}
        selectedBoardId={effectiveCreateBoardId}
        onBoardChange={setSelectedCreateBoardId}
        boardLocked={filters.board !== "all"}
        today={today}
      />

      {taskModalOpen && (
        <TaskModal
          isOpen={taskModalOpen}
          onClose={handleTaskModalClose}
          task={editingTask}
          boardId={editingBoardId}
          defaultStatus={editingTask?.status || (filters.status !== "all" ? filters.status : "todo")}
          defaultDueDate={defaultDueDate}
          onSave={handleTaskSaved}
          onDelete={handleTaskDeleted}
          members={members}
        />
      )}
    </div>
  );
}

export default CalendarPage;
