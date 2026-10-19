# Read-only employer portal pilot — October 19, 2026

**Testing only. No application started, no personal data entered, no files uploaded, no Save/Submit, no account created.** Two Greenhouse forms and one Citi route were inspected using public HTML from Optiplex. This is not a browser-driven authenticated form-fill test.

| Employer | Route | Observed response | Interpretation |
| --- | --- | --- | --- |
| Point72 | https://job-boards.greenhouse.io/point72/jobs/7046014002 | HTTP 200, job-specific page titled Quantitative Finance Researcher, one public form, 18 field controls and a Submit Application control | Public intake form exists. No proof that filling or uploading works, and none attempted. |
| Appier | https://job-boards.greenhouse.io/appier/jobs/5332115 | HTTP 200, page titled Campaign Executive, one public form, 14 controls | Second employer form readable. No candidate eligibility or upload verified. |
| Citi | https://jobs.citi.com/job/taipei/banking-commercial-banking-full-time-analyst-taiwan-apac-2027/287/101437508560 | HTTP 404, title Job Not Found | Previously advertised listing cannot be treated as a currently live application route. |
| Citi Workday | https://citi.wd5.myworkdayjobs.com/2/job/Taipei-Taipei-City-Taiwan/Banking---Commercial-Banking--Full-Time-Analyst--Taiwan---APAC--2027_26995362/apply | HTTP 200, client-rendered shell, zero server-visible form inputs | Workday app cannot be verified by HTTP 200; must use an actual rendered interactive browser and possibly authentication to determine whether requisition is active. |

## Test limits and result

- Point72 required inputs include name, email, phone, CV attachment, degree/education widgets, and separate questions. The page has a Submit Application control that **must not** be triggered without human approval.
- Appier provides a second public ATS form. Applicant-specific fields and upload functionality were not tried.
- Citi's public careers URL is currently dead. A Workday shell responding 200 is not enough to restore ACTIVE status; a genuine rendered portal check is needed.
- No saved drafts exist from this pilot. Existing CVs are local review drafts only. No employer received personal data.
- The connected browser read-only interface only exposes already-open tabs; no employer application tab was available. A real authenticated/browser-driven form-fill pilot should be done in Work mode, or with a separately authorized GUI browser-capable Optiplex operator. Do not imply we tested interactive form filling here.

## Next controlled pilot

1. In an authorized interactive browser, open Point72 and record precise field requirements without uploading or submitting.
2. Use the private reviewed quant CV and applicant authority to map field data locally. Stop for personal-history questions, sponsorship or legal declarations.
3. Only with owner-approved document choice and authorization, test a reversible upload or saved draft. Never press Submit.
4. Record gate failures, manual touches required and elapsed operator effort. Compare a second portal type (Workday) after evaluating which requisitions are truly available.
5. Do not begin 10+ applications or recurring application automation until the read-only test has passed and an owner has reviewed pilot results.
