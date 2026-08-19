export class PgBoss {
  on = jest.fn();
  start = jest.fn().mockResolvedValue(undefined);
  stop = jest.fn().mockResolvedValue(undefined);
  createQueue = jest.fn().mockResolvedValue(undefined);
  send = jest.fn().mockResolvedValue('job-id');
  insert = jest.fn().mockResolvedValue(['job-id']);
  work = jest.fn().mockResolvedValue(undefined);
  schedule = jest.fn().mockResolvedValue(undefined);
  unschedule = jest.fn().mockResolvedValue(undefined);
}
export default PgBoss;
