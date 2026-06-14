import axiosInstance from "./axiosInstance";

function normalizeTaskForCalendar(task) {
  return {
    ...task,
    boardId: task.board?._id || task.board,
    boardName: task.board?.title || task.board?.name || task.boardName,
  };
}

function buildCalendarParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "all"
    ))
  );
}

export async function getCalendarTasks(params = {}) {
  const { data } = await axiosInstance.get("/calendar/tasks", {
    params: buildCalendarParams(params),
  });
  const tasks = Array.isArray(data) ? data : [];

  return tasks.map(normalizeTaskForCalendar);
}
