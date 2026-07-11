# RentNest Backend API Documentation

RentNest is a backend API for a rental property marketplace. Tenants can browse rental properties, submit rental requests, complete Stripe payments after approval, and leave reviews after completed rentals. Landlords can list properties, manage availability, and approve or reject tenant requests. Admins can manage users, categories, listings, and rental activity.

## Submission Information

| Item                | Value                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| Live API URL        | [https://rent-nest-backend-lilac.vercel.app](https://rent-nest-backend-lilac.vercel.app)         |
| Postman Collection  | [RentNest Backend API.postman_collection.json](<./RentNest Backend API.postman_collection.json>) |
| API Documentation   | [RentNest API Documentation](https://documenter.getpostman.com/view/54943329/2sBY4LS2iD)         |
| Admin Email         | `admin@rentnest.com`                                                                             |
| Admin Password      | `admin123`                                                                                       |
| Authentication Type | JWT Bearer Token                                                                                 |
| Payment Provider    | Stripe                                                                                           |

## Postman Usage Guide

1. Import [RentNest Backend API.postman_collection.json](<./RentNest Backend API.postman_collection.json>) into Postman.
   **or** visit my RentNest API Documentation (public) [RentNest API Postman Documentation](https://documenter.getpostman.com/view/54943329/2sBY4LS2iD) and click `▶ Run in Postman` button (top right corner).

2. If Postman shows a "⚠️ Secrets Detected" warning after import, click `Secure All`. This is safe and only stores sensitive variables (e.g. Stripe secret key) securely inside Postman.

3. Confirm the collection variable `baseUrl` is set to `https://rent-nest-backend-lilac.vercel.app`.

4. Run `Login as Admin`, `Login as Tenant`, or `Login as Landlord` to automatically save the relevant token variable.

5. For protected routes, keep the request authorization type as Bearer Token. The collection already uses `{{adminToken}}`, `{{tenantToken}}`, or `{{landlordToken}}`.

6. **Environment Variables:** The collection automatically sets environment variables (like `baseUrl`, `tenantToken`, `propertyId`) dynamically using Test Scripts after successful requests. You do not need to manually copy-paste tokens!

7. Run the flow in this order for a complete demo:
   - Admin creates a category.
   - Landlord creates a property using the category ID.
   - Tenant submits a rental request for the property.
   - Landlord approves the rental request.
   - Tenant creates a Stripe payment intent.
   - Confirm payment in Stripe test mode, then call the backend payment confirmation endpoint.
   - Landlord marks the active rental as completed.
   - Tenant leaves a review.

**Note:** To test this backend project properly, I have added my Stripe test secret key as a value of `stripeSecretKey` in Postman. This allowing a real Stripe test-mode transaction using a test card `pm_card_visa` to complete and record in the Stripe dashboard.

## Standard Response Format

Successful responses:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

Error responses:

```json
{
  "success": false,
  "message": "Validation Error",
  "errorDetails": [
    {
      "field": "body.email",
      "message": "Invalid email address"
    }
  ]
}
```

## Authentication

| Method  | Endpoint             | Access        | Description                        |
| ------- | -------------------- | ------------- | ---------------------------------- |
| `POST`  | `/api/auth/register` | Public        | Register a tenant or landlord.     |
| `POST`  | `/api/auth/login`    | Public        | Login and receive a JWT token.     |
| `GET`   | `/api/users/profile` | Authenticated | Get current user profile.          |
| `PATCH` | `/api/users/profile` | Authenticated | Update current user name or email. |

Register request:

```json
{
  "name": "Tenant User",
  "email": "tenant@example.com",
  "password": "password123",
  "role": "TENANT"
}
```

Login request:

```json
{
  "email": "admin@rentnest.com",
  "password": "admin123"
}
```

## Public Features

| Method | Endpoint                                                                                                                | Description                                                 |
| ------ | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `GET`  | `/`                                                                                                                     | Health check.                                               |
| `GET`  | `/api/categories`                                                                                                       | Get all property categories.                                |
| `GET`  | `/api/properties`                                                                                                       | Browse available properties.                                |
| `GET`  | `/api/properties?searchTerm=apartment&location=Dhaka&minPrice=500&maxPrice=3000&categoryId=<id>&amenities=wifi,parking` | Search and filter available properties.                     |
| `GET`  | `/api/properties/:id`                                                                                                   | View property details with category, landlord, and reviews. |

Supported property filters:

| Query        | Example        | Purpose                       |
| ------------ | -------------- | ----------------------------- |
| `searchTerm` | `apartment`    | Search title and description. |
| `location`   | `Dhaka`        | Filter by location.           |
| `minPrice`   | `500`          | Minimum rent.                 |
| `maxPrice`   | `3000`         | Maximum rent.                 |
| `categoryId` | UUID           | Filter by category.           |
| `amenities`  | `wifi,parking` | Require all listed amenities. |

## Tenant Features

Use `Authorization: Bearer <tenantToken>`.

| Method | Endpoint                | Description                                           |
| ------ | ----------------------- | ----------------------------------------------------- |
| `POST` | `/api/requests`         | Submit a rental request.                              |
| `GET`  | `/api/requests`         | View tenant rental request history.                   |
| `GET`  | `/api/requests/:id`     | View one tenant rental request.                       |
| `POST` | `/api/payments/create`  | Create Stripe payment intent after landlord approval. |
| `POST` | `/api/payments/confirm` | Verify Stripe payment and mark rental active.         |
| `GET`  | `/api/payments`         | View tenant payment history.                          |
| `GET`  | `/api/payments/:id`     | View one payment record.                              |
| `POST` | `/api/reviews`          | Leave review after completed and paid rental.         |

Create rental request:

```json
{
  "propertyId": "property-uuid",
  "moveInDate": "2026-08-01T00:00:00.000Z",
  "moveOutDate": "2026-12-01T00:00:00.000Z"
}
```

Create payment intent:

```json
{
  "rentalRequestId": "rental-request-uuid"
}
```

Confirm backend payment after Stripe success:

```json
{
  "paymentId": "payment-uuid",
  "stripePaymentIntentId": "pi_xxxxxxxxxxxxx"
}
```

Create review:

```json
{
  "propertyId": "property-uuid",
  "rating": 5,
  "comment": "Great property and smooth rental experience."
}
```

## Landlord Features

Use `Authorization: Bearer <landlordToken>`.

| Method   | Endpoint                        | Description                                           |
| -------- | ------------------------------- | ----------------------------------------------------- |
| `POST`   | `/api/properties`               | Create a new property listing.                        |
| `GET`    | `/api/properties/my-properties` | View landlord's own properties.                       |
| `PATCH`  | `/api/properties/:id`           | Update property listing or availability.              |
| `DELETE` | `/api/properties/:id`           | Delete own property if it has no open rental request. |
| `GET`    | `/api/requests/landlord`        | View rental requests for landlord properties.         |
| `PATCH`  | `/api/requests/:id/status`      | Approve, reject, or complete a rental request.        |

Create property:

```json
{
  "title": "Modern 2 Bedroom Apartment",
  "description": "Spacious apartment with natural light and easy transport access.",
  "price": 1500,
  "location": "Dhaka, Bangladesh",
  "categoryId": "category-uuid",
  "amenities": ["wifi", "parking", "elevator"]
}
```

Update rental request status:

```json
{
  "status": "APPROVED"
}
```

Allowed status values for landlord update: `APPROVED`, `REJECTED`, `COMPLETED`.

## Admin Features

Use `Authorization: Bearer <adminToken>`.

| Method   | Endpoint                | Description                     |
| -------- | ----------------------- | ------------------------------- |
| `POST`   | `/api/categories`       | Create property category.       |
| `PATCH`  | `/api/categories/:id`   | Update property category.       |
| `DELETE` | `/api/categories/:id`   | Delete property category.       |
| `GET`    | `/api/admin/users`      | View all users.                 |
| `PATCH`  | `/api/admin/users/:id`  | Ban or unban a tenant/landlord. |
| `GET`    | `/api/admin/properties` | View all properties.            |
| `GET`    | `/api/admin/rentals`    | View all rental requests.       |

Create category:

```json
{
  "name": "Apartment",
  "description": "Residential apartment category"
}
```

Ban or unban user:

```json
{
  "isBanned": true
}
```

## Payment Flow

1. Tenant submits a rental request.
2. Landlord approves the request.
3. Tenant calls `POST /api/payments/create`.
4. Backend creates a Stripe PaymentIntent and stores a pending payment record.
5. Complete payment in Stripe test mode using Stripe's API and a test card (`pm_card_visa`).
6. Tenant calls `POST /api/payments/confirm`.
7. Backend verifies the Stripe PaymentIntent, marks payment as `COMPLETED`, marks rental request as `ACTIVE`, and sets the property as unavailable.
8. Landlord can later mark the active rental as `COMPLETED`.
9. Tenant can leave a review only after completed and paid rental.

### Completing Stripe Payment in Postman

This project does not use fake payments. The backend creates a real Stripe test-mode PaymentIntent and verifies it through Stripe before updating the database.

1. Login as tenant and submit a rental request.
2. Login as landlord and approve that request.
3. As tenant, call `POST /api/payments/create`.
4. Copy or keep the returned `stripePaymentIntentId`; the collection saves it automatically.
5. In Postman, I have set my Stripe test secret key as collection variable `stripeSecretKey` for testing purposes.
6. Run `Pay With Demo Card`. It calls Stripe's PaymentIntent confirmation endpoint with `pm_card_visa`.
   - Stripe API URL: `https://api.stripe.com/v1/payment_intents/{{stripePaymentIntentId}}/confirm`
7. After Stripe returns a successful payment, run `Confirm Payment in Backend After Stripe Success`.
8. The test-mode payment should appear in the Stripe dashboard, and the backend payment record should become `COMPLETED`.

**Note:** The Postman-side secret `STRIPE_SECRET_KEY` is only needed because this collection demonstrates the payment step without a frontend Stripe.js checkout screen.

## Requirement Compliance Checklist

| Requirement                            | Status                                                                                                                                            |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| API documentation & Postman collection | [RentNest API Documentation](https://documenter.getpostman.com/view/54943329/2sBY4LS2iD) and [RentNest Backend API.postman_collection.json](<./RentNest Backend API.postman_collection.json>). |
| Consistent error response              | API returns `{ success, message, errorDetails }` for validation, auth, 404, and application errors.                                               |
| 20 meaningful commits                  | Commit history contains 20+ descriptive backend commits.                                                                                          |
| Input validation                       | Zod validation is used on create/update/action routes and important route parameters.                                                             |
| Admin credentials                      | Provided above.                                                                                                                                   |
| Payment integration                    | Stripe PaymentIntent creation and confirmation are implemented.                                                                                   |

---
