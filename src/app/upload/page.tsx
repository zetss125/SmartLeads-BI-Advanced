"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import FileUpload from "@/components/FileUpload";
import { CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function UploadPage() {
  const router = useRouter();
  const [uploadResult, setUploadResult] = useState<any>(null);

  const handleUploadComplete = (data: any) => {
    setUploadResult(data);
  };

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/leads"
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Upload Dataset
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Import social media engagement data for AI scoring
            </p>
          </div>
        </div>

        {uploadResult ? (
          <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700/50 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Upload Successful!
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              {uploadResult.leads?.length || 0} leads processed and scored by
              the AI model.
            </p>

            {uploadResult.mappingUsed && (
              <div className="mb-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 text-left">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Column Mapping Used
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(uploadResult.mappingUsed).map(
                    ([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-slate-500 capitalize">
                          {key}:
                        </span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {String(value) || "Not mapped"}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push("/leads")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
              >
                View Leads
              </button>
              <button
                onClick={() => setUploadResult(null)}
                className="border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-6 py-2.5 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Upload Another
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700/50">
            <FileUpload onUploadComplete={handleUploadComplete} />
          </div>
        )}
      </div>
    </Layout>
  );
}
