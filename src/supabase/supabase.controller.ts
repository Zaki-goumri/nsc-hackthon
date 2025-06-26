import {
  Controller,
  Post,
  Get,
  Delete,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  HttpException,
  HttpStatus,
  Logger,
  Body,
  Param,
  Query
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { SupabaseService } from './supabase.service';

@Controller('storage')
export class SupabaseController {
  private readonly logger = new Logger('file storage');

  constructor(private readonly storageService: SupabaseService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, callback) => {
      // Allow images, PDFs, and text files
      const allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
        'text/csv'
      ];
      
      if (!allowedMimes.includes(file.mimetype)) {
        return callback(new Error('File type not allowed'), false);
      }
      callback(null, true);
    },
  }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
    @Body('bucket') bucket?: string
  ) {
    try {
      if (!file) {
        throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
      }

      this.logger.log(`Received file upload: ${file.originalname}`);

      const url = await this.storageService.uploadFile(
        file,
        folder || 'general',
        bucket
      );

      return {
        success: true,
        url,
        fileName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        message: 'File uploaded successfully'
      };
    } catch (error) {
      this.logger.error('Upload failed:', error);
      throw new HttpException(
        error.message || 'Upload failed',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 10, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB per file
    },
    fileFilter: (req, file, callback) => {
      const allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
        'text/csv'
      ];
      
      if (!allowedMimes.includes(file.mimetype)) {
        return callback(new Error('File type not allowed'), false);
      }
      callback(null, true);
    },
  }))
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('folder') folder?: string,
    @Body('bucket') bucket?: string
  ) {
    try {
      if (!files || files.length === 0) {
        throw new HttpException('No files uploaded', HttpStatus.BAD_REQUEST);
      }

      this.logger.log(`Received multiple file upload: ${files.length} files`);

      const urls = await this.storageService.uploadFiles(
        files,
        folder || 'general',
        bucket
      );

      return {
        success: true,
        urls,
        count: urls.length,
        files: files.map(f => ({
          name: f.originalname,
          size: f.size,
          mimeType: f.mimetype
        })),
        message: 'Files uploaded successfully'
      };
    } catch (error) {
      this.logger.error('Multiple upload failed:', error);
      throw new HttpException(
        error.message || 'Upload failed',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete('file/:fileName')
  async deleteFile(
    @Param('fileName') fileName: string,
    @Query('bucket') bucket?: string
  ) {
    try {
      const success = await this.storageService.deleteFile(fileName, bucket);
      
      return {
        success,
        message: 'File deleted successfully'
      };
    } catch (error) {
      this.logger.error('Delete failed:', error);
      throw new HttpException(
        error.message || 'Delete failed',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('signed-url/:fileName')
  async getSignedUrl(
    @Param('fileName') fileName: string,
    @Query('expiresIn') expiresIn?: string,
    @Query('bucket') bucket?: string
  ) {
    try {
      const expires = expiresIn ? parseInt(expiresIn) : 3600;
      const signedUrl = await this.storageService.getSignedUrl(
        fileName,
        expires,
        bucket
      );
      
      return {
        success: true,
        signedUrl,
        expiresIn: expires,
        message: 'Signed URL generated successfully'
      };
    } catch (error) {
      this.logger.error('Signed URL generation failed:', error);
      throw new HttpException(
        error.message || 'Signed URL generation failed',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('files')
  async listFiles(
    @Query('folder') folder?: string,
    @Query('bucket') bucket?: string
  ) {
    try {
      const files = await this.storageService.listFiles(folder || '', bucket);
      
      return {
        success: true,
        files,
        count: files.length,
        message: 'Files retrieved successfully'
      };
    } catch (error) {
      this.logger.error('List files failed:', error);
      throw new HttpException(
        error.message || 'List files failed',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('bucket')
  async createBucket(
    @Body('name') name: string,
    @Body('isPublic') isPublic: boolean = true
  ) {
    try {
      if (!name) {
        throw new HttpException('Bucket name is required', HttpStatus.BAD_REQUEST);
      }

      const success = await this.storageService.createBucket(name, isPublic);
      
      return {
        success,
        bucketName: name,
        isPublic,
        message: 'Bucket created successfully'
      };
    } catch (error) {
      this.logger.error('Create bucket failed:', error);
      throw new HttpException(
        error.message || 'Create bucket failed',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('file-info/:fileName')
  async getFileInfo(
    @Param('fileName') fileName: string,
    @Query('bucket') bucket?: string
  ) {
    try {
      const fileInfo = await this.storageService.getFileInfo(fileName, bucket);
      
      return {
        success: true,
        fileInfo,
        message: 'File info retrieved successfully'
      };
    } catch (error) {
      this.logger.error('Get file info failed:', error);
      throw new HttpException(
        error.message || 'Get file info failed',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}