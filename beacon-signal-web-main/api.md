Here is the list of APIs used in the project, categorized by their functionality.

1. Authentication
   Used for user login, registration, and session management.

POST /auth/request-code
Functionality: Requests a one-time password (OTP) for email verification during login or registration.
Payload: { email, name?, company? }
POST /auth/validate-code
Functionality: Validates the OTP to complete the login process and retrieve the auth token.
Payload: { email, code }
POST /auth/register
Functionality: Registers a new user account.
Payload: { email, name, company, phone? }

2. Dataset Access
   Used to fetch business intelligence data. The URL path includes the user's plan type (e.g., Trial, Business) to determine access levels.

Base URL: /datasets/user/{planType}
POST .../dataset.mna
Functionality: Fetches Mergers \& Acquisitions (M\&A) deal data.
POST .../dataset.fundraising
Functionality: Fetches Startup Funding and investment data.
POST .../dataset.layoff
Functionality: Fetches global corporate layoff data.
POST .../dataset.data\_security\_breach
Functionality: Fetches data on cybersecurity breaches.
POST .../dataset.cxo\_changes
Functionality: Fetches executive (C-level) management changes.
POST .../access
Functionality: Verifies if the user has access to a specific plan type/dataset.

3. Plans \& Subscriptions
   Used to manage user subscriptions and view available pricing.

GET /my/subscriptions
Functionality: Retrieves the current user's active plans and subscriptions.
GET /plans
Functionality: Lists all available subscription plans that can be purchased.
POST /plans/subscribe
Functionality: Creates a new subscription for a selected plan.
Payload: { planName, frequency, resources? }

4. Search \& Metadata
   Used for autocomplete and filtering within the dashboard.

Base URL: /search
GET /search/companies?q={query}
Functionality: Searches for company names (autocomplete).
GET /search/industries
Functionality: Retrieves a list of industries (supports q= for search).
GET /search/countries?q={query}
Functionality: Searches for countries.
GET /search/locations?q={query}
Functionality: Searches for specific locations (cities, states).

