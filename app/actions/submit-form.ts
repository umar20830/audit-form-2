'use server'

import nodemailer from 'nodemailer'
import { z } from 'zod'

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  countryCode: z.string(),
  website: z.string().url('Invalid website URL').or(z.literal('')).optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export type FormData = z.infer<typeof formSchema>

export async function submitForm(formData: FormData) {
  try {
    const validatedData = formSchema.parse(formData)

    console.log(process.env.SMTP_HOST);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    const mailOptions = {
      from: `"${validatedData.name}" <${process.env.SMTP_FROM}>`,
      to: process.env.SMTP_TO,
      replyTo: validatedData.email,
      subject: 'New SEO Audit Form Submission',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9f9;
              }
              .header {
                background-color: #4a5568;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 5px 5px 0 0;
              }
              .content {
                background-color: white;
                padding: 30px;
                border-radius: 0 0 5px 5px;
              }
              .field {
                margin-bottom: 20px;
              }
              .label {
                font-weight: bold;
                color: #4a5568;
                display: block;
                margin-bottom: 5px;
              }
              .value {
                color: #2d3748;
                padding: 10px;
                background-color: #edf2f7;
                border-radius: 4px;
                word-break: break-word;
              }
              .footer {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
                font-size: 12px;
                color: #718096;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>New SEO Audit Request</h1>
              </div>
              <div class="content">
                <div class="field">
                  <span class="label">Name:</span>
                  <div class="value">${validatedData.name}</div>
                </div>

                <div class="field">
                  <span class="label">Email:</span>
                  <div class="value"><a href="mailto:${validatedData.email}">${validatedData.email}</a></div>
                </div>

                <div class="field">
                  <span class="label">Phone Number:</span>
                  <div class="value">${validatedData.countryCode} ${validatedData.phone}</div>
                </div>

                ${validatedData.website ? `
                <div class="field">
                  <span class="label">Website URL:</span>
                  <div class="value"><a href="${validatedData.website}" target="_blank">${validatedData.website}</a></div>
                </div>
                ` : ''}

                <div class="field">
                  <span class="label">Message:</span>
                  <div class="value">${validatedData.message.replace(/\n/g, '<br>')}</div>
                </div>
              </div>
              <div class="footer">
                <p>This email was sent from your SEO Audit Form</p>
                <p>Submitted on ${new Date().toLocaleString()}</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
New SEO Audit Request

Name: ${validatedData.name}
Email: ${validatedData.email}
Phone: ${validatedData.countryCode} ${validatedData.phone}
${validatedData.website ? `Website: ${validatedData.website}` : ''}
Message: ${validatedData.message}

Submitted on ${new Date().toLocaleString()}
      `,
    }

    await transporter.sendMail(mailOptions)

    return {
      success: true,
      message: 'Form submitted successfully! You will receive the audit report within 1-7 days.',
    }
  } catch (error) {
    console.error('Form submission error:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Validation error',
        errors: error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      }
    }

    return {
      success: false,
      message: 'Failed to submit form. Please try again later.',
    }
  }
}
