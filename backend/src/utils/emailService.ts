import nodemailer from 'nodemailer';

// Email configurations
const bookingEmailConfig = {
  host: process.env.SMTP_HOST || 'smtppro.zoho.in',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER_BOOKING || 'bookings@lezittransports.com',
    pass: process.env.SMTP_PASS_BOOKING || ''
  }
};

const supportEmailConfig = {
  host: process.env.SMTP_HOST || 'smtppro.zoho.in',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER_SUPPORT || 'support@lezittransports.com',
    pass: process.env.SMTP_PASS_SUPPORT || ''
  }
};

// Create transporters
const bookingTransporter = nodemailer.createTransport(bookingEmailConfig);
const supportTransporter = nodemailer.createTransport(supportEmailConfig);

// Verify email configurations
const verifyEmailConfigs = async () => {
  // Only verify if credentials are provided
  const hasBookingCredentials = process.env.SMTP_USER_BOOKING && process.env.SMTP_PASS_BOOKING;
  const hasSupportCredentials = process.env.SMTP_USER_SUPPORT && process.env.SMTP_PASS_SUPPORT;

  if (hasBookingCredentials) {
    try {
      await bookingTransporter.verify();
      console.log('✅ Booking email configuration verified');
    } catch (error: any) {
      console.warn('⚠️  Booking email configuration failed:', error.code === 'EAUTH' ? 'Authentication failed - check SMTP credentials' : error.message);
      if (process.env.NODE_ENV === 'development') {
        console.warn('   Email functionality will be disabled until credentials are configured correctly.');
      }
    }
  } else {
    console.warn('⚠️  Booking email credentials not configured. Set SMTP_USER_BOOKING and SMTP_PASS_BOOKING in .env');
  }

  if (hasSupportCredentials) {
    try {
      await supportTransporter.verify();
      console.log('✅ Support email configuration verified');
    } catch (error: any) {
      console.warn('⚠️  Support email configuration failed:', error.code === 'EAUTH' ? 'Authentication failed - check SMTP credentials' : error.message);
      if (process.env.NODE_ENV === 'development') {
        console.warn('   Email functionality will be disabled until credentials are configured correctly.');
      }
    }
  } else {
    console.warn('⚠️  Support email credentials not configured. Set SMTP_USER_SUPPORT and SMTP_PASS_SUPPORT in .env');
  }
};

// Email templates
const emailTemplates = {
  bookingConfirmation: (bookingData: any) => ({
    subject: `Booking Confirmation - ${bookingData.serviceType} Transportation`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
          <h1>LEZIT TRANSPORTS</h1>
          <h2>Booking Confirmation</h2>
        </div>
        
        <div style="padding: 20px; background: #f8f9fa;">
          <h3>Dear ${bookingData.userName},</h3>
          <p>Your transportation booking has been confirmed successfully!</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>Booking Details:</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Booking ID:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${bookingData.bookingId}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Service:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${bookingData.serviceType} - ${bookingData.serviceCategory}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Pickup Location:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${bookingData.pickupLocation}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Drop Location:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${bookingData.dropLocation}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Date & Time:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${bookingData.pickupDate} at ${bookingData.pickupTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Vehicle Type:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${bookingData.vehicleType}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Total Amount:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">₹${bookingData.totalAmount}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>Important Information:</h4>
            <ul>
              <li>Please be ready 10 minutes before the scheduled pickup time</li>
              <li>Our driver will contact you 30 minutes before pickup</li>
              <li>Payment can be made in cash or online as per your preference</li>
              <li>For any changes, please contact us at least 2 hours before pickup</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <p>Thank you for choosing LEZIT TRANSPORTS!</p>
            <p>For support, contact us at: <a href="mailto:support@lezittransports.com">support@lezittransports.com</a></p>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>© 2024 LEZIT TRANSPORTS. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  bookingCancellation: (bookingData: any) => ({
    subject: `Booking Cancelled - ${bookingData.serviceType} Transportation`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc3545; color: white; padding: 20px; text-align: center;">
          <h1>LEZIT TRANSPORTS</h1>
          <h2>Booking Cancelled</h2>
        </div>
        
        <div style="padding: 20px; background: #f8f9fa;">
          <h3>Dear ${bookingData.userName},</h3>
          <p>Your transportation booking has been cancelled as requested.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>Cancelled Booking Details:</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Booking ID:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${bookingData.bookingId}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Service:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${bookingData.serviceType} - ${bookingData.serviceCategory}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Cancellation Date:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date().toLocaleDateString()}</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <p>We hope to serve you again soon!</p>
            <p>For any questions, contact us at: <a href="mailto:support@lezittransports.com">support@lezittransports.com</a></p>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>© 2024 LEZIT TRANSPORTS. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  contactForm: (contactData: any) => ({
    subject: `New Contact Form Submission - ${contactData.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
          <h1>LEZIT TRANSPORTS</h1>
          <h2>New Contact Form Submission</h2>
        </div>
        
        <div style="padding: 20px; background: #f8f9fa;">
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>Contact Details:</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Name:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${contactData.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${contactData.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${contactData.phone}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Subject:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${contactData.subject}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Message:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${contactData.message}</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <p>Please respond to this inquiry as soon as possible.</p>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>© 2024 LEZIT TRANSPORTS. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  quotation: (quotationData: any) => ({
    subject: `Quotation for Order ${quotationData.orderId || quotationData.bookingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
          <h1>LEZIT TRANSPORTS</h1>
          <h2>Quotation - ${quotationData.quotationNumber}</h2>
        </div>
        
        <div style="padding: 20px; background: #f8f9fa;">
          <h3>Dear ${quotationData.customerName},</h3>
          <p>Thank you for your interest in our services. Please find below the quotation for your booking request.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>Quotation Details:</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Quotation Number:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${quotationData.quotationNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Order ID:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${quotationData.orderId || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Valid Until:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date(quotationData.validUntil).toLocaleDateString()}</td>
              </tr>
            </table>
          </div>

          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>Items:</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f5f5f5;">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Description</th>
                  ${quotationData.items.some((item: any) => item.quantity) ? '<th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Quantity</th>' : ''}
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${quotationData.items.map((item: any) => `
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.description}</td>
                    ${item.quantity ? `<td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">${item.quantity}</td>` : ''}
                    <td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">₹${item.total.toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="${quotationData.items.some((item: any) => item.quantity) ? '2' : '1'}" style="padding: 10px; text-align: right; border-top: 2px solid #ddd;"><strong>Subtotal:</strong></td>
                  <td style="padding: 10px; text-align: right; border-top: 2px solid #ddd;"><strong>₹${quotationData.subtotal.toLocaleString()}</strong></td>
                </tr>
                ${quotationData.taxes > 0 ? `
                  <tr>
                    <td colspan="${quotationData.items.some((item: any) => item.quantity) ? '2' : '1'}" style="padding: 10px; text-align: right;"><strong>Taxes:</strong></td>
                    <td style="padding: 10px; text-align: right;"><strong>₹${quotationData.taxes.toLocaleString()}</strong></td>
                  </tr>
                ` : ''}
                ${quotationData.discount > 0 ? `
                  <tr>
                    <td colspan="${quotationData.items.some((item: any) => item.quantity) ? '2' : '1'}" style="padding: 10px; text-align: right;"><strong>Discount:</strong></td>
                    <td style="padding: 10px; text-align: right;"><strong>-₹${quotationData.discount.toLocaleString()}</strong></td>
                  </tr>
                ` : ''}
                <tr style="background: #e3f2fd;">
                  <td colspan="${quotationData.items.some((item: any) => item.quantity) ? '2' : '1'}" style="padding: 15px; text-align: right; font-size: 18px;"><strong>Total Amount:</strong></td>
                  <td style="padding: 15px; text-align: right; font-size: 18px;"><strong>₹${quotationData.totalAmount.toLocaleString()}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>

          ${quotationData.termsAndConditions ? `
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4>Terms & Conditions:</h4>
              <p style="white-space: pre-wrap;">${quotationData.termsAndConditions}</p>
            </div>
          ` : ''}
          
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p><strong>Please review this quotation and confirm if you wish to proceed.</strong></p>
            <p>This quotation is valid until ${new Date(quotationData.validUntil).toLocaleDateString()}</p>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <p>For any questions, contact us at: <a href="mailto:support@lezittransports.com">support@lezittransports.com</a></p>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>© 2024 LEZIT TRANSPORTS. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  invoice: (invoiceData: any) => ({
    subject: `Invoice ${invoiceData.invoiceNumber} - LEZIT Transports`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
          <h1>LEZIT TRANSPORTS</h1>
          <h2>Invoice - ${invoiceData.invoiceNumber}</h2>
        </div>
        
        <div style="padding: 20px; background: #f8f9fa;">
          <h3>Dear ${invoiceData.customerName},</h3>
          <p>Please find below the invoice for your booking.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>Invoice Details:</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Invoice Number:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${invoiceData.invoiceNumber}</td>
              </tr>
              ${invoiceData.orderId ? `
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Order ID:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">${invoiceData.orderId}</td>
                </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Due Date:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date(invoiceData.dueDate).toLocaleDateString()}</td>
              </tr>
            </table>
          </div>

          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>Items:</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f5f5f5;">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Description</th>
                  ${invoiceData.items.some((item: any) => item.quantity) ? '<th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Quantity</th>' : ''}
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${invoiceData.items.map((item: any) => `
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.description}</td>
                    ${item.quantity ? `<td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">${item.quantity}</td>` : ''}
                    <td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">₹${item.total.toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="${invoiceData.items.some((item: any) => item.quantity) ? '2' : '1'}" style="padding: 10px; text-align: right; border-top: 2px solid #ddd;"><strong>Subtotal:</strong></td>
                  <td style="padding: 10px; text-align: right; border-top: 2px solid #ddd;"><strong>₹${invoiceData.subtotal.toLocaleString()}</strong></td>
                </tr>
                ${invoiceData.taxes > 0 ? `
                  <tr>
                    <td colspan="${invoiceData.items.some((item: any) => item.quantity) ? '2' : '1'}" style="padding: 10px; text-align: right;"><strong>Taxes:</strong></td>
                    <td style="padding: 10px; text-align: right;"><strong>₹${invoiceData.taxes.toLocaleString()}</strong></td>
                  </tr>
                ` : ''}
                ${invoiceData.discount > 0 ? `
                  <tr>
                    <td colspan="${invoiceData.items.some((item: any) => item.quantity) ? '2' : '1'}" style="padding: 10px; text-align: right;"><strong>Discount:</strong></td>
                    <td style="padding: 10px; text-align: right;"><strong>-₹${invoiceData.discount.toLocaleString()}</strong></td>
                  </tr>
                ` : ''}
                <tr style="background: #e3f2fd;">
                  <td colspan="${invoiceData.items.some((item: any) => item.quantity) ? '2' : '1'}" style="padding: 15px; text-align: right; font-size: 18px;"><strong>Total Amount:</strong></td>
                  <td style="padding: 15px; text-align: right; font-size: 18px;"><strong>₹${invoiceData.totalAmount.toLocaleString()}</strong></td>
                </tr>
                <tr>
                  <td colspan="${invoiceData.items.some((item: any) => item.quantity) ? '2' : '1'}" style="padding: 10px; text-align: right;"><strong>Advance Paid:</strong></td>
                  <td style="padding: 10px; text-align: right;"><strong>₹${invoiceData.advancePaid.toLocaleString()}</strong></td>
                </tr>
                <tr style="background: #fff3cd;">
                  <td colspan="${invoiceData.items.some((item: any) => item.quantity) ? '2' : '1'}" style="padding: 15px; text-align: right; font-size: 16px;"><strong>Balance Due:</strong></td>
                  <td style="padding: 15px; text-align: right; font-size: 16px;"><strong>₹${invoiceData.balanceDue.toLocaleString()}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p><strong>Please make payment before the due date: ${new Date(invoiceData.dueDate).toLocaleDateString()}</strong></p>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <p>For payment inquiries, contact us at: <a href="mailto:support@lezittransports.com">support@lezittransports.com</a></p>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>© 2024 LEZIT TRANSPORTS. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  bill: (billData: any) => ({
    subject: `Bill ${billData.billNumber} - LEZIT Transports`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
          <h1>LEZIT TRANSPORTS</h1>
          <h2>Bill - ${billData.billNumber}</h2>
        </div>
        
        <div style="padding: 20px; background: #f8f9fa;">
          <h3>Dear ${billData.providerName},</h3>
          <p>Please find below the bill for services provided.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>Bill Details:</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Bill Number:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${billData.billNumber}</td>
              </tr>
              ${billData.orderId ? `
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Order ID:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">${billData.orderId}</td>
                </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Due Date:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date(billData.dueDate).toLocaleDateString()}</td>
              </tr>
            </table>
          </div>

          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>Items:</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f5f5f5;">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Description</th>
                  ${billData.items.some((item: any) => item.quantity) ? '<th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Quantity</th>' : ''}
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${billData.items.map((item: any) => `
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.description}</td>
                    ${item.quantity ? `<td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">${item.quantity}</td>` : ''}
                    <td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">₹${item.total.toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="${billData.items.some((item: any) => item.quantity) ? '2' : '1'}" style="padding: 10px; text-align: right; border-top: 2px solid #ddd;"><strong>Subtotal:</strong></td>
                  <td style="padding: 10px; text-align: right; border-top: 2px solid #ddd;"><strong>₹${billData.subtotal.toLocaleString()}</strong></td>
                </tr>
                ${billData.taxes > 0 ? `
                  <tr>
                    <td colspan="${billData.items.some((item: any) => item.quantity) ? '2' : '1'}" style="padding: 10px; text-align: right;"><strong>Taxes:</strong></td>
                    <td style="padding: 10px; text-align: right;"><strong>₹${billData.taxes.toLocaleString()}</strong></td>
                  </tr>
                ` : ''}
                <tr style="background: #e3f2fd;">
                  <td colspan="${billData.items.some((item: any) => item.quantity) ? '2' : '1'}" style="padding: 15px; text-align: right; font-size: 18px;"><strong>Total Amount:</strong></td>
                  <td style="padding: 15px; text-align: right; font-size: 18px;"><strong>₹${billData.totalAmount.toLocaleString()}</strong></td>
                </tr>
                <tr>
                  <td colspan="${billData.items.some((item: any) => item.quantity) ? '2' : '1'}" style="padding: 10px; text-align: right;"><strong>Advance Paid:</strong></td>
                  <td style="padding: 10px; text-align: right;"><strong>₹${billData.advancePaid.toLocaleString()}</strong></td>
                </tr>
                <tr style="background: #fff3cd;">
                  <td colspan="${billData.items.some((item: any) => item.quantity) ? '2' : '1'}" style="padding: 15px; text-align: right; font-size: 16px;"><strong>Balance Due:</strong></td>
                  <td style="padding: 15px; text-align: right; font-size: 16px;"><strong>₹${billData.balanceDue.toLocaleString()}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p><strong>Payment will be processed as per our agreement. Due date: ${new Date(billData.dueDate).toLocaleDateString()}</strong></p>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <p>For payment inquiries, contact us at: <a href="mailto:support@lezittransports.com">support@lezittransports.com</a></p>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>© 2024 LEZIT TRANSPORTS. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  supportRequest: (supportData: any) => ({
    subject: `Support Request - ${supportData.category}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #ffc107; color: white; padding: 20px; text-align: center;">
          <h1>LEZIT TRANSPORTS</h1>
          <h2>Support Request</h2>
        </div>
        
        <div style="padding: 20px; background: #f8f9fa;">
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>Support Request Details:</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>User:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${supportData.userName} (${supportData.userEmail})</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Category:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${supportData.category}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Priority:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${supportData.priority}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Subject:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${supportData.subject}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Description:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${supportData.description}</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <p>Please address this support request promptly.</p>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>© 2024 LEZIT TRANSPORTS. All rights reserved.</p>
        </div>
      </div>
    `
  })
};

// Email service functions
export const sendBookingConfirmation = async (bookingData: any, userEmail: string) => {
  try {
    // Check if email is configured
    if (!process.env.SMTP_USER_BOOKING || !process.env.SMTP_PASS_BOOKING) {
      console.warn('⚠️  Email not configured - skipping booking confirmation email');
      return { success: false, error: 'Email service not configured' };
    }

    const template = emailTemplates.bookingConfirmation(bookingData);
    
    const mailOptions = {
      from: process.env.SMTP_USER_BOOKING || 'bookings@lezittransports.com',
      to: userEmail,
      subject: template.subject,
      html: template.html
    };

    const result = await bookingTransporter.sendMail(mailOptions);
    console.log('✅ Booking confirmation email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    // Log error but don't throw - email failures shouldn't break the flow
    if (error.code === 'EAUTH') {
      console.warn('⚠️  Email authentication failed - check SMTP credentials in .env');
    } else {
      console.error('❌ Failed to send booking confirmation email:', error.message);
    }
    return { success: false, error: error.message };
  }
};

export const sendBookingCancellation = async (bookingData: any, userEmail: string) => {
  try {
    // Check if email is configured
    if (!process.env.SMTP_USER_BOOKING || !process.env.SMTP_PASS_BOOKING) {
      console.warn('⚠️  Email not configured - skipping booking cancellation email');
      return { success: false, error: 'Email service not configured' };
    }

    const template = emailTemplates.bookingCancellation(bookingData);
    
    const mailOptions = {
      from: process.env.SMTP_USER_BOOKING || 'bookings@lezittransports.com',
      to: userEmail,
      subject: template.subject,
      html: template.html
    };

    const result = await bookingTransporter.sendMail(mailOptions);
    console.log('✅ Booking cancellation email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    if (error.code === 'EAUTH') {
      console.warn('⚠️  Email authentication failed - check SMTP credentials in .env');
    } else {
      console.error('❌ Failed to send booking cancellation email:', error.message);
    }
    return { success: false, error: error.message };
  }
};

export const sendContactForm = async (contactData: any) => {
  try {
    // Check if email is configured
    if (!process.env.SMTP_USER_SUPPORT || !process.env.SMTP_PASS_SUPPORT) {
      console.warn('⚠️  Email not configured - skipping contact form email');
      return { success: false, error: 'Email service not configured' };
    }

    const template = emailTemplates.contactForm(contactData);
    
    const mailOptions = {
      from: process.env.SMTP_USER_SUPPORT || 'support@lezittransports.com',
      to: process.env.SMTP_USER_SUPPORT || 'support@lezittransports.com',
      subject: template.subject,
      html: template.html
    };

    const result = await supportTransporter.sendMail(mailOptions);
    console.log('✅ Contact form email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    if (error.code === 'EAUTH') {
      console.warn('⚠️  Email authentication failed - check SMTP credentials in .env');
    } else {
      console.error('❌ Failed to send contact form email:', error.message);
    }
    return { success: false, error: error.message };
  }
};

export const sendQuotationEmail = async (quotationData: any, userEmail: string) => {
  try {
    // Check if email is configured
    if (!process.env.SMTP_USER_BOOKING || !process.env.SMTP_PASS_BOOKING) {
      console.warn('⚠️  Email not configured - skipping quotation email');
      return { success: false, error: 'Email service not configured' };
    }

    const template = emailTemplates.quotation(quotationData);
    
    const mailOptions = {
      from: process.env.SMTP_USER_BOOKING || 'bookings@lezittransports.com',
      to: userEmail,
      subject: template.subject,
      html: template.html
    };

    const result = await bookingTransporter.sendMail(mailOptions);
    console.log('✅ Quotation email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    if (error.code === 'EAUTH') {
      console.warn('⚠️  Email authentication failed - check SMTP credentials in .env');
    } else {
      console.error('❌ Failed to send quotation email:', error.message);
    }
    return { success: false, error: error.message };
  }
};

export const sendInvoiceEmail = async (invoiceData: any, userEmail: string) => {
  try {
    // Check if email is configured
    if (!process.env.SMTP_USER_BOOKING || !process.env.SMTP_PASS_BOOKING) {
      console.warn('⚠️  Email not configured - skipping invoice email');
      return { success: false, error: 'Email service not configured' };
    }

    const template = emailTemplates.invoice(invoiceData);
    
    const mailOptions = {
      from: process.env.SMTP_USER_BOOKING || 'bookings@lezittransports.com',
      to: userEmail,
      subject: template.subject,
      html: template.html
    };

    const result = await bookingTransporter.sendMail(mailOptions);
    console.log('✅ Invoice email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    if (error.code === 'EAUTH') {
      console.warn('⚠️  Email authentication failed - check SMTP credentials in .env');
    } else {
      console.error('❌ Failed to send invoice email:', error.message);
    }
    return { success: false, error: error.message };
  }
};

export const sendBillEmail = async (billData: any, providerEmail: string) => {
  try {
    // Check if email is configured
    if (!process.env.SMTP_USER_BOOKING || !process.env.SMTP_PASS_BOOKING) {
      console.warn('⚠️  Email not configured - skipping bill email');
      return { success: false, error: 'Email service not configured' };
    }

    const template = emailTemplates.bill(billData);
    
    const mailOptions = {
      from: process.env.SMTP_USER_BOOKING || 'bookings@lezittransports.com',
      to: providerEmail,
      subject: template.subject,
      html: template.html
    };

    const result = await bookingTransporter.sendMail(mailOptions);
    console.log('✅ Bill email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    if (error.code === 'EAUTH') {
      console.warn('⚠️  Email authentication failed - check SMTP credentials in .env');
    } else {
      console.error('❌ Failed to send bill email:', error.message);
    }
    return { success: false, error: error.message };
  }
};

export const sendSupportRequest = async (supportData: any) => {
  try {
    // Check if email is configured
    if (!process.env.SMTP_USER_SUPPORT || !process.env.SMTP_PASS_SUPPORT) {
      console.warn('⚠️  Email not configured - skipping support request email');
      return { success: false, error: 'Email service not configured' };
    }

    const template = emailTemplates.supportRequest(supportData);
    
    const mailOptions = {
      from: process.env.SMTP_USER_SUPPORT || 'support@lezittransports.com',
      to: process.env.SMTP_USER_SUPPORT || 'support@lezittransports.com',
      subject: template.subject,
      html: template.html
    };

    const result = await supportTransporter.sendMail(mailOptions);
    console.log('✅ Support request email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    if (error.code === 'EAUTH') {
      console.warn('⚠️  Email authentication failed - check SMTP credentials in .env');
    } else {
      console.error('❌ Failed to send support request email:', error.message);
    }
    return { success: false, error: error.message };
  }
};

// Initialize email verification
verifyEmailConfigs();

export default {
  sendBookingConfirmation,
  sendBookingCancellation,
  sendQuotationEmail,
  sendInvoiceEmail,
  sendBillEmail,
  sendContactForm,
  sendSupportRequest
}; 