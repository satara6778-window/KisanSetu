import React, { useState, useEffect } from 'react';
import { marketplaceApi, API_BASE } from '../services/marketplaceApi';
import {
  ShieldAlert, Percent,
  FileSpreadsheet, UploadCloud
} from 'lucide-react';

export const AdminCenter: React.FC = () => {

  const [stats, setStats] = useState<any>({
    totalUsers: 5,
    totalListings: 4,
    totalOrders: 1,
    platformFeePercentage: 0.0,
    pendingComplaints: 0
  });

  const [feeInput, setFeeInput] = useState<number>(0.0);
  const [feeUpdating, setFeeUpdating] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadingCsv, setUploadingCsv] = useState(false);
  const [csvStatus, setCsvStatus] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await marketplaceApi.getAdminStats();
      setStats(data);
      setFeeInput(data.platformFeePercentage || 0.0);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateFee = async () => {
    setFeeUpdating(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/platform-fee`, {
        method: 'POST',
        headers: marketplaceApi.getAuthHeaders(),
        body: JSON.stringify({ feePercentage: feeInput })
      });
      if (res.ok) {
        alert('Platform fee updated to ' + feeInput + '% successfully!');
        loadStats();
      } else {
        alert('Fee update failed on server.');
      }
    } catch {
      setStats((prev: any) => ({ ...prev, platformFeePercentage: feeInput }));
      alert('Fee updated locally to ' + feeInput + '%');
    } finally {
      setFeeUpdating(false);
    }
  };

  const handleCsvUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;
    setUploadingCsv(true);
    setCsvStatus(null);
    try {
      const formData = new FormData();
      formData.append('file', csvFile);

      const res = await fetch(`${API_BASE}/api/admin/market-prices/import-csv`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kisansetu_token') || 'demo-jwt'}`
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setCsvStatus(`✓ Successfully imported ${data.importedCount || 'records'} verified mandi prices!`);
        setCsvFile(null);
      } else {
        setCsvStatus('Upload failed: ' + (data.error || 'Server error'));
      }
    } catch (err: any) {
      setCsvStatus('Upload error: ' + err.message);
    } finally {
      setUploadingCsv(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-rose-600" />
          Admin Moderation & Safety Center
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Monitor marketplace integrity, configure platform fees, ingest official APMC price data, and audit actions.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
          <p className="text-xs text-zinc-500 font-medium">Registered Users</p>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">{stats.totalUsers}</p>
        </div>
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
          <p className="text-xs text-zinc-500 font-medium">Active Harvest Listings</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.totalListings}</p>
        </div>
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
          <p className="text-xs text-zinc-500 font-medium">Fulfilled Orders</p>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{stats.totalOrders}</p>
        </div>
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
          <p className="text-xs text-zinc-500 font-medium">Platform Fee Rate</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{stats.platformFeePercentage}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Fee Configurator */}
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Percent className="w-4 h-4 text-emerald-600" />
            Configurable Platform Fee
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            The platform fee defaults to 0% initially as mandated by specification. It is deducted from gross order total upon mutual settlement.
          </p>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
              Fee Percentage (%)
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={feeInput}
                onChange={(e) => setFeeInput(Number(e.target.value))}
                className="w-32 px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
              />
              <button
                onClick={handleUpdateFee}
                disabled={feeUpdating}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50"
              >
                {feeUpdating ? 'Saving...' : 'Update Platform Fee'}
              </button>
            </div>
          </div>
        </div>

        {/* Mandi CSV Importer */}
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            Ingest Verified APMC Mandi Rates (CSV)
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Ingest verified government market records. Prices are strictly preserved with observation dates and source provenance.
          </p>

          <form onSubmit={handleCsvUpload} className="space-y-3">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files ? e.target.files[0] : null)}
              className="text-xs text-zinc-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
            />

            <button
              type="submit"
              disabled={!csvFile || uploadingCsv}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              {uploadingCsv ? 'Validating & Ingesting...' : 'Upload & Verify APMC Records'}
            </button>

            {csvStatus && (
              <p className="text-xs font-semibold text-emerald-600 mt-2">{csvStatus}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
