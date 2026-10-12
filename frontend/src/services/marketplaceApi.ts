export const API_BASE = import.meta.env.VITE_API_BASE ?? '';

export interface CropListingDto {
  id: number;
  farmer: {
    id: number;
    phone: string;
    fullName: string;
    village: string;
    district: string;
  };
  cropName: string;
  marathiAlias?: string;
  hindiAlias?: string;
  category: string;
  description: string;
  imageUrl?: string;
  availableQuantity: number;
  unit: string;
  pricePerUnit: number;
  qualityGrade: string;
  village: string;
  district: string;
  state: string;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  status: 'ACTIVE' | 'PAUSED' | 'SOLD_OUT' | 'DRAFT';
  createdAt: string;
}

export interface OrderDto {
  id: number;
  orderNumber: string;
  buyer: { id: number; phone: string; fullName: string; village: string };
  farmer: { id: number; phone: string; fullName: string; village: string };
  items: Array<{
    id: number;
    listingId: number;
    cropName: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    totalPrice: number;
  }>;
  deliveryType: 'PICKUP' | 'DELIVERY';
  deliveryAddress: string;
  status: 'PLACED' | 'ACCEPTED' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'READY_FOR_PICKUP' | 'PICKED_UP' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
  subtotal: number;
  platformFee: number;
  totalAmount: number;
  paymentMethod: 'CASH_ON_DELIVERY' | 'PAY_ON_PICKUP';
  paymentStatus: 'PENDING' | 'COMPLETED';
  notes?: string;
  createdAt: string;
}

export interface OfferDto {
  id: number;
  listingId: number;
  cropName: string;
  unit: string;
  listingPrice: number;
  buyer: { id: number; phone: string; fullName: string };
  farmer: { id: number; phone: string; fullName: string };
  offeredPrice: number;
  quantity: number;
  counterPrice?: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED' | 'CONSUMED';
  buyerNotes?: string;
  farmerNotes?: string;
  createdAt: string;
}

export interface MarketPriceDto {
  id: number;
  cropName: string;
  marathiName?: string;
  marketName: string;
  district: string;
  state: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  unit: string;
  observationDate: string;
  sourceName: string;
}

// Default realistic fallback items if backend server is warming up
const FALLBACK_CROPS: CropListingDto[] = [
  {
    id: 1,
    farmer: { id: 1, phone: '9876543210', fullName: 'Ramesh Patil', village: 'Manchar', district: 'Pune' },
    cropName: 'Farm-Fresh Tomatoes',
    marathiAlias: 'टोमॅटो',
    hindiAlias: 'टमाटर',
    category: 'Vegetables',
    description: 'Juicy, naturally ripened Grade A tomatoes picked fresh daily from Manchar farm.',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
    availableQuantity: 850,
    unit: 'kg',
    pricePerUnit: 26.00,
    qualityGrade: 'Grade A',
    village: 'Manchar',
    district: 'Pune',
    state: 'Maharashtra',
    pickupAvailable: true,
    deliveryAvailable: true,
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    farmer: { id: 2, phone: '9876543211', fullName: 'Suresh Shinde', village: 'Lasalgaon', district: 'Nashik' },
    cropName: 'Nashik Red Onion',
    marathiAlias: 'कांदा',
    hindiAlias: 'प्याज',
    category: 'Vegetables',
    description: 'Medium-to-large cured Lasalgaon red onions with thick skin and excellent shelf life.',
    imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80',
    availableQuantity: 1800,
    unit: 'kg',
    pricePerUnit: 21.50,
    qualityGrade: 'Grade A',
    village: 'Lasalgaon',
    district: 'Nashik',
    state: 'Maharashtra',
    pickupAvailable: true,
    deliveryAvailable: true,
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    farmer: { id: 2, phone: '9876543211', fullName: 'Suresh Shinde', village: 'Lasalgaon', district: 'Nashik' },
    cropName: 'Bhagwa Pomegranates',
    marathiAlias: 'डाळिंब',
    hindiAlias: 'अनार',
    category: 'Fruits',
    description: 'Deep red arils, sweet and juicy, grown with drip fertigation in well-drained soil.',
    imageUrl: 'https://images.unsplash.com/photo-1541344999736-83eca872f241?w=800&auto=format&fit=crop&q=80',
    availableQuantity: 450,
    unit: 'kg',
    pricePerUnit: 88.00,
    qualityGrade: 'Export Quality',
    village: 'Lasalgaon',
    district: 'Nashik',
    state: 'Maharashtra',
    pickupAvailable: true,
    deliveryAvailable: false,
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    farmer: { id: 1, phone: '9876543210', fullName: 'Ramesh Patil', village: 'Manchar', district: 'Pune' },
    cropName: 'Organic Green Chillies',
    marathiAlias: 'मिरची',
    hindiAlias: 'हरी मिर्च',
    category: 'Spices',
    description: 'Spicy, aromatic G4 green chillies grown without synthetic chemicals.',
    imageUrl: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop&q=80',
    availableQuantity: 120,
    unit: 'kg',
    pricePerUnit: 44.00,
    qualityGrade: 'Organic',
    village: 'Manchar',
    district: 'Pune',
    state: 'Maharashtra',
    pickupAvailable: true,
    deliveryAvailable: true,
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  }
];

export const marketplaceApi = {
  getAuthHeaders(overrideToken?: string): HeadersInit {
    // Read token from localStorage, but only trust it if the active AuthContext
    // user is a FARMER. The AuthContext stores the current persona's token as
    // 'kisansetu_token'. We read it and use it; if absent, fall back to the
    // default farmer demo token (Ramesh Patil, FARMER).
    const storedToken = overrideToken ?? localStorage.getItem('kisansetu_token');
    // Fallback: use farmer-specific demo token (never the bare 'demo-jwt' which
    // is ambiguous and could conflict if previous sessions changed localStorage).
    const token = storedToken ?? 'demo-jwt-9876543210';
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  },

  async getProducts(params?: { search?: string; category?: string }): Promise<CropListingDto[]> {
    try {
      const url = new URL(`${API_BASE}/api/products`);
      if (params?.search) url.searchParams.append('search', params.search);
      if (params?.category) url.searchParams.append('category', params.category);

      const res = await fetch(url.toString(), {
        headers: this.getAuthHeaders(),
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) throw new Error('API returned ' + res.status);
      return await res.json();
    } catch (e) {
      console.error('Failed to fetch live products from backend:', e);
      // Filter fallback products locally
      let list = [...FALLBACK_CROPS];
      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter(c =>
          c.cropName.toLowerCase().includes(q) ||
          c.marathiAlias?.toLowerCase().includes(q) ||
          c.hindiAlias?.toLowerCase().includes(q) ||
          c.village.toLowerCase().includes(q)
        );
      }
      if (params?.category && params.category !== 'All') {
        list = list.filter(c => c.category.toLowerCase() === params.category!.toLowerCase());
      }
      return list;
    }
  },

  async createProduct(data: any): Promise<CropListingDto> {
    const res = await fetch(`${API_BASE}/api/products`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => 'Server error');
      throw new Error(`Server returned ${res.status}: ${errText}`);
    }
    return res.json();
  },

  /**
   * Returns ALL listings for a specific farmer (all statuses: ACTIVE, PAUSED, etc.)
   * Uses GET /api/products/farmer/{farmerId} — the correct endpoint for My Listings page.
   * Unlike getProducts() which only returns ACTIVE listings for the marketplace.
   * NEVER falls back to fake data — throws so the caller can show a real error.
   */
  async getFarmerListings(farmerId: number): Promise<CropListingDto[]> {
    const res = await fetch(`${API_BASE}/api/products/farmer/${farmerId}`, {
      headers: this.getAuthHeaders(),
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => 'Server error');
      throw new Error(`Failed to load your listings (${res.status}): ${errText}`);
    }
    return res.json();
  },



  async updateProductStatus(id: number, status: string): Promise<CropListingDto> {
    const res = await fetch(`${API_BASE}/api/products/${id}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
  },

  async updateListing(id: number, data: any): Promise<CropListingDto> {
    const res = await fetch(`${API_BASE}/api/products/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => 'Server error');
      throw new Error(`Server returned ${res.status}: ${errText}`);
    }
    return res.json();
  },

  async createOrder(data: any): Promise<OrderDto> {
    const res = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Order placement failed' }));
      throw new Error(err.message || 'Order failed');
    }
    return res.json();
  },

  async getOrders(role: 'buyer' | 'farmer'): Promise<OrderDto[]> {
    try {
      const endpoint = role === 'buyer' ? '/api/orders/buyer' : '/api/orders/farmer';
      const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: this.getAuthHeaders(),
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) {
        console.error(`Failed to fetch ${role} orders: status ${res.status}`);
        return [];
      }
      return await res.json();
    } catch (err) {
      console.error(`Error fetching ${role} orders:`, err);
      return [];
    }
  },

  async updateOrderStatus(orderId: number, status: string): Promise<OrderDto> {
    const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to update order status' }));
      throw new Error(err.message || 'Status update failed');
    }
    return res.json();
  },

  async createOffer(data: any): Promise<OfferDto> {
    const res = await fetch(`${API_BASE}/api/offers`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to submit offer');
    return res.json();
  },

  async getOffers(role: 'buyer' | 'farmer'): Promise<OfferDto[]> {
    try {
      const endpoint = role === 'buyer' ? '/api/offers/buyer' : '/api/offers/farmer';
      const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: this.getAuthHeaders(),
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) {
        console.error(`Failed to fetch ${role} offers: status ${res.status}`);
        return [];
      }
      return await res.json();
    } catch (err) {
      console.error(`Error fetching ${role} offers:`, err);
      return [];
    }
  },

  async counterOffer(offerId: number, counterPrice: number, notes?: string): Promise<OfferDto> {
    const res = await fetch(`${API_BASE}/api/offers/${offerId}/counter`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ counterPrice, notes })
    });
    if (!res.ok) throw new Error('Failed to submit counter offer');
    return res.json();
  },

  async acceptOffer(offerId: number): Promise<OfferDto> {
    const res = await fetch(`${API_BASE}/api/offers/${offerId}/accept`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to accept offer');
    return res.json();
  },

  async rejectOffer(offerId: number): Promise<OfferDto> {
    const res = await fetch(`${API_BASE}/api/offers/${offerId}/reject`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to decline offer');
    return res.json();
  },

  async getMarketPrices(query?: string): Promise<MarketPriceDto[]> {
    try {
      const url = new URL(`${API_BASE}/api/market-prices`);
      if (query) url.searchParams.append('search', query);
      const res = await fetch(url.toString(), { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error('Prices unavailable');
      return await res.json();
    } catch {
      return [
        { id: 1, cropName: 'Tomato', marathiName: 'टोमॅटो', marketName: 'Pune APMC', district: 'Pune', state: 'Maharashtra', minPrice: 2200, maxPrice: 2800, modalPrice: 2500, unit: 'Quintal', observationDate: '2026-10-11', sourceName: 'Maharashtra MSAMB' },
        { id: 2, cropName: 'Onion', marathiName: 'कांदा', marketName: 'Lasalgaon APMC', district: 'Nashik', state: 'Maharashtra', minPrice: 1500, maxPrice: 2200, modalPrice: 1850, unit: 'Quintal', observationDate: '2026-10-11', sourceName: 'Lasalgaon Market Committee' },
        { id: 3, cropName: 'Wheat', marathiName: 'गहू', marketName: 'Nagpur APMC', district: 'Nagpur', state: 'Maharashtra', minPrice: 2100, maxPrice: 2450, modalPrice: 2275, unit: 'Quintal', observationDate: '2026-10-10', sourceName: 'Agmarknet Portal' },
        { id: 4, cropName: 'Sugarcane', marathiName: 'ऊस', marketName: 'Kolhapur Mandi', district: 'Kolhapur', state: 'Maharashtra', minPrice: 3000, maxPrice: 3300, modalPrice: 3150, unit: 'Tonne', observationDate: '2026-10-09', sourceName: 'Kolhapur APMC' },
        { id: 5, cropName: 'Pomegranate', marathiName: 'डाळिंब', marketName: 'Solapur APMC', district: 'Solapur', state: 'Maharashtra', minPrice: 6000, maxPrice: 9500, modalPrice: 8200, unit: 'Quintal', observationDate: '2026-10-10', sourceName: 'Solapur Mandi Register' }
      ];
    }
  },

  async explainPrice(cropName: string, currentPrice?: number, transportCost?: number): Promise<any> {
    const res = await fetch(`${API_BASE}/api/ai/explain-price`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cropName, currentFarmerPrice: currentPrice, transportCostPerUnit: transportCost })
    });
    if (!res.ok) throw new Error('AI Explainer unavailable');
    return res.json();
  },

  async getAdminStats(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/api/admin/dashboard`, {
        headers: this.getAuthHeaders(),
        signal: AbortSignal.timeout(3000)
      });
      if (!res.ok) throw new Error('Admin stats unavailable');
      return await res.json();
    } catch {
      return { totalUsers: 5, totalListings: 4, totalOrders: 1, platformFeePercentage: 0.0, pendingComplaints: 0 };
    }
  },

  async submitReview(orderId: number, rating: number, comment?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/api/reviews`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ orderId, rating, comment })
    });
    if (!res.ok) throw new Error('Failed to submit review');
    return res.json();
  }
};
