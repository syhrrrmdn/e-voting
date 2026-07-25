import { supabase } from './supabase';

export class DocumentInstance {
  private _tableName: string;
  [key: string]: any;

  constructor(tableName: string, data: any) {
    this._tableName = tableName;
    Object.assign(this, data);
    const idVal = data.id || data._id;
    if (idVal) {
      this.id = idVal;
      this._id = idVal;
    }
  }

  toObject() {
    const obj: any = {};
    for (const key of Object.keys(this)) {
      if (key.startsWith('_')) continue;
      obj[key] = (this as any)[key];
    }
    obj.id = this.id;
    obj._id = this._id;
    return obj;
  }

  async save() {
    const idVal = this.id;
    const updateData: any = {};
    for (const key of Object.keys(this)) {
      if (
        key.startsWith('_') ||
        key === 'id' ||
        key === 'createdAt' ||
        key === 'updatedAt' ||
        typeof (this as any)[key] === 'function'
      ) {
        continue;
      }
      updateData[key] = (this as any)[key];
    }

    updateData.updatedAt = new Date().toISOString();

    if (idVal) {
      const { data, error } = await supabase
        .from(this._tableName)
        .update(updateData)
        .eq('id', idVal)
        .select()
        .single();
      if (error) throw error;
      Object.assign(this, data);
    } else {
      updateData.createdAt = new Date().toISOString();
      const { data, error } = await supabase
        .from(this._tableName)
        .insert(updateData)
        .select()
        .single();
      if (error) throw error;
      Object.assign(this, data);
      this.id = data.id;
      this._id = data.id;
    }
    return this;
  }
}

export class SupabaseQueryBuilder {
  public tableName: string;
  public filter: any;
  public selectFields: string | null = null;
  public sortOption: any = null;
  public skipNum: number | null = null;
  public limitNum: number | null = null;
  public populateOpt: any = null;
  public isFindOne: boolean = false;

  constructor(tableName: string, filter: any = {}, isFindOne = false) {
    this.tableName = tableName;
    this.filter = filter;
    this.isFindOne = isFindOne;
  }

  select(fields: string) {
    this.selectFields = fields;
    return this;
  }

  sort(sortOpt: any) {
    this.sortOption = sortOpt;
    return this;
  }

  skip(n: number) {
    this.skipNum = n;
    return this;
  }

  limit(n: number) {
    this.limitNum = n;
    return this;
  }

  populate(opt: any) {
    this.populateOpt = opt;
    return this;
  }

  async exec() {
    let query = supabase.from(this.tableName).select('*');

    // Apply filters
    query = this.applyFilters(query, this.filter);

    // Apply sorting
    if (this.sortOption) {
      if (typeof this.sortOption === 'string') {
        const desc = this.sortOption.startsWith('-');
        const field = desc ? this.sortOption.substring(1) : this.sortOption;
        query = query.order(field, { ascending: !desc });
      } else if (typeof this.sortOption === 'object') {
        for (const key of Object.keys(this.sortOption)) {
          const val = this.sortOption[key];
          query = query.order(key, { ascending: val === 1 || val === 'asc' || val === 'ascending' });
        }
      }
    }

    // Apply pagination
    if (this.skipNum !== null || this.limitNum !== null) {
      const from = this.skipNum || 0;
      if (this.limitNum !== null) {
        const to = from + this.limitNum - 1;
        query = query.range(from, to);
      } else {
        query = query.range(from, 999999);
      }
    }

    const { data, error } = await query;
    if (error) throw error;

    if (!data) return this.isFindOne ? null : [];

    let results = data.map(item => new DocumentInstance(this.tableName, item));

    // Handle select exclusion/inclusion
    if (this.selectFields) {
      const fields = this.selectFields.split(' ');
      const excludes = fields.filter(f => f.startsWith('-')).map(f => f.substring(1));
      const includes = fields.filter(f => !f.startsWith('-'));

      if (excludes.length > 0) {
        results.forEach(doc => {
          excludes.forEach(field => {
            delete doc[field];
          });
        });
      } else if (includes.length > 0) {
        results.forEach(doc => {
          const clean: any = {};
          includes.forEach(field => {
            clean[field] = doc[field];
          });
          clean.id = doc.id;
          clean._id = doc._id;
          for (const key of Object.keys(doc)) {
            if (key !== '_tableName') {
              delete doc[key];
            }
          }
          Object.assign(doc, clean);
        });
      }
    }

    // Handle populate
    if (this.populateOpt) {
      results = await this.runPopulate(results, this.populateOpt);
    }

    if (this.isFindOne) {
      return results.length > 0 ? results[0] : null;
    }

    return results;
  }

  public applyFilters(query: any, filter: any) {
    if (!filter) return query;

    // Handle _id or id mapping
    const idVal = filter._id || filter.id;
    if (idVal !== undefined) {
      if (typeof idVal === 'object' && idVal !== null) {
        if (idVal.$in) {
          query = query.in('id', idVal.$in);
        } else if (idVal.$nin) {
          query = query.not('id', 'in', `(${idVal.$nin.join(',')})`);
        } else {
          query = query.eq('id', idVal);
        }
      } else {
        query = query.eq('id', idVal);
      }
    }

    for (const key of Object.keys(filter)) {
      if (key === '_id' || key === 'id') continue;
      const val = filter[key];

      if (key === '$or' && Array.isArray(val)) {
        const orParts = val.map((item: any) => {
          const fieldName = Object.keys(item)[0];
          const fieldVal = item[fieldName];
          const mappedField = fieldName === '_id' ? 'id' : fieldName;

          if (typeof fieldVal === 'object' && fieldVal !== null) {
            if (fieldVal.$regex) {
              return `${mappedField}.ilike.%${fieldVal.$regex}%`;
            }
          }
          return `${mappedField}.eq.${fieldVal}`;
        });
        query = query.or(orParts.join(','));
      } else if (typeof val === 'object' && val !== null && !(val instanceof Date)) {
        if (val.$gt !== undefined) {
          query = query.gt(key, val.$gt instanceof Date ? val.$gt.toISOString() : val.$gt);
        } else if (val.$lt !== undefined) {
          query = query.lt(key, val.$lt instanceof Date ? val.$lt.toISOString() : val.$lt);
        } else if (val.$gte !== undefined) {
          query = query.gte(key, val.$gte instanceof Date ? val.$gte.toISOString() : val.$gte);
        } else if (val.$lte !== undefined) {
          query = query.lte(key, val.$lte instanceof Date ? val.$lte.toISOString() : val.$lte);
        } else if (val.$in !== undefined) {
          query = query.in(key, val.$in);
        } else if (val.$regex !== undefined) {
          query = query.ilike(key, `%${val.$regex}%`);
        } else if (val.$ne !== undefined) {
          query = query.neq(key, val.$ne);
        }
      } else {
        if (val === null) {
          query = query.is(key, null);
        } else {
          query = query.eq(key, val instanceof Date ? val.toISOString() : val);
        }
      }
    }

    return query;
  }

  public async runPopulate(docs: any[], populateOpt: any) {
    if (!docs || docs.length === 0 || !populateOpt) return docs;

    const path = typeof populateOpt === 'string' ? populateOpt : populateOpt.path;
    const match = typeof populateOpt === 'object' ? populateOpt.match : null;

    if (path === 'candidates') {
      for (const doc of docs) {
        const candidateIds = Array.isArray(doc.candidates) ? doc.candidates : [];
        if (candidateIds.length === 0) {
          doc.candidates = [];
          continue;
        }

        let q = supabase.from('Candidate').select('*').in('id', candidateIds);
        if (match) {
          q = this.applyFilters(q, match);
        }

        const { data: candidates, error } = await q;
        if (error) throw error;

        doc.candidates = (candidates || []).map(c => new DocumentInstance('Candidate', c));
      }
    }
    return docs;
  }
}

function createQueryPromise<T>(execFn: () => Promise<T>, builder: SupabaseQueryBuilder): Promise<T> & {
  select(fields: string): any;
  sort(sortOpt: any): any;
  skip(n: number): any;
  limit(n: number): any;
  populate(opt: any): any;
} {
  const promise = execFn();

  const proxy: any = {
    then: (onfulfilled?: any, onrejected?: any) => promise.then(onfulfilled, onrejected),
    catch: (onrejected?: any) => promise.catch(onrejected),
    finally: (onfinally?: any) => promise.finally(onfinally),
    [Symbol.toStringTag]: 'Promise',
  };

  proxy.select = (fields: string) => {
    builder.select(fields);
    return createQueryPromise(() => builder.exec() as any, builder);
  };
  proxy.sort = (sortOpt: any) => {
    builder.sort(sortOpt);
    return createQueryPromise(() => builder.exec() as any, builder);
  };
  proxy.skip = (n: number) => {
    builder.skip(n);
    return createQueryPromise(() => builder.exec() as any, builder);
  };
  proxy.limit = (n: number) => {
    builder.limit(n);
    return createQueryPromise(() => builder.exec() as any, builder);
  };
  proxy.populate = (opt: any) => {
    builder.populate(opt);
    return createQueryPromise(() => builder.exec() as any, builder);
  };

  return proxy;
}

export class BaseModel {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  find(filter: any = {}): any {
    const builder = new SupabaseQueryBuilder(this.tableName, filter, false);
    return createQueryPromise(() => builder.exec(), builder);
  }

  findOne(filter: any = {}): any {
    const builder = new SupabaseQueryBuilder(this.tableName, filter, true);
    return createQueryPromise(() => builder.exec(), builder);
  }

  async countDocuments(filter: any = {}): Promise<number> {
    let query = supabase.from(this.tableName).select('*', { count: 'exact', head: true });
    const tempBuilder = new SupabaseQueryBuilder(this.tableName);
    query = tempBuilder.applyFilters(query, filter);

    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  }

  async create(data: any): Promise<any> {
    const cleaned: any = {};
    for (const key of Object.keys(data)) {
      if (key === '_id') continue;
      cleaned[key] = data[key];
    }

    cleaned.createdAt = new Date().toISOString();
    cleaned.updatedAt = new Date().toISOString();

    const { data: record, error } = await supabase
      .from(this.tableName)
      .insert(cleaned)
      .select()
      .single();

    if (error) throw error;
    return new DocumentInstance(this.tableName, record);
  }

  async insertMany(dataArray: any[]): Promise<any[]> {
    const cleanedArray = dataArray.map(data => {
      const cleaned: any = {};
      for (const key of Object.keys(data)) {
        if (key === '_id') continue;
        cleaned[key] = data[key];
      }
      cleaned.createdAt = new Date().toISOString();
      cleaned.updatedAt = new Date().toISOString();
      return cleaned;
    });

    const { data: records, error } = await supabase
      .from(this.tableName)
      .insert(cleanedArray)
      .select();

    if (error) throw error;
    return (records || []).map(r => new DocumentInstance(this.tableName, r));
  }

  async deleteMany(filter: any = {}): Promise<any> {
    let query = supabase.from(this.tableName).delete();
    const tempBuilder = new SupabaseQueryBuilder(this.tableName);
    query = tempBuilder.applyFilters(query, filter);

    if (Object.keys(filter).length === 0) {
      query = query.neq('id', '00000000-0000-0000-0000-000000000000');
    }

    const { data, error } = await query;
    if (error) throw error;
    return { acknowledged: true, deletedCount: data ? (data as any).length : 0 };
  }

  async updateMany(filter: any = {}, updateData: any): Promise<any> {
    let query = supabase.from(this.tableName).update(updateData);
    const tempBuilder = new SupabaseQueryBuilder(this.tableName);
    query = tempBuilder.applyFilters(query, filter);

    if (Object.keys(filter).length === 0) {
      query = query.neq('id', '00000000-0000-0000-0000-000000000000');
    }

    const { data, error } = await query;
    if (error) throw error;
    return { acknowledged: true, modifiedCount: data ? (data as any).length : 0 };
  }

  findByIdAndUpdate(id: string, updateData: any, options: any = {}): any {
    const execFn = async () => {
      const { data: current, error: fetchErr } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();
      if (fetchErr) throw fetchErr;

      const nextData = { ...updateData };
      if (updateData.$inc) {
        for (const key of Object.keys(updateData.$inc)) {
          nextData[key] = (current[key] || 0) + updateData.$inc[key];
        }
        delete nextData.$inc;
      }
      if (updateData.$pull) {
        for (const key of Object.keys(updateData.$pull)) {
          const valToRemove = updateData.$pull[key];
          const currentArr = Array.isArray(current[key]) ? current[key] : [];
          nextData[key] = currentArr.filter((item: any) => String(item) !== String(valToRemove));
        }
        delete nextData.$pull;
      }
      if (updateData.$push) {
        for (const key of Object.keys(updateData.$push)) {
          const valToAdd = updateData.$push[key];
          const currentArr = Array.isArray(current[key]) ? current[key] : [];
          nextData[key] = [...currentArr, valToAdd];
        }
        delete nextData.$push;
      }

      nextData.updatedAt = new Date().toISOString();

      const { data: record, error } = await supabase
        .from(this.tableName)
        .update(nextData)
        .eq('id', id)
        .select();

      if (error) throw error;
      if (!record || record.length === 0) return null;

      let result = new DocumentInstance(this.tableName, record[0]);
      if (options.populate) {
        const builder = new SupabaseQueryBuilder(this.tableName);
        const populated = await builder.runPopulate([result], options.populate);
        result = populated[0];
      }
      return result;
    };

    const promise = execFn();
    const builder = new SupabaseQueryBuilder(this.tableName);

    const proxy: any = {
      then: (onfulfilled?: any, onrejected?: any) => promise.then(onfulfilled, onrejected),
      catch: (onrejected?: any) => promise.catch(onrejected),
      finally: (onfinally?: any) => promise.finally(onfinally),
      [Symbol.toStringTag]: 'Promise',
    };

    proxy.populate = (opt: any) => {
      const popPromise = execFn().then(async (result) => {
        if (!result) return null;
        const populated = await builder.runPopulate([result], opt);
        return populated[0];
      });
      return popPromise;
    };

    return proxy;
  }

  findOneAndUpdate(filter: any = {}, updateData: any, options: any = {}): any {
    const execFn = async () => {
      const recordToUpdate = await this.findOne(filter);
      if (!recordToUpdate) return null;
      return this.findByIdAndUpdate(recordToUpdate.id, updateData, options);
    };

    const promise = execFn();
    const builder = new SupabaseQueryBuilder(this.tableName);

    const proxy: any = {
      then: (onfulfilled?: any, onrejected?: any) => promise.then(onfulfilled, onrejected),
      catch: (onrejected?: any) => promise.catch(onrejected),
      finally: (onfinally?: any) => promise.finally(onfinally),
      [Symbol.toStringTag]: 'Promise',
    };

    proxy.populate = (opt: any) => {
      const popPromise = execFn().then(async (result) => {
        if (!result) return null;
        const populated = await builder.runPopulate([result], opt);
        return populated[0];
      });
      return popPromise;
    };

    return proxy;
  }

  async aggregate(pipeline: any[]) {
    const groupStage = pipeline.find(stage => stage.$group);
    if (!groupStage) return [];

    const groupField = groupStage.$group._id.replace('$', '');

    const { data, error } = await supabase
      .from(this.tableName)
      .select(groupField)
      .is('deletedAt', null);

    if (error) throw error;

    const counts: Record<string, number> = {};
    for (const item of (data || [])) {
      const val = item[groupField] || 'null';
      counts[val] = (counts[val] || 0) + 1;
    }

    return Object.keys(counts).map(key => ({
      _id: key,
      count: counts[key]
    }));
  }
}
