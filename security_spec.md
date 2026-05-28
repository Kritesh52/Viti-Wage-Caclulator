# Firebase Security Specification

This document outlines the data invariants, "Dirty Dozen" malicious payloads, and rules definition for securing the Fiji Wage Calculator & Expense Planner.

## 1. Data Invariants
1. **Scope and Namespace**: A user's planner data (expenses, incomes, settings) can only exist in a path scoped under their verified `userId` (`/users/{userId}`).
2. **Identity Integrity**: The `userId` variable in paths must exactly equal the `request.auth.uid`. No user can read or write documents belonging to other users.
3. **Temporal Invariant**: The `createdAt` and `updatedAt` properties must match the system-guaranteed server time (`request.time`).
4. **Range / Value Boundaries**: Outflow and income amounts must be strictly greater than $0.
5. **No Spoofing**: Users cannot update their profile email or IDs to mimic admins or other users.

---

## 2. The "Dirty Dozen" Payloads

Here are 12 simulated hostile payloads representing identity breaches, state shortcuts, and boundary violations that our rules will fail and reject:

### 1. Identity Hijacking (Attacking /users/{victimId})
A user `attacker_123` attempts to overwrite user profile of `victim_321`.
```json
{
  "path": "/users/victim_321",
  "auth": { "uid": "attacker_123", "token": { "email_verified": true } },
  "payload": {
    "uid": "victim_321",
    "email": "victim@gmail.com",
    "displayName": "Victim",
    "photoURL": "https://example.com/pic.png",
    "updatedAt": "request.time"
  }
}
```

### 2. Expense Injection in Another User's Namespace
Attacker attempts to create an expense element in `/users/victim_uid/expenses/exp_abcd`.
```json
{
  "path": "/users/victim_uid/expenses/exp_abcd",
  "auth": { "uid": "attacker_123", "token": { "email_verified": true } },
  "payload": {
    "id": "exp_abcd",
    "name": "Attacker Debt Cashflow Injection",
    "amount": 9000,
    "frequency": "monthly",
    "category": "loans",
    "createdAt": "request.time",
    "updatedAt": "request.time"
  }
}
```

### 3. Infinite Amount Value Poisoning
A user attempts to set an expense amount that is non-positive or extremely large causing buffer overflow.
```json
{
  "path": "/users/user_123/expenses/exp_abc",
  "auth": { "uid": "user_123", "token": { "email_verified": true } },
  "payload": {
    "id": "exp_abc",
    "name": "Faked EFL Super Bill",
    "amount": -9999999,
    "frequency": "monthly",
    "category": "utilities",
    "createdAt": "request.time",
    "updatedAt": "request.time"
  }
}
```

### 4. Timestamp Tampering (Client Injecting Arbitrary Date)
User attempts to bypass server-side temporal control by setting an arbitrary static timestamp in the past or future.
```json
{
  "path": "/users/user_123/expenses/exp_abc",
  "auth": { "uid": "user_123", "token": { "email_verified": true } },
  "payload": {
    "id": "exp_abc",
    "name": "Market Produce Outflow",
    "amount": 100,
    "frequency": "weekly",
    "category": "food",
    "createdAt": "2010-01-01T00:00:00Z",
    "updatedAt": "2020-01-01T00:00:00Z"
  }
}
```

### 5. Invalid Categories Exploitation
User attempts to write an unsupported enum string to the `category` property of an expense.
```json
{
  "path": "/users/user_123/expenses/exp_abc",
  "auth": { "uid": "user_123", "token": { "email_verified": true } },
  "payload": {
    "id": "exp_abc",
    "name": "Fake Outflow",
    "amount": 200,
    "frequency": "weekly",
    "category": "unsupported_malicious_category",
    "createdAt": "request.time",
    "updatedAt": "request.time"
  }
}
```

### 6. Invalid Frequencies Injection
User attempts to input an invalid cadence for calculations.
```json
{
  "path": "/users/user_123/incomes/inc_abc",
  "auth": { "uid": "user_123", "token": { "email_verified": true } },
  "payload": {
    "id": "inc_abc",
    "name": "Illegal Gig work",
    "amount": 500,
    "frequency": "millisecondly",
    "category": "side_hustle",
    "createdAt": "request.time",
    "updatedAt": "request.time"
  }
}
```

### 7. Shadow Fields Injection / Overwrite
Under an update operation, a client attempts to append extra random fields to user settings to exceed quotas.
```json
{
  "path": "/users/user_123/settings/calculator",
  "auth": { "uid": "user_123", "token": { "email_verified": true } },
  "payload": {
    "salary": 50000,
    "frequency": "monthly",
    "residencyStatus": "resident",
    "fnpfPercent": 8,
    "isFnpfTaxExempt": false,
    "hoursPerWeek": 40,
    "daysPerWeek": 5,
    "updatedAt": "request.time",
    "ghost_field_inject": "unlawful_value_inject"
  }
}
```

### 8. Unverified Email Access
A client tries to post data using an unverified account where `email_verified` is `false`.
```json
{
  "path": "/users/user_123/expenses/exp_abc",
  "auth": { "uid": "user_123", "token": { "email_verified": false } },
  "payload": {
    "id": "exp_abc",
    "name": "Suva flat rental",
    "amount": 500,
    "frequency": "monthly",
    "category": "housing",
    "createdAt": "request.time",
    "updatedAt": "request.time"
  }
}
```

### 9. Mutating Fixed Fields / Creation Fields
A user tries to alter the `id` or the `createdAt` timestamp of an expense long after creation during an update.
```json
{
  "path": "/users/user_123/expenses/exp_abc",
  "auth": { "uid": "user_123", "token": { "email_verified": true } },
  "update_payload": {
    "id": "altered_id",
    "name": "Suva flat rent",
    "amount": 550,
    "frequency": "monthly",
    "category": "housing",
    "createdAt": "2015-05-18T00:00:00Z",
    "updatedAt": "request.time"
  }
}
```

### 10. Blank Names Resource Exhaustion Attack
A malicious user tries to register empty names filled with whitespace or huge strings exceeding limits.
```json
{
  "path": "/users/user_123/expenses/exp_abc",
  "auth": { "uid": "user_123", "token": { "email_verified": true } },
  "payload": {
    "id": "exp_abc",
    "name": "                    ",
    "amount": 200,
    "frequency": "monthly",
    "category": "food",
    "createdAt": "request.time",
    "updatedAt": "request.time"
  }
}
```

### 11. Read Scraping via Blind Listing
An authenticated user attempts to perform a raw, unfiltered global listing of users.
```json
{
  "collection": "/users",
  "auth": { "uid": "attacker_123", "token": { "email_verified": true } }
}
```

### 12. Path Variable Junk ID Poisoning
An attacker attempts to write to a document ID with huge binary garbage to trigger database index issues.
```json
{
  "path": "/users/user_123/expenses/some_massive_junk_id_exceeding_128_chars_$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$",
  "auth": { "uid": "user_123", "token": { "email_verified": true } },
  "payload": {
    "id": "some_massive_junk_id_exceeding_128_chars_$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$",
    "name": "Market veggie run",
    "amount": 40,
    "frequency": "weekly",
    "category": "food",
    "createdAt": "request.time",
    "updatedAt": "request.time"
  }
}
```

---

## 3. Passive Assertions Verification
All "Dirty Dozen" payloads will fail under our proposed lock-down Rules, returning a strict `PERMISSION_DENIED` since:
- `ownerId` checks prevent cross-user mutations.
- `request.auth.token.email_verified == true` restricts standard writes to verified users.
- Validation functions check `request.time` matches for temporal items.
- Strict enums prevent illegal inputs.
- Object properties are bound by size constraints.
