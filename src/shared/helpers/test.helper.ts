import { INestApplication } from '@nestjs/common';
import { ContextIdFactory, REQUEST } from '@nestjs/core';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { mocked } from 'jest-mock';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { AppModule } from '../../app.module';
import { getMongooseConfig } from '../../config/config.provider';

jest.mock('../../config/config.provider');
const createMongooseOptionsMock = mocked(getMongooseConfig);

export const initTestApp = async (
  overrides?: (testModule: TestingModuleBuilder) => void,
  overrideTestBuilder?: () => TestingModuleBuilder,
): Promise<[INestApplication]> => {
  const mongodb = await MongoMemoryServer.create();

  createMongooseOptionsMock.mockImplementation(() => ({
    uri: mongodb.getUri(),
  }));
  const testBuilder: TestingModuleBuilder = overrideTestBuilder
    ? overrideTestBuilder()
    : Test.createTestingModule({
        imports: [AppModule],
      });

  if (overrides) {
    overrides(testBuilder);
  }

  const fixture = await testBuilder
    .overrideProvider(REQUEST)
    .useValue(ContextIdFactory.create())
    .compile();

  const app = fixture.createNestApplication();
  return [app];
};
