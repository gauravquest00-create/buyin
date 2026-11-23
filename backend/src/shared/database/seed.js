import { connectDatabase, disconnectDatabase } from '../../config/database.js';
import { runBootstrap } from './bootstrap.js';
import { Lead } from '../models/Lead.model.js';
import { Category } from '../models/Category.model.js';
import { calculateClaimPricing } from '../../logics/pricing/pricing.engine.js';
import { BudgetBand, LeadPoolState, PropertyType, SiteVisitStatus } from '../enums/index.js';
import { generateCode } from '../utils/crypto.js';
import { logger } from '../utils/logger.js';

async function seedDevelopmentData() {
  await connectDatabase();
  await runBootstrap();

  const cities = ['Gurugram', 'Noida', 'Bengaluru', 'Mumbai', 'Pune'];
  for (const city of cities) {
    await Category.updateOne(
      { type: 'CITY', name: city, parentName: '' },
      { $setOnInsert: { type: 'CITY', name: city, parentName: '', isActive: true } },
      { upsert: true }
    );
  }

  const sampleLeads = [
    {
      title: '3 BHK Ready-to-Move Apartment on Golf Course Extension Road',
      requirementSummary: 'End-user family relocating from South Delhi seeking a 3 BHK + servant room in a gated high-rise with possession within 60 days.',
      buyerName: 'Rohan Malhotra',
      buyerPhone: '+919811223344',
      buyerEmail: 'rohan.malhotra@example.com',
      budgetBand: BudgetBand.CR2_TO_5CR,
      budgetMinInr: 24000000,
      budgetMaxInr: 32000000,
      propertyType: PropertyType.APARTMENT,
      city: 'Gurugram',
      location: 'Golf Course Extension Road',
      configuration: '3 BHK + Servant',
      purchaseTimeline: 'WITHIN_30_DAYS',
      seriousnessScore: 92,
      signals: {
        contactVerified: true,
        budgetConfirmed: true,
        exactLocationConfig: true,
        siteVisitRequested: true,
        buyerActivelyResponding: true,
        fundingLoanReadiness: true,
      },
      siteVisitStatus: SiteVisitStatus.REQUESTED,
      poolState: LeadPoolState.AVAILABLE,
    },
    {
      title: 'Independent Builder Floor in Sushant Lok Phase 1',
      requirementSummary: 'Verified investor looking for a 4 BHK newly constructed builder floor with lift and stilt parking.',
      buyerName: 'Meera Nair',
      buyerPhone: '+919822334455',
      buyerEmail: 'meera.nair@example.com',
      budgetBand: BudgetBand.CR2_TO_5CR,
      budgetMinInr: 28000000,
      budgetMaxInr: 36000000,
      propertyType: PropertyType.BUILDER_FLOOR,
      city: 'Gurugram',
      location: 'Sushant Lok Phase 1',
      configuration: '4 BHK',
      purchaseTimeline: 'DAYS_31_TO_90',
      seriousnessScore: 84,
      signals: {
        contactVerified: true,
        budgetConfirmed: true,
        exactLocationConfig: true,
        siteVisitRequested: false,
        buyerActivelyResponding: true,
        fundingLoanReadiness: false,
      },
      siteVisitStatus: SiteVisitStatus.SCHEDULED,
      poolState: LeadPoolState.AVAILABLE,
    },
    {
      title: 'Commercial Retail Space on Sohna Road',
      requirementSummary: 'Pre-leased or high-footfall ground-floor retail shop requirement with clear title.',
      buyerName: 'Vikramaditya Singh',
      buyerPhone: '+919833445566',
      buyerEmail: 'vikram.singh@example.com',
      budgetBand: BudgetBand.CR1_TO_2CR,
      budgetMinInr: 12000000,
      budgetMaxInr: 18500000,
      propertyType: PropertyType.COMMERCIAL,
      city: 'Gurugram',
      location: 'Sohna Road',
      configuration: '650-900 sq.ft Retail',
      purchaseTimeline: 'DAYS_31_TO_90',
      seriousnessScore: 78,
      signals: {
        contactVerified: true,
        budgetConfirmed: true,
        exactLocationConfig: false,
        siteVisitRequested: true,
        buyerActivelyResponding: true,
        fundingLoanReadiness: true,
      },
      siteVisitStatus: SiteVisitStatus.NONE,
      poolState: LeadPoolState.AVAILABLE,
    },
  ];

  const existingCount = await Lead.countDocuments();
  if (existingCount === 0) {
    for (const item of sampleLeads) {
      const snapshot = calculateClaimPricing(item);
      await Lead.create({
        ...item,
        leadCode: generateCode('LED'),
        computedClaimPoints: snapshot.finalPoints,
        pricingSnapshot: snapshot,
      });
    }
    logger.info('Seeded sample BUYIN buyer requirements', { count: sampleLeads.length });
  } else {
    logger.info('Leads already exist; skipping sample lead seed', { existingCount });
  }

  await disconnectDatabase();
}

seedDevelopmentData().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
