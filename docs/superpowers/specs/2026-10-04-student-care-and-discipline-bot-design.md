# Student Care and Discipline Bot Design

## Approved scope

Implement only the following in both the web software and Telegram bot:

1. A predefined discipline complaint list: shivya dene, shalet dhingana ghalane, abhyas na karne, seva na kare, mothyana ulate firun bolane, and ushira uthane. The repeated "abhyas na karne" item is one option. Also provide a free-text reason.
2. Health records in the bot: select student, select or write an illness/reason, and record a free-text note. Show the records in the software health profile.
3. Adarsh Vidyarthi: allow an administrator-written custom note.
4. Leave / gaav: select student, enter the free-text reason and date range. Show leave attendance in a distinct colour, never as absent; attendance returns to normal after the range.
5. Palak visit: select student and save who visited, relation, reason, and the administrator's note. Show its history in the software profile.
6. All bot-created records must appear in the software and all software-created records must be included in bot student information/sync.

## Explicit non-goals

- Do not alter unrelated menus, attendance rules, marks, fees, complaints/blacklist behaviour, or other software UI.
- Do not add new roles, notifications, uploads, automated messages, or workflow categories beyond the approved list.

## Data conventions

- Discipline records use the existing `complaints` list with a defined type and free-text `action`.
- Health records append dated notes to the existing `medical.doctorNotes` field.
- Leave remains in the existing `leaves` list and uses the established `"leave"` attendance value.
- Palak visits are a new per-student `parentVisits` list of `{ date, visitor, relation, reason, note }`.
- Adarsh records preserve `{ id, name, date, note }` in `vss_adarsh_week`.
