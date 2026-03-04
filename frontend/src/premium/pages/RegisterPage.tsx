import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../components/ui/Card';

const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      await register({
        name: String(formData.get('name') || ''),
        email: String(formData.get('email') || ''),
        phone: String(formData.get('phone') || ''),
        password: String(formData.get('password') || '')
      });
      navigate('/premium/dashboard');
    } catch (submissionError: any) {
      setError(submissionError?.message || 'Unable to register.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background via-background to-muted/30 p-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="w-full max-w-md">
        <Card className="p-6 md:p-7">
          <p className="mb-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">LEZIT CLOUD</p>
          <h1 className="text-2xl font-semibold tracking-tight">Create workspace access</h1>
          <p className="mt-1 text-sm text-muted-foreground">Fast onboarding for logistics customers and operators.</p>

          <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
            <input name="name" placeholder="Full name" required className="w-full rounded-xl border-border bg-background px-3 py-2.5 text-sm" />
            <input name="email" type="email" placeholder="Work email" required className="w-full rounded-xl border-border bg-background px-3 py-2.5 text-sm" />
            <input name="phone" placeholder="Phone" required className="w-full rounded-xl border-border bg-background px-3 py-2.5 text-sm" />
            <input name="password" type="password" placeholder="Password" required className="w-full rounded-xl border-border bg-background px-3 py-2.5 text-sm" />
            {error ? <p className="text-xs text-danger">{error}</p> : null}
            <button
              disabled={loading}
              className="w-full rounded-xl bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-4 text-sm text-muted-foreground">
            Already registered? <Link to="/premium/login" className="text-primary">Sign in</Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
