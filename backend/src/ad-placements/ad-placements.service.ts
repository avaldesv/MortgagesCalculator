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

  async listAll(): Promise<AdPlacement[]> {
    return this.store.getPlacements();
  }

  async getOne(id: string): Promise<AdPlacement> {
    const p = await this.store.getPlacement(id);
    if (!p) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Placement not found.' });
    return p;
  }

  async create(input: Omit<AdPlacement, 'updatedAt'>): Promise<AdPlacement> {
    if (await this.store.getPlacement(input.id)) {
      throw new ConflictException({
        code: 'PLACEMENT_ID_CONFLICT',
        message: `Placement id "${input.id}" already exists.`,
      });
    }
    const placement: AdPlacement = {
      ...input,
      updatedAt: new Date().toISOString(),
    };
    await this.store.upsertPlacement(placement);
    return placement;
  }

  async update(id: string, patch: Partial<Omit<AdPlacement, 'id' | 'updatedAt'>>): Promise<AdPlacement> {
    const existing = await this.getOne(id);
    const placement: AdPlacement = {
      ...existing,
      ...patch,
      id,
      updatedAt: new Date().toISOString(),
    };
    await this.store.upsertPlacement(placement);
    return placement;
  }

  async remove(id: string): Promise<void> {
    if (!(await this.store.deletePlacement(id))) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Placement not found.' });
    }
  }

  async activeForTab(tabId: string): Promise<{ tabId: TabId; placements: AdPlacement[] }> {
    if (!TAB_IDS.includes(tabId as TabId)) {
      return { tabId: tabId as TabId, placements: [] };
    }
    const tab = tabId as TabId;
    const active = (await this.store.getPlacements())
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
