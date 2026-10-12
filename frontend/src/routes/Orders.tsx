import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { marketplaceApi } from '../services/marketplaceApi';
import type { OrderDto } from '../services/marketplaceApi';
import {
  Truck, CheckCircle2, Clock, Star,
  ChevronRight, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Orders: React.FC = () => {
  const { t } = useLanguage();
  const { user, role } = useAuth();

  const [activeTab, setActiveTab] = useState<'buyer' | 'farmer'>(role === 'FARMER' ? 'farmer' : 'buyer');
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [reviewOrder, setReviewOrder] = useState<OrderDto | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [activeTab, user]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await marketplaceApi.getOrders(activeTab);
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceStatus = async (orderId: number, nextStatus: string) => {
    try {
      await marketplaceApi.updateOrderStatus(orderId, nextStatus);
      loadOrders();
    } catch (err: any) {
      alert('Status advance error: ' + err.message);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewOrder) return;
    setSubmittingReview(true);
    try {
      await marketplaceApi.submitReview(reviewOrder.id, rating, reviewComment);
      alert('Thank you! Your verified rating and review have been recorded.');
      setReviewOrder(null);
    } catch (err: any) {
      alert('Review error: ' + err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const deliverySteps = ['PLACED', 'ACCEPTED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'COMPLETED'];
  const pickupSteps = ['PLACED', 'ACCEPTED', 'CONFIRMED', 'PACKED', 'READY_FOR_PICKUP', 'PICKED_UP', 'COMPLETED'];

  const getStepIndex = (status: string, isPickup: boolean) => {
    const list = isPickup ? pickupSteps : deliverySteps;
    return list.indexOf(status);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Truck className="w-6 h-6 text-emerald-600" />
          {t('ordersTitle')}
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          {t('ordersSubtitle')}
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
          My Purchases (Buyer)
        </button>
        <button
          onClick={() => setActiveTab('farmer')}
          className={`py-2.5 px-5 text-xs font-bold border-b-2 transition ${
            activeTab === 'farmer'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Incoming Orders to Fulfil (Farmer)
        </button>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="h-40 rounded-2xl bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => {
            const isPickup = order.deliveryType === 'PICKUP';
            const steps = isPickup ? pickupSteps : deliverySteps;
            const currentIdx = getStepIndex(order.status, isPickup);

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-4"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <div>
                    <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                      {order.orderNumber}
                    </span>
                    <span className="text-[11px] text-zinc-400 ml-2">
                      · {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                      {order.deliveryType} · {order.paymentMethod === 'PAY_ON_PICKUP' ? 'Pay on Pickup' : 'Cash on Delivery'}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Items & Participants */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-400 block mb-1">Items in this order:</span>
                    {order.items?.map((it) => (
                      <div key={it.id} className="flex justify-between font-semibold text-zinc-800 dark:text-zinc-200 py-0.5">
                        <span>{it.quantity} {it.unit} of {it.cropName}</span>
                        <span>₹{it.totalPrice}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-extrabold text-emerald-600 pt-1 text-sm">
                      <span>Total Amount:</span>
                      <span>₹{order.totalAmount}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-400 block">Participants & Location:</span>
                    <p className="text-zinc-700 dark:text-zinc-300">
                      <strong>Farmer:</strong> {order.farmer?.fullName} ({order.farmer?.village})
                    </p>
                    <p className="text-zinc-700 dark:text-zinc-300">
                      <strong>Buyer:</strong> {order.buyer?.fullName} ({order.buyer?.village})
                    </p>
                    {order.deliveryAddress && (
                      <p className="text-zinc-500">
                        <strong>Delivery Destination:</strong> {order.deliveryAddress}
                      </p>
                    )}
                  </div>
                </div>

                {/* Strict Lifecycle Stepper */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                    Order Fulfilment Sequence
                  </span>
                  <div className="flex items-center gap-1 overflow-x-auto pb-2">
                    {steps.map((st, idx) => {
                      const isDone = currentIdx >= idx;
                      const isCurrent = currentIdx === idx;
                      return (
                        <React.Fragment key={st}>
                          <div
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition ${
                              isCurrent
                                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20'
                                : isDone
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-400'
                            }`}
                          >
                            {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                            <span>{st.replace(/_/g, ' ')}</span>
                          </div>
                          {idx < steps.length - 1 && (
                            <ChevronRight className="w-3 h-3 text-zinc-300 flex-shrink-0" />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* Status Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  {/* Farmer Actions */}
                  {order.status === 'PLACED' && activeTab === 'farmer' && (
                    <button
                      onClick={() => handleAdvanceStatus(order.id, 'ACCEPTED')}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
                    >
                      ✓ {t('actionAccept')}
                    </button>
                  )}
                  {order.status === 'ACCEPTED' && activeTab === 'farmer' && (
                    <button
                      onClick={() => handleAdvanceStatus(order.id, 'CONFIRMED')}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
                    >
                      Confirm Availability
                    </button>
                  )}
                  {order.status === 'CONFIRMED' && activeTab === 'farmer' && (
                    <button
                      onClick={() => handleAdvanceStatus(order.id, 'PACKED')}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
                    >
                      📦 {t('actionPack')}
                    </button>
                  )}
                  {order.status === 'PACKED' && activeTab === 'farmer' && (
                    <button
                      onClick={() => handleAdvanceStatus(order.id, isPickup ? 'READY_FOR_PICKUP' : 'SHIPPED')}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
                    >
                      🚚 {t('actionShip')}
                    </button>
                  )}

                  {/* Buyer Actions */}
                  {order.status === 'SHIPPED' && activeTab === 'buyer' && (
                    <button
                      onClick={() => handleAdvanceStatus(order.id, 'DELIVERED')}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
                    >
                      ✓ Confirm Delivery Arrival
                    </button>
                  )}
                  {order.status === 'READY_FOR_PICKUP' && activeTab === 'buyer' && (
                    <button
                      onClick={() => handleAdvanceStatus(order.id, 'PICKED_UP')}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
                    >
                      ✓ Confirm Farmgate Pickup
                    </button>
                  )}
                  {(order.status === 'DELIVERED' || order.status === 'PICKED_UP') && activeTab === 'buyer' && (
                    <button
                      onClick={() => handleAdvanceStatus(order.id, 'COMPLETED')}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
                    >
                      ✓ {t('actionConfirmReceipt')}
                    </button>
                  )}

                  {/* Review Button */}
                  {order.status === 'COMPLETED' && activeTab === 'buyer' && (
                    <button
                      onClick={() => setReviewOrder(order)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition flex items-center gap-1"
                    >
                      <Star className="w-3.5 h-3.5 fill-white" />
                      {t('leaveReview')}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60">
          <Clock className="w-10 h-10 text-zinc-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-zinc-600">No {activeTab} orders found at this moment.</p>
        </div>
      )}

      {/* ── Rating & Review Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {reviewOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setReviewOrder(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                Rate Your Harvest Experience
              </h3>
              <p className="text-xs text-zinc-500 mb-4">
                Order #{reviewOrder.orderNumber} · Farmer: {reviewOrder.farmer?.fullName}
              </p>

              <div className="space-y-4">
                {/* 5-Star selector */}
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                    Rating (1 to 5 Stars)
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 text-2xl transition"
                      >
                        <Star className={`w-6 h-6 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Your Review & Comments
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Share feedback on freshness, sweetness, weight accuracy..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className="w-full py-2.5 rounded-xl font-bold text-sm bg-amber-600 hover:bg-amber-700 text-white shadow-md transition disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting Review...' : 'Publish Rating'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
