# Select every school on a Handshake job posting

Clicking ~1,000+ schools one at a time in the **Search by name** picker is slow.
`select-all-schools.js` does the clicking for you.

> First check the picker's **suggested groups**: if Handshake offers an "all
> schools" style group for your account, selecting it is faster than any script.

## Option A: browser console (no install)

1. Open the job > **Job details**, click **Edit** on the schools section so the
   "Search by name" box shows.
2. Open DevTools (Mac `Cmd+Opt+J`, Windows `Ctrl+Shift+J`), paste all of
   `select-all-schools.js`, press Enter.
3. Progress logs every 25 schools. Stop anytime with `window.__stopSchoolSelect = true`.
4. Review the selection and click **Save** yourself.

Do a test run first: `selectAllHandshakeSchools({ max: 5 })`.

## Option B: Playwright

```
cd handshake
npm install
npm start
```

Log in in the Chrome window that opens (the profile is kept in `.hs-profile/`),
open the school picker, press Enter in the terminal.

## If it says "no elements match [role=option]"

Right-click a school in the dropdown > **Inspect**, find a selector shared by
every school row, and run e.g.
`selectAllHandshakeSchools({ optionSelector: 'li[data-test="school-option"]' })`.

Options: `delayMs` (default 250; raise it if selections are missed), `max`,
`optionSelector`, `inputSelector`, `skip` (regex of rows to skip; defaults to
consortia, school lists and groups).
