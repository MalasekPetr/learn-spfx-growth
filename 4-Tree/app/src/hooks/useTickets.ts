import { useState, useEffect, useCallback, useMemo } from 'react';
import type { SPFI } from '@pnp/sp';
import type { Ticket } from '../models';
import { createTicketService } from '../services';
import { ticketCache } from '../cache';

type UseTicketsReturn = {
  tickets: Ticket[];
  loading: boolean;
  error: string | undefined;
  refresh: () => void;
  addTicket: (ticket: Omit<Ticket, 'Id' | 'Created' | 'Modified'>) => Promise<void>;
  updateTicket: (id: number, ticket: Partial<Ticket>) => Promise<void>;
  deleteTicket: (id: number) => Promise<void>;
};

export const useTickets = (sp: SPFI, listName: string): UseTicketsReturn => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const service = useMemo(() => createTicketService(sp, listName), [sp, listName]);

  const fetchTickets = useCallback(async (): Promise<void> => {
    setError(undefined);

    try {
      // Cache-first: load from IndexedDB immediately
      const cached = await ticketCache.getAll();
      if (cached.length > 0) {
        setTickets(cached);
        setLoading(false);
      }

      // Then refresh from SharePoint
      const fresh = await service.getAll();
      setTickets(fresh);

      // Update cache with fresh data
      await ticketCache.putAll(fresh);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [service, refreshKey]);

  useEffect(() => {
    fetchTickets().catch(() => { /* handled in state */ });
  }, [fetchTickets]);

  const refresh = useCallback((): void => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  // Write-through: update SPO first, then cache, then refresh state
  const addTicket = useCallback(async (ticket: Omit<Ticket, 'Id' | 'Created' | 'Modified'>): Promise<void> => {
    const created = await service.add(ticket);
    await ticketCache.put(created);
    setRefreshKey((prev) => prev + 1);
  }, [service]);

  const updateTicket = useCallback(async (id: number, updates: Partial<Ticket>): Promise<void> => {
    await service.update(id, updates);
    const existing = tickets.find((t) => t.Id === id);
    if (existing) {
      await ticketCache.put({ ...existing, ...updates });
    }
    setRefreshKey((prev) => prev + 1);
  }, [service, tickets]);

  const deleteTicket = useCallback(async (id: number): Promise<void> => {
    await service.remove(id);
    await ticketCache.remove(id);
    setRefreshKey((prev) => prev + 1);
  }, [service]);

  return { tickets, loading, error, refresh, addTicket, updateTicket, deleteTicket };
};
