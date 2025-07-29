# Tour Image Upload Documentation

## Overview

The tour image upload functionality allows you to upload multiple images for tours, including a cover image and up to 3 additional images.

## Features

- **Cover Image**: One main cover image for the tour
- **Multiple Images**: Up to 3 additional images for the tour gallery
- **Image Processing**: Automatic resizing to 2000x1333 pixels with 90% JPEG quality
- **File Validation**: Only image files are accepted
- **Unique Naming**: Images are automatically named with tour ID and timestamp

## API Endpoints

### Create Tour with Images

```
POST /api/v1/tours
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Form Fields:**

- `name` (required): Tour name
- `duration` (required): Tour duration in days
- `maxGroupSize` (required): Maximum group size
- `difficulty` (required): Tour difficulty
- `price` (required): Tour price
- `summary` (required): Tour summary
- `description` (optional): Detailed description
- `imageCover` (optional): Cover image file
- `images` (optional): Up to 3 additional image files
- Other tour fields as needed

### Update Tour Images

```
PATCH /api/v1/tours/:id
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Form Fields:**

- `imageCover` (optional): New cover image file
- `images` (optional): Up to 3 new image files
- Other tour fields to update

## File Requirements

- **Format**: JPEG, PNG, GIF, WebP
- **Cover Image**: Will be resized to 2000x1333 pixels
- **Gallery Images**: Will be resized to 2000x1333 pixels
- **Quality**: 90% JPEG quality
- **Storage**: Images are saved to `public/img/tours/`

## Example Usage

### Using cURL

```bash
# Create a new tour with images
curl -X POST http://localhost:3000/api/v1/tours \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Amazing Mountain Tour" \
  -F "duration=7" \
  -F "maxGroupSize=25" \
  -F "difficulty=medium" \
  -F "price=997" \
  -F "summary=Experience the beauty of mountain landscapes" \
  -F "imageCover=@cover-image.jpg" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg" \
  -F "images=@image3.jpg"

# Update tour images
curl -X PATCH http://localhost:3000/api/v1/tours/TOUR_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "imageCover=@new-cover.jpg" \
  -F "images=@new-image1.jpg"
```

### Using JavaScript/Fetch

```javascript
const formData = new FormData();
formData.append('name', 'Amazing Mountain Tour');
formData.append('duration', '7');
formData.append('maxGroupSize', '25');
formData.append('difficulty', 'medium');
formData.append('price', '997');
formData.append('summary', 'Experience the beauty of mountain landscapes');

// Add cover image
formData.append('imageCover', coverImageFile);

// Add multiple images
imageFiles.forEach((file) => {
  formData.append('images', file);
});

const response = await fetch('/api/v1/tours', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer YOUR_TOKEN',
  },
  body: formData,
});
```

## Response Format

```json
{
  "status": "success",
  "data": {
    "tour": {
      "_id": "tour_id",
      "name": "Amazing Mountain Tour",
      "imageCover": "tour-amazing-mountain-tour-1234567890-cover.jpeg",
      "images": [
        "tour-amazing-mountain-tour-1234567890-1.jpeg",
        "tour-amazing-mountain-tour-1234567890-2.jpeg",
        "tour-amazing-mountain-tour-1234567890-3.jpeg"
      ]
      // ... other tour fields
    }
  }
}
```

## Error Handling

- **Invalid File Type**: Returns 400 error if non-image files are uploaded
- **File Size**: No specific limit, but consider server storage constraints
- **Authentication**: Requires valid JWT token
- **Authorization**: Only admin and lead-guide roles can upload images

## Notes

- Images are processed asynchronously using Sharp
- File names include tour ID/name and timestamp for uniqueness
- Existing images are not automatically deleted when updating
- The system supports both creating new tours and updating existing ones
