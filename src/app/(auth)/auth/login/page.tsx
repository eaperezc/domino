"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("next") ?? "/home";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [tab, setTab] = useState<"signin" | "signup">("signin");

  async function handleSignIn() {
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setRedirecting(true);
      router.push(redirectTo);
      router.refresh();
    }
  }

  async function handleSignUp() {
    setError(null);
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: username.trim() } },
    });
    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }
    // Auto sign-in after registration
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
    } else {
      setRedirecting(true);
      router.push(redirectTo);
      router.refresh();
    }
  }

  return (
    <Panel className="w-full max-w-md">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight mb-2">
          Domino
        </h1>
        <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
          Sign in to play online
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex border-b border-border/30 mb-6">
        <button
          onClick={() => { setTab("signin"); setError(null); }}
          className={`flex-1 pb-3 font-mono text-xs tracking-widest uppercase transition-colors relative ${
            tab === "signin"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Sign In
          {tab === "signin" && (
            <span className="absolute bottom-0 left-0 right-0 h-px bg-primary" />
          )}
        </button>
        <button
          onClick={() => { setTab("signup"); setError(null); }}
          className={`flex-1 pb-3 font-mono text-xs tracking-widest uppercase transition-colors relative ${
            tab === "signup"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Sign Up
          {tab === "signup" && (
            <span className="absolute bottom-0 left-0 right-0 h-px bg-primary" />
          )}
        </button>
      </div>

      {/* Sign In form */}
      {tab === "signin" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="signin-email"
              className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground"
            >
              Email
            </label>
            <input
              id="signin-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 bg-transparent border border-border/40 px-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="signin-password"
              className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground"
            >
              Password
            </label>
            <input
              id="signin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
              className="w-full h-10 bg-transparent border border-border/40 px-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors"
            />
          </div>
          {error && (
            <p className="font-mono text-xs text-destructive">{error}</p>
          )}
          <Button
            className="w-full"
            onClick={handleSignIn}
            disabled={loading || redirecting}
          >
            {redirecting ? "Redirecting..." : loading ? "Signing in..." : "Sign In"}
          </Button>
        </div>
      )}

      {/* Sign Up form */}
      {tab === "signup" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="signup-username"
              className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground"
            >
              Username
            </label>
            <input
              id="signup-username"
              placeholder="domino_king"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-10 bg-transparent border border-border/40 px-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="signup-email"
              className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground"
            >
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 bg-transparent border border-border/40 px-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="signup-password"
              className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground"
            >
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSignUp()}
              className="w-full h-10 bg-transparent border border-border/40 px-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors"
            />
          </div>
          {error && (
            <p className="font-mono text-xs text-destructive">{error}</p>
          )}
          <Button
            className="w-full"
            onClick={handleSignUp}
            disabled={loading || redirecting}
          >
            {redirecting ? "Redirecting..." : loading ? "Creating account..." : "Sign Up"}
          </Button>
        </div>
      )}
    </Panel>
  );
}
