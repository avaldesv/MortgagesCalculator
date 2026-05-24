import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import {
  AdPlacement,
  AdPagePosition,
  DataStoreService,
  TabId,
  TabsTarget,
} from '../store/data-store.service';

const TAB_IDS: TabId[] = [
  'simple-calculator',
  'advanced-calculator',
  'affordability',
  'compare-scenarios',
  'homes-by-payment',
  'learning-center',
  'partners',
];

@Injectable()
export class AdPlacementsService {
  constructor(private readonly store: DataStoreService) {}

  listAll(): AdPlacement[] {
    return this.store.getPlacements();
  }

  getOne(id: string): AdPlacement {
    const p = this.store.getPlacement(id);
    if (!p) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Placement not found.' });
    return p;
  }

  create(input: Omit<AdPlacement, 'updatedAt'>): AdPlacement {
    if (this.store.getPlacement(input.id)) {
      throw new ConflictException({
        code: 'PLACEMENT_ID_CONFLICT',
        message: `Placement id "${input.id}" already exists.`,
      });
    }
    const placement: AdPlacement = {
      ...input,
      updatedAt: new Date().toISOString(),
    };
    this.store.upsertPlacement(placement);
    return placement;
  }

  update(id: string, patch: Partial<Omit<AdPlacement, 'id' | 'updatedAt'>>): AdPlacement {
    const existing = this.getOne(id);
    const placement: AdPlacement = {
      ...existing,
      ...patch,
      id,
      updatedAt: new Date().toISOString(),
    };
    this.store.upsertPlacement(placement);
    return placement;
  }

  remove(id: string): void {
    if (!this.store.deletePlacement(id)) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Placement not found.' });
    }
  }

  activeForTab(tabId: string): { tabId: TabId; placements: AdPlacement[] } {
    if (!TAB_IDS.includes(tabId as TabId)) {
      return { tabId: tabId as TabId, placements: [] };
    }
    const tab = tabId as TabId;
    const active = this.store
      .getPlacements()
      .filter((p) => p.enabled && this.appliesToTab(p.tabs, tab))
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

    const byPosition = new Map<AdPagePosition, AdPlacement>();
    for (const p of active) {
      if (!byPosition.has(p.position)) byPosition.set(p.position, p);
    }
    return { tabId: tab, placements: [...byPosition.values()] };
  }

  private appliesToTab(tabs: TabsTarget, tabId: TabId): boolean {
    return tabs === 'all' || (Array.isArray(tabs) && tabs.includes(tabId));
  }
}
