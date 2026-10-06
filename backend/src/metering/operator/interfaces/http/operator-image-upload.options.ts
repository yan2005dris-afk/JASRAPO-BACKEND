import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { createImageFileFilter } from 'src/infrastructure/common/utils/evidence-upload.util';
import { OPERATOR_MAX_UPLOAD_BYTES } from 'src/infrastructure/config/app.constants';

export const OPERATOR_IMAGE_UPLOAD_OPTIONS: MulterOptions = {
  limits: { fileSize: OPERATOR_MAX_UPLOAD_BYTES },
  fileFilter: createImageFileFilter(),
};
