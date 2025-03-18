import { Injectable } from '@nestjs/common';

import {
  IPagination,
  IPaginationHeader,
} from '../interfaces/pagination.interface';

@Injectable()
export class PaginationHeaderHelper {
  getHeaders(pagination: IPagination, totalCount: number): IPaginationHeader {
    if (!pagination) {
      return;
    }

    const page = +pagination.page;
    const perPage = +pagination.perPage;
    const pagesCount = Math.ceil(totalCount / perPage);

    return {
      'x-next-page': page === pagesCount ? page : page + 1,
      'x-page': page,
      'x-pages-count': pagesCount,
      'x-per-page': perPage,
      'x-total-count': totalCount,
    };
  }
}

export const createPagination = (
  page: number,
  perPage: number,
): IPagination => {
  page = +page || 1;
  perPage = +perPage || 10;

  const startIndex = (page - 1) * perPage;
  const endIndex = page * perPage;

  return {
    endIndex,
    page,
    perPage,
    startIndex,
  };
};
