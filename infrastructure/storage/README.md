# Supabase Storage Setup Guide

## Quick Setup

1. Go to your Supabase project Dashboard
2. Navigate to **Storage** (left sidebar)
3. Click **New bucket** and create:
   - `uploads` (private, 50MB limit)
   - `screenshots` (public, 10MB limit)
   - `exports` (private, 100MB limit)

## Or use SQL

Run the SQL in `infrastructure/storage/supabase-storage-setup.sql` in Supabase SQL Editor.

## Configuration

### Bucket Settings

| Bucket | Public | Max Size | Purpose |
|--------|--------|----------|---------|
| uploads | No | 50MB | Test logs, traces, JSON |
| screenshots | Yes | 10MB | Failure screenshots |
| exports | No | 100MB | PDF reports, CSV exports |

### File Types

```
uploads: .log, .txt, .json, .xml, .png, .jpg, .gif, .webp, .har, .trace, .html
screenshots: .png, .jpg, .gif, .webp
exports: .pdf, .json, .csv, .zip
```

## Storage API

```typescript
import { storageService } from '@/lib/services/storage';

// Get public URL
const url = storageService.getPublicUrl('screenshots', 'user123/project1/screenshot.png');

// Get signed URL for private files
const signed = await storageService.getSignedUrl('uploads', 'user123/project1/test.log');

// List files
const { files } = await storageService.listFiles('uploads', 'user123/project1');

// Delete file
await storageService.deleteFile('uploads', 'user123/project1/test.log');
```

## Folder Structure

```
uploads/
  └── {user_id}/
      └── {project_id}/
          └── {timestamp}-{filename}

screenshots/
  └── {user_id}/
      └── {project_id}/
          └── {timestamp}-{filename}

exports/
  └── {user_id}/
      └── {project_id}/
          └── report-{timestamp}.pdf
```