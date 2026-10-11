import { OPERATOR_MAX_UPLOAD_BYTES } from 'src/infrastructure/config/app.constants';
import { OPERATOR_IMAGE_UPLOAD_OPTIONS } from './operator-image-upload.options';

describe('operator image upload options', () => {
  it('usa el mismo límite configurable de bytes que la validación de imagen', () => {
    expect(OPERATOR_IMAGE_UPLOAD_OPTIONS.limits?.fileSize).toBe(
      OPERATOR_MAX_UPLOAD_BYTES,
    );
  });
});
