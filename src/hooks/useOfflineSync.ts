import { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import { supabase } from '@/integrations/supabase/client';

interface ProductivityItem {
  id: string;
  type: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  completed: boolean;
  missed: boolean;
  user_id?: string;
}

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingChanges();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveItemLocally = async (item: ProductivityItem) => {
    try {
      const { value } = await Preferences.get({ key: 'localItems' });
      const items = value ? JSON.parse(value) : [];
      const existingIndex = items.findIndex((i: ProductivityItem) => i.id === item.id);
      
      if (existingIndex >= 0) {
        items[existingIndex] = item;
      } else {
        items.push(item);
      }
      
      await Preferences.set({
        key: 'localItems',
        value: JSON.stringify(items),
      });
    } catch (error) {
      console.error('Error saving item locally:', error);
    }
  };

  const getLocalItems = async (): Promise<ProductivityItem[]> => {
    try {
      const { value } = await Preferences.get({ key: 'localItems' });
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error('Error getting local items:', error);
      return [];
    }
  };

  const addPendingChange = async (change: {
    action: 'insert' | 'update' | 'delete';
    item: ProductivityItem;
  }) => {
    try {
      const { value } = await Preferences.get({ key: 'pendingChanges' });
      const changes = value ? JSON.parse(value) : [];
      changes.push(change);
      await Preferences.set({
        key: 'pendingChanges',
        value: JSON.stringify(changes),
      });
    } catch (error) {
      console.error('Error adding pending change:', error);
    }
  };

  const syncPendingChanges = async () => {
    try {
      const { value } = await Preferences.get({ key: 'pendingChanges' });
      if (!value) return;

      const changes = JSON.parse(value);
      
      for (const change of changes) {
        try {
          if (change.action === 'insert') {
            await supabase.from('productivity_items').insert(change.item);
          } else if (change.action === 'update') {
            await supabase
              .from('productivity_items')
              .update(change.item)
              .eq('id', change.item.id);
          } else if (change.action === 'delete') {
            await supabase
              .from('productivity_items')
              .delete()
              .eq('id', change.item.id);
          }
        } catch (error) {
          console.error('Error syncing change:', error);
        }
      }

      // Clear pending changes after sync
      await Preferences.remove({ key: 'pendingChanges' });
    } catch (error) {
      console.error('Error syncing pending changes:', error);
    }
  };

  return {
    isOnline,
    saveItemLocally,
    getLocalItems,
    addPendingChange,
    syncPendingChanges,
  };
};
