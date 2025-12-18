import { Request, Response } from 'express';
import Document from '../models/Document';
import Booking from '../models/Booking';
import { createTimelineEntry } from '../utils/timelineHelper';
import { AuthRequest } from '../types';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';

// Extend AuthRequest to include file
interface DocumentRequest extends AuthRequest {
  file?: Express.Multer.File;
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req: any, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = 'uploads/documents';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req: any, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: FileFilterCallback) => {
  // Allow images and PDFs
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png) and documents (pdf, doc, docx) are allowed!'));
  }
};

export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

/**
 * Upload Document (Step 10 & 15: Collect Necessary Documents)
 */
export const uploadDocument = async (req: DocumentRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { bookingId, documentType, documentName, description, isPhysicalCopy, physicalCopyLocation } = req.body;
    const file = req.file;

    if (!file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    // Validate booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      // Delete uploaded file if booking doesn't exist
      fs.unlinkSync(file.path);
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    // Create file URL (adjust based on your deployment)
    const fileUrl = `/uploads/documents/${file.filename}`;
    // For production, you might want to use cloud storage URL
    // const fileUrl = `${process.env.CLOUD_STORAGE_URL}/${file.filename}`;

    // Create document record
    const document = await Document.create({
      bookingId: booking._id,
      orderId: booking.orderId,
      documentType,
      documentName: documentName || file.originalname,
      fileName: file.filename,
      fileUrl,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedBy: userId,
      description,
      isPhysicalCopy: isPhysicalCopy === 'true' || isPhysicalCopy === true,
      physicalCopyLocation
    });

    // Create timeline entry
    await createTimelineEntry({
      bookingId: String(booking._id),
      orderId: booking.orderId || undefined,
      action: 'Document Uploaded',
      description: `Document "${documentName || file.originalname}" (${documentType}) uploaded`,
      updatedBy: String(userId),
      updatedByRole: (req.user?.role as any) || 'admin',
      metadata: { documentId: String(document._id), documentType }
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });
  } catch (error: any) {
    console.error('Error uploading document:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message
    });
  }
};

/**
 * Get Documents by Booking ID
 */
export const getDocumentsByBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const documentType = req.query.documentType as string;

    const query: any = { bookingId };
    if (documentType) {
      query.documentType = documentType;
    }

    const documents = await Document.find(query)
      .populate('uploadedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: documents
    });
  } catch (error: any) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
};

/**
 * Get Document by ID
 */
export const getDocumentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { documentId } = req.params;

    const document = await Document.findById(documentId)
      .populate('uploadedBy', 'name email role')
      .populate('bookingId');

    if (!document) {
      res.status(404).json({
        success: false,
        message: 'Document not found'
      });
      return;
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error: any) {
    console.error('Error fetching document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document',
      error: error.message
    });
  }
};

/**
 * Delete Document
 */
export const deleteDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { documentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const document = await Document.findById(documentId);
    if (!document) {
      res.status(404).json({ success: false, message: 'Document not found' });
      return;
    }

    // Check permissions (admin or document uploader)
    if (req.user?.role !== 'admin' && String(document.uploadedBy) !== String(userId)) {
      res.status(403).json({ success: false, message: 'Not authorized to delete this document' });
      return;
    }

    // Delete file from filesystem
    try {
      const filePath = path.join('uploads/documents', document.fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fileError) {
      console.error('Error deleting file:', fileError);
      // Continue with document deletion even if file deletion fails
    }

    // Get booking for timeline
    const booking = await Booking.findById(document.bookingId);

    // Delete document record
    await Document.findByIdAndDelete(documentId);

    // Create timeline entry
    if (booking) {
      await createTimelineEntry({
        bookingId: String(booking._id),
        orderId: booking.orderId || undefined,
        action: 'Document Deleted',
        description: `Document "${document.documentName}" deleted`,
        updatedBy: String(userId),
        updatedByRole: (req.user?.role as any) || 'admin'
      });
    }

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    });
  }
};

/**
 * Serve Document File
 */
export const getDocumentFile = async (req: DocumentRequest, res: Response): Promise<void> => {
  try {
    const { documentId } = req.params;

    const document = await Document.findById(documentId);
    if (!document) {
      res.status(404).json({ success: false, message: 'Document not found' });
      return;
    }

    const filePath = path.join('uploads/documents', document.fileName);
    
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ success: false, message: 'Document file not found on server' });
      return;
    }

    // Send file
    res.sendFile(path.resolve(filePath));
  } catch (error: any) {
    console.error('Error serving document file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to serve document file',
      error: error.message
    });
  }
};

