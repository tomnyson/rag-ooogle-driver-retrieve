# Supported File Formats

## ✅ Fully Supported Formats

### PDF Files
- **Extension:** `.pdf`
- **MIME Type:** `application/pdf`
- **Status:** ✅ Fully supported
- **Library:** `pdf-parse`
- **Notes:** All PDF versions supported

### Word Documents (Modern)
- **Extension:** `.docx`
- **MIME Type:** `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **Status:** ✅ Fully supported
- **Library:** `mammoth`
- **Notes:** Word 2007 and later

### Google Docs
- **Extension:** N/A (cloud-based)
- **MIME Type:** `application/vnd.google-apps.document`
- **Status:** ✅ Fully supported
- **Library:** `mammoth` (exported as .docx)
- **Notes:** Automatically exported to .docx format

## ⚠️ Partially Supported / Skipped Formats

### Word Documents (Legacy)
- **Extension:** `.doc`
- **MIME Type:** `application/msword`
- **Status:** ⚠️ **NOT SUPPORTED** - Will be skipped
- **Reason:** Old binary format (Word 97-2003) not supported by mammoth library
- **Solution:** Convert to `.docx` format

#### How to Convert .doc to .docx

**Option 1: Microsoft Word**
1. Open the `.doc` file in Microsoft Word
2. Click **File** > **Save As**
3. Choose format: **Word Document (.docx)**
4. Save

**Option 2: Google Docs**
1. Upload `.doc` file to Google Drive
2. Right-click > **Open with** > **Google Docs**
3. File > **Download** > **Microsoft Word (.docx)**

**Option 3: LibreOffice**
1. Open the `.doc` file in LibreOffice Writer
2. File > **Save As**
3. Choose format: **Office Open XML Text (.docx)**
4. Save

**Option 4: Online Converter**
- [CloudConvert](https://cloudconvert.com/doc-to-docx)
- [Zamzar](https://www.zamzar.com/convert/doc-to-docx/)
- [Online-Convert](https://document.online-convert.com/convert-to-docx)

**Option 5: Command Line (LibreOffice)**
```bash
# Install LibreOffice
# Ubuntu/Debian
sudo apt-get install libreoffice

# macOS
brew install --cask libreoffice

# Convert
libreoffice --headless --convert-to docx file.doc
```

## 🚫 Unsupported Formats

The following formats are **not supported** and will be ignored:

- `.txt` - Plain text files
- `.rtf` - Rich Text Format
- `.odt` - OpenDocument Text
- `.pages` - Apple Pages
- `.xls`, `.xlsx` - Excel spreadsheets
- `.ppt`, `.pptx` - PowerPoint presentations
- Images (`.jpg`, `.png`, etc.)
- Videos, Audio files

## 📊 Format Comparison

| Format | Extension | Supported | Text Extraction | Notes |
|--------|-----------|-----------|-----------------|-------|
| PDF | `.pdf` | ✅ Yes | Excellent | All versions |
| Word Modern | `.docx` | ✅ Yes | Excellent | Word 2007+ |
| Google Docs | N/A | ✅ Yes | Excellent | Auto-converted |
| Word Legacy | `.doc` | ❌ No | N/A | Convert to .docx |
| Plain Text | `.txt` | ❌ No | N/A | Not implemented |
| RTF | `.rtf` | ❌ No | N/A | Not implemented |

## 🔍 Detection and Handling

### How Files Are Processed

1. **File Discovery**
   - System scans Google Drive for files
   - Checks MIME type of each file

2. **Format Detection**
   - PDF: Processed with `pdf-parse`
   - DOCX: Processed with `mammoth`
   - Google Docs: Exported to DOCX, then processed
   - DOC: Detected but **skipped** with warning

3. **Text Extraction**
   - Successful: Text is extracted and processed
   - Failed: Error logged, file skipped
   - Empty: Warning logged, file skipped

4. **Logging**
   ```
   ✅ Successfully processed: document.docx
   ⚠️  Skipped document.doc: Old .doc format not supported. Please convert to .docx
   ❌ Failed to process: corrupted.pdf
   ```

## 🛠️ Technical Details

### Libraries Used

```json
{
  "pdf-parse": "^1.1.1",    // PDF text extraction
  "mammoth": "^1.6.0"       // DOCX text extraction
}
```

### Why .doc is Not Supported

The `.doc` format (Word 97-2003) uses a proprietary binary format that is:
- Complex to parse
- Requires specialized libraries
- Less common in modern workflows
- Being phased out by Microsoft

The `mammoth` library only supports the modern `.docx` format (Office Open XML), which is:
- XML-based (easier to parse)
- Industry standard
- Better documented
- More widely supported

### Adding Support for .doc

If you need `.doc` support, you would need to:

1. **Add a library** like `word-extractor`:
   ```bash
   npm install word-extractor
   ```

2. **Update fileProcessor.js**:
   ```javascript
   import WordExtractor from 'word-extractor';
   
   async extractFromOldWord(fileBuffer) {
     const extractor = new WordExtractor();
     const doc = await extractor.extract(fileBuffer);
     return doc.getBody();
   }
   ```

3. **Update logic** to use different extractors for `.doc` vs `.docx`

However, we recommend **converting to .docx** instead, as it's:
- More reliable
- Better supported
- Future-proof
- Simpler to maintain

## 📝 Best Practices

### For Users

1. **Use Modern Formats**
   - Prefer `.docx` over `.doc`
   - Use Google Docs for cloud documents
   - Save PDFs with text layer (not scanned images)

2. **Convert Legacy Files**
   - Batch convert all `.doc` files to `.docx`
   - Use Google Drive's built-in converter
   - Keep originals as backup

3. **Check File Quality**
   - Ensure PDFs have text (not just images)
   - Avoid password-protected files
   - Test with a few files first

### For Administrators

1. **Monitor Logs**
   ```bash
   pm2 logs rag-cron | grep "Skipped"
   ```

2. **Track Skipped Files**
   - Review which files are being skipped
   - Identify patterns
   - Plan conversion strategy

3. **Communicate with Users**
   - Inform users about supported formats
   - Provide conversion instructions
   - Set up automated conversion if needed

## 🔄 Automated Conversion

### Google Drive Apps Script

You can create a Google Apps Script to automatically convert `.doc` files:

```javascript
function convertDocToDocx() {
  var folder = DriveApp.getFolderById('YOUR_FOLDER_ID');
  var files = folder.getFilesByType(MimeType.MICROSOFT_WORD);
  
  while (files.hasNext()) {
    var file = files.next();
    
    // Open in Google Docs
    var docFile = Drive.Files.copy({}, file.getId(), {
      convert: true
    });
    
    // Export as DOCX
    var blob = DriveApp.getFileById(docFile.id).getAs('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    folder.createFile(blob);
    
    // Optional: Delete original
    // file.setTrashed(true);
  }
}
```

## 📞 Support

If you encounter issues with file formats:

1. Check the logs: `pm2 logs rag-cron`
2. Verify file format: Check file extension and MIME type
3. Try converting: Use one of the conversion methods above
4. Test with a sample: Try with a known-good file first

## 🔮 Future Support

Potential formats to add in the future:
- `.txt` - Plain text files
- `.rtf` - Rich Text Format
- `.odt` - OpenDocument Text
- `.md` - Markdown files

Let us know if you need support for additional formats!
