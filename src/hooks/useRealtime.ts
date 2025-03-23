
import { useEffect } from 'react';
import { supabase } from '@/services/base-service';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type Table = 'issues' | 'issue_comments' | 'issue_images' | 'ai_verifications';
type Event = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface UseRealtimeOptions {
  event?: Event;
  schema?: string;
  table: Table;
  filter?: string;
}

/**
 * Hook to subscribe to Supabase realtime updates
 */
export const useRealtime = <T = any>(
  options: UseRealtimeOptions,
  callback: (payload: RealtimePostgresChangesPayload<T>) => void
) => {
  const { event = '*', schema = 'public', table, filter } = options;

  useEffect(() => {
    let channel: RealtimeChannel;

    const setupSubscription = async () => {
      // Build channel configuration
      const channelConfig = {
        schema,
        table,
        event,
      };

      if (filter) {
        // @ts-ignore - type definition is incomplete in supabase-js
        channelConfig.filter = filter;
      }

      channel = supabase
        .channel('db-changes')
        .on('postgres_changes', channelConfig, (payload: any) => {
          callback(payload);
        })
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [event, schema, table, filter, callback]);
};

/**
 * Hook to subscribe to Supabase presence for user status
 */
export const usePresence = (
  channelName: string,
  initialState: any,
  onSync?: (state: any) => void,
  onJoin?: (key: string, newPresence: any) => void,
  onLeave?: (key: string, leftPresence: any) => void
) => {
  useEffect(() => {
    const channel = supabase.channel(channelName);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        if (onSync) onSync(state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        if (onJoin) onJoin(key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        if (onLeave) onLeave(key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track(initialState);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName, initialState, onSync, onJoin, onLeave]);
};
