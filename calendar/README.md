# Calendars

**Import `gauntlet-live.ics`. Only that one.**

It is generated from the live Gauntlet list by `npm run calendar`
(`scripts/build-calendar.mjs`), so it cannot drift from the list:

- one deadline event per live route from today on, plus any verified prerequisite milestones recorded on that route;
- no repeating events;
- reminders a week and a day before application deadlines, packet work with a hard deadline, and required prerequisite milestones;
- deadlines with a time are placed on their Taipei date, with the local close
  time in the title;
- every event ID is `<route-id>-<YYYYMMDD>@blowback`, so re-importing updates
  events instead of duplicating them.

Regenerate after the list changes, then re-import into the same calendar.
`calendar:queue` reads this generated file by default.

## Do not import the other files

`gauntlet-consolidated-*.ics`, `gauntlet-postgrad-*.ics`,
`research-assets-gauntlet-*.ics` and `policy-lab-gauntlet-2026.ics` are the
older hand-edited planning calendars. Some historical reports still read the
active and rolling-watch files as planning input, which is the only reason they
are kept. As calendars they are wrong: on 2026-09-30 only 1 of the 82 events in
the active file matched a live route, they carried archived routes and
follow-ups for applications never sent, 25 reminders repeated with no end, and
18 dated routes were missing, NCCU, NTU and HKPFS among them.
