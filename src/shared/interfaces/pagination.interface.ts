import { ApiQuery } from '@nestjs/swagger';

export interface IPagination {
  page: number;
  perPage: number;
  startIndex?: number;
  endIndex?: number;
}

export interface IPaginationHeader {
  'x-page': number;
  'x-total-count': number;
  'x-pages-count': number;
  'x-per-page': number;
  'x-next-page': number;
}

export interface IPaginationResponse<T> {
  items: T[];
  headers: IPaginationHeader;
}

export const ApiPagination =
  () => (target: any, key: string | symbol, descriptor: PropertyDescriptor) => {
    ApiQuery({
      description: 'Page number',
      name: 'page',
      required: false,
      type: Number,
    })(target, key, descriptor);
    ApiQuery({
      description: 'Items per page',
      name: 'perPage',
      required: false,
      type: Number,
    })(target, key, descriptor);
  };
