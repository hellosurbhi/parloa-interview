"use client";

import { useState } from "react";

interface NoteResponse {
  id: string;
  content: string;
  created_at: string;
  expires_at?: string | null;
}

export default function Home() {
  const [content, setContent] = useState("");
  const [createdNote, setCreatedNote] = useState<NoteResponse | null>(null);
  const [fetchId, setFetchId] = useState("");
  const [fetchedNote, setFetchedNote] = useState<NoteResponse | null>(null);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [fetching, setFetching] = useState(false);

  async function handleCreate() {
    setError("");
    setCreatedNote(null);
    setCreating(true);

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create note");
        return;
      }

      const note: NoteResponse = await res.json();
      setCreatedNote(note);
      setContent("");
    } catch {
      setError("Network error");
    } finally {
      setCreating(false);
    }
  }

  async function handleFetch() {
    setError("");
    setFetchedNote(null);
    setFetching(true);

    try {
      const res = await fetch(`/api/notes/${fetchId}`);

      if (res.status === 404) {
        setError("Note not found");
        return;
      }
      if (res.status === 410) {
        setError("Note has expired");
        return;
      }
      if (!res.ok) {
        setError("Failed to fetch note");
        return;
      }

      const note: NoteResponse = await res.json();
      setFetchedNote(note);
    } catch {
      setError("Network error");
    } finally {
      setFetching(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6 sm:p-12">
      <div className="max-w-xl mx-auto space-y-10">
        <h1 className="text-2xl font-bold tracking-tight">Notes</h1>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-300">Create a note</h2>
          <textarea
            className="w-full h-32 bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write something..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button
            onClick={handleCreate}
            disabled={creating || content.trim().length === 0}
            className="px-4 py-2 bg-blue-600 text-sm font-medium rounded-lg hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {creating ? "Creating..." : "Create"}
          </button>

          {createdNote && (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-sm space-y-1">
              <p className="text-green-400">Note created</p>
              <p>
                <span className="text-gray-400">ID:</span>{" "}
                <code className="text-blue-400">{createdNote.id}</code>
              </p>
              <p>
                <span className="text-gray-400">Link:</span>{" "}
                <code className="text-blue-400 break-all">
                  {typeof window !== "undefined"
                    ? `${window.location.origin}/api/notes/${createdNote.id}`
                    : `/api/notes/${createdNote.id}`}
                </code>
              </p>
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-300">Fetch a note</h2>
          <div className="flex gap-2">
            <input
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Paste a note ID..."
              value={fetchId}
              onChange={(e) => setFetchId(e.target.value)}
            />
            <button
              onClick={handleFetch}
              disabled={fetching || fetchId.trim().length === 0}
              className="px-4 py-2 bg-gray-700 text-sm font-medium rounded-lg hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {fetching ? "Fetching..." : "Fetch"}
            </button>
          </div>

          {fetchedNote && (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-sm space-y-1">
              <p className="whitespace-pre-wrap">{fetchedNote.content}</p>
              <p className="text-gray-500 text-xs mt-2">
                Created: {fetchedNote.created_at}
              </p>
            </div>
          )}
        </section>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}
      </div>
    </main>
  );
}
