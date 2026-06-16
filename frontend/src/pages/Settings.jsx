import Layout from '../components/Layout';
import { Moon, Sun } from 'lucide-react';

export default function Settings({ darkMode, setDarkMode }) {
  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Settings</h1>
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700/50">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Appearance</h2>
          <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-700/50">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-600'}`}>
                {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Dark Mode</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Toggle dark mode interface theme</p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${darkMode ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
