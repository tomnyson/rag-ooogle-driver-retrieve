# Incremental Sync

The cron job uses **incremental sync** to only process files that have been added or modified since the last sync.

## How It Works

### 1. **Change Detection**

The system compares Google Drive file modification times with stored metadata:

```javascript
// Checks if file needs updating
const needsUpdate = await supabaseService.needsUpdate(
  file.name,
  file.modifiedTime
);
```

### 2. **Smart Processing**

- ✅ **New files** → Processed and added to database
- ✅ **Modified files** → Re-processed and updated in database  
- ⏭️ **Unchanged files** → Skipped (no processing needed)

### 3. **Efficiency Benefits**

| Benefit | Description |
|---------|-------------|
| **Faster syncs** | Only processes changed files |
| **Lower API usage** | Fewer API calls to Gemini & Drive |
| **Cost savings** | Reduced embedding generation costs |
| **Better logs** | Clear indication of what changed |

## Example Output

### First Sync (All New)
```
📁 Found 10 files in Google Drive
🔎 Checking which files need processing...

[1/10] Processing: document1.pdf
📝 New file detected: document1.pdf
✅ Successfully processed: document1.pdf

[2/10] Processing: document2.docx
📝 New file detected: document2.docx
✅ Successfully processed: document2.docx

📊 SYNC SUMMARY
⏱️  Duration: 2m 15s
✅ Processed (new/updated): 10
⏭️  Skipped (no changes): 0
```

### Subsequent Syncs (No Changes)
```
📁 Found 10 files in Google Drive
🔎 Checking which files need processing...

[1/10] Processing: document1.pdf
⏭️  Skipping (already up to date): document1.pdf

[2/10] Processing: document2.docx
⏭️  Skipping (already up to date): document2.docx

📊 SYNC SUMMARY
⏱️  Duration: 0m 8s
✅ Processed (new/updated): 0
⏭️  Skipped (no changes): 10
📈 Total efficiency: 100.0% skipped

✨ All files are up to date! No processing needed.
```

### With Some Changes
```
📁 Found 10 files in Google Drive
🔎 Checking which files need processing...

[1/10] Processing: document1.pdf
⏭️  Skipping (already up to date): document1.pdf

[2/10] Processing: document2.docx
🔄 File modified: document2.docx
   Drive: 2025-10-29T10:30:00.000Z
   Stored: 2025-10-28T15:20:00.000Z
✅ Successfully processed: document2.docx

[3/10] Processing: new-file.pdf
📝 New file detected: new-file.pdf
✅ Successfully processed: new-file.pdf

📊 SYNC SUMMARY
⏱️  Duration: 0m 35s
✅ Processed (new/updated): 2
⏭️  Skipped (no changes): 8
📈 Total efficiency: 80.0% skipped

✨ Successfully updated 2 file(s).
```

## How Files Are Compared

### Stored Metadata
```json
{
  "driveFileId": "1abc...",
  "size": 12345,
  "mimeType": "application/pdf",
  "textLength": 5000,
  "modifiedTime": "2025-10-28T15:20:00.000Z"
}
```

### Comparison Logic
1. Fetch existing document from database
2. Extract `modifiedTime` from metadata
3. Compare with Google Drive's `modifiedTime`
4. If Drive time > Stored time → Process
5. Otherwise → Skip

## Benefits

### Performance
- **10x faster** for subsequent syncs with no changes
- **Minimal API calls** when files haven't changed
- **Reduced server load** during scheduled runs

### Cost Optimization
- **No re-processing** of unchanged documents
- **No duplicate embeddings** generated
- **Lower Gemini API usage** = lower costs

### Reliability
- **Accurate change detection** using Drive timestamps
- **Automatic re-sync** if files are modified
- **Safe updates** - existing data preserved if unchanged

## Configuration

No additional configuration needed! The incremental sync is **always active**.

### Cron Schedule
Set your schedule in `.env`:
```bash
CRON_SCHEDULE="0 */6 * * *"  # Every 6 hours
CRON_RUN_ON_STARTUP=true     # Run on startup
```

### Force Full Re-sync

If you need to force a full re-sync (ignore change detection):

```bash
# Option 1: Clear the database and re-sync
# WARNING: This deletes all data
psql -h your-supabase-url -d postgres -c "TRUNCATE knowledge_base;"
npm run cron:once

# Option 2: Delete specific files from database manually
# Then run sync - they'll be detected as new files
```

## Monitoring

### Check Sync Efficiency

Look for the efficiency metric in the summary:
```
📈 Total efficiency: 80.0% skipped
```

- **High percentage** (>80%) = Most files unchanged (efficient)
- **Low percentage** (<20%) = Many files changed (expected after bulk updates)

### Logs Show Exactly What Changed

```
📝 New file detected: new-document.pdf          # New file
🔄 File modified: existing-document.pdf         # Modified file
⏭️  Skipping (already up to date): old-doc.pdf  # No changes
```

## Best Practices

### Scheduled Syncs
For **frequent syncs** (every hour):
- Most runs will skip unchanged files
- Very fast execution
- Low API costs

For **infrequent syncs** (daily):
- More files likely changed
- Longer processing time
- Higher API usage

### Recommended Schedule

```bash
# Development/Testing
CRON_SCHEDULE="*/30 * * * *"  # Every 30 minutes

# Production (low-traffic)
CRON_SCHEDULE="0 */4 * * *"    # Every 4 hours

# Production (high-traffic)
CRON_SCHEDULE="0 * * * *"      # Every hour
```

## Troubleshooting

### Files Not Updating?

Check if modification time changed in Google Drive:
```bash
npm run test:list
# Look for modifiedTime in the output
```

### Force Re-process a File?

1. Delete from database (or update modifiedTime to old date)
2. Run sync again - will be detected as new/modified

### All Files Skipped?

This is **normal and good**! It means:
- ✅ No files have been modified
- ✅ All files are in sync
- ✅ System is working efficiently

---

**Summary**: Incremental sync saves time, reduces costs, and ensures only changed files are processed. It's automatic and requires no configuration!
