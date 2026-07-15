'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import { useAuthStore } from './store';

// --- Public config (shop info, TeleBirr/CBE display, Maps key) ---------
export function usePublicConfig() {
  return useQuery({
    queryKey: ['public-config'],
    queryFn: () => api.get('/api/config/public').then((d) => d.config),
    staleTime: 5 * 60 * 1000,
  });
}

// --- Products -------------------------------------------------------------
export function useProducts(params = {}) {
  const search = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
  ).toString();
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => api.get(`/api/products${search ? `?${search}` : ''}`),
    keepPreviousData: true,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products-featured'],
    queryFn: () => api.get('/api/products/featured'),
  });
}

export function useProductBySlug(slug) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => api.get(`/api/products/slug/${slug}`).then((d) => d.product),
    enabled: Boolean(slug),
  });
}

export function useRelatedProducts(productId) {
  return useQuery({
    queryKey: ['related', productId],
    queryFn: () => api.get(`/api/products/${productId}/related`).then((d) => d.products),
    enabled: Boolean(productId),
  });
}

export function useFacets() {
  return useQuery({
    queryKey: ['facets'],
    queryFn: () => api.get('/api/products/facets').then((d) => d.facets),
    staleTime: 10 * 60 * 1000,
  });
}

export function useSubmitReview(productId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (review) => api.post(`/api/products/${productId}/reviews`, review),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['product'] }),
  });
}

// --- Wishlist (logged-in only) --------------------------------------------
export function useWishlist() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: () => api.get('/api/auth/wishlist').then((d) => d.wishlist),
    enabled: Boolean(token),
  });
}

export function useToggleWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId) => api.post(`/api/auth/wishlist/${productId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
  });
}

// --- Banners ----------------------------------------------------------
export function useActiveBanners() {
  return useQuery({
    queryKey: ['banners-active'],
    queryFn: () => api.get('/api/banners').then((d) => d.banners),
  });
}

// --- Orders (customer-facing) --------------------------------------------
export function useCreateOrder() {
  return useMutation({
    mutationFn: (formData) => api.post('/api/orders', formData, { isFormData: true }),
  });
}

export function useTrackOrder(orderNumber, phone, enabled) {
  return useQuery({
    queryKey: ['track-order', orderNumber, phone],
    queryFn: () =>
      api
        .get(`/api/orders/track?orderNumber=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(phone)}`)
        .then((d) => d.order),
    enabled: Boolean(enabled),
    retry: false,
  });
}

export function useMyOrders() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.get('/api/orders/my').then((d) => d.orders),
    enabled: Boolean(token),
  });
}

// --- Admin: orders --------------------------------------------------------
export function useAdminOrders(params = {}) {
  const search = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
  ).toString();
  return useQuery({
    queryKey: ['admin-orders', params],
    queryFn: () => api.get(`/api/orders${search ? `?${search}` : ''}`),
    keepPreviousData: true,
  });
}

export function useConfirmPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId) => api.put(`/api/orders/${orderId}/confirm-payment`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders'] }),
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, orderStatus, note, cancelReason }) =>
      api.put(`/api/orders/${orderId}/status`, { orderStatus, note, cancelReason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders'] }),
  });
}

export function useAssignDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, name, phone }) => api.put(`/api/orders/${orderId}/assign-driver`, { name, phone }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders'] }),
  });
}

// --- Admin: dashboard / products / banners -------------------------------
export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/api/admin/stats').then((d) => d.stats),
    refetchInterval: 60 * 1000,
  });
}

export function useAdminCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => api.post('/api/products', formData, { isFormData: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useAdminUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => api.put(`/api/products/${id}`, formData, { isFormData: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useAdminDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.del(`/api/products/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useAdminBanners() {
  return useQuery({
    queryKey: ['admin-banners'],
    queryFn: () => api.get('/api/admin/banners').then((d) => d.banners),
  });
}

export function useAdminCreateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => api.post('/api/admin/banners', formData, { isFormData: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-banners'] }),
  });
}

export function useAdminUpdateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => api.put(`/api/admin/banners/${id}`, formData, { isFormData: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-banners'] }),
  });
}

export function useAdminDeleteBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.del(`/api/admin/banners/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-banners'] }),
  });
}

// --- Newsletter -----------------------------------------------------------
export function useSubscribeNewsletter() {
  return useMutation({
    mutationFn: (email) => api.post('/api/newsletter/subscribe', { email }, { auth: false }),
  });
}

// --- Auth: login / register ------------------------------------------
export function useLogin() {
  return useMutation({
    mutationFn: ({ phone, password }) => api.post('/api/auth/login', { phone, password }, { auth: false }),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: ({ name, phone, password, email }) =>
      api.post('/api/auth/register', { name, phone, password, email }, { auth: false }),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (updates) => api.put('/api/auth/me', updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });
}

export function useAddAddress() {
  return useMutation({
    mutationFn: (address) => api.post('/api/auth/addresses', address),
  });
}

export function useDeleteAddress() {
  return useMutation({
    mutationFn: (addressId) => api.del(`/api/auth/addresses/${addressId}`),
  });
}

export function useMe() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/api/auth/me').then((d) => d.user),
    enabled: Boolean(token),
    retry: false,
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }) => api.put('/api/auth/password', { currentPassword, newPassword }),
  });
}

// --- Realtime admin order notifications ------------------------------
// Connects to the backend's socket.io server, authenticates as an admin,
// and invalidates the orders/stats queries (plus shows a toast) whenever
// a new order comes in — so the dashboard updates instantly without a
// manual refresh.
export function useAdminRealtimeOrders({ onNewOrder } = {}) {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();

  useEffect(() => {
    if (!token) return undefined;
    let socket;
    let cancelled = false;

    import('socket.io-client').then(({ io }) => {
      if (cancelled) return;
      socket = io(api.base, { transports: ['websocket', 'polling'] });
      socket.on('connect', () => socket.emit('join_admin', token));
      socket.on('new_order', (order) => {
        qc.invalidateQueries({ queryKey: ['admin-orders'] });
        qc.invalidateQueries({ queryKey: ['admin-stats'] });
        onNewOrder?.(order);
      });
    });

    return () => {
      cancelled = true;
      socket?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);
}
