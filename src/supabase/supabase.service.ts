import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger('file storage');
  private supabase: SupabaseClient;
  private readonly bucketName = 'nsc-hackathon'; // Default bucket name

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and key must be provided');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.logger.log('Supabase client initialized');
  }

  /**
   * Upload a single file to Supabase Storage
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'general',
    bucketName: string = this.bucketName
  ): Promise<string> {
    try {
      if (!file || !file.buffer) {
        throw new Error('Invalid file provided');
      }

      // Generate unique filename
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

      this.logger.log(`Uploading file: ${file.originalname} as ${fileName}`);

      // Upload file to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from(bucketName)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          duplex: 'half'
        });

      if (error) {
        this.logger.error('Supabase upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      this.logger.log(`File uploaded successfully: ${urlData.publicUrl}`);
      return urlData.publicUrl;

    } catch (error) {
      this.logger.error('Upload failed:', error);
      throw error;
    }
  }

  /**
   * Upload multiple files to Supabase Storage
   */
  async uploadFiles(
    files: Express.Multer.File[],
    folder: string = 'general',
    bucketName: string = this.bucketName
  ): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    this.logger.log(`Uploading ${files.length} files to folder: ${folder}`);

    const uploadPromises = files.map(file => 
      this.uploadFile(file, folder, bucketName)
    );

    return Promise.all(uploadPromises);
  }

  /**
   * Delete a file from Supabase Storage
   */
  async deleteFile(
    fileName: string,
    bucketName: string = this.bucketName
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase.storage
        .from(bucketName)
        .remove([fileName]);

      if (error) {
        this.logger.error('Delete error:', error);
        throw new Error(`Delete failed: ${error.message}`);
      }

      this.logger.log(`File deleted successfully: ${fileName}`);
      return true;
    } catch (error) {
      this.logger.error('Delete failed:', error);
      throw error;
    }
  }

  /**
   * Get a signed URL for private files (expires in 1 hour by default)
   */
  async getSignedUrl(
    fileName: string,
    expiresIn: number = 3600,
    bucketName: string = this.bucketName
  ): Promise<string> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucketName)
        .createSignedUrl(fileName, expiresIn);

      if (error) {
        this.logger.error('Signed URL error:', error);
        throw new Error(`Signed URL creation failed: ${error.message}`);
      }

      return data.signedUrl;
    } catch (error) {
      this.logger.error('Signed URL creation failed:', error);
      throw error;
    }
  }

  /**
   * List files in a folder
   */
  async listFiles(
    folder: string = '',
    bucketName: string = this.bucketName
  ): Promise<any[]> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucketName)
        .list(folder);

      if (error) {
        this.logger.error('List files error:', error);
        throw new Error(`List files failed: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      this.logger.error('List files failed:', error);
      throw error;
    }
  }

  /**
   * Create a new storage bucket
   */
  async createBucket(
    bucketName: string,
    isPublic: boolean = true
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase.storage
        .createBucket(bucketName, {
          public: isPublic,
          allowedMimeTypes: ['image/*', 'application/pdf', 'text/*'],
          fileSizeLimit: 10485760 // 10MB
        });

      if (error) {
        this.logger.error('Create bucket error:', error);
        throw new Error(`Create bucket failed: ${error.message}`);
      }

      this.logger.log(`Bucket created successfully: ${bucketName}`);
      return true;
    } catch (error) {
      this.logger.error('Create bucket failed:', error);
      throw error;
    }
  }

  /**
   * Get file info
   */
  async getFileInfo(
    fileName: string,
    bucketName: string = this.bucketName
  ): Promise<any> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucketName)
        .list('', {
          search: fileName
        });

      if (error) {
        this.logger.error('Get file info error:', error);
        throw new Error(`Get file info failed: ${error.message}`);
      }

      return data?.[0] || null;
    } catch (error) {
      this.logger.error('Get file info failed:', error);
      throw error;
    }
  }
}