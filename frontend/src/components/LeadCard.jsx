import { Star, Clock, Tag } from 'lucide-react';

export default function LeadCard({ lead }) {
  const isHigh = lead.score >= 80;
  const isMedium = lead.score >= 45 && lead.score < 80;
  
  const scoreColor = isHigh ? 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20' :
                     isMedium ? 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20' :
                     'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20';

  const badgeColor = isHigh ? 'bg-emerald-500' :
                     isMedium ? 'bg-amber-500' :
                     'bg-rose-500';

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md dark:bg-slate-800 dark:border-slate-700/50">
      <div className={`absolute top-0 right-0 h-1 w-full ${badgeColor}`} />
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">{lead.name || 'Anonymous User'}</h3>
          <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
            <Tag className="h-3 w-3" /> {lead.platform || 'Social Media'} &bull; {lead.date ? new Date(lead.date).toLocaleDateString() : 'Recent'}
          </p>
        </div>
        <div className={`flex items-center justify-center h-10 w-10 rounded-full border ${scoreColor}`}>
          <span className="font-bold">{lead.score}</span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
          "{lead.originalText}"
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {lead.signals?.map((signal, idx) => (
          <span key={idx} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            <Star className="h-3 w-3 text-emerald-500" />
            {signal}
          </span>
        ))}
        {lead.urgency && (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
            <Clock className="h-3 w-3" />
            High Urgency
          </span>
        )}
      </div>
    </div>
  );
}
