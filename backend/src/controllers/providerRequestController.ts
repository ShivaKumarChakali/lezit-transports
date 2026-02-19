import { Request, Response } from 'express';
import ProviderRequest from '../models/ProviderRequest';
import { sendSupportRequest, sendContactForm } from '../utils/emailService';

// Create a new provider request
export const createProviderRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;

    const pr = await ProviderRequest.create(data);

    // Send notification email to support/admin
    try {
      const message = `New ${pr.requestType} request:\n${JSON.stringify({
        fullName: pr.fullName,
        email: pr.email,
        mobile: pr.mobile,
        businessName: pr.businessName,
        transportType: pr.transportType,
        hasLicence: pr.hasLicence,
        drivingFor: pr.drivingFor
      }, null, 2)}`;

      await sendContactForm({ name: pr.fullName, email: pr.email, phone: pr.mobile, subject: `New ${pr.requestType} request`, message });
    } catch (e) {
      console.warn('Failed to send provider request email:', (e as any).message || e);
    }

    res.status(201).json({ success: true, data: pr });
  } catch (error: any) {
    console.error('Error creating provider request:', error);
    res.status(500).json({ success: false, message: 'Failed to create provider request' });
  }
};

// List provider requests (admin access)
export const listProviderRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const requests = await ProviderRequest.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, data: requests });
  } catch (error: any) {
    console.error('Error listing provider requests:', error);
    res.status(500).json({ success: false, message: 'Failed to list provider requests' });
  }
};
