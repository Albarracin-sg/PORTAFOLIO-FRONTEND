import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminAuth } from './AdminAuthProvider';
import { Lock, Loader2, Eye, EyeOff } from 'lucide-react';

export function AdminLoginModal({
  triggerLabel = 'Admin',
  triggerClassName,
  onTriggerClick,
}: {
  triggerLabel?: string;
  triggerClassName?: string;
  onTriggerClick?: () => void;
}) {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      setOpen(false);
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerClassName ? (
          <button
            type="button"
            className={triggerClassName}
            onClick={() => onTriggerClick?.()}
          >
            {triggerLabel}
          </button>
        ) : (
          <Button
            variant="outline"
            className="rounded-2xl gap-2"
            onClick={() => onTriggerClick?.()}
          >
            {triggerLabel}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="
        w-[calc(100vw-2rem)] max-w-sm
        rounded-3xl
        border border-slate-200 dark:border-white/[0.07]
        bg-white/95 dark:bg-gray-950/95
        backdrop-blur-2xl
        shadow-2xl shadow-black/10
        p-6 sm:p-8
        gap-0
      ">
        <DialogHeader className="mb-6">
          <div className="flex items-start gap-4 text-left">
            <div className="h-11 w-11 rounded-2xl bg-violet-500/10 flex items-center justify-center shrink-0 border border-violet-500/20 mt-1">
              <Lock className="h-5 w-5 text-violet-500 pointer-events-none" />
            </div>
            <div className="min-w-0 pt-1">
              <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
                Admin Access
              </DialogTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                Access the admin panel.
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* autoComplete="off" en el form evita que el autofill del browser
            inyecte nodos en el DOM de React y cause el error
            "Permission denied to access property correspondingUseElement" */}
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="admin-email" className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1">
              Email
            </Label>
            <Input
              id="admin-email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="off"
              className="rounded-2xl border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.04] h-11 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus-visible:ring-violet-500 transition-all"
            />
          </div>

          {/* Password + eye toggle */}
          <div className="space-y-1.5">
            <Label htmlFor="admin-password" className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1">
              Password
            </Label>
            <div className="relative">
              <Input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="rounded-2xl border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.04] h-11 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus-visible:ring-violet-500 transition-all pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                tabIndex={-1}
              >
                {showPassword
                  ? <EyeOff className="h-4 w-4 pointer-events-none" />
                  : <Eye className="h-4 w-4 pointer-events-none" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-500/20 text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium shadow-lg shadow-violet-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin pointer-events-none" />
                Signing in...
              </span>
            ) : 'Sign in'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}