# Database Architecture

This document outlines the database infrastructure for the RentTitan MVP up through Phase 3.

## Infrastructure Setup
To ensure a robust, production-ready environment for microservices, the databases are hosted locally using Docker containers orchestrated by `docker-compose.yml`. 

We utilize two distinct databases to satisfy the project requirements:
1. **PostgreSQL**: A relational SQL database used by the Main Backend to store structured data (Users, Dossiers) and by the Scoring Service to store scores.
2. **MongoDB**: A NoSQL database that will be used by the Document Service to store unstructured document metadata and checklists (to be implemented in Phase 4).

## PostgreSQL Schema (Prisma)
The Main Backend interacts with the PostgreSQL database using **Prisma ORM (v5)**. The schema is defined in `backend/prisma/schema.prisma`.

### Models

#### 1. User
Stores the core identity of the user authenticated via Google OAuth.
- `id`: UUID (Primary Key)
- `googleId`: String (Unique identifier from Google)
- `email`: String (Unique)
- `name`: String
- `avatar`: String (Optional)
- *Relationship*: A User has exactly one Dossier.

#### 2. Dossier
Stores the primary financial data required to calculate the rent affordability score.
- `id`: UUID (Primary Key)
- `userId`: String (Foreign Key linking to User)
- `targetRent`: Float (The rent amount the user is applying for)
- `monthlyIncome`: Float (The user's net monthly income)
- `employmentStatus`: String (e.g., CDI, CDD, Student, Alternance)
- `hasGuarantor`: Boolean 
- *Relationship*: A Dossier can have multiple Guarantors.

#### 3. Guarantor
Stores financial information about people guaranteeing the user's rent.
- `id`: UUID (Primary Key)
- `dossierId`: String (Foreign Key linking to Dossier)
- `name`: String (Full name of the guarantor)
- `monthlyIncome`: Float (The guarantor's net monthly income)
