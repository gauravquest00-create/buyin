'use client';

import { useState } from 'react';
import { submitContactInquiry } from '../services/apiClient.js';
import styles from '../styles/site.module.css';

export function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', text: '' });
    try {
      const res = await submitContactInquiry(form);
      setStatus({ type: 'ok', text: res.message || 'Your message has been sent. We will respond shortly.' });
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setStatus({ type: 'err', text: err.message || 'Could not send message. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.card} onSubmit={onSubmit} style={{ padding: 28 }}>
      <div style={{ marginBottom: 20 }}>
        <span className={styles.eyebrow}>Direct Message</span>
        <h2 className={styles.cardTitle} style={{ fontSize: 21, marginBottom: 4 }}>
          Send Us an Inquiry
        </h2>
        <p className={styles.cardText} style={{ fontSize: 13.5 }}>
          Fill in your details below and our onboarding or support desk will get back to you promptly.
        </p>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor="contact-name">
          Full Name
        </label>
        <input
          id="contact-name"
          className={styles.input}
          placeholder="Enter your full name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>

      <div className={styles.grid2} style={{ gap: 14 }}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="contact-email">
            Work Email
          </label>
          <input
            id="contact-email"
            className={styles.input}
            type="email"
            placeholder="you@agency.com"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="contact-phone">
            Phone Number
          </label>
          <input
            id="contact-phone"
            className={styles.input}
            type="tel"
            placeholder="+91 98XXXXXXXX"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor="contact-message">
          Message
        </label>
        <textarea
          id="contact-message"
          className={styles.textarea}
          rows={5}
          placeholder="Tell us about your agency, city, verification question, or partnership inquiry..."
          required
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </div>

      {status.text && (
        <div
          style={{
            marginBottom: 16,
            padding: '11px 14px',
            borderRadius: 10,
            fontSize: 13.5,
            fontWeight: 600,
            background: status.type === 'ok' ? '#ecfdf5' : '#fef2f2',
            color: status.type === 'ok' ? '#065f46' : '#991b1b',
            border: status.type === 'ok' ? '1px solid #a7f3d0' : '1px solid #fecaca',
          }}
        >
          {status.text}
        </div>
      )}

      <button
        className={`${styles.btnPrimary} ${styles.btnLg}`}
        style={{ width: '100%' }}
        disabled={submitting}
        type="submit"
      >
        {submitting ? 'Sending Message...' : 'Send Message ->'}
      </button>
    </form>
  );
}