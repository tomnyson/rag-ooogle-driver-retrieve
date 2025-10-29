import { google } from 'googleapis';
import { config } from '../config/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GoogleDriveService {
  constructor() {
    this.auth = null;
    this.drive = null;
  }

  /**
   * Initialize Google Drive API client with Service Account
   */
  async initialize() {
    try {
      // Use Service Account authentication
      if (config.google.serviceAccountFile) {
        const serviceAccountPath = path.resolve(config.google.serviceAccountFile);
        
        if (!fs.existsSync(serviceAccountPath)) {
          throw new Error(`Service account file not found: ${serviceAccountPath}`);
        }

        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        
        this.auth = new google.auth.GoogleAuth({
          credentials: serviceAccount,
          scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        });

        this.drive = google.drive({ version: 'v3', auth: this.auth });
        
        console.log('✅ Google Drive API initialized successfully (Service Account)');
        console.log(`📧 Service Account: ${serviceAccount.client_email}`);
      } 
      // Fallback to OAuth2 if configured
      else if (config.google.clientId && config.google.refreshToken) {
        const oauth2Client = new google.auth.OAuth2(
          config.google.clientId,
          config.google.clientSecret,
          config.google.redirectUri
        );

        oauth2Client.setCredentials({
          refresh_token: config.google.refreshToken,
        });

        this.drive = google.drive({ version: 'v3', auth: oauth2Client });
        
        console.log('✅ Google Drive API initialized successfully (OAuth2)');
      } else {
        throw new Error('No valid authentication method configured. Please set GOOGLE_SERVICE_ACCOUNT_FILE or OAuth credentials.');
      }
    } catch (error) {
      console.error('❌ Failed to initialize Google Drive API:', error.message);
      throw error;
    }
  }

  /**
   * List all folders in a given folder
   * @param {string} folderId - Folder ID to list subfolders from
   * @returns {Array} List of folders
   */
  async listFolders(folderId = null) {
    try {
      const query = [];
      
      if (folderId) {
        query.push(`'${folderId}' in parents`);
      }
      
      query.push(`mimeType='application/vnd.google-apps.folder'`);
      query.push('trashed=false');

      const response = await this.drive.files.list({
        q: query.join(' and '),
        fields: 'files(id, name)',
        pageSize: 1000,
      });

      return response.data.files || [];
    } catch (error) {
      console.error('❌ Error listing folders:', error.message);
      return [];
    }
  }

  /**
   * List all files from Google Drive recursively (supports PDF and Word docs)
   * @param {string} folderId - Optional folder ID to list files from
   * @returns {Array} List of files
   */
  async listFiles(folderId = null) {
    try {
      const supportedMimeTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/msword', // .doc
        'application/vnd.google-apps.document', // Google Docs
      ];

      console.log(`📂 Scanning folder${folderId ? ': ' + folderId : ' (root)'}...`);

      // Get all files in current folder
      const query = [];
      
      if (folderId) {
        query.push(`'${folderId}' in parents`);
      }
      
      query.push(`(${supportedMimeTypes.map(type => `mimeType='${type}'`).join(' or ')})`);
      query.push('trashed=false');

      const response = await this.drive.files.list({
        q: query.join(' and '),
        fields: 'files(id, name, mimeType, modifiedTime, size, webViewLink)',
        pageSize: 1000,
      });

      let allFiles = response.data.files || [];
      console.log(`  └─ Found ${allFiles.length} file(s) in current folder`);

      // Get all subfolders in current folder
      const subfolders = await this.listFolders(folderId);
      
      if (subfolders.length > 0) {
        console.log(`  └─ Found ${subfolders.length} subfolder(s), scanning recursively...`);
        
        // Recursively get files from subfolders
        for (const folder of subfolders) {
          console.log(`\n  📁 Entering subfolder: ${folder.name}`);
          const subFiles = await this.listFiles(folder.id);
          allFiles = allFiles.concat(subFiles);
        }
      }

      return allFiles;
    } catch (error) {
      console.error('❌ Error listing files:', error.message);
      throw error;
    }
  }

  /**
   * Get summary of all files found
   * @param {string} folderId - Optional folder ID
   * @returns {Array} List of all files
   */
  async getAllFilesRecursive(folderId = null) {
    console.log('🔍 Starting recursive file scan...\n');
    const startTime = Date.now();
    
    const files = await this.listFiles(folderId);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n' + '='.repeat(60));
    console.log(`✅ Scan complete! Found ${files.length} total file(s) in ${duration}s`);
    console.log('='.repeat(60) + '\n');
    
    return files;
  }

  /**
   * Download a file from Google Drive
   * @param {string} fileId - File ID to download
   * @param {string} fileName - File name
   * @param {string} mimeType - File MIME type
   * @returns {Buffer} File content as buffer
   */
  async downloadFile(fileId, fileName, mimeType) {
    try {
      let response;

      // Google Docs need to be exported to a different format
      if (mimeType === 'application/vnd.google-apps.document') {
        response = await this.drive.files.export(
          {
            fileId: fileId,
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          },
          { responseType: 'arraybuffer' }
        );
      } else {
        response = await this.drive.files.get(
          { fileId: fileId, alt: 'media' },
          { responseType: 'arraybuffer' }
        );
      }

      console.log(`📥 Downloaded file: ${fileName}`);
      return Buffer.from(response.data);
    } catch (error) {
      console.error(`❌ Error downloading file ${fileName}:`, error.message);
      throw error;
    }
  }

  /**
   * Get file metadata
   * @param {string} fileId - File ID
   * @returns {Object} File metadata
   */
  async getFileMetadata(fileId) {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'id, name, mimeType, modifiedTime, size, webViewLink, parents',
      });

      return response.data;
    } catch (error) {
      console.error(`❌ Error getting file metadata:`, error.message);
      throw error;
    }
  }
}

export default new GoogleDriveService();

