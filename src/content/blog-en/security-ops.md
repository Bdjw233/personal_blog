From May to November 2025 I interned in network security operations at a new-materials company in Gaoyou. The work sounded very "traditional": patching endpoints, updating antivirus signatures, sweeping for weak passwords, watching anomalous outbound connections, maintaining firewalls and web-access policies, and provisioning and revoking accounts.

Six months in, the biggest thing I took away wasn't a security product — it was a **different lens on the code I write**.

## What the day-to-day actually is

A day of inspection looks roughly like this:

- Check patch status and antivirus versions across endpoints and servers, and record anything outstanding.
- Sweep accounts: any long-dormant ones, any with excessive privileges, any shared accounts.
- Watch outbound logs: which internal hosts are sending data to unfamiliar addresses.
- Handle alerts and tickets: someone clicked a phishing link, installed unvetted software, or can't get a printer working.
- Change policy: open a permission for a new hire, revoke one for a leaver, open a port temporarily and write down when it closes.

Individually these are trivial. Together they do one thing: **shrink the attack surface and make every change traceable**.

## Four habits that changed

### 1. Default config is not secure config

I used to consider a service done once it ran. Now I ask: should the default port change? Did we change the default credentials? Is the admin panel exposed to the internet? Did we close the debug endpoint before launch?

Most exploited vulnerabilities aren't exotic memory corruption — they're "default password unchanged" and "test endpoint left on".

### 2. Grant the least privilege necessary

The most common discovery during permission reviews is "that admin access we granted to rush a project three years ago is still there". The same applies to application code: don't save effort with a lazy `if (user) return true`, and don't run the database as root.

### 3. Logs are for your future self

The worst thing in an incident is "no record". Who changed a firewall rule, when, why, and when it was reverted — without those, an investigation becomes archaeology.

I started taking logging seriously in my own code too: **structured fields, a request ID, and a reason for the failure** — not `console.log('error')`.

### 4. Dependencies have an expiry date

Third-party libraries get vulnerabilities, images go stale, certificates expire. I used to `npm install` and never look again; now I watch the update cadence and at least: pin versions, follow security advisories, and keep upgrades quick.

## Turn inspections into a script

Repetitive checking has to be scripted — that was the one thing I insisted on most. Even a script that just generates an inspection record:

```python
import csv
from datetime import date

CHECKLIST = [
    ('Patch status', 'All endpoints and servers are patched to the latest'),
    ('Antivirus', 'Signature version is within 7 days'),
    ('Weak passwords', 'No weak or shared accounts'),
    ('Anomalous outbound', 'No internal host is contacting unknown external addresses'),
    ('Permissions', 'Leavers revoked, temporary grants expired'),
    ('Backups', 'Critical backup jobs succeeded'),
]

def write_report(path, operator, note=''):
    with open(path, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f)
        writer.writerow(['Date', 'Item', 'Standard', 'Result', 'Inspector', 'Notes'])
        for item, standard in CHECKLIST:
            writer.writerow([date.today().isoformat(), item, standard, 'Pending', operator, note])

if __name__ == '__main__':
    write_report('inspection.csv', operator='Shen Yuxuan')
    print('Inspection report generated')
```

The script itself is trivial; its value is that it turns "did I inspect today?" from memory into a file. With history, trends become visible — a machine that's missed patches three weeks running is more useful information than "everything is fine today".

## Three pieces of advice for developers

1. **Run an "attack surface checklist" before launch**: ports reachable from the internet, open endpoints, default accounts, debug switches, whether error stack traces leak.
2. **Don't treat security as post-launch work**: auth, input validation, and dependency management are development-time costs — the later you add them, the more they cost.
3. **Assume you'll be breached**: instead of chasing "absolutely can't get in", guarantee "if they get in, they're detected and the damage is contained". That's what logging, backups, and privilege separation are for.

## Wrapping up

Security ops produces no new features — it produces **certainty**: knowing what state the system is in, who changed what, and where to look when something breaks.

It didn't turn me into a security expert, but it made me pause for one extra second on every line that touches permissions, logging, or config. That second is worth a lot.
