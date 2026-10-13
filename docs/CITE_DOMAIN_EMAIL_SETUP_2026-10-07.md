# Cite domain email setup — October 7, 2026

## Observed current state

Public DNS queries succeeded:

- Domain: cite-agent.com
- Nameservers: dns1.registrar-servers.com, dns2.registrar-servers.com
- MX: eforward1/2/3.registrar-servers.com (priority 10), eforward4 (15), eforward5 (20)
- SPF: v=spf1 include:spf.efwd.registrar-servers.com ~all

This matches Namecheap free forwarding infrastructure. DNS cannot establish whether a particular alias exists, its destination, or successful message delivery.

Browser domain-management link https://ap.www.namecheap.com/domains/list/ currently redirects to Namecheap login. Owner sign-in required; no credentials requested or captured. No DNS or aliases changed.

## Prepared next action

Inspect cite-agent.com Manage → Domain → Redirect Email after owner sign-in. Preserve existing forwarding aliases and destinations. Prefer an existing owner address; otherwise propose founder@cite-agent.com routed to the established owner contact in canonical applicant authority. Confirm the specific destination before altering delivery. Do not access any inbox; canonical authority prohibits email access.

Keep existing website and docs DNS intact. Existing MX/SPF need no replacement merely to add a forwarder.

Namecheap forwarding is receive-only, not a sending mailbox. If full send/receive is required, inspect existing Private Email/hosting entitlements first. Any new paid mailbox purchase, terms acceptance or password creation is a human gate. Before a migration, record existing aliases and reconcile delivery; free forwarding and another root-domain email provider cannot operate together using Namecheap’s forwarding setup.

## Verification

After saving an approved alias, Namecheap advises allowing about one hour for setup. Test delivery from a different sender than the forwarding destination; owner confirms receipt without granting inbox access. User request covers configuration help, not automatic outgoing test messages. Domain-email acceptance by Claude remains subject to its actual verification and eligibility review.

## Sources

https://www.namecheap.com/support/knowledgebase/article.aspx/308/2214/how-to-set-up-free-email-forwarding/
https://claude.com/programs/startups

Status: WAITING_HUMAN — Namecheap sign-in; no mailbox created, no forwarding alias verified, no application submitted.

## Full mailbox follow-up

Owner clarified that a full send/receive mailbox is required. No forwarding rule was saved; the empty forwarder form was cancelled.

Browser troubleshooting found two extension profiles: the original connection was `christ`, while the signed-in Namecheap account is in `Your Chrome`. The latter’s user tab was claimed; authenticated account `spectating101` and cite-agent.com ownership were observed. Agent-created unmarked tabs were closing at turn end; preserve the current handoff tab.

Private Email subscription list explicitly reports no subscription. Prepared Launch Email for cite-agent.com in the existing account cart: one mailbox, 5 GB, 10 aliases, 1 Month free trial, subtotal $0.00. Public pricing lists $14.88/year renewal after the trial. Cart AUTO-RENEW is checked by default and remains unchanged. No unrelated add-ons selected.

Stopped before Confirm Order (subscription/legal human gate under AGENTS.md). Owner must review auto-renew and complete order confirmation. No subscription activation, DNS modification or mailbox creation has occurred.

Next: after order receipt, create founder@cite-agent.com with an owner-chosen password, configure provider-designated MX/SPF/DKIM records preserving web/docs records, verify DNS and let owner verify actual send/receive. Inbox access remains prohibited. Then resume the Claude startup application.

## Provider comparison after owner cost question

Namecheap is convenient, not verified cheapest. No order confirmed.

- Zoho Forever Free: one custom domain, up to 5 users, 5 GB/user; web/mobile mail, no IMAP/POP/ActiveSync. Available only in selected data centers; actual Taiwan/account signup availability must be checked before recommending it as guaranteed free. Source: https://www.zoho.com/mail/zohomail-pricing.html
- Purelymail simple pricing: $10/year with custom domains; excessive usage may require advanced usage billing. Source: https://purelymail.com/pricing
- Namecheap Launch: 30-day free trial then listed $14.88/year, one 5 GB mailbox, IMAP/SMTP, convenient existing registrar account. Prepared cart remains unconfirmed.
- Existing Namecheap free forwarding is receive-only and does not meet owner’s requested full mailbox setup.

Recommendation: inspect Zoho’s free signup availability first. If unavailable or an external mail client is required, compare Purelymail’s $10/year against Namecheap’s $14.88/year; prefer Namecheap only when same-account administration is worth the $4.88 annual difference. Claude requires matching domain contact, not a particular mailbox vendor.

## Zoho and Student Pack follow-up

Owner selected Zoho and reports a possible existing prior setup. No Zoho connector or existing Zoho tab found in the active Chrome profile; opened public admin entry and followed its Sign In link. No personal fields entered, account created or inbox accessed. Existing Zoho organization/domain state is not yet established.

Current GitHub Student Pack public catalog checked October 7: Namecheap offers .me domain registration and SSL, not Private Email. Name.com offer is selected domain registration; Testmail Essential is for automated email testing. No Zoho offer listed. These findings do not certify account-specific redemption state. Source: https://education.github.com/pack

Namecheap trial order remains unconfirmed while Zoho is evaluated; no purchase or DNS change.

## Existing Zoho organization inspected

Authenticated administration confirms Presuniv Reference Project, domain presunivreference.info, Mail Free, four active users, five licenses, United States data center. Domain requires ownership re-verification; dashboard lists MX/SPF 0/1 and DKIM 1/1. This does not establish registrar expiry or message delivery. No inbox read.

Attempted only the reversible Add an existing domain control. Zoho displays: maximum number of domains reached; upgrade to paid to add more. Dialog closed without upgrade. No domains/users/DNS/subscriptions changed.

Cite must use a separate eligible free organization or a paid additional-domain setup. Repurposing old organization would require a user decision and review of four users, login continuity and retained mail; old domain status alone does not authorize removal.

The authenticated free signup link redirected the existing organization user to its Mail application rather than creating another organization. The new tab was closed immediately after observing shell/loading state; no messages were opened. A separate administrator identity/signup may be needed for a separate free Cite organization, subject to Zoho’s actual signup eligibility. Preserve four-user old organization.

## Owner-authorized repurpose assessment

Owner reports old presunivreference.info expired and unnecessary, authorizes removal/repurpose using operator judgment. Opened domain Delete review dialog only. No final Delete clicked.

Live warning: permanent/irrecoverable data loss, immediate old-domain email disruption, associated addresses/subdomain addresses may be unverified or permanently deleted across Zoho services according to inactivity policy, administrators lose management of affected users. Portal recommends adding replacement and reassigning users before deletion; existing free plan blocks second domain. This materially broadens consequences beyond simply removing an expired DNS domain.

Final destructive control and reauthentication remain human-gated under AGENTS.md. Exact dialog preserved for owner review; do not reinterpret broad setup authority as permission to silently remove organization users or all-services accounts. After owner removal, inspect surviving session/account state before attempting Cite domain registration. Free-plan survival and direct replacement are not guaranteed by this screen.

## Cite domain replacement completed

Owner confirmed deleting the expired domain. Verified the empty domains list, then added cite-agent.com successfully to the existing Mail Free organization. Four existing users and five licenses remain. Domain ownership is verified; cite-agent.com is the primary domain.

Configured Namecheap public DNS using records supplied by Zoho US administration:

- Ownership TXT @: zoho-verification=zb26949666.zmverify.zoho.com
- Custom MX @: mx.zoho.com priority 10; mx2.zoho.com priority 20; mx3.zoho.com priority 50.
- Single SPF TXT @: v=spf1 include:zohomail.com ~all
- DKIM TXT zmail._domainkey: exact provider-generated public key. Zoho confirmed selector verified and signing Status checked/enabled.

Zoho dashboard now confirms MX 1/1, SPF 1/1, DKIM 1/1. Public DNS lookup independently resolves the three MX records, ownership/SPF TXT and DKIM TXT. Website A @ 76.76.21.21, docs A 165.245.190.241 and www CNAME cname.vercel-dns.com. were preserved. No paid order or upgrade completed.

After a full admin-page reload restored Mailbox Settings, added founder@cite-agent.com to the existing owner mailbox, display name Christopher Ongko, with Set as Mailbox Address selected. Zoho confirms Email alias added successfully and lists founder@cite-agent.com as Mailbox address. Existing owner credentials and personal Gmail login remain; no new password/user was created. The expired-domain address remains a legacy alias/login and should not be used for delivery. Other users were not modified.

Zoho documents that aliases can send, receive and log in: https://www.zoho.com/mail/help/adminconsole/user-settings.html#email-alias

Configuration is complete; real delivery is not yet tested. Owner should send a message from personal Gmail to founder@cite-agent.com, open Zoho Mail personally, and reply using founder@cite-agent.com. Operator did not open/read an inbox or send a message; canonical authority still prohibits email access.

Claude Startups application opened in the correct signed-in Chrome profile. It still requires Console login, and Continue explicitly accepts terms. Filled founder@cite-agent.com in the reversible email field and left Continue with email for the owner under AGENTS.md. No application submitted.

## Agreed academic identity update

Owner selected chrisko@cite-agent.com and Xin-Fu Wang (王新福), the established academic writing name used on SSRN and papers. Added this address to the existing Zoho mailbox and set it as the default mailbox address; provider list confirms it. Founder address remains an alias; no addresses/users were deleted. This supersedes founder@ for the active Cite contact. Existing account password unchanged. Actual message delivery still untested.

Claude Console sign-in now has chrisko@cite-agent.com prepared. Continue with email explicitly accepts terms and remains for the owner under AGENTS.md. Owner must complete verification personally and tell operator when signed in. No external application draft/submission exists.

## Delivery test preparation

Owner requested a test to personal Gmail. Public MX/SPF/DKIM rechecked successfully. Current Zoho composer confirms sender Xin-Fu Wang <chrisko@cite-agent.com>. Prepared subject Cite-Agent email delivery test. Legacy compose endpoint returned 404; used current New Mail control, dismissed introduction dialogs and inspected composer controls only. No inbox messages read. Recipient/body/send await the Chrome skill action-time confirmation presented to owner. No test sent and delivery is not yet verified. Composer preserved for continuation.

## Approved outbound test sent

Owner explicitly confirmed "yes send this test". Sent from Xin-Fu Wang <chrisko@cite-agent.com> to christ.ongko13@gmail.com, subject Cite-Agent email delivery test, body: This is a test of chrisko@cite-agent.com. Please reply to this message to verify incoming delivery as well. No CC/BCC.

Zoho displayed Mail sent at 2026-10-07T15:46:34.977593+00:00. This confirms provider submission, not Gmail receipt, spam placement or inbound reply delivery. No inbox messages read. Owner should confirm Gmail receipt and reply to verify incoming mail. No persistent forwarding rule was configured.

Owner confirmed test arrived in Gmail notifications, establishing outbound delivery. Owner reports replying from Gmail; inbound verification pending.

## Incoming test reply verified

At 2026-10-07T15:50:53.046014+00:00, checked only the owner-authorized test conversation. Zoho inbox contains the two-message Cite-Agent email delivery test thread; received reply view is https://mail.zoho.com/zm/#mail/folder/inbox/p/1791388062290158500 and visible sender header title is christ.ongko13@gmail.com. Combined with owner-confirmed original arrival in Gmail, two-way delivery is verified. No unrelated email messages inspected.

## October 8 forwarding check and owner decision

Owner requested chrisko@cite-agent.com forwarding to christ.ongko13@gmail.com. Inspected existing mailbox forwarding settings: no forwarding addresses configured. Zoho rejected Add with a paid-plan-only upgrade dialog. No forwarding rule or paid upgrade was made. Owner then chose to operate Zoho Mail directly and complete Claude login personally.
