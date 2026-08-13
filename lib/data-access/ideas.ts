import { and, eq, inArray } from 'drizzle-orm';
import { boolean, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { ideas } from '@/db/schema/index';
import { crudTheoWorkspace } from './crud-theo-workspace';
import type { KetNoiDrizzle } from './guard';

const studioIdeas = pgTable('ideas', {
  id: uuid('id').primaryKey(),
  workspaceId: uuid('workspace_id').notNull(),
  tieuDe: text('tieu_de'),
  khamPha: boolean('kham_pha').notNull().default(false),
});

export type Idea = typeof ideas.$inferSelect & { tieuDe: string | null; khamPha: boolean };

export function ideasRepo(db: KetNoiDrizzle, workspaceId: string) {
  const crud = crudTheoWorkspace(db, workspaceId, ideas);

  async function withStudioFields<T extends { id: string }>(rows: T[]) {
    if (rows.length === 0) return [];
    const extra = await db.select().from(studioIdeas).where(and(
      eq(studioIdeas.workspaceId, workspaceId),
      inArray(studioIdeas.id, rows.map((row) => row.id)),
    ));
    const byId = new Map(extra.map((row) => [row.id, row]));
    return rows.map((row) => ({
      ...row,
      tieuDe: byId.get(row.id)?.tieuDe ?? null,
      khamPha: byId.get(row.id)?.khamPha ?? false,
    }));
  }

  return {
    ...crud,
    async list(limit = 200): Promise<Idea[]> {
      return withStudioFields(await crud.list(limit)) as Promise<Idea[]>;
    },
    async layTheoId(id: string): Promise<Idea | null> {
      const row = await crud.layTheoId(id);
      if (!row) return null;
      return (await withStudioFields([row]))[0] as Idea;
    },
    async tao(values: Record<string, unknown>): Promise<Idea> {
      const { tieuDe, khamPha, ...base } = values;
      const row = await crud.tao(base);
      const [extra] = await db.update(studioIdeas).set({
        tieuDe: typeof tieuDe === 'string' ? tieuDe : null,
        khamPha: khamPha === true,
      }).where(and(eq(studioIdeas.workspaceId, workspaceId), eq(studioIdeas.id, row.id))).returning();
      return { ...row, tieuDe: extra?.tieuDe ?? null, khamPha: extra?.khamPha ?? false } as Idea;
    },
  };
}
