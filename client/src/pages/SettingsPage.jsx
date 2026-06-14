import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  AlertCircle,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Eye,
  EyeOff,
  Image,
  KanbanSquare,
  KeyRound,
  LoaderCircle,
  Lock,
  Mail,
  Monitor,
  Moon,
  RefreshCw,
  Save,
  ShieldCheck,
  Sun,
  User,
  UserCircle,
  Volume2,
} from "lucide-react";

import { getBoardStats, getBoardsWithStats, getDashboardStats } from "../api/boardApi";
import { getNotifications } from "../api/notificationApi";
import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import useAuth from "../hooks/useAuth";
import useSettings from "../hooks/useSettings";

const PREFERENCES_STORAGE_KEY = "taskflow_preferences";

const DEFAULT_PREFERENCES = {
  enableNotifications: true,
  enableSoundAlerts: false,
  theme: "dark",
  defaultBoardView: "kanban",
};

const DEFAULT_WORKSPACE_INFO = {
  boardsJoined: 0,
  tasksAssigned: 0,
  tasksCompleted: 0,
  notificationsReceived: 0,
};

const THEME_OPTIONS = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
];

const BOARD_VIEW_OPTIONS = [
  { value: "kanban", label: "Kanban", icon: KanbanSquare },
  { value: "calendar", label: "Calendar", icon: CalendarDays },
];

function getStoredPreferences() {
  try {
    const savedPreferences = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!savedPreferences) return DEFAULT_PREFERENCES;

    return normalizePreferences(JSON.parse(savedPreferences));
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function saveStoredPreferences(preferences) {
  try {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Settings remain usable in-memory if localStorage is unavailable.
  }
}

function normalizePreferences(preferences = {}) {
  return {
    enableNotifications:
      typeof preferences.enableNotifications === "boolean"
        ? preferences.enableNotifications
        : typeof preferences.notificationsEnabled === "boolean"
          ? preferences.notificationsEnabled
          : DEFAULT_PREFERENCES.enableNotifications,
    enableSoundAlerts:
      typeof preferences.enableSoundAlerts === "boolean"
        ? preferences.enableSoundAlerts
        : typeof preferences.soundEnabled === "boolean"
          ? preferences.soundEnabled
          : DEFAULT_PREFERENCES.enableSoundAlerts,
    theme: THEME_OPTIONS.some((option) => option.value === preferences.theme)
      ? preferences.theme
      : DEFAULT_PREFERENCES.theme,
    defaultBoardView: BOARD_VIEW_OPTIONS.some(
      (option) => option.value === preferences.defaultBoardView,
    )
      ? preferences.defaultBoardView
      : BOARD_VIEW_OPTIONS.some((option) => option.value === preferences.defaultView)
        ? preferences.defaultView
        : DEFAULT_PREFERENCES.defaultBoardView,
  };
}

function toApiPreferences(preferences) {
  return {
    notificationsEnabled: preferences.enableNotifications,
    soundEnabled: preferences.enableSoundAlerts,
    theme: preferences.theme,
    defaultView: preferences.defaultBoardView,
    enableNotifications: preferences.enableNotifications,
    enableSoundAlerts: preferences.enableSoundAlerts,
    defaultBoardView: preferences.defaultBoardView,
  };
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

function SettingsSection({ icon: Icon, title, description, children, busy = false }) {
  return (
    <section
      className="rounded-xl border border-gray-800 bg-gray-900 p-4 shadow-sm shadow-black/10 sm:p-6"
      aria-busy={busy}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-3 lg:max-w-xs">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
            <Icon size={19} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-gray-400">{description}</p>
          </div>
        </div>

        <div className="w-full lg:max-w-2xl">{children}</div>
      </div>
    </section>
  );
}

function FieldError({ id, children }) {
  if (!children) return null;

  return (
    <p id={id} className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
      <AlertCircle size={13} aria-hidden="true" />
      {children}
    </p>
  );
}

function InlineAlert({ children, tone = "error" }) {
  if (!children) return null;

  const styles =
    tone === "success"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
      : "border-red-500/20 bg-red-500/10 text-red-300";
  const Icon = tone === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div
      className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${styles}`}
      role={tone === "error" ? "alert" : "status"}
    >
      <Icon size={16} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

function SkeletonBlock({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-800/80 ${className}`}
      aria-hidden="true"
    />
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading settings">
      <SettingsSection
        icon={UserCircle}
        title="Profile"
        description="Loading your profile details."
        busy
      >
        <div className="space-y-5">
          <div className="flex flex-col gap-4 rounded-lg border border-gray-800 bg-gray-950 p-4 sm:flex-row sm:items-center">
            <SkeletonBlock className="h-20 w-20 rounded-full" />
            <div className="min-w-0 flex-1 space-y-3">
              <SkeletonBlock className="h-4 w-40" />
              <SkeletonBlock className="h-4 w-56 max-w-full" />
              <SkeletonBlock className="h-3 w-full max-w-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SkeletonBlock className="h-20" />
            <SkeletonBlock className="h-20" />
          </div>
          <SkeletonBlock className="h-20" />
        </div>
      </SettingsSection>

      <SettingsSection
        icon={Monitor}
        title="Preferences"
        description="Loading workspace preferences."
        busy
      >
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-20" />
          ))}
        </div>
      </SettingsSection>
    </div>
  );
}

function ProfileInput({ label, icon: Icon, error, id, ...props }) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500"
      >
        {label}
      </label>
      <div
        className={`flex min-h-11 items-center gap-3 rounded-lg border bg-gray-950 px-3 py-2 transition-colors ${
          error ? "border-red-500/60" : "border-gray-800 focus-within:border-indigo-500/70"
        }`}
      >
        <Icon size={16} className="flex-shrink-0 text-gray-500" aria-hidden="true" />
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          {...props}
          className="w-full bg-transparent text-sm text-gray-100 outline-none placeholder:text-gray-600 disabled:cursor-not-allowed disabled:text-gray-500"
        />
      </div>
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}

function ReadOnlyProfileField({ label, value, icon: Icon, id }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500"
      >
        {label}
      </label>
      <div className="flex min-h-11 items-center gap-3 rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-400">
        <Icon size={16} className="flex-shrink-0 text-gray-500" aria-hidden="true" />
        <input
          id={id}
          value={value || "Not provided"}
          readOnly
          className="w-full cursor-not-allowed bg-transparent text-sm text-gray-400 outline-none"
        />
      </div>
    </div>
  );
}

function PasswordInput({
  label,
  name,
  value,
  visible,
  error,
  disabled,
  onChange,
  onToggleVisibility,
  placeholder,
}) {
  const id = `settings-${name}`;
  const errorId = `${id}-error`;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500"
      >
        {label}
      </label>
      <div
        className={`flex min-h-11 items-center gap-3 rounded-lg border bg-gray-950 px-3 py-2 transition-colors ${
          error ? "border-red-500/60" : "border-gray-800 focus-within:border-indigo-500/70"
        }`}
      >
        <KeyRound size={16} className="flex-shrink-0 text-gray-500" aria-hidden="true" />
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="new-password"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="w-full bg-transparent text-sm text-gray-100 outline-none placeholder:text-gray-600 disabled:cursor-not-allowed disabled:text-gray-500"
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          disabled={disabled}
          className="rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-500"
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
        </button>
      </div>
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}

function ToggleRow({ icon: Icon, title, description, checked, disabled, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-800 bg-gray-950 p-4">
      <div className="flex min-w-0 items-start gap-3">
        <Icon size={18} className="mt-0.5 flex-shrink-0 text-gray-500" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-gray-100">{title}</p>
          <p className="mt-1 text-xs leading-5 text-gray-500">{description}</p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-label={title}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:ring-offset-2 focus:ring-offset-gray-950 disabled:cursor-not-allowed disabled:opacity-60 ${
          checked ? "bg-indigo-600" : "bg-gray-700"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function PreferenceOptionGroup({ label, description, options, value, disabled, onChange }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-950 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-100">{label}</p>
          <p className="mt-1 text-xs leading-5 text-gray-500">{description}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-shrink-0" role="group" aria-label={label}>
          {options.map((option) => {
            const Icon = option.icon;
            const active = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                disabled={disabled}
                aria-pressed={active}
                onClick={() => onChange(option.value)}
                className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/60 disabled:cursor-not-allowed disabled:opacity-60 ${
                  active
                    ? "border-indigo-500 bg-indigo-500/15 text-indigo-200"
                    : "border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-700 hover:text-gray-200"
                }`}
              >
                <Icon size={15} aria-hidden="true" />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WorkspaceStatCard({ icon: Icon, label, value, loading, accent }) {
  return (
    <div className="flex min-h-28 items-center gap-4 rounded-lg border border-gray-800 bg-gray-950 p-4 transition-colors hover:border-gray-700">
      <div
        className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg ${accent.background} ${accent.text}`}
      >
        <Icon size={20} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
        {loading ? (
          <SkeletonBlock className="mt-3 h-7 w-20" />
        ) : (
          <p className="mt-2 break-words text-2xl font-bold leading-tight text-white">{value}</p>
        )}
      </div>
    </div>
  );
}

function getFirstNumber(...values) {
  const value = values.find((item) => typeof item === "number" && Number.isFinite(item));
  return value ?? null;
}

function formatMemberSince(createdAt) {
  if (!createdAt) return "Available after profile sync";

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "Available after profile sync";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function validateProfile(values) {
  const errors = {};
  const name = values.name.trim();
  const avatar = values.avatar.trim();

  if (!name) {
    errors.name = "Name is required.";
  } else if (name.length < 2) {
    errors.name = "Name must be at least 2 characters.";
  } else if (name.length > 60) {
    errors.name = "Name must be 60 characters or less.";
  }

  if (avatar) {
    try {
      const parsedUrl = new URL(avatar);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        errors.avatar = "Avatar URL must start with http or https.";
      }
    } catch {
      errors.avatar = "Enter a valid avatar URL.";
    }
  }

  return errors;
}

function validateSecurity(values) {
  const errors = {};

  if (!values.currentPassword) {
    errors.currentPassword = "Current password is required.";
  }

  if (!values.newPassword) {
    errors.newPassword = "New password is required.";
  } else if (values.newPassword.length < 6) {
    errors.newPassword = "New password must be at least 6 characters.";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Confirm your new password.";
  } else if (values.newPassword !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

function SettingsPage() {
  const { user } = useAuth();
  const storedPreferences = useMemo(getStoredPreferences, []);
  const {
    loading: settingsLoading,
    savingProfile,
    savingPreferences,
    changingPassword,
    errors: settingsErrors,
    profile,
    preferences: loadedPreferences,
    saveProfile,
    savePreferences,
    changePassword,
    refreshSettings,
  } = useSettings(storedPreferences);

  const activeProfile = profile || user || {};
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: activeProfile?.name || "",
    avatar: activeProfile?.avatar || "",
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileErrorMessage, setProfileErrorMessage] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [securityErrors, setSecurityErrors] = useState({});
  const [securityVisible, setSecurityVisible] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [securityErrorMessage, setSecurityErrorMessage] = useState("");
  const [securitySaved, setSecuritySaved] = useState(false);
  const [preferences, setPreferences] = useState(storedPreferences);
  const [workspaceInfo, setWorkspaceInfo] = useState(DEFAULT_WORKSPACE_INFO);
  const [workspaceLoading, setWorkspaceLoading] = useState(true);
  const [workspaceError, setWorkspaceError] = useState("");
  const lastToastRef = useRef("");

  useEffect(() => {
    setProfileForm({
      name: activeProfile?.name || "",
      avatar: activeProfile?.avatar || "",
    });
  }, [activeProfile?.name, activeProfile?.avatar]);

  useEffect(() => {
    if (loadedPreferences) {
      setPreferences(normalizePreferences(loadedPreferences));
    }
  }, [loadedPreferences]);

  useEffect(() => {
    saveStoredPreferences(preferences);
  }, [preferences]);

  useEffect(() => {
    const messages = [
      settingsErrors?.profile,
      settingsErrors?.preferences,
      workspaceError,
    ].filter(Boolean);

    messages.forEach((message) => {
      if (lastToastRef.current !== message) {
        toast.error(message);
        lastToastRef.current = message;
      }
    });
  }, [settingsErrors?.profile, settingsErrors?.preferences, workspaceError]);

  useEffect(() => {
    let cancelled = false;

    async function loadWorkspaceInformation() {
      setWorkspaceLoading(true);
      setWorkspaceError("");

      try {
        let dashboardData = null;
        let notificationData = [];

        try {
          dashboardData = await getDashboardStats();
        } catch {
          const boards = await getBoardsWithStats();
          const boardsWithStats = boards.length && boards[0].stats === undefined
            ? await Promise.all(
                boards.map(async (board) => {
                  try {
                    return {
                      ...board,
                      stats: await getBoardStats(board._id),
                    };
                  } catch {
                    return {
                      ...board,
                      stats: { total: 0, completed: 0 },
                    };
                  }
                }),
              )
            : boards;

          dashboardData = {
            totalBoards: boardsWithStats.length,
            completed: boardsWithStats.reduce(
              (sum, board) => sum + (board.stats?.completed || 0),
              0,
            ),
          };
        }

        const needsNotificationFallback =
          getFirstNumber(dashboardData?.tasksAssigned, dashboardData?.assignedTasks) === null ||
          getFirstNumber(
            dashboardData?.notificationsReceived,
            dashboardData?.totalNotifications,
          ) === null;

        if (needsNotificationFallback) {
          try {
            notificationData = await getNotifications(1, 100);
          } catch {
            notificationData = [];
          }
        }

        const tasksAssigned =
          getFirstNumber(dashboardData?.tasksAssigned, dashboardData?.assignedTasks) ??
          notificationData.filter((notification) => notification.type === "task_assigned").length;

        const notificationsReceived =
          getFirstNumber(
            dashboardData?.notificationsReceived,
            dashboardData?.totalNotifications,
          ) ?? notificationData.length;

        if (!cancelled) {
          setWorkspaceInfo({
            boardsJoined:
              getFirstNumber(dashboardData?.boardsJoined, dashboardData?.totalBoards) ?? 0,
            tasksAssigned,
            tasksCompleted:
              getFirstNumber(dashboardData?.tasksCompleted, dashboardData?.completed) ?? 0,
            notificationsReceived,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setWorkspaceInfo(DEFAULT_WORKSPACE_INFO);
          setWorkspaceError(getErrorMessage(error, "Failed to load workspace information."));
        }
      } finally {
        if (!cancelled) {
          setWorkspaceLoading(false);
        }
      }
    }

    loadWorkspaceInformation();

    return () => {
      cancelled = true;
    };
  }, []);

  const userInitials = useMemo(() => {
    const name = profileForm.name.trim() || activeProfile?.name?.trim();
    if (!name) return "U";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }, [profileForm.name, activeProfile?.name]);

  const avatarPreview = profileForm.avatar.trim();
  const profileChanged =
    profileForm.name.trim() !== (activeProfile?.name || "").trim() ||
    profileForm.avatar.trim() !== (activeProfile?.avatar || "").trim();

  const memberSince = formatMemberSince(activeProfile?.createdAt);

  const workspaceStats = [
    {
      label: "Boards Joined",
      value: workspaceInfo.boardsJoined,
      icon: KanbanSquare,
      accent: { background: "bg-indigo-500/10", text: "text-indigo-400" },
    },
    {
      label: "Tasks Assigned",
      value: workspaceInfo.tasksAssigned,
      icon: ClipboardList,
      accent: { background: "bg-sky-500/10", text: "text-sky-400" },
    },
    {
      label: "Tasks Completed",
      value: workspaceInfo.tasksCompleted,
      icon: ClipboardCheck,
      accent: { background: "bg-emerald-500/10", text: "text-emerald-400" },
    },
    {
      label: "Notifications Received",
      value: workspaceInfo.notificationsReceived,
      icon: Bell,
      accent: { background: "bg-amber-500/10", text: "text-amber-400" },
    },
    {
      label: "Member Since",
      value: memberSince,
      icon: CalendarDays,
      accent: { background: "bg-fuchsia-500/10", text: "text-fuchsia-400" },
    },
  ];

  async function persistPreferences(nextPreferences) {
    const previousPreferences = preferences;
    setPreferences(nextPreferences);
    setProfileSaved(false);
    setSecuritySaved(false);

    try {
      const savedPreferences = await savePreferences(toApiPreferences(nextPreferences));
      const normalizedSavedPreferences = normalizePreferences(savedPreferences);
      setPreferences(normalizedSavedPreferences);
      toast.success("Preferences saved.");
    } catch (error) {
      setPreferences(previousPreferences);
      toast.error(getErrorMessage(error, "Failed to save preferences."));
    }
  }

  function updatePreference(key, value) {
    const nextPreferences = {
      ...preferences,
      [key]: value,
    };

    persistPreferences(nextPreferences);
  }

  function handleProfileChange(event) {
    const { name, value } = event.target;

    setProfileForm((current) => ({
      ...current,
      [name]: value,
    }));

    setProfileSaved(false);
    setProfileErrorMessage("");

    if (profileErrors[name]) {
      setProfileErrors((current) => ({
        ...current,
        [name]: "",
      }));
    }
  }

  function handleSecurityChange(event) {
    const { name, value } = event.target;

    setSecurityForm((current) => ({
      ...current,
      [name]: value,
    }));

    setSecuritySaved(false);
    setSecurityErrorMessage("");

    if (securityErrors[name]) {
      setSecurityErrors((current) => ({
        ...current,
        [name]: "",
      }));
    }
  }

  function togglePasswordVisibility(field) {
    setSecurityVisible((current) => ({
      ...current,
      [field]: !current[field],
    }));
  }

  async function handleRefresh() {
    try {
      await refreshSettings();
      toast.success("Settings refreshed.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to refresh settings."));
    }
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setProfileSaved(false);
    setProfileErrorMessage("");

    const nextErrors = validateProfile(profileForm);
    setProfileErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted profile fields.");
      return;
    }

    try {
      const updatedProfile = await saveProfile({
        name: profileForm.name.trim(),
        avatar: profileForm.avatar.trim() || null,
      });

      setProfileForm({
        name: updatedProfile.name || "",
        avatar: updatedProfile.avatar || "",
      });
      setProfileSaved(true);
      toast.success("Profile saved.");
    } catch (error) {
      const message = getErrorMessage(error, "Failed to save profile changes.");
      setProfileErrorMessage(message);
      toast.error(message);
    }
  }

  async function handleSecuritySubmit(event) {
    event.preventDefault();
    setSecuritySaved(false);
    setSecurityErrorMessage("");

    const nextErrors = validateSecurity(securityForm);
    setSecurityErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted password fields.");
      return;
    }

    try {
      await changePassword(securityForm);
      setSecurityForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSecurityVisible({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
      });
      setSecuritySaved(true);
      toast.success("Password updated.");
    } catch (error) {
      const message = getErrorMessage(error, "Failed to update password.");
      setSecurityErrorMessage(message);
      toast.error(message);
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 z-50 h-full">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar title="Settings" onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-col gap-4 border-b border-gray-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-indigo-400">
                  <ShieldCheck size={15} aria-hidden="true" />
                  Account controls
                </div>
                <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Settings
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
                  Manage your profile details, workspace preferences, security posture,
                  and account information for TaskFlow.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300">
                  <CheckCircle2 size={15} aria-hidden="true" />
                  Account active
                </div>
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={settingsLoading}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-gray-800 bg-gray-900 px-3 text-sm font-medium text-gray-300 transition-colors hover:border-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/60 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    size={15}
                    className={settingsLoading ? "animate-spin" : ""}
                    aria-hidden="true"
                  />
                  Refresh
                </button>
              </div>
            </div>

            {settingsLoading && !loadedPreferences ? (
              <SettingsSkeleton />
            ) : (
              <>
                <SettingsSection
                  icon={UserCircle}
                  title="Profile"
                  description="Update your display name and avatar. Your email remains tied to your login."
                  busy={savingProfile}
                >
                  <form className="space-y-5" onSubmit={handleProfileSubmit} noValidate>
                    <div className="flex flex-col gap-4 rounded-lg border border-gray-800 bg-gray-950 p-4 sm:flex-row sm:items-center">
                      <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-600 text-lg font-bold text-white ring-1 ring-gray-800">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt={`${profileForm.name || "User"} avatar preview`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          userInitials
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {profileForm.name.trim() || "TaskFlow User"}
                        </p>
                        <p className="truncate text-sm text-gray-500">
                          {activeProfile?.email || "No email linked"}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-gray-600">
                          Paste a hosted image URL to update your avatar preview before saving.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <ProfileInput
                        id="settings-profile-name"
                        label="Name"
                        name="name"
                        type="text"
                        value={profileForm.name}
                        onChange={handleProfileChange}
                        placeholder="Enter your name"
                        disabled={savingProfile}
                        icon={User}
                        error={profileErrors.name}
                      />
                      <ReadOnlyProfileField
                        id="settings-profile-email"
                        label="Email"
                        value={activeProfile?.email}
                        icon={Mail}
                      />
                    </div>

                    <ProfileInput
                      id="settings-profile-avatar"
                      label="Avatar URL"
                      name="avatar"
                      type="url"
                      value={profileForm.avatar}
                      onChange={handleProfileChange}
                      placeholder="https://example.com/avatar.jpg"
                      disabled={savingProfile}
                      icon={Image}
                      error={profileErrors.avatar}
                    />

                    <InlineAlert>{profileErrorMessage || settingsErrors?.saveProfile}</InlineAlert>
                    <InlineAlert tone="success">
                      {profileSaved ? "Profile changes saved successfully." : ""}
                    </InlineAlert>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={savingProfile || !profileChanged}
                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:ring-offset-2 focus:ring-offset-gray-950 disabled:cursor-not-allowed disabled:bg-gray-800 disabled:text-gray-500 sm:w-auto"
                      >
                        {savingProfile ? (
                          <>
                            <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={16} aria-hidden="true" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </SettingsSection>

                <SettingsSection
                  icon={Monitor}
                  title="Preferences"
                  description="Tune notifications, sound, theme behavior, and your preferred board starting view."
                  busy={savingPreferences}
                >
                  <div className="space-y-3">
                    <InlineAlert>{settingsErrors?.preferences || settingsErrors?.savePreferences}</InlineAlert>
                    <ToggleRow
                      icon={Bell}
                      title="Enable Notifications"
                      description="Show task, board, collaboration, and workspace updates in TaskFlow."
                      checked={preferences.enableNotifications}
                      disabled={savingPreferences}
                      onChange={(value) => updatePreference("enableNotifications", value)}
                    />
                    <ToggleRow
                      icon={Volume2}
                      title="Enable Sound Alerts"
                      description="Play a subtle sound when important real-time updates arrive."
                      checked={preferences.enableSoundAlerts}
                      disabled={savingPreferences}
                      onChange={(value) => updatePreference("enableSoundAlerts", value)}
                    />
                    <PreferenceOptionGroup
                      label="Theme Selector"
                      description="Choose how TaskFlow should remember your preferred visual mode."
                      options={THEME_OPTIONS}
                      value={preferences.theme}
                      disabled={savingPreferences}
                      onChange={(value) => updatePreference("theme", value)}
                    />
                    <PreferenceOptionGroup
                      label="Default Board View"
                      description="Choose which view should open first when you enter a board."
                      options={BOARD_VIEW_OPTIONS}
                      value={preferences.defaultBoardView}
                      disabled={savingPreferences}
                      onChange={(value) => updatePreference("defaultBoardView", value)}
                    />
                  </div>
                </SettingsSection>
              </>
            )}

            <SettingsSection
              icon={Lock}
              title="Security"
              description="Change your password with your current credentials for account protection."
              busy={changingPassword}
            >
              <form className="space-y-4" onSubmit={handleSecuritySubmit} noValidate>
                <PasswordInput
                  label="Current Password"
                  name="currentPassword"
                  value={securityForm.currentPassword}
                  visible={securityVisible.currentPassword}
                  onChange={handleSecurityChange}
                  onToggleVisibility={() => togglePasswordVisibility("currentPassword")}
                  placeholder="Enter current password"
                  disabled={changingPassword}
                  error={securityErrors.currentPassword}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <PasswordInput
                    label="New Password"
                    name="newPassword"
                    value={securityForm.newPassword}
                    visible={securityVisible.newPassword}
                    onChange={handleSecurityChange}
                    onToggleVisibility={() => togglePasswordVisibility("newPassword")}
                    placeholder="Minimum 6 characters"
                    disabled={changingPassword}
                    error={securityErrors.newPassword}
                  />
                  <PasswordInput
                    label="Confirm Password"
                    name="confirmPassword"
                    value={securityForm.confirmPassword}
                    visible={securityVisible.confirmPassword}
                    onChange={handleSecurityChange}
                    onToggleVisibility={() => togglePasswordVisibility("confirmPassword")}
                    placeholder="Repeat new password"
                    disabled={changingPassword}
                    error={securityErrors.confirmPassword}
                  />
                </div>

                <InlineAlert>{securityErrorMessage || settingsErrors?.changePassword}</InlineAlert>
                <InlineAlert tone="success">
                  {securitySaved ? "Password updated successfully." : ""}
                </InlineAlert>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:ring-offset-2 focus:ring-offset-gray-950 disabled:cursor-not-allowed disabled:bg-gray-800 disabled:text-gray-500 sm:w-auto"
                  >
                    {changingPassword ? (
                      <>
                        <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save size={16} aria-hidden="true" />
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </SettingsSection>

            <SettingsSection
              icon={Building2}
              title="Workspace Information"
              description="A quick read on your workspace activity, assignments, notifications, and account tenure."
              busy={workspaceLoading}
            >
              <div className="space-y-4">
                <InlineAlert>{workspaceError}</InlineAlert>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {workspaceStats.map((stat) => (
                    <WorkspaceStatCard
                      key={stat.label}
                      icon={stat.icon}
                      label={stat.label}
                      value={stat.value}
                      loading={workspaceLoading}
                      accent={stat.accent}
                    />
                  ))}
                </div>
              </div>
            </SettingsSection>
          </div>
        </main>
      </div>
    </div>
  );
}

export default SettingsPage;
