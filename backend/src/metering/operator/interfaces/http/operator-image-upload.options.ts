import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { createImageFileFilter } from 'src/infrastructure/common/utils/evidence-upload.util';

export const OPERATOR_IMAGE_UPLOAD_OPTIONS: MulterOptions = {
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: createImageFileFilter(),
};
