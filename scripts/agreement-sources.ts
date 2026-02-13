/**
 * Agreement Sources Registry
 *
 * Single source of truth for all SaaS agreements analysed by Livo.
 * Used by both the download script and the vector-DB seed script.
 */

export interface AgreementSource {
  /** Company / provider name */
  company: string;
  /** Human-readable agreement title */
  agreementName: string;
  /** Public URL of the agreement page or PDF */
  url: string;
  /** "html" = render page to PDF via Puppeteer; "pdf" = direct download */
  type: "html" | "pdf";
  /** Output filename inside "Saas Agreements/" */
  filename: string;
  /** true = file was manually added before automation existed */
  existingManual?: boolean;
}

// ─────────────────────────────────────────────
// Existing agreements (already in Saas Agreements/)
// ─────────────────────────────────────────────

export const EXISTING_AGREEMENTS: AgreementSource[] = [
  {
    company: "AWS",
    agreementName: "AWS Customer Agreement",
    url: "https://aws.amazon.com/agreement/",
    type: "html",
    filename: "AWS Customer Agreement.pdf",
    existingManual: true,
  },
  {
    company: "Bonterms",
    agreementName: "Bonterms Cloud Terms v1.0",
    url: "https://bonterms.com/forms/cloud-terms/",
    type: "html",
    filename: "Bonterms-Cloud-Terms-Version-1.0.pdf",
    existingManual: true,
  },
  {
    company: "Common Paper",
    agreementName: "Common Paper Cloud Service Agreement v2.1",
    url: "https://commonpaper.com/standards/cloud-service-agreement/",
    type: "html",
    filename:
      "Common-Paper-Cloud-Service-Agreement-SLA-v2.1-cover-page-and-standard-terms.docx",
    existingManual: true,
  },
  {
    company: "GitHub",
    agreementName: "GitHub Customer Agreement",
    url: "https://github.com/customer-terms",
    type: "html",
    filename:
      "GCA_-_2025_03_-_GitHub_Customer_Agreement_General_Terms_-_FINAL_locked.pdf",
    existingManual: true,
  },
  {
    company: "Google Cloud",
    agreementName: "Google Cloud Platform Terms of Service",
    url: "https://cloud.google.com/terms",
    type: "html",
    filename: "Google Cloud Platform Terms Of Service.pdf",
    existingManual: true,
  },
  {
    company: "Oracle",
    agreementName: "Oracle Cloud Services Agreement",
    url: "https://www.oracle.com/corporate/contracts/cloud-services/",
    type: "html",
    filename:
      "Oracle+Cloud+Services+Agreement+-+Oracle+Corporation+Singapore+Pte+Ltd.+-+v012418.pdf",
    existingManual: true,
  },
  {
    company: "Salesforce",
    agreementName: "Salesforce Master Subscription Agreement",
    url: "https://www.salesforce.com/company/legal/agreements/",
    type: "html",
    filename: "salesforce_MSA.pdf",
    existingManual: true,
  },
  {
    company: "Stripe",
    agreementName: "Stripe Services Agreement",
    url: "https://stripe.com/legal/ssa",
    type: "html",
    filename: "Stripe Services Agreement - General Terms.pdf",
    existingManual: true,
  },
  {
    company: "Zendesk",
    agreementName: "Zendesk Customer Agreement",
    url: "https://www.zendesk.com/company/agreements-and-terms/master-subscription-agreement/",
    type: "html",
    filename: "Zendesk Customer Agreement.pdf",
    existingManual: true,
  },
  {
    company: "Zoom",
    agreementName: "Zoom Terms of Service",
    url: "https://explore.zoom.us/en/terms/",
    type: "html",
    filename: "Zoom Terms of Service _ Zoom.pdf",
    existingManual: true,
  },
];

// ─────────────────────────────────────────────
// New agreements to download
// ─────────────────────────────────────────────

export const NEW_AGREEMENTS: AgreementSource[] = [
  // ── Tier 1: Hyperscalers / Mega Cap ──
  {
    company: "Microsoft",
    agreementName: "Microsoft Azure Online Subscription Agreement",
    url: "https://azure.microsoft.com/en-us/support/legal/subscription-agreement/",
    type: "html",
    filename: "Microsoft Azure Online Subscription Agreement.pdf",
  },

  // ── Tier 2: Enterprise SaaS Leaders ──
  {
    company: "Adobe",
    agreementName: "Adobe General Terms of Use",
    url: "https://www.adobe.com/legal/terms.html",
    type: "html",
    filename: "Adobe General Terms of Use.pdf",
  },
  {
    company: "ServiceNow",
    agreementName: "ServiceNow Subscription Service Agreement",
    url: "https://www.servicenow.com/content/dam/servicenow-assets/public/en-us/doc-type/legal/servicenow-subscription-service-agreement.pdf",
    type: "pdf",
    filename: "ServiceNow Subscription Service Agreement.pdf",
  },
  {
    company: "Workday",
    agreementName: "Workday Universal Customer Terms",
    url: "https://www.workday.com/en-us/legal/universal-contract-terms-and-conditions/index.html",
    type: "html",
    filename: "Workday Universal Customer Terms.pdf",
  },
  {
    company: "Intuit",
    agreementName: "Intuit Terms of Service",
    url: "https://accounts.intuit.com/terms-of-service",
    type: "html",
    filename: "Intuit Terms of Service.pdf",
  },
  {
    company: "Shopify",
    agreementName: "Shopify Terms of Service",
    url: "https://www.shopify.com/legal/terms",
    type: "html",
    filename: "Shopify Terms of Service.pdf",
  },

  // ── Tier 3: Large Cap SaaS ──
  {
    company: "Snowflake",
    agreementName: "Snowflake Customer Terms of Service",
    url: "https://www.snowflake.com/legal/terms-of-service/",
    type: "html",
    filename: "Snowflake Customer Terms of Service.pdf",
  },
  {
    company: "Atlassian",
    agreementName: "Atlassian Cloud Terms of Service",
    url: "https://www.atlassian.com/legal/cloud-terms-of-service",
    type: "html",
    filename: "Atlassian Cloud Terms of Service.pdf",
  },
  {
    company: "HubSpot",
    agreementName: "HubSpot Customer Terms of Service",
    url: "https://legal.hubspot.com/terms-of-service",
    type: "html",
    filename: "HubSpot Customer Terms of Service.pdf",
  },
  {
    company: "Cloudflare",
    agreementName: "Cloudflare Self-Serve Subscription Agreement",
    url: "https://www.cloudflare.com/terms/",
    type: "html",
    filename: "Cloudflare Self-Serve Subscription Agreement.pdf",
  },
  {
    company: "Datadog",
    agreementName: "Datadog Terms of Use",
    url: "https://www.datadoghq.com/legal/terms/",
    type: "html",
    filename: "Datadog Terms of Use.pdf",
  },
  {
    company: "Squarespace",
    agreementName: "Squarespace Terms of Service",
    url: "https://www.squarespace.com/terms-of-service",
    type: "html",
    filename: "Squarespace Terms of Service.pdf",
  },
  {
    company: "DocuSign",
    agreementName: "DocuSign Terms and Conditions",
    url: "https://www.docusign.com/company/terms-and-conditions/web",
    type: "html",
    filename: "DocuSign Terms and Conditions.pdf",
  },
  {
    company: "Okta",
    agreementName: "Okta Terms of Service",
    url: "https://www.okta.com/terms-of-service/",
    type: "html",
    filename: "Okta Terms of Service.pdf",
  },
  {
    company: "CrowdStrike",
    agreementName: "CrowdStrike Terms and Conditions",
    url: "https://www.crowdstrike.com/terms-conditions/",
    type: "html",
    filename: "CrowdStrike Terms and Conditions.pdf",
  },
  {
    company: "Dropbox",
    agreementName: "Dropbox Terms of Service",
    url: "https://www.dropbox.com/terms",
    type: "html",
    filename: "Dropbox Terms of Service.pdf",
  },

  // ── Tier 4: Mid Cap SaaS ──
  {
    company: "MongoDB",
    agreementName: "MongoDB Cloud Terms of Service",
    url: "https://www.mongodb.com/legal/terms-and-conditions/cloud",
    type: "html",
    filename: "MongoDB Cloud Terms of Service.pdf",
  },
  {
    company: "Elastic",
    agreementName: "Elastic Cloud Monthly Terms of Service",
    url: "https://elastic.co/pdf/elastic-cloud-monthly-terms-of-service-global-v09122025-1.pdf",
    type: "pdf",
    filename: "Elastic Cloud Monthly Terms of Service.pdf",
  },
  {
    company: "Confluent",
    agreementName: "Confluent Cloud Terms of Service",
    url: "https://www.confluent.io/confluent-cloud-tos/",
    type: "html",
    filename: "Confluent Cloud Terms of Service.pdf",
  },
  {
    company: "Box",
    agreementName: "Box Terms of Service",
    url: "https://www.box.com/legal/termsofservice",
    type: "html",
    filename: "Box Terms of Service.pdf",
  },
  {
    company: "Monday.com",
    agreementName: "Monday.com Terms of Service",
    url: "https://monday.com/l/legal/tos/",
    type: "html",
    filename: "Monday.com Terms of Service.pdf",
  },
  {
    company: "Freshworks",
    agreementName: "Freshworks Terms of Service",
    url: "https://www.freshworks.com/terms/",
    type: "html",
    filename: "Freshworks Terms of Service.pdf",
  },

  // ── Tier 5: Growth / Popular SaaS ──
  {
    company: "Asana",
    agreementName: "Asana Terms of Service",
    url: "https://asana.com/terms",
    type: "html",
    filename: "Asana Terms of Service.pdf",
  },
  {
    company: "PagerDuty",
    agreementName: "PagerDuty Terms of Service",
    url: "https://www.pagerduty.com/service-terms-use/",
    type: "html",
    filename: "PagerDuty Terms of Service.pdf",
  },
  {
    company: "Notion",
    agreementName: "Notion Master Subscription Agreement",
    url: "https://www.notion.so/notion/Master-Subscription-Agreement-4e1c5dd3e3de45dfa4a8ed60f1a43da0",
    type: "html",
    filename: "Notion Master Subscription Agreement.pdf",
  },
  {
    company: "Canva",
    agreementName: "Canva Terms of Use",
    url: "https://www.canva.com/policies/terms-of-use/",
    type: "html",
    filename: "Canva Terms of Use.pdf",
  },
  {
    company: "Airtable",
    agreementName: "Airtable Terms of Service",
    url: "https://www.airtable.com/company/tos",
    type: "html",
    filename: "Airtable Terms of Service.pdf",
  },

  // ── Tier 6: Developer / Emerging SaaS ──
  {
    company: "Figma",
    agreementName: "Figma Terms of Service",
    url: "https://www.figma.com/tos/",
    type: "html",
    filename: "Figma Terms of Service.pdf",
  },
  {
    company: "Vercel",
    agreementName: "Vercel Terms of Service",
    url: "https://vercel.com/legal/terms",
    type: "html",
    filename: "Vercel Terms of Service.pdf",
  },
  {
    company: "Supabase",
    agreementName: "Supabase Terms of Service",
    url: "https://supabase.com/terms",
    type: "html",
    filename: "Supabase Terms of Service.pdf",
  },
  {
    company: "Netlify",
    agreementName: "Netlify Terms of Use",
    url: "https://www.netlify.com/legal/terms-of-use/",
    type: "html",
    filename: "Netlify Terms of Use.pdf",
  },
  {
    company: "Slack",
    agreementName: "Slack Terms of Service",
    url: "https://slack.com/terms-of-service",
    type: "html",
    filename: "Slack Terms of Service.pdf",
  },
];

// ─────────────────────────────────────────────
// Combined list (all 42 agreements)
// ─────────────────────────────────────────────

export const ALL_AGREEMENTS: AgreementSource[] = [
  ...EXISTING_AGREEMENTS,
  ...NEW_AGREEMENTS,
];

/**
 * Build a filename → agreementName lookup map.
 * Used by the seed script to resolve friendly names.
 */
export function buildNameMap(): Record<string, string> {
  return Object.fromEntries(
    ALL_AGREEMENTS.map((s) => [s.filename, s.agreementName])
  );
}
