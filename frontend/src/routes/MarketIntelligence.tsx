import React, { useState, useEffect } from 'react';
import {
  Landmark, Search, BarChart3,
  MapPin, ShieldCheck, Sparkles, X, Calendar, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { marketplaceApi } from '../services/marketplaceApi';
import type { MarketPriceDto } from '../services/marketplaceApi';

export const MarketIntelligence: React.FC = () => {
  const [search, setSearch] = useState('');
  const [prices, setPrices] = useState<MarketPriceDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Explainer modal state
  const [explainingCrop, setExplainingCrop] = useState<MarketPriceDto | null>(null);
  const farmerPriceInput = 28;
  const transportCostInput = 2;
  const [explainerResult, setExplainerResult] = useState<any>(null);
  const [explainingLoading, setExplainingLoading] = useState(false);

  useEffect(() => {
    loadPrices();
  }, [search]);

  const loadPrices = async () => {
    setLoading(true);
    try {
      const data = await marketplaceApi.getMarketPrices(search.trim() || undefined);
      setPrices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async (crop: MarketPriceDto) => {
    setExplainingCrop(crop);
    setExplainingLoading(true);
    setExplainerResult(null);
    try {
      const res = await marketplaceApi.explainPrice(crop.cropName, farmerPriceInput, transportCostInput);
      setExplainerResult(res);
    } catch {
      // Offline fallback deterministic explainer
      setExplainerResult({
        cropName: crop.cropName,
        storedModalPrice: crop.modalPrice,
        minPrice: crop.minPrice,
        maxPrice: crop.maxPrice,
        unit: crop.unit,
        marketName: crop.marketName,
        sourceName: crop.sourceName,
        aiAnalysis: `According to verified data from ${crop.sourceName} for ${crop.marketName} observed on ${crop.observationDate}:
• Modal price: ₹${crop.modalPrice} per ${crop.unit} (Range: ₹${crop.minPrice} - ₹${crop.maxPrice}).
• Direct selling without middleman charges increases farmgate net realization.`,
        disclaimer: 'Historical trend analysis based on verified mandi records. Not a guaranteed forecast. Final selling price decision remains with the farmer.'
      });
    } finally {
      setExplainingLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" /> Verified APMC Mandi Intelligence
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Official government recorded mandi rates. Factual stored records only — never invented by AI.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search crop or APMC mandi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500 transition shadow-sm"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Mandi Prices list */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-zinc-100 dark:bg-zinc-900 animate-pulse border border-zinc-200 dark:border-zinc-800" />
              ))}
            </div>
          ) : prices.length > 0 ? (
            prices.map((item, idx) => (
              <motion.div
                key={item.id || item.cropName}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-all group"
              >
                {/* Crop details */}
                <div className="space-y-1 min-w-[140px]">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-zinc-800 dark:text-zinc-100">{item.cropName}</span>
                    {item.marathiName && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                        {item.marathiName}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" /> {item.marketName} ({item.district})
                  </p>
                  <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-zinc-400" /> Observed: {item.observationDate}
                  </p>
                </div>

                {/* Price block */}
                <div className="md:text-right">
                  <p className="text-xl font-black text-zinc-900 dark:text-white">
                    ₹{item.modalPrice.toLocaleString('en-IN')}{' '}
                    <span className="text-xs text-zinc-400 font-medium">/ {item.unit}</span>
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Range: ₹{item.minPrice} - ₹{item.maxPrice}
                  </p>
                  <p className="text-[9px] text-zinc-400 flex items-center md:justify-end gap-1 mt-0.5">
                    <Database className="w-2.5 h-2.5" /> Source: {item.sourceName}
                  </p>
                </div>

                {/* AI Explainer Action */}
                <div className="border-t md:border-t-0 md:border-l border-zinc-100 dark:border-zinc-800 pt-3 md:pt-0 md:pl-5">
                  <button
                    onClick={() => handleExplain(item)}
                    className="w-full md:w-auto px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center gap-1.5 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    AI Rate Context
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-8 text-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60">
              <Search className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
              <p className="text-sm text-zinc-500 font-semibold">No verified mandi rates match this search</p>
            </div>
          )}
        </div>

        {/* Right: Insights card */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 shadow-sm"
          >
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Agricultural Mandi Guidance
            </h3>
            
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50">
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Direct Farmgate Selling Advantage</p>
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-450 mt-1 leading-relaxed">
                  Selling directly to consumers on KisanSetu preserves 100% of the sale value, bypassing mandi loading fees, weighment charges, and 6-8% middleman commission.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50">
                <p className="text-xs font-bold text-amber-800 dark:text-amber-300">Verifiable Observation Provenance</p>
                <p className="text-[11px] text-amber-700/80 dark:text-amber-450 mt-1 leading-relaxed">
                  All market rates are verified from government APMC mandi records and MSAMB logs. AI explains historical context without ever inventing numbers.
                </p>
              </div>
            </div>
          </motion.div>

          {/* MSP info */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 shadow-sm"
          >
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-3 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-blue-500" /> MSP Guidelines 2026
            </h3>
            <p className="text-[11px] text-zinc-400 mb-4">Minimum Support Prices set by Government of India</p>

            <div className="space-y-3">
              {[
                { name: 'Wheat (Common)', MSP: 2275, year: '2025-26' },
                { name: 'Sugarcane (FRP Standard)', MSP: 3150, year: 'Per Tonne' },
                { name: 'Soybean (Yellow)', MSP: 4892, year: '2025-26' },
              ].map((msp) => (
                <div key={msp.name} className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80">
                  <div>
                    <p className="font-semibold text-zinc-700 dark:text-zinc-300">{msp.name}</p>
                    <p className="text-[9px] text-zinc-400 mt-0.5">{msp.year}</p>
                  </div>
                  <span className="font-black text-zinc-800 dark:text-zinc-100">₹{msp.MSP}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── AI Rate Explainer Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {explainingCrop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setExplainingCrop(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Mandi Price Analysis: {explainingCrop.cropName}
              </h3>
              <p className="text-xs text-zinc-500 mb-4">
                {explainingCrop.marketName} · Observed {explainingCrop.observationDate}
              </p>

              {explainingLoading ? (
                <div className="p-8 text-center text-xs text-zinc-500">
                  Analyzing stored government APMC price records...
                </div>
              ) : explainerResult ? (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-2 whitespace-pre-line text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
                    {explainerResult.aiAnalysis}
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                    <strong>Mandatory Disclaimer:</strong> {explainerResult.disclaimer}
                  </div>

                  <button
                    onClick={() => setExplainingCrop(null)}
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition"
                  >
                    Done
                  </button>
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
