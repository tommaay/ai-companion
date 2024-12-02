import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

import { companions } from '@/db/schema';

export type Companion = InferSelectModel<typeof companions>;
export type CompanionCreate = InferInsertModel<typeof companions>;
export type CompanionUpdate = Partial<CompanionCreate>;
