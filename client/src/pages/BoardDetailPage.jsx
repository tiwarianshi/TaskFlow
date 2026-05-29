import { useParams } from "react-router-dom";

export default function BoardDetailPage() {
  const { boardId } = useParams();

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">
        Board Detail Page
      </h1>

      <p className="text-gray-400">
        Board ID:
      </p>

      <p className="text-indigo-400 font-mono mt-2">
        {boardId}
      </p>
    </div>
  );
}