// src/api/taskApi.js
// All task + board-related API calls.
// Uses axiosInstance → auth headers & baseURL are automatically attached.

import api from "./axiosInstance";

/**
 * Get single board details
 * GET /boards/:id
 */
export async function getBoardById(boardId) {
  const res = await api.get(`/boards/${boardId}`);
  return res.data;
}

/**
 * Fetch all tasks for a specific board
 * GET /tasks/board/:boardId
 */
export async function getTasksByBoard(boardId) {
  const res = await api.get(`/tasks/board/${boardId}`);
  return res.data;
}

/**
 * Create a new task
 * POST /tasks
 */
export async function createTask(taskData) {
  const res = await api.post("/tasks", taskData);
  return res.data;
}

/**
 * Update an existing task
 * PUT /tasks/:taskId
 */
export async function updateTask(taskId, updatedData) {
  const res = await api.put(`/tasks/${taskId}`, updatedData);
  return res.data;
}

/**
 * Delete a task
 * DELETE /tasks/:taskId
 */
export async function deleteTask(taskId) {
  const res = await api.delete(`/tasks/${taskId}`);
  return res.data;
}