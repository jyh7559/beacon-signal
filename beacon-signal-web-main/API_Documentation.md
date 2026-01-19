# API Documentation

## 1. Authentication

### Request OTP
**Endpoint:** `POST /auth/request-code`

**Description:** Requests a one-time password (OTP) for email verification.

**Request Body:**
```json
{
  "email": "string",
  "name": "string (optional)",
  "company": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification code sent successfully"
}
```

### Validate OTP
**Endpoint:** `POST /auth/validate-code`

**Description:** Validates the OTP to complete login and retrieve the auth token.

**Request Body:**
```json
{
  "email": "string",
  "code": "string"
}
```

**Response:**
```json
{
  "token": "jwt_token_string",
  "user": {
    "email": "string",
    "id": "string",
    ...
  },
  "name": "string",
  "profile": { ... }
}
```

### Register User
**Endpoint:** `POST /auth/register`

**Description:** Registers a new user account.

**Request Body:**
```json
{
  "email": "string",
  "name": "string",
  "company": "string",
  "phone": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  ...
}
```

---

## 2. Dataset Access

**Base Path:** `/datasets/user/{planType}`
*   `planType` values: `Trial`, `Essential`, `Business`, `Business-Custom`

### Common Filter Parameters
Most dataset endpoints accept a subset of these filters in the request body:
*   `limit`: number (default: 100)
*   `dateType`: "ANNOUNCED" | "LAST-MODIFIED"
*   `startDate`: string (ISO date)
*   `endDate`: string (ISO date)
*   `date`: string
*   `lastRecordId`: string (for pagination)

### Mergers & Acquisitions (M&A)
**Endpoint:** `POST /datasets/user/{planType}/dataset.mna`

**Request Body (MnaApiFilters):**
```json
{
  "limit": 100,
  "dateType": "ANNOUNCED",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "acquiringCompanyName": "string",
  "acquiringCompanyDomain": "string",
  "acquiringCompanyIndustry": ["string"],
  "acquiredCompanyName": "string",
  "dealAmount": "string",
  "currency": "string",
  "mnaStatus": ["string"],
  "mnaType": ["string"],
  ...
}
```

**Response:**
```json
{
  "dataset": [
    {
      "id": "string",
      "announcedDate": "string",
      "acquiringCompany": {
        "name": "string",
        "domain": "string",
        ...
      },
      "acquiredCompany": { ... },
      "dealAmount": number,
      "currency": "string",
      ...
    }
  ],
  "prevId": "string | null",
  "nextId": "string | null",
  "count": number,
  "isTrialAndExpired": boolean
}
```

### Fundraising / Funding
**Endpoint:** `POST /datasets/user/{planType}/dataset.fundraising`

**Request Body (FundingApiFilters):**
```json
{
  "limit": 100,
  "companyName": "string",
  "companyIndustry": ["string"],
  "fundingType": ["string"],
  "fundingStage": ["string"],
  "investors": "string",
  "amount": "string",
  ...
}
```

**Response:**
Similar structure to M&A, containing funding records.

### Layoffs
**Endpoint:** `POST /datasets/user/{planType}/dataset.layoff`

**Request Body (LayoffApiFilters):**
```json
{
  "limit": 100,
  "companyName": "string",
  "layoffType": ["string"],
  "employeesAffected": "string",
  "reason": ["string"],
  "department": ["string"],
  ...
}
```

**Response:**
Similar structure to M&A, containing layoff records.

### Data Security Breaches
**Endpoint:** `POST /datasets/user/{planType}/dataset.data_security_breach`

**Request Body (DataBreachApiFilters):**
```json
{
  "limit": 100,
  "companyName": "string",
  "incidentType": ["string"],
  "peopleImpacted": "string",
  "severityLevel": ["string"],
  "dataType": ["string"],
  ...
}
```

### CXO Changes
**Endpoint:** `POST /datasets/user/{planType}/dataset.cxo_changes`

**Request Body (CxoChangesApiFilters):**
```json
{
  "limit": 100,
  "companyName": "string",
  "executiveName": "string",
  "executiveTitle": ["string"],
  "changeType": ["string"],
  "titleCategory": ["string"],
  ...
}
```

### Business Expansion
**Endpoint:** `POST /datasets/user/{planType}/dataset.business_expansion`

**Request Body (BusinessExpansionApiFilters):**
```json
{
  "limit": 100,
  "companyName": "string",
  "expansionType": ["string"],
  "investment": "string",
  "jobsCreated": "string",
  "marketEntry": ["string"],
  ...
}
```

### Check Access
**Endpoint:** `GET /datasets/user/{planType}/access`

**Response:**
```json
{
  "hasAccess": boolean
}
```

---

## 3. Plans & Subscriptions

### Get User Subscriptions
**Endpoint:** `GET /my/subscriptions`

**Description:** Retrieves the current user's active plans and subscriptions.

**Response:**
```json
[
  {
    "resource": "string (e.g., dataset.mna)",
    "plan": {
      "name": "string",
      "pricing": { ... },
      "downloadAllowed": boolean,
      "maxTeamMembers": number,
      ...
    },
    "subscribedOn": "string",
    "expiresOn": "string",
    "isActive": boolean,
    ...
  }
]
```

### Get Available Plans
**Endpoint:** `GET /plans`

**Description:** Lists all available subscription plans.

**Response:**
```json
[
  {
    "_id": "string",
    "name": "string",
    "type": "string",
    "datasets": ["string"],
    "pricing": {
      "monthly": number,
      "quarterly": number,
      "halfYearly": number,
      "annual": number
    },
    "features": ["string"],
    ...
  }
]
```

### Subscribe to Plan
**Endpoint:** `POST /plans/subscribe`

**Request Body:**
```json
{
  "planName": "string",
  "frequency": "monthly" | "quarterly" | "halfYearly" | "annual",
  "resources": ["string"] (optional)
}
```

**Response:**
```json
{
  "success": true,
  "message": "string",
  "subscription": {
    "planName": "string",
    "totalCost": number,
    "startDate": "string",
    "endDate": "string",
    ...
  }
}
```

---

## 4. Search Services

**Base URL:** `/search`

### Search Companies
**Endpoint:** `GET /search/companies?q={query}`

**Response:**
```json
{
  "results": [
    {
      "name": "string",
      "domain": "string"
    }
  ]
}
```

### Search Industries
**Endpoint:** `GET /search/industries?q={query}` (query optional)

**Response:**
```json
{
  "results": [
    {
      "name": "string"
    }
  ]
}
```

### Search Countries
**Endpoint:** `GET /search/countries?q={query}`

**Response:**
```json
{
  "results": [
    {
      "name": "string",
      "code": "string"
    }
  ]
}
```

### Search Locations
**Endpoint:** `GET /search/locations?q={query}`

**Response:**
```json
{
  "results": [
    {
      "name": "string",
      "city": "string",
      "state": "string",
      "country": "string"
    }
  ]
}
```
