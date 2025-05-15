import { Injectable } from '@nestjs/common';
import { Model, FilterQuery } from 'mongoose';
import { QueryDto, SortOrder } from '../dto/query.dto';

@Injectable()
export class QueryBuilderService {
  buildQuery<T>(queryDto: QueryDto, model: Model<T>): {
    filter: FilterQuery<T>;
    sort: Record<string, 1 | -1>;
    select: Record<string, 1>;
    skip: number;
    limit: number;
  } {
    const { page = 1, limit = 10, sortBy, sortOrder, search, searchFields, select, filter } = queryDto;
    const skip = (page - 1) * limit;

    // Build filter
    let queryFilter: FilterQuery<T> = filter ? { ...filter } as FilterQuery<T> : {};

    // Add search condition if search term is provided
    if (search && searchFields?.length) {
      const searchConditions = searchFields.map(field => ({
        [field]: { $regex: search, $options: 'i' },
      }));
      queryFilter = {
        ...queryFilter,
        $or: searchConditions,
      };
    }

    // Build sort
    const sort: Record<string, 1 | -1> = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === SortOrder.ASC ? 1 : -1;
    }

    // Build select
    const selectFields: Record<string, 1> = {};
    if (select?.length) {
      select.forEach(field => {
        selectFields[field] = 1;
      });
    }

    return {
      filter: queryFilter,
      sort,
      select: selectFields,
      skip,
      limit,
    };
  }
} 