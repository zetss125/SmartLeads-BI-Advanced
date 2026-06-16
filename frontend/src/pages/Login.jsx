import { useState } from 'react';
import { UserPlus, Sparkles } from 'lucide-react';

export default function Login({ onLogin }) {
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    // Simulate network request for mock auth
    setTimeout(() => {
      onLogin();
    }, 1000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-900">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-200/50 dark:bg-slate-800 dark:shadow-none">
        <div className="p-10 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">SmartLeads BI</h1>
          <p className="mb-10 text-slate-500 dark:text-slate-400">AI Lead Scoring & Marketing Assistant</p>
          
          <button
            onClick={handleLogin}
            disabled={loading}
            className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-[#1877F2] px-4 py-4 font-semibold text-white transition-all hover:bg-[#166fe5] hover:shadow-lg hover:shadow-[#1877F2]/30 disabled:opacity-70 disabled:hover:shadow-none"
          >
            {loading ? (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <UserPlus className="h-6 w-6" />
                <span>Continue with your chosen social media app</span>
              </>
            )}
          </button>
          
          <p className="mt-8 text-sm text-slate-400 dark:text-slate-500">
            Demo environment. No actual data will be posted to your account.
          </p>
        </div>
      </div>
    </div>
  );
}
