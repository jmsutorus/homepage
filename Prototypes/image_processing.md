I have an image processing service running on GCP.
I want to use this service in this app.
If a user uploads an image that is not a jpg, png, or webp, convert it to webp using the image processing service.
This service can convert HEIC, DNG, and JPG to WebP.

## Authentication

Authentication in Code: Since the backend requires authentication, the homepage service must include an OIDC ID token in the Authorization header of its requests.
The header should look like: Authorization: Bearer <ID_TOKEN>
You can fetch this token from the Google Cloud metadata server within your code.

## URL

https://image-processing-backend-705251858590.us-central1.run.app

## Endpoints

## Synchronous Endpoints

### Convert to JPEG

```bash
# Convert HEIC to JPEG
curl -X POST "http://localhost:8000/convert" \
  -F "file=@photo.heic" \
  --output converted.jpg

# Convert DNG to JPEG
curl -X POST "http://localhost:8000/convert" \
  -F "file=@raw.dng" \
  --output converted.jpg

# Convert JPG to JPEG (with quality adjustment)
curl -X POST "http://localhost:8000/convert" \
  -F "file=@photo.jpg" \
  --output converted.jpg
```

### Convert to WebP

```bash
# Convert HEIC to WebP (lossy, quality 85)
curl -X POST "http://localhost:8000/convert-to-webp?quality=85&lossless=false" \
  -F "file=@photo.heic" \
  --output converted.webp

# Convert DNG to WebP (high quality)
curl -X POST "http://localhost:8000/convert-to-webp?quality=90&lossless=false" \
  -F "file=@raw.dng" \
  --output converted.webp

# Convert JPG to WebP (lossless)
curl -X POST "http://localhost:8000/convert-to-webp?lossless=true&quality=100" \
  -F "file=@photo.jpg" \
  --output converted.webp

# Convert JPG to WebP (maximum compression for web)
curl -X POST "http://localhost:8000/convert-to-webp?quality=80&lossless=false" \
  -F "file=@photo.jpg" \
  --output converted.webp
```

### WebP Parameters

- **quality** (0-100): Quality/compression level
  - For lossy: 0=smallest file, 100=largest/best quality (default: 85)
  - For lossless: 0=fastest compression, 100=slowest/smallest (default: 85)
- **lossless** (true/false): Enable lossless compression (default: false)

### Compression Results

Real-world test results from our sample images:

| Input Format | Input Size | Output Format | Output Size | Reduction | Quality |
|--------------|-----------|---------------|-------------|-----------|---------|
| HEIC | 3.7 MB | WebP | 2.9 MB | 22% | quality=85 |
| JPG | 1.5 MB | WebP | 258 KB | **83%** | quality=85 |
| DNG | 28 MB | WebP | 448 KB | **98.4%** | quality=90 |
| JPG | 1.5 MB | WebP (lossless) | 3.2 MB | -113% | lossless=true |

**Key Takeaways:**
- WebP provides 25-80% file size reduction for typical web use cases
- DNG → WebP is ideal for publishing RAW photos to websites
- Lossless WebP is larger than lossy but maintains perfect quality
- Recommended: quality=85 for web images, quality=90 for hero images

## Tasks

### Step 1: Authentication

Add code to your homepage service to fetch an OIDC ID token from the Google Cloud metadata server following the authentication instructions listed above.

### Step 2: Image Processing

Update this service to be reusable and able to be invoked by components across the site that allow users to upload images.

### Step 3: Implementation

Start by adding this service to the events photo upload dialog.
Found at: components\widgets\events\event-photo-upload-dialog.tsx.
