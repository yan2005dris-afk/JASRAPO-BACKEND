import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { createHash } from 'crypto';

@Injectable()
export class InvitationTokenGeneratorService {
  generate(): { tokenPlain: string; tokenHash: string } {
    const tokenPlain = randomBytes(64).toString('hex');
    const tokenHash = createHash('sha256').update(tokenPlain).digest('hex');

    return { tokenPlain, tokenHash };
  }
}
