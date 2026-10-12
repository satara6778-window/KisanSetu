import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { marketplaceApi } from '../services/marketplaceApi';
import type { CropListingDto } from '../services/marketplaceApi';
import { offlineStorage } from '../services/offlineStorage';
import type { OfflineDraft } from '../services/offlineStorage';
import { ImageUploader } from '../components/ImageUploader';
import {
  Plus, WifiOff, RefreshCw, CheckCircle2,
  Package, PauseCircle, PlayCircle, X, Pencil, ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MyListings: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [listings, setListings] = useState<CropListingDto[]>([]);
  const [drafts, setDrafts] = useState<OfflineDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);

  // ── Add Listing Modal state ──────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cropName, setCropName] = useState('');
  const [marathiAlias, setMarathiAlias] = useState('');
  const [hindiAlias, setHindiAlias] = useState('');
  const [category, setCategory] = useState('Vegetables');
  const [availableQuantity, setAvailableQuantity] = useState<number>(100);
  const [unit, setUnit] = useState('kg');
  const [pricePerUnit, setPricePerUnit] = useState<number>(30);
  const [qualityGrade, setQualityGrade] = useState('Grade A');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [pickupAvailable, setPickupAvailable] = useState(true);
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);

  // ── Edit Listing Modal state ─────────────────────────────────────────────
  const [editCrop, setEditCrop] = useState<CropListingDto | null>(null);
  const [editCropName, setEditCropName] = useState('');
  const [editMarathiAlias, setEditMarathiAlias] = useState('');
  const [editHindiAlias, setEditHindiAlias] = useState('');
  const [editCategory, setEditCategory] = useState('Vegetables');
  const [editQuantity, setEditQuantity] = useState<number>(100);
  const [editUnit, setEditUnit] = useState('kg');
  const [editPrice, setEditPrice] = useState<number>(30);
  const [editGrade, setEditGrade] = useState('Grade A');
  const [editDescription, setEditDescription] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editPickup, setEditPickup] = useState(true);
  const [editDelivery, setEditDelivery] = useState(false);
  const [isEditImageUploading, setIsEditImageUploading] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const farmerListings = await marketplaceApi.getFarmerListings(user.id);
      setListings(farmerListings);
      const localDrafts = await offlineStorage.getAllDrafts();
      setDrafts(localDrafts);
    } catch (e: any) {
      console.error('loadData error:', e);
      setLoadError(e?.message ?? 'Failed to load your listings. Is the backend running on port 8080?');
    } finally {
      setLoading(false);
    }
  };

  const resetAddForm = () => {
    setCropName('');
    setMarathiAlias('');
    setHindiAlias('');
    setDescription('');
    setImageUrl('');
    setAvailableQuantity(100);
    setPricePerUnit(30);
    setCategory('Vegetables');
    setUnit('kg');
    setQualityGrade('Grade A');
    setPickupAvailable(true);
    setDeliveryAvailable(false);
  };

  const handleSyncDrafts = async () => {
    setSyncing(true);
    try {
      for (const draft of drafts) {
        await marketplaceApi.createProduct({
          cropName: draft.cropName,
          marathiAlias: draft.marathiAlias,
          hindiAlias: draft.hindiAlias,
          category: draft.category,
          availableQuantity: draft.availableQuantity,
          unit: draft.unit,
          pricePerUnit: draft.pricePerUnit,
          qualityGrade: draft.qualityGrade,
          description: draft.description,
          imageUrl: draft.imageUrl,
          pickupAvailable: draft.pickupAvailable,
          deliveryAvailable: draft.deliveryAvailable,
        });
        await offlineStorage.deleteDraft(draft.localId);
      }
      alert('All offline drafts synchronized to the live marketplace successfully!');
      loadData();
    } catch (err: any) {
      alert('Sync failed: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveListing = async (isOffline: boolean) => {
    if (isSubmitting) return;

    if (!cropName.trim() || pricePerUnit <= 0 || availableQuantity <= 0) {
      alert('Please fill out all required crop details: Name, valid Quantity (> 0), and Price (> 0).');
      return;
    }

    if (!isOffline && user?.role !== 'FARMER') {
      alert(
        `⚠️ Listing Blocked: Only farmers can publish crop listings.\n\n` +
        `Your current account "${user?.fullName}" is a ${user?.role}.\n\n` +
        `Please switch to a Farmer persona (e.g. Ramesh Patil or Suresh Shinde) ` +
        `using the persona switcher in the top bar before publishing.`
      );
      return;
    }

    const defaultImg = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80';
    const payload = {
      cropName: cropName.trim(),
      marathiAlias: marathiAlias.trim() || undefined,
      hindiAlias: hindiAlias.trim() || undefined,
      category,
      availableQuantity,
      unit,
      pricePerUnit,
      qualityGrade,
      description: description.trim() || 'Fresh crop produce',
      imageUrl: imageUrl || defaultImg,
      village: user?.village || 'Manchar',
      pickupAvailable,
      deliveryAvailable,
    };

    if (isOffline) {
      setIsSubmitting(true);
      try {
        await offlineStorage.saveDraft(payload);
        resetAddForm();
        alert('✓ Listing saved locally in IndexedDB as an Offline Draft! (Pending Sync)');
        setIsModalOpen(false);
        await loadData();
      } catch (draftErr: any) {
        alert('Failed to save offline draft: ' + draftErr.message);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await marketplaceApi.createProduct(payload);
      resetAddForm();
      alert(`✓ Crop "${created.cropName}" published to live marketplace successfully!`);
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      console.error('Publish error:', err);

      const is403 = err?.message?.includes('403') ||
                    err?.message?.toLowerCase().includes('forbidden') ||
                    err?.message?.toLowerCase().includes('only farmers');
      if (is403) {
        alert(
          `❌ Authorization Rejected by Server (403 Forbidden)\n\n` +
          `Server says: ${err.message}\n\n` +
          `Your current account token is not recognized as a FARMER by the backend. ` +
          `Please switch to a Farmer persona using the top bar persona switcher and try again.`
        );
        return;
      }

      // Network error — save as offline draft
      try {
        await offlineStorage.saveDraft(payload);
        alert(`Server communication issue: ${err.message}. Saved as offline draft.`);
        setIsModalOpen(false);
        await loadData();
      } catch (draftErr: any) {
        alert(`Publishing failed: ${err.message}. Offline save also failed: ${draftErr.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Edit handlers ────────────────────────────────────────────────────────
  const openEditModal = (crop: CropListingDto) => {
    setEditCrop(crop);
    setEditCropName(crop.cropName);
    setEditMarathiAlias(crop.marathiAlias || '');
    setEditHindiAlias(crop.hindiAlias || '');
    setEditCategory(crop.category);
    setEditQuantity(crop.availableQuantity);
    setEditUnit(crop.unit);
    setEditPrice(crop.pricePerUnit);
    setEditGrade(crop.qualityGrade);
    setEditDescription(crop.description || '');
    setEditImageUrl(crop.imageUrl || '');
    setEditPickup(crop.pickupAvailable);
    setEditDelivery(crop.deliveryAvailable);
  };

  const handleSaveEdit = async () => {
    if (isEditSubmitting || !editCrop) return;

    if (!editCropName.trim() || editPrice <= 0 || editQuantity <= 0) {
      alert('Please fill all required fields: Name, Quantity (> 0), Price (> 0).');
      return;
    }

    setIsEditSubmitting(true);
    try {
      await marketplaceApi.updateListing(editCrop.id, {
        cropName: editCropName.trim(),
        marathiAlias: editMarathiAlias.trim() || undefined,
        hindiAlias: editHindiAlias.trim() || undefined,
        category: editCategory,
        availableQuantity: editQuantity,
        unit: editUnit,
        pricePerUnit: editPrice,
        qualityGrade: editGrade,
        description: editDescription.trim() || undefined,
        imageUrl: editImageUrl || undefined,
        village: editCrop.village,
        pickupAvailable: editPickup,
        deliveryAvailable: editDelivery,
      });
      alert(`✓ Listing "${editCropName}" updated successfully!`);
      setEditCrop(null);
      await loadData();
    } catch (err: any) {
      alert(`Failed to update listing: ${err.message}`);
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleToggleStatus = async (crop: CropListingDto) => {
    const nextStatus = crop.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await marketplaceApi.updateProductStatus(crop.id, nextStatus);
      loadData();
    } catch {
      setListings(prev => prev.map(c => c.id === crop.id ? { ...c, status: nextStatus as any } : c));
    }
  };

  // ── Shared form field classes ─────────────────────────────────────────────
  const inputCls = 'w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100';
  const inputSmCls = 'w-full px-2 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100';
  const labelCls = 'text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-600" />
            {t('navMyListings')}
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage your crop inventory, adjust selling rates, and synchronize offline drafts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {drafts.length > 0 && (
            <button
              onClick={handleSyncDrafts}
              disabled={syncing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              Sync Drafts ({drafts.length})
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            {t('createListingTitle')}
          </button>
        </div>
      </div>

      {/* Offline Drafts Alert */}
      {drafts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-white">
              <WifiOff className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                You have {drafts.length} offline listing drafts pending server sync
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                Saved securely in browser IndexedDB memory. Click Sync when internet is restored.
              </p>
            </div>
          </div>
          <button
            onClick={handleSyncDrafts}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 transition"
          >
            Upload Now
          </button>
        </div>
      )}

      {/* Listings Grid */}
      {loading ? (
        <div className="h-48 rounded-2xl bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((crop) => (
            <motion.div
              key={crop.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3">
                {/* Crop image */}
                <div className="relative">
                  <img
                    src={crop.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80'}
                    alt={crop.cropName}
                    className="w-14 h-14 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800"
                  />
                  {!crop.imageUrl && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                      <ImageIcon className="w-5 h-5 text-zinc-400" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {crop.cropName}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      crop.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}>
                      {crop.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 truncate mt-0.5">
                    {crop.category} · {crop.qualityGrade}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 text-xs">
                <div>
                  <span className="text-zinc-400 block text-[10px]">Price:</span>
                  <span className="font-extrabold text-zinc-900 dark:text-zinc-100">
                    ₹{crop.pricePerUnit} / {crop.unit}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px]">Stock Left:</span>
                  <span className="font-extrabold text-emerald-600">
                    {crop.availableQuantity} {crop.unit}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                {/* Edit Button */}
                <button
                  onClick={() => openEditModal(crop)}
                  className="flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 flex items-center justify-center gap-1.5 text-blue-600 dark:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 transition"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
                {/* Pause / Activate */}
                <button
                  onClick={() => handleToggleStatus(crop)}
                  className="flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center gap-1.5 text-zinc-700 dark:text-zinc-300 transition"
                >
                  {crop.status === 'ACTIVE' ? (
                    <>
                      <PauseCircle className="w-3.5 h-3.5 text-amber-500" />
                      Pause
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-3.5 h-3.5 text-emerald-500" />
                      Activate
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : loadError ? (
        <div className="p-8 text-center rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20">
          <Package className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-sm font-bold text-red-700 dark:text-red-300 mb-1">Could not load your listings</p>
          <p className="text-xs text-red-600 dark:text-red-400 mb-4 max-w-sm mx-auto">{loadError}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60">
          <Package className="w-10 h-10 text-zinc-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-zinc-600">No crops listed yet. Click "+ Add Crop Harvest" above!</p>
        </div>
      )}

      {/* ── Add New Crop Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative my-8"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                {t('createListingTitle')}
              </h3>
              <p className="text-xs text-zinc-500 mb-4">
                {t('createListingSubtitle')}
              </p>

              <div className="space-y-3.5 max-h-[72vh] overflow-y-auto pr-1">
                {/* ── Photo Upload ──────────────────────────────────────────── */}
                <ImageUploader
                  value={imageUrl}
                  onChange={setImageUrl}
                  label="Crop Photo (Upload from computer or take photo)"
                  onUploadingChange={setIsImageUploading}
                />

                <div>
                  <label className={labelCls}>{t('cropNameLabel')} *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Farm-Fresh Tomatoes"
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className={inputCls}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>{t('marathiAliasLabel')}</label>
                    <input
                      type="text"
                      placeholder="उदा. टोमॅटो, कांदा"
                      value={marathiAlias}
                      onChange={(e) => setMarathiAlias(e.target.value)}
                      className={inputSmCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>{t('hindiAliasLabel')}</label>
                    <input
                      type="text"
                      placeholder="उदा. टमाटर, प्याज"
                      value={hindiAlias}
                      onChange={(e) => setHindiAlias(e.target.value)}
                      className={inputSmCls}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className={labelCls}>{t('categoryLabel')}</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={inputSmCls}
                    >
                      <option value="Vegetables">Vegetables</option>
                      <option value="Fruits">Fruits</option>
                      <option value="Grains">Grains</option>
                      <option value="Spices">Spices</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>{t('quantityLabel')} *</label>
                    <input
                      type="number"
                      min="1"
                      value={availableQuantity}
                      onChange={(e) => setAvailableQuantity(Number(e.target.value))}
                      className={inputSmCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>{t('unitLabel')}</label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className={inputSmCls}
                    >
                      <option value="kg">kg</option>
                      <option value="Quintal">Quintal</option>
                      <option value="Tonne">Tonne</option>
                      <option value="Crate">Crate</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>{t('priceLabel')} *</label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      value={pricePerUnit}
                      onChange={(e) => setPricePerUnit(Number(e.target.value))}
                      className={inputSmCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>{t('qualityGrade')}</label>
                    <select
                      value={qualityGrade}
                      onChange={(e) => setQualityGrade(e.target.value)}
                      className={inputSmCls}
                    >
                      <option value="Grade A">Grade A</option>
                      <option value="Grade B">Grade B</option>
                      <option value="Premium">Premium</option>
                      <option value="Organic">Organic</option>
                    </select>
                  </div>
                </div>

                {/* Mandi Benchmark Alert */}
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-[11px] text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />
                  <strong>{t('mandiBenchmarkNotice')}</strong> Pune APMC modal benchmark rate is approx ₹25.00/kg.
                </div>

                <div>
                  <label className={labelCls}>Crop Description</label>
                  <textarea
                    rows={2}
                    placeholder="Details on variety, freshness, fertilizer usage..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={inputCls}
                  />
                </div>

                <div className="flex gap-4 pt-1 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer text-zinc-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={pickupAvailable}
                      onChange={(e) => setPickupAvailable(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    {t('pickupOption')}
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-zinc-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={deliveryAvailable}
                      onChange={(e) => setDeliveryAvailable(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    {t('deliveryOption')}
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    disabled={isSubmitting || isImageUploading}
                    onClick={() => handleSaveListing(true)}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                  >
                    <WifiOff className="w-3.5 h-3.5 text-zinc-500" />
                    {isSubmitting ? 'Processing...' : t('saveDraftOffline')}
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting || isImageUploading}
                    onClick={() => handleSaveListing(false)}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
                    {isImageUploading ? 'Uploading Photo…' : isSubmitting ? 'Publishing...' : t('publishListing')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Edit Listing Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {editCrop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative my-8"
            >
              <button
                onClick={() => setEditCrop(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-2">
                <Pencil className="w-4 h-4 text-blue-500" />
                Edit Listing
              </h3>
              <p className="text-xs text-zinc-500 mb-4">
                Update crop details, price, or replace the photo — changes go live immediately.
              </p>

              <div className="space-y-3.5 max-h-[72vh] overflow-y-auto pr-1">
                {/* ── Photo Upload ──────────────────────────────────────────── */}
                <ImageUploader
                  value={editImageUrl}
                  onChange={setEditImageUrl}
                  label="Crop Photo — Upload from computer or take a new photo"
                  onUploadingChange={setIsEditImageUploading}
                />

                <div>
                  <label className={labelCls}>Crop Name *</label>
                  <input
                    type="text"
                    value={editCropName}
                    onChange={(e) => setEditCropName(e.target.value)}
                    className={inputCls}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>Marathi Name</label>
                    <input
                      type="text"
                      placeholder="उदा. टोमॅटो"
                      value={editMarathiAlias}
                      onChange={(e) => setEditMarathiAlias(e.target.value)}
                      className={inputSmCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Hindi Name</label>
                    <input
                      type="text"
                      placeholder="उदा. टमाटर"
                      value={editHindiAlias}
                      onChange={(e) => setEditHindiAlias(e.target.value)}
                      className={inputSmCls}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className={labelCls}>Category</label>
                    <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className={inputSmCls}>
                      <option value="Vegetables">Vegetables</option>
                      <option value="Fruits">Fruits</option>
                      <option value="Grains">Grains</option>
                      <option value="Spices">Spices</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Quantity *</label>
                    <input
                      type="number"
                      min="1"
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(Number(e.target.value))}
                      className={inputSmCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Unit</label>
                    <select value={editUnit} onChange={(e) => setEditUnit(e.target.value)} className={inputSmCls}>
                      <option value="kg">kg</option>
                      <option value="Quintal">Quintal</option>
                      <option value="Tonne">Tonne</option>
                      <option value="Crate">Crate</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>Price / Unit (₹) *</label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      value={editPrice}
                      onChange={(e) => setEditPrice(Number(e.target.value))}
                      className={inputSmCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Quality Grade</label>
                    <select value={editGrade} onChange={(e) => setEditGrade(e.target.value)} className={inputSmCls}>
                      <option value="Grade A">Grade A</option>
                      <option value="Grade B">Grade B</option>
                      <option value="Premium">Premium</option>
                      <option value="Organic">Organic</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Description</label>
                  <textarea
                    rows={2}
                    placeholder="Details on variety, freshness..."
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className={inputCls}
                  />
                </div>

                <div className="flex gap-4 pt-1 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer text-zinc-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={editPickup}
                      onChange={(e) => setEditPickup(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    Pickup Available
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-zinc-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={editDelivery}
                      onChange={(e) => setEditDelivery(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    Delivery Available
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setEditCrop(null)}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-1.5 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isEditSubmitting || isEditImageUploading}
                    onClick={handleSaveEdit}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isEditSubmitting ? 'animate-spin' : ''}`} />
                    {isEditImageUploading ? 'Uploading Photo…' : isEditSubmitting ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
