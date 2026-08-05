"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Key, Plus, Trash2, Copy, CheckCircle2, AlertTriangle, Loader2, ShieldAlert } from "lucide-react";
import { APIKey } from "@/types";

export default function APIKeysPage() {
  const [keys, setKeys] = useState<Omit<APIKey, "hashedKey">[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newKeyData, setNewKeyData] = useState<{ token: string; key: Omit<APIKey, "hashedKey"> } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/keys");
      if (res.ok) {
        const data = await res.json();
        setKeys(
          Array.isArray(data?.data) ? data.data.filter((k: any) => k && typeof k === "object") : []
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    setIsCreating(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          scopes: ["leads:read", "leads:write", "scoring:run", "chat:query", "marketing:generate"]
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setNewKeyData(data.data);
        setNewName("");
        fetchKeys();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const revokeKey = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this API key? Any applications using it will immediately lose access.")) return;
    
    try {
      const res = await fetch(`/api/keys/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchKeys();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = () => {
    if (newKeyData) {
      navigator.clipboard.writeText(newKeyData.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Layout>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Key className="h-6 w-6 text-emerald-500" />
            API Keys
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage your API keys to access SmartLeads BI programmatically via the CLI or external systems.
          </p>
        </div>

        {/* Create Key Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Create New Key</h2>
          
          {newKeyData ? (
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <ShieldAlert className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-800 dark:text-amber-300">Save your secret key!</h3>
                  <p className="text-sm text-amber-700 dark:text-amber-400/80 mt-1">
                    Please copy this API key and store it somewhere safe. For security reasons, <strong>we cannot show it to you again</strong>.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-4">
                <code className="flex-1 bg-white dark:bg-slate-900 p-3 rounded-lg border border-amber-200 dark:border-amber-500/30 text-slate-800 dark:text-slate-200 font-mono text-sm break-all">
                  {newKeyData.token}
                </code>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-3 rounded-lg font-medium transition-colors shrink-0"
                >
                  {copied ? <CheckCircle2 className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setNewKeyData(null)}
                  className="text-sm font-medium text-amber-700 dark:text-amber-400 hover:underline"
                >
                  I have saved it securely
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={createKey} className="flex gap-4 items-end max-w-xl">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Key Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. CI/CD Script, Zapier Integration"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:text-white"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isCreating || !newName.trim()}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
              >
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create Key
              </button>
            </form>
          )}
        </div>

        {/* List Keys Section */}
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Active API Keys</h2>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
          </div>
        ) : keys.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 border border-slate-200 dark:border-slate-700 text-center">
            <Key className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No API keys</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              You haven't created any API keys yet. Create one above to start automating your workflows.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase text-xs font-semibold">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Key Prefix</th>
                    <th className="px-6 py-4">Created</th>
                    <th className="px-6 py-4">Last Used</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {keys.map((key) => (
                    <tr key={key.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                          {key.name}
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                            {key.rateLimit} req/min
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                        {key.prefix}••••••••••••
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                        {new Date(key.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                        {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : "Never"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => revokeKey(key.id)}
                          className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 font-medium transition-colors flex items-center gap-1 justify-end ml-auto"
                        >
                          <Trash2 className="h-4 w-4" /> Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
