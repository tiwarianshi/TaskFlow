import api from "./axiosInstance";

export async function getBoardById(boardId) {
  const response = await api.get(`/boards/${boardId}`);
  return response.data;
}

export async function getTasksByBoard(boardId) {
  const response = await api.get(`/tasks/board/${boardId}`);
  return response.data;
}