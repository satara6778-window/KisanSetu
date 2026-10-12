import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { marketplaceApi } from '../services/marketplaceApi';
import type { OfferDto } from '../services/marketplaceApi';
import {
  Handshake, CheckCircle2, Clock, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Offers: React.FC = () => {
  const { t } = useLanguage();
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'buyer' | 'farmer'>(role === 'FARMER' ? 'farmer' : 'buyer');
  const [offers, setOffers] = useState<OfferDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Counter offer modal
  const [counterModalOffer, setCounterModalOffer] = useState<OfferDto | null>(null);
  const [counterPrice, setCounterPrice] = useState<number>(25);
  const [counterNotes, setCounterNotes] = useState('');
  const [counterSubmitting, setCounterSubmitting] = useState(false);

  useEffect(() => {
    loadOffers();
  }, [activeTab, user]);

  const loadOffers = async () => {
    setLoading(true);
    try {
      const data = await marketplaceApi.getOffers(activeTab);
      setOffers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId: number) => {
    try {
      await marketplaceApi.acceptOffer(offerId);
      alert('Offer accepted! An agreed order has been created in your Orders queue.');
      loadOffers();
      navigate('/orders');
    } catch (err: any) {
      alert('Acceptance failed: ' + err.message);
    }
  };

  const handleRejectOffer = async (offerId: number) => {
    try {
      await marketplaceApi.rejectOffer(offerId);
      loadOffers();
    } catch (err: any) {
      alert('Rejection failed: ' + err.message);
    }
  };

  const handleSubmitCounter = async () => {
    if (!counterModalOffer) return;
    setCounterSubmitting(true);
    try {
      await marketplaceApi.counterOffer(counterModalOffer.id, counterPrice, counterNotes);
      alert('Counter offer submitted back to buyer!');
      setCounterModalOffer(null);
      loadOffers();
    } catch (err: any) {
      alert('Counter failed: ' + err.message);
    } finally {
      setCounterSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Handshake className="w-6 h-6 text-amber-500" />
          {t('negotiationTitle')}
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          {t('negotiationSubtitle')}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('buyer')}
          className={`py-2.5 px-5 text-xs font-bold border-b-2 transition ${
            activeTab === 'buyer'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          My Sent Offers (Buyer)
        </button>
        <button
          onClick={() => setActiveTab('farmer')}
          className={`py-2.5 px-5 text-xs font-bold border-b-2 transition ${
            activeTab === 'farmer'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Received Offers (Farmer)
        </button>
      </div>

      {/* Offers List */}
      {loading ? (
        <div className="h-40 rounded-2xl bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
      ) : offers.length > 0 ? (
        <div className="space-y-4">
          {offers.map((offer) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {offer.cropName}
                  </span>
                  <span className="text-xs text-zinc-400">
                    (Listed at ₹{offer.listingPrice || 26} / {offer.unit})
                  </span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  offer.status === 'CONSUMED' || offer.status === 'ACCEPTED'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : offer.status === 'COUNTERED'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                    : offer.status === 'REJECTED'
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                }`}>
                  {offer.status}
                </span>
              </div>

              {/* Offer Pricing Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 text-xs">
                <div>
                  <span className="text-zinc-400 block text-[10px]">Buyer Proposed:</span>
                  <span className="font-extrabold text-amber-600">₹{offer.offeredPrice} / {offer.unit}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px]">Volume:</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{offer.quantity} {offer.unit}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px]">Farmer Counter:</span>
                  <span className="font-extrabold text-blue-600">{offer.counterPrice ? `₹${offer.counterPrice} / ${offer.unit}` : '—'}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px]">Total Proposal:</span>
                  <span className="font-extrabold text-emerald-600">
                    ₹{(offer.counterPrice || offer.offeredPrice) * offer.quantity}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {(offer.buyerNotes || offer.farmerNotes) && (
                <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                  {offer.buyerNotes && <p><strong>Buyer Note:</strong> "{offer.buyerNotes}"</p>}
                  {offer.farmerNotes && <p><strong>Farmer Note:</strong> "{offer.farmerNotes}"</p>}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                {/* Farmer decisions on PENDING */}
                {activeTab === 'farmer' && offer.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleAcceptOffer(offer.id)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
                    >
                      ✓ Accept Offer (₹{offer.offeredPrice})
                    </button>
                    <button
                      onClick={() => {
                        setCounterModalOffer(offer);
                        setCounterPrice(Math.round((offer.offeredPrice + (offer.listingPrice || 26)) / 2));
                      }}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
                    >
                      Counter Offer
                    </button>
                    <button
                      onClick={() => handleRejectOffer(offer.id)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
                    >
                      Decline
                    </button>
                  </>
                )}

                {/* Buyer decisions on COUNTERED */}
                {activeTab === 'buyer' && offer.status === 'COUNTERED' && (
                  <>
                    <button
                      onClick={() => handleAcceptOffer(offer.id)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
                    >
                      ✓ Accept Counter (₹{offer.counterPrice})
                    </button>
                    <button
                      onClick={() => handleRejectOffer(offer.id)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
                    >
                      Decline
                    </button>
                  </>
                )}

                {offer.status === 'CONSUMED' && (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Converted to Live Order
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60">
          <Clock className="w-10 h-10 text-zinc-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-zinc-600">No active negotiations in {activeTab} view.</p>
        </div>
      )}

      {/* ── Counter Offer Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {counterModalOffer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setCounterModalOffer(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                Submit Counter Offer
              </h3>
              <p className="text-xs text-zinc-500 mb-4">
                Buyer requested ₹{counterModalOffer.offeredPrice} for {counterModalOffer.quantity} {counterModalOffer.unit}
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Your Counter Price (₹ per {counterModalOffer.unit})
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={counterPrice}
                    onChange={(e) => setCounterPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Explanation note to buyer
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Higher quality grade A sorting"
                    value={counterNotes}
                    onChange={(e) => setCounterNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <button
                  onClick={handleSubmitCounter}
                  disabled={counterSubmitting}
                  className="w-full py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md transition disabled:opacity-50"
                >
                  {counterSubmitting ? 'Submitting...' : 'Send Counter Offer'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
