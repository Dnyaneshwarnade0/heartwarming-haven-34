# Historical attendance and student-status import

## Goal

Import the supplied June–September attendance totals, complaint records, and blacklist records into the local student-management portal. Identify students who are not attending school and prevent them from being counted as absent for the School session.

## Source mapping

- `Student Roll List`: import monthly School, Evening, and Morning attendance totals for roll numbers 1–72.
- `Student not going to school`: use the 15 red Marathi-name cells as the not-attending-school list. Black entries remain regular school attendees.
- `Complaints Log`: import all 74 complaint rows and retain every record, including repeated entries.
- A `Blacklist` value in the complaints sheet marks the affected student's complaint as blacklisted. Seven rows affect five students.

## Confirmed source corrections

- Atharv Waghmare's September Morning and Evening totals are 26, not 260.
- Vedant Ubre's September School total stays blank.
- Yash Shinde's June Morning and Evening totals stay blank.

## Data model and behaviour

- Add monthly historical attendance totals without fabricating daily attendance records.
- Add a `notGoingToSchool` status to the affected student records.
- Show the status with a distinct visual treatment in the portal's student list and profile.
- Exclude the School session from attendance denominators and absence prompts for these students. Morning and Evening sessions remain unaffected.
- Keep the status active for future attendance in both the portal and Telegram bot, without changing historical June–September totals.
- Preserve existing student records and merge incoming data by roll number. Unmatched or duplicate roll numbers stop the import for review.

## Import safeguards

- Validate all 72 workbook students against the portal roster before writing.
- Treat the three confirmed blank attendance cells as unavailable, not zero or absent.
- Preserve existing complaint history while appending new complaint rows.
- Validate post-import counts: 72 attendance histories, 15 not-attending-school statuses, 74 imported complaints, and five blacklisted students.

## Verification

- Add automated checks for the status-to-attendance exclusion rule and import validation.
- Build the application and verify the local portal loads.
- Spot-check the corrected Atharv, Vedant, and Yash records, one marked not-attending-school student, and one blacklisted student.
