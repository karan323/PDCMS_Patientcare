# Hospital Inpatient Requirements Coverage

This project now maps the requirements in `Req/Hospital_Inpatient_Web_Requirements_Sheet.docx` into the staff-side prototype.

## Implemented Coverage

| Requirement area | Project coverage |
| --- | --- |
| 1. Product goals | Single admission record stores admission, care, activity, medication, diagnostics, scheduling, discharge, documents, visibility, audit, and follow-up data. |
| 2. Roles and boundaries | Expanded staff roles include Head Admin/Super Admin, ward staff, nurses, doctors, consultants, diagnostics/lab, reception/scheduling, and privacy/compliance. New account creation is Head Admin-gated after first setup. |
| 3. Page map | Main workspace includes Dashboard, Admission, Patient Profile, Daily Activity, Care Summary, Medication/MAR, Reports, Consultant Visit, Doctor Slots, Discharge, Document Center, Notes/Notifications, and Admin/Audit. `/patients` provides patient search/edit. `/login` provides secure login and account creation. |
| 4. Authentication/session/access | Staff login is required for inpatient APIs, tokens expire, failed login lockout is configurable, Head Admin account creation is protected, and access events are recorded when patient records are opened. |
| 5. Dashboard | Dashboard now shows admitted patients, pending discharge, pending reports, due medication tasks, consultant visits, daily notes due, priority patients, follow-up scheduling, vitals due, abnormal reports, discharge blockers, portal setup pending, and alert previews. |
| 6. Admission | Admission form captures identity, DOB, age, sex/gender, phone, address, emergency contact/relationship, blood group, health card reference, admission IDs, admission date/time, department, ward, room, bed, doctor, diagnosis, allergies, status tags, portal status, consent, caregiver access, and generated portal credentials. |
| 7. Patient overview | Patient workspace header, admission/medication/report/appointment summary cards, allergy/status risk tag, and portal publication status are available in the profile module. |
| 8. Clinical summary | Diagnosis, treatment plan, precautions, diet, observations, progress notes, visibility, sign-off, nurse acknowledgement, addendum reason, field history, and audit events are persisted. |
| 9. Daily activity | Activity date/time/type, performer, status, priority, taxonomy, governance note, vitals/meal/procedure/mobility checks, exception flag, and remarks are captured. |
| 10-11. Medication/MAR | Prescription fields, schedule/PRN, food/caution instructions, allergy/interaction warnings, override reason, change reason, administration status/time/user, and exception reason are captured and validated. |
| 12. Diagnostics/reports | Multiple reports can be added by category with order/schedule/result dates, status workflow, file reference, clinician review, release state, abnormal flag, patient visibility, and grouped preview. |
| 13. Scheduling/follow-up | Consultant requests, status, reschedule reason, 5 availability slots, provider/location, blocked dates, appointment booking, follow-up type/provider, next test, and reminder dates are captured. |
| 14. Discharge | Readiness fields, blockers, final diagnosis, hospital course, procedures, medications, home instructions, warning signs, sign-off, checklist gating, discharge pack publication, and reminder dates are captured. |
| 15. Documents | Dedicated Document Center captures category, date, source, owner, file reference, visibility, current/superseded state, and replacement note. |
| 16. Notifications | Notes module includes reminder owner/due/status, patient notification trigger, and template notes for report release, appointments, discharge publication, and reminders. |
| 17. Admin/audit | Admin/Audit module captures update logs, role visibility, approval flow, access review notes, master data notes, policy notes, break-glass reason, export purpose, and approval. API persists create/edit/access audit events and field history. |
| 18. NFR/security/compliance | Server-side validation covers required clinical fields, DOB/date formats, phone format, room/bed conflicts, duplicate patients, medication schedule rules, exception reasons, review-before-release, discharge checklist gating, and conservative visibility controls. |
| 19. Field catalogue | All listed field groups are represented in the UI and persisted through the admission API. |
| 20. Discovery questions | Open policy questions remain documented in the source requirements and are represented by configurable fields where final hospital policy is unknown. |
| 21. Implementation advice | The UI uses a persistent patient workspace with tab navigation, explicit publication states, medication safety checks, report release controls, fast patient search, and audit/history persistence. |

## Known Prototype Boundaries

- Drug interaction and allergy warnings are captured as fields, but no external formulary integration is connected yet.
- HL7/HIS/EHR/LIS/PACS integrations are represented as policy/integration notes; no live integration connector is implemented.
- Uploaded files are stored as references in this prototype; binary storage is not implemented.
- Visual browser verification could not be run in this environment because the `agent-browser` CLI is unavailable.
