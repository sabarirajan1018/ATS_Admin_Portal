'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Brain,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('admin.sarah@migrateflow.io');
  const [password, setPassword] = useState('demo1234');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/admin/dashboard');
    }
  }, [isAuthenticated, router]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      login(email, password);
      toast.success('Welcome back to MigrateFlow Admin.');
      router.push('/admin/dashboard');
    }, 700);
  }

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50">
      {/* Brand side */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-900 p-12 text-white lg:flex">
        <div className="absolute inset-0 bg-grid opacity-[0.04]" />
        <div
          className="absolute -left-24 top-1/4 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, hsl(199 89% 48%), transparent 70%)' }}
        />
        <div
          className="absolute -bottom-24 right-0 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, hsl(142 71% 45%), transparent 70%)' }}
        />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500 shadow-lg shadow-sky-500/30">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">MigrateFlow</h1>
              <p className="text-xs text-slate-400">AI Recruitment & Immigration</p>
            </div>
          </div>
        </div>

        <div className="relative space-y-6">
          <h2 className="text-4xl font-bold leading-tight tracking-tight">
            AI-powered talent,
            <br />
            verified by humans.
          </h2>
          <p className="max-w-md text-base leading-relaxed text-slate-300">
            The admin portal where your team reviews AI-extracted candidate
            profiles, approves documents, and controls employer access — all
            before candidates reach the hiring market.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="text-2xl font-bold text-sky-400">2,847</div>
              <div className="text-xs text-slate-400">Candidates Processed</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="text-2xl font-bold text-emerald-400">94%</div>
              <div className="text-xs text-slate-400">AI Accuracy</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="text-2xl font-bold text-violet-400">412</div>
              <div className="text-xs text-slate-400">Active Employers</div>
            </div>
          </div>
        </div>

        <div className="relative flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4" />
          <span>SOC 2 Type II Certified · ISO 27001 Compliant</span>
        </div>
      </div>

      {/* Form side */}
      <div className="flex w-1/2 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 shadow-lg shadow-sky-500/30">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">MigrateFlow</h1>
              <p className="text-xs text-muted-foreground">Admin Portal</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Sign in to your account
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Enter your credentials to access the admin dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@migrateflow.io"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  className="text-xs font-medium text-sky-600 hover:text-sky-700"
                  onClick={() => toast.info('Password reset is disabled in demo mode.')}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pl-9 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-input text-sky-600 focus:ring-sky-500"
                />
                Remember me for 30 days
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-sky-600 text-white hover:bg-sky-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in to Dashboard'
              )}
            </Button>
          </form>

          <div className="mt-6 rounded-lg border border-sky-100 bg-sky-50 p-3 text-xs text-sky-800">
            <span className="font-semibold">Demo credentials:</span> Any email
            and password will work. Pre-filled for convenience.
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            © 2026 MigrateFlow Inc. · All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
}
