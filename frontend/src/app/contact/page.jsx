import Link from 'next/link';
import { ContactForm } from '../../components/ContactForm.jsx';
import styles from '../../styles/site.module.css';

export const metadata = {
  title: 'Contact BUYIN',
  description:
    'Contact the BUYIN onboarding, verification, and partner support team for questions about agency accounts, KYC, or buyer requirement partnerships.',
};

const SUPPORT_TOPICS = [
  {
    title: 'Agency & Broker Onboarding',
    text: 'Need help setting up your RERA profile, channel partner team, or target city discovery preferences? Our onboarding team can guide you.',
  },
  {
    title: 'Verification & KYC Support',
    text: 'Questions about document uploads, verification turnaround times, or mobile OTP onboarding? Reach out with your registered email.',
  },
  {
    title: 'Wallet, Billing & Partnerships',
    text: 'Inquiries regarding Razorpay recharge receipts, custom point packages, or high-volume buyer requirement partnerships.',
  },
];

export default function ContactPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div>
              <span className={styles.heroBadge}>
                <span className={styles.pulseDot} />
                Contact &amp; Partner Support
              </span>
              <h1 className={styles.heroTitle}>
                Talk to the BUYIN{' '}
                <span className={styles.heroAccent}>Onboarding &amp; Support Team.</span>
              </h1>
              <p className={styles.heroSub}>
                Questions about agency onboarding, professional verification, wallet packages, or buyer requirement partnerships? Send us a message and our team will respond promptly.
              </p>

              <div className={styles.heroActions}>
                <Link href="/faqs" className={`${styles.btnGhostDark} ${styles.btnLg}`}>
                  Browse FAQs
                </Link>
                <Link href="/login" className={`${styles.btnGhostDark} ${styles.btnLg}`}>
                  Professional Login
                </Link>
              </div>

              <div className={styles.heroTrust}>
                <span className={styles.heroTrustItem}>
                  <span className={styles.checkIcon}>+</span> Human support responses
                </span>
                <span className={styles.heroTrustItem}>
                  <span className={styles.checkIcon}>+</span> KYC &amp; onboarding guidance
                </span>
                <span className={styles.heroTrustItem}>
                  <span className={styles.checkIcon}>+</span> In-dashboard ticket desk
                </span>
              </div>
            </div>

            <div className={styles.previewShell}>
              <div className={styles.previewTop}>
                <span className={styles.previewLabel}>Support Desk Status</span>
                <span className={styles.previewStatus}>Active</span>
              </div>

              <div className={styles.previewCard}>
                <div className={styles.previewHead}>
                  <div>
                    <div className={styles.previewTitle}>BUYIN Partner Help Desk</div>
                    <div className={styles.previewLoc}>Onboarding, Verification &amp; Billing</div>
                  </div>
                  <span className={styles.previewPts}>&lt; 24h</span>
                </div>

                <div className={styles.previewMetaGrid}>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Onboarding Desk</div>
                    <div className={styles.previewMetaVal}>Brokers &amp; Agencies</div>
                  </div>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Verification</div>
                    <div className={styles.previewMetaVal}>KYC &amp; RERA Help</div>
                  </div>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Wallet &amp; Refunds</div>
                    <div className={styles.previewMetaVal}>Razorpay Support</div>
                  </div>
                  <div className={styles.previewMetaBox}>
                    <div className={styles.previewMetaKey}>Active Members</div>
                    <div className={styles.previewMetaVal}>Dashboard Tickets</div>
                  </div>
                </div>

                <div className={styles.previewMasked}>
                  <div>
                    <strong>Already Registered?</strong> Track tickets inside Dashboard
                  </div>
                  <span className={styles.previewMaskedBadge}>Fastest</span>
                </div>

                <Link href="/login" className={styles.previewCta}>
                  <span>Sign In to Support Desk</span>
                  <span>-&gt;</span>
                </Link>
              </div>

              <div className={styles.previewFoot}>
                <span>Mon - Sat business hours</span>
                <span>Dedicated partner onboarding</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.grid2} style={{ alignItems: 'start', gap: 28 }}>
            <div>
              <div className={styles.sectionHeader} style={{ marginBottom: 24 }}>
                <span className={styles.eyebrow}>How We Can Help</span>
                <h2 className={styles.sectionTitle}>Reach the Right Team Faster</h2>
                <p className={styles.sectionSub}>
                  Include your city, agency name, and registered email or mobile number so we can assist you on the very first reply.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {SUPPORT_TOPICS.map((topic) => (
                  <div key={topic.title} className={styles.card}>
                    <h3 className={styles.cardTitle}>{topic.title}</h3>
                    <p className={styles.cardText}>{topic.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} style={{ paddingTop: 0 }}>
        <div className={styles.container}>
          <div className={styles.ctaBanner}>
            <div>
              <h2 className={styles.ctaTitle}>Ready to start claiming exclusive buyer leads?</h2>
              <p className={styles.ctaSub}>
                Create your verified professional account in minutes or sign in to access your Dashboard Wallet and Lead Pool.
              </p>
            </div>
            <div className={styles.ctaActions}>
              <Link href="/get-started" className={`${styles.btnPrimary} ${styles.btnLg}`}>
                Get Started Free -&gt;
              </Link>
              <Link href="/pricing" className={`${styles.btnGhostDark} ${styles.btnLg}`}>
                View Wallet &amp; Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}