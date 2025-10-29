import googleDriveService from './services/googleDrive.js';
import geminiService from './services/gemini.js';
import supabaseService from './services/supabase.js';
import fileProcessorService from './services/fileProcessor.js';
import { config } from './config/index.js';

class SyncService {
  constructor() {
    this.stats = {
      processed: 0,
      skipped: 0,
      errors: 0,
      startTime: null,
      endTime: null,
    };
  }

  /**
   * Initialize all services
   */
  async initialize() {
    console.log('🚀 Initializing services...');
    await googleDriveService.initialize();
    await geminiService.initialize();
    await supabaseService.initialize();
    await supabaseService.setupDatabase();
  }

  /**
   * Sync all files from Google Drive to Supabase
   */
  async syncFiles() {
    this.stats.startTime = new Date();
    console.log('\n📊 Starting sync process...');
    console.log(`⏰ Started at: ${this.stats.startTime.toLocaleString()}`);
    console.log('🔍 Checking for new or modified files...\n');

    try {
      // List all files from Google Drive (recursive)
      const files = await googleDriveService.getAllFilesRecursive(config.drive.folderId);

      if (files.length === 0) {
        console.log('📂 No files found to sync');
        return;
      }

      console.log(`📁 Found ${files.length} files in Google Drive`);
      console.log(`🔎 Checking which files need processing...\n`);

      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`\n[${i + 1}/${files.length}] Processing: ${file.name}`);

        try {
          await this.processFile(file);
          this.stats.processed++;
        } catch (error) {
          console.error(`❌ Error processing file ${file.name}:`, error.message);
          this.stats.errors++;
        }

        // Add a small delay between files to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('❌ Sync process failed:', error.message);
      throw error;
    } finally {
      this.stats.endTime = new Date();
      this.printSummary();
    }
  }

  /**
   * Process a single file
   * @param {Object} file - File metadata from Google Drive
   */
  async processFile(file) {
    try {
      // Check if file needs updating
      const needsUpdate = await supabaseService.needsUpdate(
        file.name,
        file.modifiedTime
      );

      if (!needsUpdate) {
        console.log(`⏭️  Skipping (already up to date): ${file.name}`);
        this.stats.skipped++;
        return;
      }

      // Download file from Google Drive
      const fileBuffer = await googleDriveService.downloadFile(
        file.id,
        file.name,
        file.mimeType
      );

      // Extract text content
      const rawText = await fileProcessorService.extractText(
        fileBuffer,
        file.mimeType,
        file.name
      );

      const cleanedText = fileProcessorService.cleanText(rawText);

      if (!cleanedText || cleanedText.length < 10) {
        console.warn(`⚠️  File ${file.name} has no extractable text content`);
        return;
      }

      // Generate embeddings from the full text
      const embeddings = await geminiService.generateEmbeddings(cleanedText);

      // Prepare document data for knowledge_base table
      const document = {
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension for title
        fileName: file.name,
        filePath: null, // Will be set if needed
        fileUrl: file.webViewLink,
        fileType: fileProcessorService.getFileType(file.mimeType),
        content: cleanedText,
        embedding: embeddings,
        metadata: {
          driveFileId: file.id,
          size: file.size,
          mimeType: file.mimeType,
          textLength: cleanedText.length,
          modifiedTime: file.modifiedTime,
        },
        chunkIndex: 0,
        teacherId: config.user.teacherId,
        userId: config.user.userId,
      };

      // Save to Supabase
      await supabaseService.upsertDocument(document);

      console.log(`✅ Successfully processed: ${file.name}`);
    } catch (error) {
      console.error(`❌ Failed to process ${file.name}:`, error.message);
      throw error;
    }
  }

  /**
   * Print sync summary
   */
  printSummary() {
    const duration = this.stats.endTime - this.stats.startTime;
    const minutes = Math.floor(duration / 60000);
    const seconds = ((duration % 60000) / 1000).toFixed(0);

    console.log('\n' + '='.repeat(60));
    console.log('📊 SYNC SUMMARY');
    console.log('='.repeat(60));
    console.log(`⏱️  Duration: ${minutes}m ${seconds}s`);
    console.log(`✅ Processed (new/updated): ${this.stats.processed}`);
    console.log(`⏭️  Skipped (no changes): ${this.stats.skipped}`);
    console.log(`❌ Errors: ${this.stats.errors}`);
    console.log(`📈 Total efficiency: ${this.stats.skipped > 0 ? 
      ((this.stats.skipped / (this.stats.processed + this.stats.skipped)) * 100).toFixed(1) + '% skipped' : 
      'N/A'}`);
    console.log(`🏁 Finished at: ${this.stats.endTime.toLocaleString()}`);
    console.log('='.repeat(60) + '\n');
    
    if (this.stats.processed === 0 && this.stats.skipped > 0) {
      console.log('✨ All files are up to date! No processing needed.\n');
    } else if (this.stats.processed > 0) {
      console.log(`✨ Successfully updated ${this.stats.processed} file(s).\n`);
    }
  }

  /**
   * Run sync with error handling
   */
  async run() {
    try {
      await this.initialize();
      await this.syncFiles();
    } catch (error) {
      console.error('❌ Fatal error during sync:', error);
      process.exit(1);
    }
  }
}

export default new SyncService();

