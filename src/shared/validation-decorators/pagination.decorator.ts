import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { createPagination } from '../helpers/pagination.helper';

export const Pagination = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return createPagination(request.query.page, request.query.perPage);
  },
);
