import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { marketplaceApi } from '../services/marketplaceApi';
import type { CropListingDto } from '../services/marketplaceApi';
import {
  Search, MapPin, PackageCheck,
  ShoppingBag, Sparkles, AlertCircle, X, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Marketplace: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [crops, setCrops] = useState<CropListingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  // Modals state
  const [buyModalListing, setBuyModalListing] = useState<CropListingDto | null>(null);
  const [buyQuantity, setBuyQuantity] = useState<number>(10);
  const [deliveryType, setDeliveryType] = useState<'PICKUP' | 'DELIVERY'>('PICKUP');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string | null>(null);

  // Offer modal state
  const [offerModalListing, setOfferModalListing] = useState<CropListingDto | null>(null);
  const [offerPrice, setOfferPrice] = useState<number>(20);
  const [offerQuantity, setOfferQuantity] = useState<number>(50);
  const [offerNotes, setOfferNotes] = useState('');
  const [offerSubmitting, setOfferSubmitting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [category]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await marketplaceApi.getProducts({
        search: search.trim() || undefined,
        category: category !== 'All' ? category : undefined
      });
      setCrops(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts();
  };

  const handlePlaceOrder = async () => {
    if (!buyModalListing) return;
    setOrderSubmitting(true);
    try {
      const idempotencyKey = 'IDEMP-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
      const res = await marketplaceApi.createOrder({
        listingId: buyModalListing.id,
        quantity: buyQuantity,
        deliveryType,
        deliveryAddress: deliveryType === 'DELIVERY' ? deliveryAddress || user.village : undefined,
        idempotencyKey,
        notes: 'Direct marketplace purchase'
      });
      setOrderSuccessMsg(`Order #${res.orderNumber} placed successfully! Advancing to tracker...`);
      setTimeout(() => {
        setBuyModalListing(null);
        setOrderSuccessMsg(null);
        navigate('/orders');
      }, 1400);
    } catch (err: any) {
      alert('Order failed: ' + err.message);
    } finally {
      setOrderSubmitting(false);
    }
  };

  const handleSubmitOffer = async () => {
    if (!offerModalListing) return;
    setOfferSubmitting(true);
    try {
      await marketplaceApi.createOffer({
        listingId: offerModalListing.id,
        offeredPrice: offerPrice,
        quantity: offerQuantity,
        notes: offerNotes || 'Buyer requested direct price negotiation'
      });
      alert('Offer submitted directly to farmer! Check Offers tab for negotiation progress.');
      setOfferModalListing(null);
      navigate('/offers');
    } catch (err: any) {
      alert('Offer submission failed: ' + err.message);
    } finally {
      setOfferSubmitting(false);
    }
  };

  const categories = [
    { id: 'All', label: t('filterAll') },
    { id: 'Vegetables', label: t('filterVegetables') },
    { id: 'Fruits', label: t('filterFruits') },
    { id: 'Grains', label: t('filterGrains') },
    { id: 'Spices', label: t('filterSpices') },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Title Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 border border-emerald-400/30 backdrop-blur-sm mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            0% Middleman Platform
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
            {t('marketplaceTitle')}
          </h1>
          <p className="text-emerald-100/90 text-sm leading-relaxed">
            {t('marketplaceSubtitle')}
          </p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-zinc-900/60 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-10 pr-24 py-2.5 text-xs md:text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition"
          >
            Search
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                category === c.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Crop Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 rounded-2xl bg-zinc-100 dark:bg-zinc-900 animate-pulse border border-zinc-200 dark:border-zinc-800" />
          ))}
        </div>
      ) : crops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {crops.map((crop) => (
            <motion.div
              key={crop.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group"
            >
              {/* Image banner */}
              <div className="relative h-44 w-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <img
                  src={crop.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80'}
                  alt={crop.cropName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 dark:bg-zinc-900/90 text-emerald-700 dark:text-emerald-400 shadow-sm backdrop-blur-sm">
                    {crop.qualityGrade}
                  </span>
                  {crop.marathiAlias && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-600/90 text-white shadow-sm backdrop-blur-sm">
                      {crop.marathiAlias}
                    </span>
                  )}
                </div>
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-black/60 text-white backdrop-blur-sm flex items-center gap-1">
                    <PackageCheck className="w-3 h-3 text-emerald-400" />
                    {crop.availableQuantity} {crop.unit}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                    {crop.cropName}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    {crop.farmer.fullName} · {crop.village}, {crop.district}
                  </p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                    {crop.description}
                  </p>
                </div>

                {/* Delivery Options & Price */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <span className="flex items-center gap-1">
                      {crop.pickupAvailable && <span className="text-emerald-600 font-medium">✓ Farmgate Pickup</span>}
                    </span>
                    <span>
                      {crop.deliveryAvailable ? <span className="text-blue-600 font-medium">✓ Delivery</span> : 'Pickup Only'}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xl font-extrabold text-zinc-900 dark:text-white">
                        ₹{crop.pricePerUnit}
                      </span>
                      <span className="text-xs text-zinc-500 font-medium"> / {crop.unit}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => {
                        setBuyModalListing(crop);
                        setBuyQuantity(Math.min(10, crop.availableQuantity));
                        setDeliveryType(crop.pickupAvailable ? 'PICKUP' : 'DELIVERY');
                      }}
                      className="w-full py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 shadow-sm transition"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      {t('buyNow')}
                    </button>
                    <button
                      onClick={() => {
                        setOfferModalListing(crop);
                        setOfferPrice(Math.round(crop.pricePerUnit * 0.9));
                        setOfferQuantity(Math.min(25, crop.availableQuantity));
                      }}
                      className="w-full py-2 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-1.5 transition"
                    >
                      {t('makeOffer')}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60">
          <AlertCircle className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">{t('noCropsFound')}</p>
        </div>
      )}

      {/* ── Direct Buy Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {buyModalListing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setBuyModalListing(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                Confirm Purchase
              </h3>
              <p className="text-xs text-zinc-500 mb-4">
                {buyModalListing.cropName} · ₹{buyModalListing.pricePerUnit} / {buyModalListing.unit}
              </p>

              {orderSuccessMsg ? (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-center font-bold text-sm">
                  ✓ {orderSuccessMsg}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Quantity selector */}
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Purchase Quantity ({buyModalListing.unit})
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={buyModalListing.availableQuantity}
                      value={buyQuantity}
                      onChange={(e) => setBuyQuantity(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[10px] text-zinc-400 mt-0.5">Max in stock: {buyModalListing.availableQuantity} {buyModalListing.unit}</p>
                  </div>

                  {/* Delivery Mode */}
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Fulfillment Method
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryType('PICKUP')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                          deliveryType === 'PICKUP'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 text-emerald-700 dark:text-emerald-300'
                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-600'
                        }`}
                      >
                        🚗 Farmgate Pickup (Free)
                      </button>
                      <button
                        type="button"
                        disabled={!buyModalListing.deliveryAvailable}
                        onClick={() => setDeliveryType('DELIVERY')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                          deliveryType === 'DELIVERY'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 text-emerald-700 dark:text-emerald-300'
                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-600'
                        } ${!buyModalListing.deliveryAvailable ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        🚚 Direct Delivery
                      </button>
                    </div>
                  </div>

                  {deliveryType === 'DELIVERY' && (
                    <div>
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                        Delivery Address
                      </label>
                      <input
                        type="text"
                        placeholder="House / Shop address, Pune"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                  )}

                  {/* Price breakdown */}
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1.5">
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                      <span>Harvest Subtotal:</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        ₹{(buyQuantity * buyModalListing.pricePerUnit).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                      <span>Platform Fee (0% Launch):</span>
                      <span className="text-emerald-600 font-bold">₹0.00</span>
                    </div>
                    <div className="flex justify-between text-zinc-900 dark:text-zinc-100 font-bold text-sm pt-1 border-t border-zinc-200 dark:border-zinc-800">
                      <span>Total to Pay:</span>
                      <span className="text-emerald-600">
                        ₹{(buyQuantity * buyModalListing.pricePerUnit).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 pt-1">
                      {deliveryType === 'PICKUP' ? 'Pay upon collection at the farmgate.' : 'Cash on delivery upon inspection.'}
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handlePlaceOrder}
                    disabled={orderSubmitting || buyQuantity <= 0}
                    className="w-full py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition disabled:opacity-50"
                  >
                    {orderSubmitting ? 'Validating Stock & Placing...' : 'Confirm Order'}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Negotiation / Make Offer Modal ─────────────────────────────────── */}
      <AnimatePresence>
        {offerModalListing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setOfferModalListing(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                Propose Price Offer
              </h3>
              <p className="text-xs text-zinc-500 mb-4">
                Listing price: ₹{offerModalListing.pricePerUnit} / {offerModalListing.unit}
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Your Proposed Price (₹ per {offerModalListing.unit})
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Quantity ({offerModalListing.unit})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={offerModalListing.availableQuantity}
                    value={offerQuantity}
                    onChange={(e) => setOfferQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Note to Farmer
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Regular bulk buyer procurement from APMC"
                    value={offerNotes}
                    onChange={(e) => setOfferNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs">
                  <ShieldCheck className="w-4 h-4 inline mr-1 text-amber-600" />
                  Total offer: ₹{(offerPrice * offerQuantity).toFixed(2)}. The farmer can accept, reject, or submit a counter rate.
                </div>

                <button
                  onClick={handleSubmitOffer}
                  disabled={offerSubmitting}
                  className="w-full py-2.5 rounded-xl font-bold text-sm bg-amber-600 hover:bg-amber-700 text-white shadow-md transition disabled:opacity-50"
                >
                  {offerSubmitting ? 'Sending Offer...' : 'Send Offer to Farmer'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
