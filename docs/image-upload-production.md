### Image uploads in production (Railway backend + Vercel frontend)

This note outlines a pragmatic, secure way to move from dev disk uploads to production object storage using a presigned-URL flow. It assumes:
- Backend runs on Railway (FastAPI)
- Frontend runs on Vercel (Next.js)
- Storage is AWS S3 (primary recommendation). Cloudflare R2 alternative included at the end.

## What we’ll ship
- Store images in S3 (not in DB; notes keep Markdown with image URLs)
- Backend endpoint: issue presigned URLs to authenticated users
- Frontend: paste/upload directly to S3 using the presigned URL, then insert the final public URL into Markdown
- Optional CDN layer (CloudFront) for performance and stable public URLs

## Why presigned URLs (and not proxy uploads)
- Lower backend bandwidth/cost; uploads go client → S3
- Less latency and load on your API
- Simple revoke/expire behavior with short-lived signatures

## Step 1 — Create S3 bucket
1. Pick a region close to your users (e.g., `us-east-1`).
2. Create bucket `studentsai-uploads-<your-env>`.
3. For first pass, you can allow public read on objects (we’ll switch to CloudFront + private bucket later).

Bucket CORS (allow PUT from your app domains):
```
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedOrigins": [
      "https://<your-vercel-domain>",
      "http://localhost:3000"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

## Step 2 — Configure environment variables
Set these in Railway (backend):
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` (e.g. `us-east-1`)
- `S3_BUCKET_NAME` (e.g. `studentsai-uploads-prod`)
- Optional when using CloudFront: `S3_PUBLIC_BASE_URL` (e.g. `https://cdn.studentsai.app`)

Frontend (Vercel Project Settings → Environment Variables):
- `NEXT_PUBLIC_API_URL` → backend public URL

## Step 3 — Backend: add presigned URL endpoint
Implementation sketch (FastAPI):
- Install deps in `backend/requirements.txt`:
  - `boto3==1.34.*`
- Add endpoint (e.g., `POST /upload/presign`) that:
  - Requires auth (JWT)
  - Accepts: `content_type`, optional `filename`
  - Generates key like: `user/<user_id>/<uuid>.<ext>`
  - Validates allowed types (`image/png`, `image/jpeg`, `image/webp`, `image/gif`)
  - Uses `boto3.client("s3").generate_presigned_url` (or `generate_presigned_post`) with short expiry (e.g., 60–180s)
  - Returns `{ uploadUrl, fields? (if POST), finalUrl }`
    - `finalUrl` should use `S3_PUBLIC_BASE_URL` if set (CloudFront). Else default to `https://<bucket>.s3.<region>.amazonaws.com/<key>`

Example Python outline (not the full code):
```python
import boto3, uuid, mimetypes, os

s3 = boto3.client("s3", region_name=os.environ["AWS_REGION"])

@app.post("/upload/presign")
async def presign_image(request: Request, payload: PresignReq, user_id=Depends(get_current_user_id)):
    # Validate content_type
    if payload.content_type not in {"image/png", "image/jpeg", "image/webp", "image/gif"}:
        raise HTTPException(400, "Unsupported type")

    ext = mimetypes.guess_extension(payload.content_type) or ".bin"
    key = f"user/{user_id}/{uuid.uuid4()}{ext}"
    bucket = os.environ["S3_BUCKET_NAME"]

    presigned = s3.generate_presigned_url(
        ClientMethod="put_object",
        Params={"Bucket": bucket, "Key": key, "ContentType": payload.content_type},
        ExpiresIn=180,
    )

    public_base = os.getenv("S3_PUBLIC_BASE_URL")
    if public_base:
        final_url = f"{public_base}/{key}"
    else:
        region = os.environ["AWS_REGION"]
        final_url = f"https://{bucket}.s3.{region}.amazonaws.com/{key}"

    return {"uploadUrl": presigned, "finalUrl": final_url}
```

## Step 4 — Frontend: upload using presigned URL
Change `uploadImage` flow:
1. Request presign from API with the file’s content type
2. `fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })`
3. On 200, use `finalUrl` and insert `![](<finalUrl>)` into Markdown

Note: If you use `generate_presigned_post` you’ll send a multipart form instead of PUT; both are fine.

## Step 5 — Security/limits
- Validate content type and size (enforce client-side and server-side; e.g., reject > 10MB)
- Rate-limit the presign endpoint
- Optionally scan uploaded files (e.g., post-upload queue + AV scanner)
- Use short-lived presign URLs (< 3 minutes)

## Step 6 — Optional: CloudFront + private bucket
More robust production setup:
1. Keep the S3 bucket private (Block Public Access = ON)
2. Create a CloudFront distribution with origin set to the S3 bucket (Origin Access Control/OAC)
3. CloudFront domain becomes your `S3_PUBLIC_BASE_URL`
4. Set long cache TTLs for images

## Step 7 — Dev/prod toggle
Keep current local-disk upload for dev (DEBUG=true). For prod, add an env variable like `USE_S3=1` to switch the code path to presign-based uploads.

## Cloudflare R2 alternative (S3-compatible)
- Create R2 bucket and API token
- Endpoint: `https://<account_id>.r2.cloudflarestorage.com`
- Env add: `S3_ENDPOINT` and pass `endpoint_url=S3_ENDPOINT` to `boto3.client("s3", endpoint_url=...)`
- Public URL can be via a custom domain proxied through Cloudflare, or R2 public bucket binding

## Cleanup & lifecycle (nice-to-have)
- Keep an `attachments` table to track uploaded objects referenced by notes (for cleanup)
- On note deletion, remove unreferenced objects from S3

## Rollout checklist
- [ ] S3 bucket + CORS + policy done
- [ ] Railway env vars set (AWS keys, region, bucket, S3_PUBLIC_BASE_URL)
- [ ] Backend presign endpoint implemented + tested
- [ ] Frontend uses presigned PUT and inserts `finalUrl`
- [ ] Optional CloudFront distribution uses your domain/CDN
- [ ] Limits + rate-limits in place
- [ ] Vercel `NEXT_PUBLIC_API_URL` set


