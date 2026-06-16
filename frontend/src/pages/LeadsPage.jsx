import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import FileUpload from '../components/FileUpload';
import LeadCard from '../components/LeadCard';
import { Upload, Search, Filter, Loader2 } from 'lucide-react';

export default function LeadsPage() {
  const [showUpload, setShowUpload] = useState(false);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/leads');
      setLeads(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleUploadComplete = (data) => {
    if (data.leads) {
      setLeads(data.leads);
    } else {
      fetchLeads();
    }
    setShowUpload(false);
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Leads Management</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Upload, analyze, and manage your leads</p>
          </div>
          <button 
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-colors font-medium"
          >
            <Upload className="h-4 w-4" />
            {showUpload ? 'View Leads' : 'Upload Dataset'}
          </button>
        </div>

        <div className="rounded-2xl bg-white shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700/50 overflow-hidden min-h-[400px]">
          {showUpload ? (
            <div className="p-12 border-t border-slate-100 dark:border-slate-700/50">
              <FileUpload onUploadComplete={handleUploadComplete} />
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search leads..."
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:text-white"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <Filter className="h-4 w-4" />
                  Filters
                </button>
              </div>
              
              {loading ? (
                <div className="p-16 flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">Loading leads...</p>
                </div>
              ) : leads.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
                    <Upload className="h-6 w-6 text-slate-400 dark:text-slate-300" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No leads found</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">Upload a social media dataset to start generating AI scored leads automatically.</p>
                  <button 
                    onClick={() => setShowUpload(true)}
                    className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                  >
                    Upload your first dataset
                  </button>
                </div>
              ) : (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 bg-slate-50/50 dark:bg-slate-900/20">
                  {leads.map(lead => (
                    <LeadCard key={lead.id} lead={lead} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
