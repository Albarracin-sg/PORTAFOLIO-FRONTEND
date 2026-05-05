import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '@/features/admin/AdminAuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DynamicBackground from '@/components/DynamicBackground';
import { ArrowLeft, Lock, Loader2 } from 'lucide-react';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-background">
      <DynamicBackground />

      {/* Back link — mismo estilo que nav */}
      <div className="absolute top-6 left-6 z-10">
        <Button
          variant="ghost"
          asChild
          className="rounded-2xl gap-2 text-sm text-muted-foreground hover:text-foreground transition-all duration-200"
        >
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Back to site
          </Link>
        </Button>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="rounded-3xl border border-slate-200 dark:border-white/[0.07] bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl shadow-2xl shadow-black/5 p-8 space-y-7">

          {/* Icon + title */}
          <div className="text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-violet-500/10 flex items-center justify-center">
              <Lock className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Admin Access
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Securely manage your portfolio
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-2xl border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.04] h-11 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus-visible:ring-violet-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-2xl border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.04] h-11 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus-visible:ring-violet-500 transition-all"
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-500/20 text-xs text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium shadow-lg shadow-violet-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Authenticating...
                </span>
              ) : 'Access Dashboard'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}