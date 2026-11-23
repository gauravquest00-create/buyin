import { Router } from 'express';
import * as controller from './controller.js';
import { userAuthMiddleware } from '../../shared/middleware/auth.middleware.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { createMemoryUpload } from '../../config/storage.js';
import { updateProfileSchema } from './validation.js';

const router = Router();
const avatarUpload = createMemoryUpload('PROFILE_AVATAR');

router.use(userAuthMiddleware);
router.get('/', controller.getProfile);
router.patch('/', validate(updateProfileSchema), controller.updateProfile);
router.post('/avatar', avatarUpload.single('file'), controller.uploadAvatar);

export default router;
