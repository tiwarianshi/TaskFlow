import api from "./axiosInstance";

/**
 * Fetch all boards belonging to the logged-in user.
 */
export async function getBoards() {
  const response = await api.get("/boards");
  return response.data;
}

/**
 * Create a new board.
 */
export async function createBoard(boardData) {
  const response = await api.post("/boards", boardData);
  return response.data;
}

/**
 * Delete a board by ID.
 */
export async function deleteBoard(boardId) {
  const response = await api.delete(`/boards/${boardId}`);
  return response.data;
}