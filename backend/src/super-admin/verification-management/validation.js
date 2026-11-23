import { z } from 'zod';
import { VerificationStatus } from '../../shared/enums/index.js';

export const reviewVerificationSchema = z.object({
  status: z.enum([
    VerificationStatus.APPROVED,
    VerificationStatus.REJECTED,
    VerificationStatus.MORE_DOCS_REQUIRED,
    VerificationStatus.UNDER_REVIEW,
    VerificationStatus.SUSPENDED,
  ]),
  adminRemarks: z.string().trim().max(1000).default(''),
});
