# Microservices Architecture

RentTitan utilizes two independent microservices alongside the Main Backend to demonstrate a distributed architecture.

## 1. Document Service (Port 5001)
The Document Service handles file uploads and maintains the completion checklist for the user's rental dossier.

- **Framework:** Node.js, Express
- **Database:** MongoDB
- **Key Responsibilities:**
  - Securely validates the user's JWT.
  - Exposes `POST /upload` to accept dummy documents and update the completeness checklist.
  - Exposes `DELETE /documents/:documentType?fileId=...` to specifically target and remove individual documents from arrays.
  - Tracks arrays of unique files for both "Proof of Income" and "Guarantor Proof of Income" (up to 5 files each) instead of simple booleans.
  - Exposes `GET /status` to return the completion checklist arrays and flags.

## 2. Scoring Service (Port 5002)
The Scoring Service acts as the "brain" of the application, running a deterministic mathematical engine to calculate a transparent strength score.

- **Framework:** Node.js, Express, Apollo Server 4
- **Database Access:** Uses Token Forwarding to fetch data dynamically.
- **Key Responsibilities:**
  - Extracts the user's JWT and forwards it to the Main Backend to fetch the financial profile.
  - Forwards the JWT to the Document Service to fetch the document checklist.
  - Runs the 100-point calculation algorithm based on document completeness, rent affordability, guarantor strength, profile stability, and profile clarity.
    
  ### Scoring Logic Breakdown (100 Points Total)
  - **25 Pts:** Document Completeness (5 pts for each of the 5 required documents).
  - **25 Pts:** Rent Affordability (Awards max points if rent is <= 33% of monthly income).
  - **25 Pts:** Guarantor Strength (Awards max points if guarantor income is >= 3x the rent).
  - **15 Pts:** Profile Stability (Awards max points for permanent 'CDI' employment).
  - **10 Pts:** Profile Clarity (Base points awarded for completely filling out the core financial fields).

  ### API Paradigms
  - Exposes the data via two paradigms:
    - **REST:** `GET /api/v1/dossier-score`
    - **GraphQL:** `POST /graphql` (query `myDossier`)
