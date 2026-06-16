import Layout from '../components/Layout';
import MarketingPanel from '../components/MarketingPanel';

export default function Dashboard() {
  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">High Priority Leads</h3>
            <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">24</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Medium Priority Leads</h3>
            <p className="mt-2 text-3xl font-bold text-amber-500 dark:text-amber-400">56</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Leads</h3>
            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">142</p>
          </div>
        </div>
        
        <MarketingPanel />
      </div>
    </Layout>
  );
}
