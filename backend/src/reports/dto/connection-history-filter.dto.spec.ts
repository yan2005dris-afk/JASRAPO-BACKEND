import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ConnectionHistoryFilterDto } from './connection-history-filter.dto';

describe('ConnectionHistoryFilterDto (REQ-18, REQ-20)', () => {
  const valid = { contratoId: '42', fechaDesde: '2024-01-01' };

  describe('contratoId validation', () => {
    it('accepts a valid positive integer as string (REQ-18.1)', async () => {
      const dto = plainToInstance(ConnectionHistoryFilterDto, valid);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('rejects leading-zero contratoId (REQ-18.2)', async () => {
      const dto = plainToInstance(ConnectionHistoryFilterDto, {
        ...valid,
        contratoId: '042',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThanOrEqual(1);
      expect(errors[0].constraints).toBeDefined();
    });

    it('rejects non-numeric contratoId (REQ-18.3)', async () => {
      const dto = plainToInstance(ConnectionHistoryFilterDto, {
        ...valid,
        contratoId: 'abc',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThanOrEqual(1);
    });

    it('rejects zero contratoId (REQ-20 happy-adjacent)', async () => {
      const dto = plainToInstance(ConnectionHistoryFilterDto, {
        ...valid,
        contratoId: '0',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThanOrEqual(1);
    });

    it('rejects negative contratoId (REQ-19.2 style)', async () => {
      const dto = plainToInstance(ConnectionHistoryFilterDto, {
        ...valid,
        contratoId: '-5',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThanOrEqual(1);
    });

    it('rejects empty contratoId (REQ-20.2)', async () => {
      const dto = plainToInstance(ConnectionHistoryFilterDto, {
        ...valid,
        contratoId: '',
      });
      const errors = await validate(dto);
      // IsNotEmptyString + @Matches both reject empty
      expect(errors.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('optional fields remain optional', () => {
    it('accepts only contratoId (no optional dates)', async () => {
      const dto = plainToInstance(ConnectionHistoryFilterDto, {
        contratoId: '1',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});
