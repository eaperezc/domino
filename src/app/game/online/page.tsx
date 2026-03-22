"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OnlineLobbyPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    setError(null);
    setLoading(true);
    const res = await fetch("/api/games/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetScore: 100 }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to create game");
      return;
    }

    router.push(`/game/online/${data.gameId}`);
  }

  async function handleJoin() {
    setError(null);
    if (!code.trim()) {
      setError("Enter a game code");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/games/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim() }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to join game");
      return;
    }

    router.push(`/game/online/${data.gameId}`);
  }

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Create Game</CardTitle>
            <CardDescription>Start a new game and invite friends with a code</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCreate} disabled={loading} className="w-full">
              {loading ? "Creating..." : "Create New Game"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Join Game</CardTitle>
            <CardDescription>Enter a game code to join an existing game</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="code">Game Code</Label>
              <Input
                id="code"
                placeholder="ABCD"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                maxLength={4}
                className="text-center text-lg font-mono tracking-widest uppercase"
              />
            </div>
            <Button onClick={handleJoin} disabled={loading} variant="secondary" className="w-full">
              {loading ? "Joining..." : "Join Game"}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}
      </div>
    </div>
  );
}
