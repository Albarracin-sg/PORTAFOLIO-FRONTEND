import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminAuth } from './AdminAuthProvider';

export function AdminLoginModal({
  triggerLabel = 'Admin',
  triggerClassName,
}: {
  triggerLabel?: string;
  triggerClassName?: string;
}) {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
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
          <button type="button" className={triggerClassName}>
            {triggerLabel}
          </button>
        ) : (
          <Button variant="outline" className="gap-2">
            {triggerLabel}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        overlayClassName="bg-slate-900/20 dark:bg-slate-950/35 backdrop-blur-md"
        className="border border-slate-200/60 bg-white/80 text-slate-900 shadow-[0_30px_80px_rgba(15,23,42,0.25)] dark:border-white/10 dark:bg-slate-950/80 dark:text-white dark:shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
      >
        <div className="absolute -top-16 -right-10 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />

        <DialogHeader className="relative">
          <DialogTitle className="text-2xl font-semibold text-slate-900 dark:text-white">
            Admin Login
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-300">
            Access the portfolio admin panel.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="admin-email" className="text-slate-700 dark:text-slate-200">Email</Label>
            <Input
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-1 border-slate-200/70 bg-white/70 text-slate-900 placeholder:text-slate-400 focus-visible:ring-purple-400/60 dark:border-white/10 dark:bg-slate-900/60 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>
          <div>
            <Label htmlFor="admin-password" className="text-slate-700 dark:text-slate-200">Password</Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="mt-1 border-slate-200/70 bg-white/70 text-slate-900 placeholder:text-slate-400 focus-visible:ring-purple-400/60 dark:border-white/10 dark:bg-slate-900/60 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>
          {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 hover:from-purple-500 hover:via-violet-500 hover:to-indigo-500"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
