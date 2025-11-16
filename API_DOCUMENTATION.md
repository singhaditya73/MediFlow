# MediFlow Backend API Documentation

## Overview
MediFlow backend provides RESTful APIs for managing healthcare data conversion to FHIR format, access control, and blockchain-based audit trails.

## Base URL
```
http://localhost:3000/api
```

## Authentication
All protected endpoints require authentication via NextAuth session cookies.

---

## API Endpoints

### Authentication

#### POST `/api/auth/signup`
Create a new user account with credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-11-16T10:00:00.000Z"
  }
}
```

---

### Upload & Conversion

#### POST `/api/upload`
Upload a PDF file and convert to FHIR format using AI.

**Authentication:** Required

**Request:** `multipart/form-data`
- `file`: PDF file containing clinical data

**Response:**
```json
{
  "success": true,
  "recordId": "clx...",
  "fhirData": { /* FHIR Bundle JSON */ },
  "extractedText": "Patient data..."
}
```

#### POST `/api/convert`
Convert text/clinical data to FHIR format.

**Authentication:** Required

**Request Body:**
```json
{
  "text": "Patient Name: John Doe\nDiagnosis: Type 2 Diabetes..."
}
```

**Response:**
```json
{
  "success": true,
  "recordId": "clx...",
  "fhirData": { /* FHIR Bundle JSON */ }
}
```

---

### Records Management

#### GET `/api/records`
Get all FHIR records for the authenticated user.

**Authentication:** Required

**Query Parameters:**
- `resourceType` (optional): Filter by resource type (Patient, DiagnosticReport, etc.)
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Records per page

**Response:**
```json
{
  "success": true,
  "records": [
    {
      "id": "clx...",
      "resourceType": "DiagnosticReport",
      "fhirData": { /* FHIR JSON */ },
      "ipfsHash": "Qm...",
      "blockchainTxHash": "0x...",
      "metadata": {},
      "createdAt": "2025-11-16T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### GET `/api/records/[id]`
Get a specific FHIR record by ID.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "record": {
    "id": "clx...",
    "resourceType": "DiagnosticReport",
    "fhirData": { /* FHIR JSON */ },
    "extractedText": "...",
    "user": {
      "id": "clx...",
      "email": "owner@example.com",
      "name": "Record Owner"
    },
    "createdAt": "2025-11-16T10:00:00.000Z"
  }
}
```

#### PATCH `/api/records/[id]`
Update IPFS hash or blockchain transaction hash for a record.

**Authentication:** Required (must be record owner)

**Request Body:**
```json
{
  "ipfsHash": "Qm...",
  "blockchainTxHash": "0x...",
  "metadata": { "key": "value" }
}
```

**Response:**
```json
{
  "success": true,
  "record": { /* Updated record */ }
}
```

#### DELETE `/api/records?id=[id]`
Delete a FHIR record.

**Authentication:** Required (must be record owner)

**Response:**
```json
{
  "success": true,
  "message": "Record deleted successfully"
}
```

---

### Access Control

#### GET `/api/access-control`
Get all access control entries where user is the granter (owner).

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "accessControls": [
    {
      "id": "clx...",
      "recordId": "clx...",
      "granterId": "clx...",
      "receiverId": "clx...",
      "accessLevel": "Read",
      "isActive": true,
      "expiresAt": null,
      "receiver": {
        "id": "clx...",
        "email": "doctor@hospital.com",
        "name": "Dr. Smith"
      },
      "record": {
        "id": "clx...",
        "resourceType": "DiagnosticReport",
        "createdAt": "2025-11-16T10:00:00.000Z"
      }
    }
  ]
}
```

#### POST `/api/access-control`
Grant access to a record.

**Authentication:** Required (must be record owner)

**Request Body:**
```json
{
  "recordId": "clx...",
  "receiverEmail": "doctor@hospital.com",
  "accessLevel": "Read",
  "expiresAt": "2025-12-31T23:59:59.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "accessControl": {
    "id": "clx...",
    "recordId": "clx...",
    "accessLevel": "Read",
    "isActive": true,
    "receiver": { /* user details */ }
  }
}
```

#### PATCH `/api/access-control/[id]`
Update access control (toggle active, change expiry, etc.).

**Authentication:** Required (must be granter)

**Request Body:**
```json
{
  "isActive": false,
  "accessLevel": "Write",
  "expiresAt": "2025-12-31T23:59:59.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "accessControl": { /* Updated access control */ }
}
```

#### DELETE `/api/access-control/[id]`
Revoke access by deleting access control entry.

**Authentication:** Required (must be granter)

**Response:**
```json
{
  "success": true,
  "message": "Access control deleted successfully"
}
```

---

### User Profile

#### GET `/api/user/profile`
Get current user profile.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "John Doe",
    "aadhaarNumber": "1234-5678-9012",
    "phoneNumber": "+91-9876543210",
    "provider": "Google",
    "createdAt": "2025-11-16T10:00:00.000Z"
  }
}
```

#### PATCH `/api/user/profile`
Update user profile.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "aadhaarNumber": "1234-5678-9012",
  "phoneNumber": "+91-9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "user": { /* Updated user profile */ }
}
```

---

### Audit Logs

#### GET `/api/audit-logs`
Get audit logs for current user.

**Authentication:** Required

**Query Parameters:**
- `recordId` (optional): Filter by record ID
- `action` (optional): Filter by action (view, create, update, delete, grant_access, revoke_access)
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20): Logs per page

**Response:**
```json
{
  "success": true,
  "logs": [
    {
      "id": "clx...",
      "userId": "clx...",
      "recordId": "clx...",
      "action": "create",
      "ipAddress": "192.168.1.1",
      "blockchainTxHash": "0x...",
      "metadata": {},
      "createdAt": "2025-11-16T10:00:00.000Z",
      "record": {
        "id": "clx...",
        "resourceType": "DiagnosticReport"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

---

## Data Models

### User
```typescript
{
  id: string
  email: string | null
  password: string
  provider: "Google" | "Credentials"
  name: string | null
  aadhaarNumber: string | null
  phoneNumber: string | null
  createdAt: DateTime
  updatedAt: DateTime
}
```

### FhirRecord
```typescript
{
  id: string
  userId: string
  resourceType: "DiagnosticReport" | "Patient" | "Observation" | ...
  fhirData: JSON
  originalFileUrl: string | null
  ipfsHash: string | null
  blockchainTxHash: string | null
  extractedText: string | null
  metadata: JSON | null
  createdAt: DateTime
  updatedAt: DateTime
}
```

### AccessControl
```typescript
{
  id: string
  recordId: string
  granterId: string
  receiverId: string
  accessLevel: "Read" | "Write" | "Full"
  isActive: boolean
  expiresAt: DateTime | null
  smartContractAddress: string | null
  createdAt: DateTime
  updatedAt: DateTime
}
```

### AuditLog
```typescript
{
  id: string
  userId: string
  recordId: string | null
  action: string
  ipAddress: string | null
  userAgent: string | null
  blockchainTxHash: string | null
  metadata: JSON | null
  createdAt: DateTime
}
```

---

## Error Responses

All endpoints return errors in this format:
```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

---

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Set Environment Variables:**
   Copy `.env.example` to `.env` and fill in your values.

3. **Run Database Migrations:**
   ```bash
   npx prisma migrate dev
   ```

4. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

5. **Start Development Server:**
   ```bash
   npm run dev
   ```

---

## Next Steps

- Implement IPFS integration for decentralized storage
- Add blockchain smart contracts for access control
- Implement real-time notifications via WebSockets
- Add more FHIR resource type validators
- Implement rate limiting and request throttling
