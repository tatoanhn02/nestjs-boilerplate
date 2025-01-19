import { InternalServerErrorException, Type } from '@nestjs/common';
import { SchemaFactory } from '@nestjs/mongoose';
import { merge, slice } from 'lodash';
import { BulkWriteResult, TransactionOptions } from 'mongodb';
import {
  ClientSession,
  Document,
  FilterQuery,
  Model,
  MongooseBulkWriteOptions,
  ObjectId,
  Query,
  QueryOptions,
  SaveOptions,
  Schema,
  SessionOption,
  Types,
  UpdateQuery,
} from 'mongoose';

import { Errors } from '../../errors/errors.constants';

export const DEFAULT_SORT = '-createdAt';

export function addMongooseParam(
  key: string,
  value: string | object,
  mongooseObject = {},
) {
  if (!mongooseObject) {
    mongooseObject = {};
  }

  mongooseObject[key] = value;

  return mongooseObject;
}

export interface FindAndUpdateOptions
  extends QueryOptions,
    IIncludeSoftDeletedOptions {}

export type DeleteOptions = SessionOption;

export interface FindOneAndDeleteOptions extends QueryOptions {
  rawResult: true;
}

export interface UpdateOptions extends DeleteOptions {
  multi?: boolean;
  upsert?: boolean;
  setDefaultsOnInsert?: boolean;
  timestamps?: boolean;
  omitUndefined?: boolean;
  overwrite?: boolean;
  runValidators?: boolean;
  context?: string;
  multipleCastError?: boolean;
}

export interface IIncludeSoftDeletedOptions {
  includeSoftDeleted?: boolean;
}

export interface IRepository<T extends Document> {
  aggregate(aggregations?: any[]): Promise<any[]>;

  count(conditions: FilterQuery<T>): Promise<number>;

  countAll(): Promise<number>;

  create(doc: Record<string, any>, options?: SaveOptions): Promise<T>;

  create(docs: Record<string, any>[], options?: SaveOptions): Promise<T[]>;

  delete(doc: T, options?: DeleteOptions): Promise<T>;

  delete(docs: T[], options?: DeleteOptions): Promise<T[]>;

  deleteAll(options?: DeleteOptions): Promise<number>;

  bulkWrite(
    operations: any[],
    options?: MongooseBulkWriteOptions,
  ): Promise<BulkWriteResult>;

  deleteById(
    id: string | ObjectId,
    options?: FindOneAndDeleteOptions,
  ): Promise<T | null>;

  deleteMany(
    conditions: FilterQuery<T>,
    options?: DeleteOptions,
  ): Promise<number>;

  deleteOne(
    conditions: FilterQuery<T>,
    options?: FindOneAndDeleteOptions,
  ): Promise<T | null>;

  exists(conditions: FilterQuery<T>): Promise<Pick<T, '_id'> | null>;

  existsById(id: string | ObjectId): Promise<Pick<T, '_id'> | null>;

  find(conditions: FilterQuery<T>, options?: QueryOptions<T>): Promise<T[]>;

  findAll(options?: QueryOptions<T>): Promise<T[]>;

  findById(id: string | ObjectId, options?: QueryOptions<T>): Promise<T | null>;

  findOne(
    conditions: FilterQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<T | null>;

  findOneOrCreate(
    conditions: FilterQuery<T>,
    doc: T,
    options?: QueryOptions<T> & SaveOptions,
  ): Promise<T>;

  save(doc: T, options?: SaveOptions): Promise<T>;

  save(docs: T[], options?: SaveOptions): Promise<T[]>;

  updateOne(
    conditions: FilterQuery<T>,
    doc: UpdateQuery<T>,
    options?: UpdateOptions,
  ): Promise<any>;

  updateById(
    id: string | ObjectId,
    doc: UpdateQuery<T>,
    options?: FindAndUpdateOptions,
  ): Promise<T | null>;

  updateMany(
    conditions: FilterQuery<T>,
    doc: UpdateQuery<T>,
    options?: UpdateOptions,
  ): Promise<number>;

  updateOne(
    conditions: FilterQuery<T>,
    doc: UpdateQuery<T>,
    options?: FindAndUpdateOptions,
  ): Promise<T | null>;

  updateOneOrCreate(
    conditions: FilterQuery<T>,
    doc: UpdateQuery<T>,
    options?: FindAndUpdateOptions,
  ): Promise<T | null>;

  withTransaction<U>(
    fn: (session: ClientSession) => Promise<U>,
    option?: TransactionOptions,
  ): Promise<U>;

  getCollectionName(): string;

  createCollection(): Promise<void>;

  dropCollection(): Promise<void>;

  getPrimaryKey(): string;
}

export interface IBaseDocument extends Document {
  createdAt?: Date;
  updatedAt?: Date;
}

export class BaseRepository<T extends IBaseDocument> implements IRepository<T> {
  protected primaryKey = '_id';
  private readonly isSoftDeleteSupported: boolean;

  constructor(public readonly model: Model<T>) {
    this.isSoftDeleteSupported = this.isModelSupportSoftDelete(model);
  }

  aggregate(
    aggregations?: any[],
    options?: IIncludeSoftDeletedOptions,
  ): Promise<any[]> {
    aggregations = slice(aggregations);
    if (this.isNotIncludeSoftDeleted(options)) {
      aggregations.unshift({ $match: { _deleted: { $ne: true } } });
    }
    return this.model.aggregate(aggregations).exec();
  }

  async count(
    conditions: any,
    options?: IIncludeSoftDeletedOptions,
  ): Promise<number> {
    return this.modifyQuery(
      this.model.countDocuments(conditions),
      options,
    ).exec();
  }

  async estimatedDocumentCount(): Promise<number> {
    return this.model.estimatedDocumentCount().exec();
  }

  async countAll(options?: IIncludeSoftDeletedOptions): Promise<number> {
    return this.count({}, options);
  }

  async create(doc: object, options?: SaveOptions): Promise<T>;
  async create(docs: object[], options?: SaveOptions): Promise<T[]>;
  async create(
    docs: object | object[],
    options?: SaveOptions,
  ): Promise<T | T[]> {
    if (Array.isArray(docs)) {
      const result: T[] = [];
      for (const doc of docs) {
        result.push(await this.create(doc, options));
      }
      return result;
    }
    return this.save(new this.model(docs), options);
  }

  async createBulk(
    docs: object | object[],
    options?: SaveOptions,
  ): Promise<T | T[]> {
    if (Array.isArray(docs)) {
      return this.saveBulk(
        docs.map((doc) => new this.model(doc)),
        options,
      );
    }
    return this.save(new this.model(docs), options);
  }

  async delete(doc: T, options?: QueryOptions): Promise<T>;
  async delete(docs: T[], options?: QueryOptions): Promise<T[]>;
  async delete(docs: T | T[], options?: QueryOptions): Promise<T | T[]> {
    if (Array.isArray(docs)) {
      const result: T[] = [];
      for (const doc of docs) {
        result.push(await this.delete(doc, options));
      }
      return result;
    }
    if (options?.session) {
      docs.$session(options.session);
    }
    return;
  }

  async deleteAll(options?: QueryOptions): Promise<number> {
    return this.deleteMany({}, options);
  }

  async deleteById(id: any): Promise<T> {
    return this.deleteOne({ [this.primaryKey]: id });
  }

  async deleteMany(conditions: any, options?: QueryOptions): Promise<number> {
    let query = this.model.deleteMany(conditions);
    if (options?.session) {
      query = query.session(options.session);
    }
    const result = await query.exec();
    return result.acknowledged ? result.deletedCount : 0;
  }

  async deleteOne(conditions: any, options?: QueryOptions): Promise<T> {
    return this.model.findOneAndDelete(conditions, options).exec();
  }

  async exists(
    conditions: any,
    options?: IIncludeSoftDeletedOptions,
  ): Promise<Pick<T, '_id'> | null> {
    if (this.isNotIncludeSoftDeleted(options)) {
      conditions = merge({}, conditions, { _deleted: { $ne: true } });
    }
    return this.model.exists(conditions);
  }

  async existsById(id: any): Promise<Pick<T, '_id'> | null> {
    return this.exists({ [this.primaryKey]: id });
  }

  async find(conditions: any, options?: QueryOptions): Promise<T[]> {
    return this.modifyQuery(
      this.model.find(conditions, null, options),
      options,
    ).exec();
  }

  async findAll(options?: QueryOptions): Promise<T[]> {
    return this.find({}, options);
  }

  async findById(id: any, options?: QueryOptions): Promise<T> {
    return this.findOne({ [this.primaryKey]: id }, options);
  }

  async findOne(conditions: any, options?: QueryOptions): Promise<T> {
    return this.modifyQuery(
      this.model.findOne(conditions, null, options),
      options,
    ).exec();
  }

  async findOneOrCreate(
    conditions: any,
    doc: any,
    options?: QueryOptions & SaveOptions,
  ): Promise<T> {
    let document = await this.findOne(conditions, options);
    if (!document) {
      document = await this.create(merge({}, conditions, doc), options);
    }
    return document;
  }

  async save(doc: T, options?: SaveOptions): Promise<T>;
  async save(docs: T[], options?: SaveOptions): Promise<T[]>;
  async save(docs: T | T[], options?: SaveOptions): Promise<T | T[]> {
    if (Array.isArray(docs)) {
      const result: T[] = [];
      for (const doc of docs) {
        result.push(await this.save(doc, options));
      }
      return result;
    }
    return docs.save(options);
  }
  async saveBulk(docs: T | T[], options?: SaveOptions): Promise<T | T[]> {
    if (Array.isArray(docs)) {
      return await this.model.insertMany(docs, options);
    }
    return docs.save(options);
  }

  async softDelete(doc: T, options?: SaveOptions): Promise<T>;
  async softDelete(docs: T[], options?: SaveOptions): Promise<T[]>;
  async softDelete(docs: T | T[], options?: SaveOptions): Promise<T | T[]> {
    this.checkIfSoftDeleteSupported();
    if (Array.isArray(docs)) {
      const result: T[] = [];
      for (const doc of docs) {
        result.push(await this.softDelete(doc, options));
      }
      return result;
    }
    docs.set({
      _deleted: true,
      deletedAt: new Date(),
    });
    return docs.save(options);
  }

  async softDeleteAll(options?: QueryOptions): Promise<number> {
    return this.softDeleteMany({}, options);
  }

  async softDeleteById(id: any, options?: QueryOptions): Promise<T> {
    return this.softDeleteOne(
      { [this.primaryKey]: id } as FilterQuery<T>,
      options,
    );
  }

  async softDeleteMany(
    conditions: FilterQuery<T> = {},
    options?: QueryOptions,
  ): Promise<number> {
    this.checkIfSoftDeleteSupported();
    return this.updateMany(
      conditions,
      { _deleted: true, deletedAt: new Date() },
      options,
    );
  }

  async softDeleteOne(
    conditions: FilterQuery<T>,
    options?: QueryOptions,
  ): Promise<T> {
    this.checkIfSoftDeleteSupported();
    return this.updateOne(
      conditions,
      { _deleted: true, deletedAt: new Date() },
      options,
    );
  }

  async updateById(
    id: string | ObjectId,
    doc: UpdateQuery<T>,
    options?: QueryOptions,
  ): Promise<T> {
    return this.updateOne(
      { [this.primaryKey]: id } as FilterQuery<T>,
      doc,
      options,
    );
  }

  async updateMany(
    conditions: FilterQuery<T>,
    doc: UpdateQuery<T>,
    options?: QueryOptions,
  ): Promise<number> {
    const result = await this.modifyQuery(
      this.model.updateMany(conditions, doc, (options || {}) as UpdateOptions),
      options,
    ).exec();
    return result.acknowledged ? result.modifiedCount : 0;
  }

  async updateOne(
    conditions: FilterQuery<T>,
    doc: UpdateQuery<T>,
    options?: FindAndUpdateOptions,
  ): Promise<T> {
    return this.modifyQuery(
      this.model.findOneAndUpdate(
        conditions,
        doc,
        merge({ new: true }, options || {}) as FindAndUpdateOptions,
      ),
      options,
    ).exec();
  }

  async updateOneOrCreate(
    conditions: FilterQuery<T>,
    doc: UpdateQuery<T>,
    options?: QueryOptions,
  ): Promise<T> {
    return this.updateOne(
      conditions,
      doc,
      merge({ new: true, setDefaultsOnInsert: true, upsert: true }, options),
    );
  }

  async withTransaction<U>(
    fn: (session: ClientSession) => Promise<U>,
  ): Promise<U> {
    const session = await this.model.db.startSession();
    try {
      session.startTransaction();
      const result = await fn(session);
      await session.commitTransaction();
      return result;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  getCollectionName(): string {
    return this.model.collection.collectionName;
  }

  async createCollection(): Promise<void> {
    if (!(await this.isCollectionExists())) {
      await this.model.createCollection();
    }
  }

  async dropCollection(): Promise<void> {
    if (await this.isCollectionExists()) {
      await this.model.collection.drop();
    }
  }

  async bulkWrite(
    operations: any[],
    options?: MongooseBulkWriteOptions,
  ): Promise<BulkWriteResult> {
    if (!Array.isArray(operations) || operations.length === 0) {
      throw new Error('BulkWrite requires an array of operations.');
    }

    try {
      const result = (await this.model.bulkWrite(
        operations,
        options,
      )) as unknown as BulkWriteResult;
      return result;
    } catch (err) {
      throw new InternalServerErrorException({
        ...Errors.INTERNAL_SERVER_ERROR,
        description: err.message,
      });
    }
  }

  getPrimaryKey(): string {
    return this.primaryKey;
  }

  private isModelSupportSoftDelete(model: Model<T>): boolean {
    return (
      model.schema.pathType('_deleted') === 'real' &&
      model.schema.pathType('deletedAt') === 'real'
    );
  }

  private isNotIncludeSoftDeleted(options?: IIncludeSoftDeletedOptions) {
    return this.isSoftDeleteSupported && !options?.includeSoftDeleted;
  }

  private checkIfSoftDeleteSupported() {
    if (!this.isSoftDeleteSupported) {
      throw new Error('Model does not support soft-delete');
    }
  }

  private modifyQuery<U, T>(query: Query<U, T>, options?: any): Query<U, T> {
    if (this.isNotIncludeSoftDeleted(options)) {
      query = query.where('_deleted').ne(true);
    }
    return query;
  }

  private async isCollectionExists(): Promise<boolean> {
    const result = await this.model.db.db
      .listCollections({ name: this.model.collection.collectionName })
      .next();
    return !!result;
  }
}

export interface BaseSchemaFactoryOptions {
  virtualId?: boolean;
  toJSON?: boolean;
  methods?: Record<string, any>;
}

export class BaseSchemaFactory extends SchemaFactory {
  static createForClass<TClass = any>(
    target: Type<TClass>,
    options?: BaseSchemaFactoryOptions,
  ): Schema<TClass> {
    const { virtualId = true, toJSON = true, methods = {} } = options || {};
    try {
      const schema = super.createForClass(target);
      if (virtualId) {
        schema.virtual('id').get(function (this: { _id: Types.ObjectId }) {
          return this._id.toHexString();
        });
      }
      // Ensure virtual fields are serialised.
      if (toJSON) {
        schema.set('toJSON', { getters: true, virtuals: true });
      }
      // set custom methods for schema
      if (methods && Object.keys(methods).length) {
        for (const funcName in methods) {
          if (typeof methods[funcName] === 'function') {
            schema.methods[funcName] = methods[funcName];
          }
        }
      }

      return schema;
    } catch (err) {
      throw new InternalServerErrorException({
        ...Errors.INTERNAL_SERVER_ERROR,
        description: err.message,
      });
    }
  }
}
