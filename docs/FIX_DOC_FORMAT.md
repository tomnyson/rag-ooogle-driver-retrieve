# Fix: Old .doc Format Support

## Issue

Files with `.doc` extension (Word 97-2003 format) were causing errors:

```
❌ [2025-10-29T16:53:22.989Z] ERROR [FileProcessor] Error parsing Word document: 
Could not find the body element: are you sure this is a docx file?
```

## Root Cause

The `mammoth` library only supports modern `.docx` format (Office Open XML). It cannot parse the old binary `.doc` format (Word 97-2003).

## Solution Implemented

### 1. Graceful Handling in fileProcessor.js

Updated `extractFromWord()` to detect and skip old `.doc` files:

```javascript
async extractFromWord(fileBuffer) {
  try {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value;
  } catch (error) {
    // Check if it's a .doc file (not supported by mammoth)
    if (error.message && error.message.includes('body element')) {
      this.logger.warn('Old .doc format detected (Word 97-2003). Only .docx is supported. Skipping file.');
      return ''; // Return empty string instead of throwing error
    }
    
    this.logger.error('Error parsing Word document:', error.message);
    throw new FileProcessingError(...);
  }
}
```

### 2. Better Logging in extractText()

Added specific warning for `.doc` files:

```javascript
// Check if file was skipped (old .doc format)
if (text === '' && fileName.endsWith('.doc')) {
  this.logger.warn(`⚠️  Skipped ${fileName}: Old .doc format not supported. Please convert to .docx`);
}
```

### 3. Updated Sync Service

Modified `processFile()` to properly count skipped `.doc` files:

```javascript
if (!cleanedText || cleanedText.length < 10) {
  // Check if it's an old .doc file
  if (file.name.endsWith('.doc') && !file.name.endsWith('.docx')) {
    console.warn(`⚠️  Skipped ${file.name}: Old .doc format not supported. Please convert to .docx`);
    this.stats.skipped++;
  } else {
    console.warn(`⚠️  File ${file.name} has no extractable text content`);
  }
  return;
}
```

### 4. Updated Constants

Added documentation in constants.js:

```javascript
/**
 * Supported file types array
 * Note: .doc (Word 97-2003) is listed but not fully supported - will be skipped during processing
 */
export const SUPPORTED_MIME_TYPES = [
  MIME_TYPES.PDF,
  MIME_TYPES.DOCX,
  MIME_TYPES.DOC, // Listed for detection, but will be skipped
  MIME_TYPES.GOOGLE_DOC,
];

/**
 * Fully supported file types (can be processed)
 */
export const FULLY_SUPPORTED_MIME_TYPES = [
  MIME_TYPES.PDF,
  MIME_TYPES.DOCX,
  MIME_TYPES.GOOGLE_DOC,
];
```

## New Documentation

### 1. docs/SUPPORTED_FORMATS.md
Complete guide covering:
- ✅ Fully supported formats (PDF, .docx, Google Docs)
- ⚠️ Partially supported formats (.doc - skipped)
- 🚫 Unsupported formats
- Conversion instructions (4 methods)
- Technical details
- Best practices

### 2. TROUBLESHOOTING.md
Comprehensive troubleshooting guide with:
- Common issues and solutions
- Debugging commands
- Prevention tips
- Getting help section

### 3. Updated README.md
- Added link to Supported Formats documentation
- Added link to Troubleshooting guide
- Updated features list with format details

## Behavior Changes

### Before
```
❌ Error processing file document.doc: Failed to extract text
❌ Failed to process document.doc: Failed to parse Word document
[Process continues with error count]
```

### After
```
⚠️  Skipped document.doc: Old .doc format not supported. Please convert to .docx
[Process continues, file counted as skipped]
```

## Benefits

1. **No More Crashes**: Old `.doc` files no longer cause errors
2. **Clear Messaging**: Users know exactly why files are skipped
3. **Proper Tracking**: Skipped files are counted in statistics
4. **Better UX**: Helpful conversion instructions provided
5. **Maintainable**: Well-documented with clear separation of concerns

## User Actions Required

### For Users with .doc Files

**Option 1: Convert to .docx (Recommended)**
```bash
# Using LibreOffice
libreoffice --headless --convert-to docx file.doc

# Or use Microsoft Word, Google Docs, or online converters
```

**Option 2: Accept Skipping**
- Files will be skipped with warning
- No data loss, just not processed
- Can convert later if needed

### For Administrators

**Monitor Skipped Files:**
```bash
# Check logs for skipped files
pm2 logs rag-cron | grep "Skipped"

# Count skipped .doc files
pm2 logs rag-cron | grep "Old .doc format" | wc -l
```

**Batch Conversion:**
```bash
# Convert all .doc files in Google Drive
# Use Google Apps Script or manual conversion
```

## Testing

### Test Cases

1. ✅ `.docx` file - Processes successfully
2. ✅ `.doc` file - Skips with warning
3. ✅ PDF file - Processes successfully
4. ✅ Google Doc - Processes successfully
5. ✅ Empty file - Skips with warning
6. ✅ Corrupted file - Logs error, continues

### Verification

```bash
# Start sync
npm run cron

# Check logs
pm2 logs rag-cron

# Expected output for .doc files:
# ⚠️  Skipped document.doc: Old .doc format not supported. Please convert to .docx
```

## Files Changed

### Code Changes
- ✅ `src/services/fileProcessor.js` - Graceful .doc handling
- ✅ `src/sync.js` - Better skipped file tracking
- ✅ `src/utils/constants.js` - Documentation updates

### Documentation
- ✅ `docs/SUPPORTED_FORMATS.md` - New comprehensive guide
- ✅ `TROUBLESHOOTING.md` - New troubleshooting guide
- ✅ `README.md` - Updated with format info and links
- ✅ `FIX_DOC_FORMAT.md` - This file

## Future Considerations

### Option 1: Add .doc Support
If needed, could add `word-extractor` library:
```bash
npm install word-extractor
```

**Pros:**
- Full .doc support
- No conversion needed

**Cons:**
- Additional dependency
- More complex code
- Less reliable than .docx
- Maintenance burden

### Option 2: Keep Current Approach (Recommended)
**Pros:**
- Simple and maintainable
- Encourages modern formats
- Clear user guidance
- No additional dependencies

**Cons:**
- Users must convert files
- Some files may be missed

**Recommendation:** Keep current approach. The `.doc` format is legacy and being phased out. Encouraging conversion to `.docx` is better long-term.

## Rollback

If needed to rollback:

```bash
# Revert changes
git revert <commit-hash>

# Or restore old behavior
# Remove the error handling in extractFromWord()
```

## Summary

✅ **Fixed:** Old `.doc` files no longer cause errors
✅ **Improved:** Clear warnings and user guidance
✅ **Documented:** Comprehensive format documentation
✅ **Tested:** All test cases pass
✅ **Deployed:** Ready for production

Users with `.doc` files will see helpful warnings and conversion instructions instead of errors.
