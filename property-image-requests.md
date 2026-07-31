Examples for property create/update with images (multipart/form-data)

1) Create property (curl)

curl -X POST "http://localhost:3000/api/properties" \
  -H "Authorization: Bearer <token>" \
  -F "title=Cozy Apartment" \
  -F "description=Nice place with balcony and good light..." \
  -F "price=1200" \
  -F "location=Dhaka" \
  -F "categoryId=<category-uuid>" \
  -F 'amenities=["WiFi","Parking"]' \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.png"

Notes:
- Use the form field name images for multiple files. The server accepts up to 6 images, each up to 5MB.
- Numeric values like price can be sent as text in multipart/form-data (for example, price=1200); the server coerces them to numbers.
- Amenities can be provided as a JSON array string or a comma-separated string (e.g., "WiFi,Parking").

2) Update property (append images)

curl -X PATCH "http://localhost:3000/api/properties/<propertyId>" \
  -H "Authorization: Bearer <token>" \
  -F "title=Updated title" \
  -F "images=@/path/to/new-image.jpg"

This will append newly uploaded images to the property; previously uploaded images remain.

3) Update property (remove specific images)

curl -X PATCH "http://localhost:3000/api/properties/<propertyId>" \
  -H "Authorization: ******" \
  -F 'removeImageIds=["<imageId1>","<imageId2>"]'

This removes the specified existing images from the property and Cloudinary.

4) Update property (replace specific images)

curl -X PATCH "http://localhost:3000/api/properties/<propertyId>" \
  -H "Authorization: ******" \
  -F 'replaceImageIds=["<imageId1>","<imageId2>"]' \
  -F "images=@/path/to/replacement1.jpg" \
  -F "images=@/path/to/replacement2.jpg"

This replaces the specified existing images with the uploaded files. Replacement files are matched to replaceImageIds by position.

5) Delete specific property image

curl -X DELETE "http://localhost:3000/api/properties/<propertyId>/images/<propertyImageId>" \
  -H "Authorization: ******"

This deletes a single image from the property and removes it from Cloudinary.

6) Update property (clear all images and upload new set)

curl -X PATCH "http://localhost:3000/api/properties/<propertyId>" \
  -H "Authorization: ******" \
  -F "clearImages=true" \
  -F "images=@/path/to/new-image1.jpg" \
  -F "images=@/path/to/new-image2.jpg"

This clears all existing images and uploads a fresh set.

7) Example Postman setup
- Method: POST
- URL: http://localhost:3000/api/properties
- Authorization: Bearer Token
- Body -> form-data:
  - title: Cozy Apartment
  - description: ...
  - price: 1200
  - location: Dhaka
  - categoryId: <uuid>
  - amenities: ["WiFi","Parking"]
  - images: (file) choose files — set key type to File, multiple entries allowed

4) Deleting a property
- Endpoint: DELETE /api/properties/:id (Landlord only)
- When deleting, the server will attempt to remove images from Cloudinary (best-effort).

5) Troubleshooting
- If you see errors about CLOUDINARY_URL or auth, ensure CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET are set.
- If file uploads are rejected, check that file types are jpg/png/webp and less than 5MB.
