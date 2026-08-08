import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
  let appController: AppController;
  const count = jest.fn();

  beforeEach(async () => {
    count.mockReset();

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      // AppController injects PrismaService as well as AppService; the health
      // check only touches the former, so it is stubbed down to user.count().
      providers: [
        AppService,
        { provide: PrismaService, useValue: { user: { count } } },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getHealth', () => {
    it('reports the database as connected when it answers', async () => {
      count.mockResolvedValue(0);

      await expect(appController.getHealth()).resolves.toEqual({
        status: 'ok',
        database: 'connected',
      });
    });

    it('reports the database as disconnected when the query throws', async () => {
      count.mockRejectedValue(new Error('connection refused'));

      await expect(appController.getHealth()).resolves.toEqual({
        status: 'error',
        database: 'disconnected',
      });
    });
  });
});
