import path from 'node:path';
import { loadOpportunity } from '../core/load.mjs';
import { assertOpportunity } from '../core/validate.mjs';
import { createRecordDir, writeJson } from '../core/record.mjs';
import { openBrowser } from '../core/browser.mjs';
import { resolveRouteUrls } from '../core/routes.mjs';

const ROUTE_WORDS = /(apply|application|register|registration|sign\s*in|log\s*in|create\s*account|submit|submission|報名|报名|申請|申请|投稿|徵件|征件|參賽|参赛)/i;

function classifyCandidate(text) {
  if (/(sign\s*in|log\s*in|create\s*account)/i.test(text)) return 'auth';
  if (/(submit|submission|投稿)/i.test(text)) return 'submission';
  if (/(apply|application|register|registration|報名|报名|申請|申请|徵件|征件|參賽|参赛)/i.test(text)) return 'registration';
  return 'candidate';
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

export async function collectReconSnapshot(page) {
  const snapshot = await page.evaluate(() => {
    const text = (node) => (node?.innerText ?? node?.textContent ?? '').replace(/\s+/g, ' ').trim();
    const labelsFor = (element) => {
      const labels = element.labels ? [...element.labels].map((label) => text(label)).filter(Boolean) : [];
      const fallback = element.getAttribute('aria-label') || element.getAttribute('placeholder') || null;
      return labels.length ? labels : (fallback ? [fallback] : []);
    };

    const links = [...document.querySelectorAll('a[href]')].map((anchor) => ({
      text: text(anchor).slice(0, 240),
      href: anchor.href
    }));

    const controls = [...document.querySelectorAll('input, textarea, select')].map((element) => ({
      tag: element.tagName.toLowerCase(),
      type: element.getAttribute('type') || null,
      name: element.getAttribute('name') || null,
      id: element.id || null,
      labels: labelsFor(element),
      required: Boolean(element.required),
      disabled: Boolean(element.disabled),
      accept: element.getAttribute('accept') || null,
      multiple: Boolean(element.multiple),
      autocomplete: element.getAttribute('autocomplete') || null
    }));

    const buttons = [...document.querySelectorAll('button, input[type="submit"], input[type="button"]')].map((button) => ({
      text: (text(button) || button.getAttribute('value') || '').slice(0, 240),
      type: button.getAttribute('type') || null,
      name: button.getAttribute('name') || null,
      id: button.id || null,
      disabled: Boolean(button.disabled)
    }));

    const forms = [...document.forms].map((form) => ({
      id: form.id || null,
      name: form.getAttribute('name') || null,
      action: form.action || null,
      method: (form.method || 'get').toLowerCase(),
      control_count: form.elements.length
    }));

    const iframes = [...document.querySelectorAll('iframe')].map((frame) => ({
      src: frame.src || null,
      title: frame.getAttribute('title') || null,
      name: frame.getAttribute('name') || null
    }));

    const bodyText = text(document.body).slice(0, 200000);
    const captchaNodeCount = document.querySelectorAll(
      'iframe[src*="recaptcha"], iframe[src*="hcaptcha"], .g-recaptcha, .h-captcha, [data-sitekey]'
    ).length;

    return {
      title: document.title,
      url: location.href,
      links,
      controls,
      buttons,
      forms,
      iframes,
      signals: {
        password_inputs: document.querySelectorAll('input[type="password"]').length,
        email_or_username_inputs: document.querySelectorAll('input[type="email"], input[autocomplete="username"]').length,
        captcha: captchaNodeCount > 0 || /\b(captcha|recaptcha|hcaptcha)\b/i.test(bodyText),
        two_factor: /\b(2fa|two[- ]factor|verification code|one[- ]time code|otp)\b/i.test(bodyText),
        login: /\b(sign in|log in|login|create account)\b/i.test(bodyText)
      }
    };
  });

  const candidateLinks = snapshot.links
    .filter((link) => ROUTE_WORDS.test(`${link.text} ${link.href}`))
    .map((link) => ({ ...link, kind: classifyCandidate(`${link.text} ${link.href}`) }));

  return {
    ...snapshot,
    candidate_links: candidateLinks,
    file_inputs: snapshot.controls.filter((control) => control.type === 'file')
  };
}

export async function reconOpportunity(filePath, { persistAuth = false } = {}) {
  const opportunity = await loadOpportunity(filePath);
  assertOpportunity(opportunity);
  const routes = resolveRouteUrls(opportunity);
  if (!routes.recon_url) throw new Error('recon requires source_url, registration_url, submission_url, or entry_url');

  const recordDir = await createRecordDir(`${opportunity.id}-recon`);
  const session = await openBrowser(opportunity);
  const navigations = [];
  const onNavigation = (frame) => {
    if (frame === session.page.mainFrame()) navigations.push(frame.url());
  };
  session.page.on('framenavigated', onNavigation);

  try {
    await session.page.goto(routes.recon_url, { waitUntil: 'domcontentloaded' });
    const snapshot = await collectReconSnapshot(session.page);
    await session.page.screenshot({ path: path.join(recordDir, 'recon.png'), fullPage: true });
    if (persistAuth) await session.persistAuth();

    const receipt = {
      schema: 'blowback.portal_recon.v1',
      opportunity: opportunity.id,
      portal: opportunity.portal,
      auth_scope: session.authScope,
      routes,
      observed: snapshot,
      navigations: unique(navigations),
      mutations_performed: false,
      final_submit_performed: false,
      candidate_route_status: 'UNVERIFIED',
      manifest_updated: false,
      execution_state_before: opportunity.execution_state ?? 'RESEARCH_ONLY',
      recommended_next_state: 'PORTAL_RECON_REQUIRED',
      boundary: 'recon observes only; candidate routes must be human-verified before prepare is enabled'
    };
    await writeJson(recordDir, 'recon.json', receipt);
    return { recordDir, receipt };
  } finally {
    session.page.off('framenavigated', onNavigation);
    await session.browser.close();
  }
}
