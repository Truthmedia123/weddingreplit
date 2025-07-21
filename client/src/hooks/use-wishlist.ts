import { useState, useEffect } from 'react';
import type { Vendor } from '@shared/schema';

const WISHLIST_KEY = 'thegoangwedding_wishlist';

export interface WishlistItem {
  vendor: Vendor;
  addedAt: string;
  category: string;
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(WISHLIST_KEY);
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse wishlist from localStorage:', error);
        localStorage.removeItem(WISHLIST_KEY);
      }
    }
  }, []);

  const saveWishlist = (newWishlist: WishlistItem[]) => {
    setWishlist(newWishlist);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(newWishlist));
  };

  const addToWishlist = (vendor: Vendor) => {
    const newItem: WishlistItem = {
      vendor,
      addedAt: new Date().toISOString(),
      category: vendor.category
    };
    
    const newWishlist = [...wishlist.filter(item => item.vendor.id !== vendor.id), newItem];
    saveWishlist(newWishlist);
  };

  const removeFromWishlist = (vendorId: number) => {
    const newWishlist = wishlist.filter(item => item.vendor.id !== vendorId);
    saveWishlist(newWishlist);
  };

  const isInWishlist = (vendorId: number) => {
    return wishlist.some(item => item.vendor.id === vendorId);
  };

  const clearWishlist = () => {
    saveWishlist([]);
  };

  const getWishlistByCategory = () => {
    const grouped = wishlist.reduce((acc, item) => {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, WishlistItem[]>);

    return grouped;
  };

  return {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    getWishlistByCategory,
    wishlistCount: wishlist.length
  };
}