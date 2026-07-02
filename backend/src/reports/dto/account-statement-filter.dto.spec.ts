import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { AccountStatementFilterDto } from './account-statement-filter.dto';

describe('AccountStatementFilterDto (REQ-19, REQ-20)', () => {
  const valid = { contratoId: '42' };

  describe('contratoId validation', () => {
    it('accepts a valid positive integer as string (REQ-19.1)', async () => {
      const dto = plainToInstance(AccountStatementFilterDto, valid);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('rejects zero contratoId (REQ-19.2)', async () => {
      const dto = plainToInstance(AccountStatementFilterDto, {
        ...valid,
        contratoId: '0',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThanOrEqual(1);
    });

    it('rejects negative contratoId (REQ-19.2)', async () => {
      const dto = plainToInstance(AccountStatementFilterDto, {
        ...valid,
        contratoId: '-5',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThanOrEqual(1);
    });

    it('rejects empty contratoId (REQ-20.2)', async () => {
      const dto = plainToInstance(AccountStatementFilterDto, {
        contratoId: '',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThanOrEqual(1);
    });

    it('rejects non-numeric contratoId (REQ-20.1)', async () => {
      const dto = plainToInstance(AccountStatementFilterDto, {
        ...valid,
        contratoId: 'abc',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThanOrEqual(1);
    });

    it('rejects leading-zero contratoId', async () => {
      const dto = plainToInstance(AccountStatementFilterDto, {
        ...valid,
        contratoId: '042',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThanOrEqual(1);
    });
  });
});
