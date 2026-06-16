import { useState } from 'react';
import { Target, CheckCircle2, ChevronDown, ListTodo } from 'lucide-react';
import axios from 'axios';

export default function MarketingPanel() {
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/marketing/generate');
      setStrategy(response.data.strategy);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700/50 mt-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">AI Marketing Strategy</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Automated strategies based on lead behavior</p>
          </div>
        </div>
        {!strategy && (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Plan'}
          </button>
        )}
      </div>

      {strategy ? (
        <div className="space-y-6">
          <div className="prose prose-slate dark:prose-invert prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: strategy.replace(/\n/g, '<br />') }} />
          </div>
          
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-emerald-500" />
              Action Items
            </h3>
            <ul className="space-y-3">
              {[
                "Target Facebook leads with personalized retargeting",
                "Create Instagram story for highly engaged segment",
                "Send SMS reminder for 'High Urgency' leads"
              ].map((task, i) => (
                <li key={i} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                  <CheckCircle2 className="h-5 w-5 text-slate-300 dark:text-slate-600 flex-shrink-0 hover:text-emerald-500 cursor-pointer transition-colors" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{task}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
            <Target className="h-6 w-6 text-slate-400 dark:text-slate-300" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Click "Generate Plan" to create a targeted marketing strategy based on your current lead pool.
          </p>
        </div>
      )}
    </div>
  );
}
