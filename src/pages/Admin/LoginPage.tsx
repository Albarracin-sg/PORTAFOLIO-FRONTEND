import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '@/features/admin/AdminAuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DynamicBackground from '@/components/DynamicBackground';
import { ArrowLeft, Lock } from 'lucide-react';

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
      
      <div className="absolute top-8 left-8">
        <Button variant="ghost" asChild className="rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to site
          </Link>
        </Button>
      </div>

      <Card className="w-full max-w-md border-slate-200 dark:border-white/10 bg-background/60 backdrop-blur-xl shadow-2xl relative z-10 rounded-3xl overflow-hidden">
        <CardHeader className="pt-8 pb-4 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-violet-600/10 flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-violet-600" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Admin Access
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Securely manage your portfolio content
          </p>
        </CardHeader>
        <CardContent className="pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="rounded-2xl border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 h-12 focus:ring-violet-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="rounded-2xl border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 h-12 focus:ring-violet-500 transition-all"
              />
            </div>
            {error && (
              <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-xs text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full h-12 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-lg shadow-violet-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : 'Access Dashboard'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
