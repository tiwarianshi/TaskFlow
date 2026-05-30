import axiosInstance from "./axiosInstance";

// ─── Existing (unchanged) ────────────────────────────────────────────────────
export async function getBoards() {
  const { data } = await axiosInstance.get("/boards");
  return data;
}

export async function getBoardById(boardId) {
  const { data } = await axiosInstance.get(`/boards/${boardId}`);
  return data;
}

export async function createBoard(boardData) {
  const { data } = await axiosInstance.post("/boards", boardData);
  return data;
}

export async function deleteBoard(boardId) {
  const { data } = await axiosInstance.delete(`/boards/${boardId}`);
  return data;
}

export async function updateBoard(boardId, updates) {
  const { data } = await axiosInstance.put(`/boards/${boardId}`, updates);
  return data;
}

// ─── New: Favorite toggle ────────────────────────────────────────────────────
// Backend expected: PATCH /api/boards/:boardId/favorite
// Body: { isFavorite: boolean }
// Returns updated board
export async function toggleFavoriteBoard(boardId, isFavorite) {
  const { data } = await axiosInstance.patch(`/boards/${boardId}/favorite`, {
    isFavorite,
  });
  return data;
}

// ─── New: Board stats ────────────────────────────────────────────────────────
// Backend expected: GET /api/boards/:boardId/stats
// Returns: { total: number, completed: number }
export async function getBoardStats(boardId) {
  const { data } = await axiosInstance.get(`/boards/${boardId}/stats`);
  return data;
}

// ─── New: All boards with stats in one call (optional optimization) ──────────
// Backend expected: GET /api/boards?includeStats=true
// Falls back to individual stat calls if not supported
export async function getBoardsWithStats() {
  const { data } = await axiosInstance.get("/boards?includeStats=true");
  return data;
}
