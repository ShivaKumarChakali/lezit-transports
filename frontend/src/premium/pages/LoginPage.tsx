import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../components/ui/Card';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') || '');
    const password = String(formData.get('password') || '');

    try {
      await login(email, password);
      navigate('/premium/dashboard');
    } catch (submissionError: any) {
      setError(submissionError?.message || 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background via-background to-muted/30 p-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="w-full max-w-md">
        <Card className="p-6 md:p-7">
          <p className="mb-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">LEZIT CLOUD</p>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Premium operations workspace for logistics teams.</p>

          <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
            <input
              name="email"
              type="email"
              placeholder="Work email"
              required
              className="w-full rounded-xl border-border bg-background px-3 py-2.5 text-sm"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              className="w-full rounded-xl border-border bg-background px-3 py-2.5 text-sm"
            />
            {error ? <p className="text-xs text-danger">{error}</p> : null}
            <button
              disabled={loading}
              className="w-full rounded-xl bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-4 text-sm text-muted-foreground">
            No account? <Link to="/premium/register" className="text-primary">Create one</Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;
