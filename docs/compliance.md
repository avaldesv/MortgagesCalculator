# MortgageCalc — Compliance & disclosures (P0-A)

| Campo | Valor |
|-------|--------|
| Product | MortgageCalc |
| Status | P0-A — legal review TBD |
| Last updated | 2026-05-24 |

## Nature of service

MortgageCalc provides **educational estimates** for U.S. residential mortgage scenarios. It is **not** a loan offer, commitment to lend, or personalized financial advice.

## Estimates disclaimer (required in UI)

Display near every monthly payment result and in the site footer:

> **Estimates only.** Monthly payments shown are illustrative. Actual payments vary by lender, credit profile, taxes, insurance, HOA, PMI, and loan program. This tool does not guarantee approval or rates.

## Accuracy

- Calculations use standard amortization formulas and user-entered assumptions.
- Property tax, insurance, PMI, and HOA are estimates unless sourced from verified data (future phases).
- Users should confirm figures with a licensed loan officer or lender.

## Advertising / sponsored listings

- Listings shown in ad modules must be labeled **Sponsored** when configured via admin.
- MortgageCalc does not endorse any listing, agent, or lender.

## Leads & contact (Partners tab — P0-B / API v0.1)

- `consentContact: true` required before submitting partner leads.
- Retention period and privacy policy URL: **TBD legal** (target: document before production marketing).
- Do not sell or share lead data without disclosure in privacy policy.

## Admin access

- Admin routes require authentication (JWT).
- Credentials limited to staff; rotate default seed credentials before production.

## Regulatory note

This document is a product placeholder. Obtain review from qualified counsel before large-scale marketing or lead collection.
