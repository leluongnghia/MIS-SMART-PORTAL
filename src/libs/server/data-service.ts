import { eq, sql, and, desc, asc } from 'drizzle-orm';
import { db, schema } from './db';
import { getCurrentActor, writeAuditLog, type Actor } from './auth-helper';

// Generic error classes
class DataServiceError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'DataServiceError';
  }
}

class UnauthorizedError extends DataServiceError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

class ForbiddenError extends DataServiceError {
  constructor(message = 'Forbidden') {
    super(403, message);
  }
}

class NotFoundError extends DataServiceError {
  constructor(message = 'Not Found') {
    super(404, message);
  }
}

export interface ListOptions {
  limit?: number;
  offset?: number;
  orderBy?: { field: string; direction: 'asc' | 'desc' }[];
  where?: any;
}

/**
 * Generic Data Service class to wrap around Drizzle ORM models
 * providing built-in authorization hooks, audit logging, and standardized responses.
 */
export class DataService<T extends keyof typeof schema> {
  protected tableName: string;
  protected tableModel: any;

  constructor(public modelName: T) {
    this.tableName = String(modelName);
    this.tableModel = (schema as any)[modelName];
    if (!this.tableModel) {
      throw new Error(`Model ${this.tableName} not found in schema`);
    }
  }

  /**
   * Override this to provide custom authorization logic per model
   */
  protected async authorize(actor: Actor, action: 'read' | 'create' | 'update' | 'delete', record?: any): Promise<boolean> {
    // By default, only logged-in users can do anything.
    // In a real implementation, you'd integrate auth-helper.ts's specific canEdit/canView functions here.
    return !!actor;
  }

  public async findMany(options: ListOptions = {}, actorOverride?: Actor | null) {
    const actor = actorOverride ?? await getCurrentActor();
    if (!actor) throw new UnauthorizedError();
    if (!(await this.authorize(actor, 'read'))) throw new ForbiddenError();

    const queryOptions: any = {};
    if (options.limit) queryOptions.limit = options.limit;
    if (options.offset) queryOptions.offset = options.offset;
    if (options.where) queryOptions.where = options.where;
    
    // Sort
    if (options.orderBy && options.orderBy.length > 0) {
      queryOptions.orderBy = options.orderBy.map(ob => 
        ob.direction === 'desc' ? desc(this.tableModel[ob.field]) : asc(this.tableModel[ob.field])
      );
    } else if (this.tableModel.createdAt) {
      queryOptions.orderBy = [desc(this.tableModel.createdAt)];
    }

    const items = await (db.query as any)[this.tableName].findMany(queryOptions);
    return items;
  }

  public async findById(id: string, actorOverride?: Actor | null) {
    const actor = actorOverride ?? await getCurrentActor();
    if (!actor) throw new UnauthorizedError();

    const item = await (db.query as any)[this.tableName].findFirst({
      where: eq(this.tableModel.id, id)
    });

    if (!item) throw new NotFoundError();
    if (!(await this.authorize(actor, 'read', item))) throw new ForbiddenError();

    return item;
  }

  public async create(data: any, actorOverride?: Actor | null) {
    const actor = actorOverride ?? await getCurrentActor();
    if (!actor) throw new UnauthorizedError();
    if (!(await this.authorize(actor, 'create'))) throw new ForbiddenError();

    const now = new Date();
    const id = data.id || `${this.tableName}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    
    const insertData = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };

    if (this.tableModel.createdBy) insertData.createdBy = actor.id;

    await db.insert(this.tableModel).values(insertData);
    
    await writeAuditLog(actor.id, `CREATE_${this.tableName.toUpperCase()}`, this.tableName.toUpperCase(), id, { data });

    return this.findById(id, actor);
  }

  public async update(id: string, data: any, actorOverride?: Actor | null) {
    const actor = actorOverride ?? await getCurrentActor();
    if (!actor) throw new UnauthorizedError();

    const existing = await this.findById(id, actor);
    if (!(await this.authorize(actor, 'update', existing))) throw new ForbiddenError();

    const updateData = {
      ...data,
      updatedAt: new Date()
    };
    if (this.tableModel.updatedBy) updateData.updatedBy = actor.id;

    await db.update(this.tableModel).set(updateData).where(eq(this.tableModel.id, id));

    await writeAuditLog(actor.id, `UPDATE_${this.tableName.toUpperCase()}`, this.tableName.toUpperCase(), id, { patch: data });

    return this.findById(id, actor);
  }

  public async delete(id: string, actorOverride?: Actor | null) {
    const actor = actorOverride ?? await getCurrentActor();
    if (!actor) throw new UnauthorizedError();

    const existing = await this.findById(id, actor);
    if (!(await this.authorize(actor, 'delete', existing))) throw new ForbiddenError();

    // Soft delete if supported
    if (this.tableModel.deletedAt) {
      const deleteData: any = { deletedAt: new Date() };
      if (this.tableModel.deletedBy) deleteData.deletedBy = actor.id;
      
      await db.update(this.tableModel).set(deleteData).where(eq(this.tableModel.id, id));
    } else {
      await db.delete(this.tableModel).where(eq(this.tableModel.id, id));
    }

    await writeAuditLog(actor.id, `DELETE_${this.tableName.toUpperCase()}`, this.tableName.toUpperCase(), id, { id });

    return { success: true };
  }
}
