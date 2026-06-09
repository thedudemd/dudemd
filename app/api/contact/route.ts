import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json()
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email and message are required' }, { status: 400 })
    }

    await resend.emails.send({
      from: 'DudeMD Contact <noreply@dudemd.com>',
      to: 'emaildudemd@gmail.com',
      replyTo: email,
      subject: subject ? `Contact Form: ${subject}` : `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 2rem; background: #f7f4ee;">
          <img src="https://bicljoujevywrkzjeaoy.supabase.co/storage/v1/object/public/media/article-images/1780803524618-pt9sjxvtbh.png" alt="DudeMD" style="height: 60px; margin-bottom: 1.5rem;" />
          <h2 style="color: #0e1a2b; font-size: 1.5rem; margin-bottom: 1.5rem;">New Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 1.5rem;">
            <tr><td style="padding: 0.75rem; background: #fff; border: 1px solid #e8e4de; font-weight: 700; width: 120px; color: #0e1a2b;">Name</td><td style="padding: 0.75rem; background: #fff; border: 1px solid #e8e4de; color: #4A5563;">${name}</td></tr>
            <tr><td style="padding: 0.75rem; background: #fff; border: 1px solid #e8e4de; font-weight: 700; color: #0e1a2b;">Email</td><td style="padding: 0.75rem; background: #fff; border: 1px solid #e8e4de; color: #4A5563;"><a href="mailto:${email}" style="color: #c9b28f;">${email}</a></td></tr>
            ${subject ? `<tr><td style="padding: 0.75rem; background: #fff; border: 1px solid #e8e4de; font-weight: 700; color: #0e1a2b;">Subject</td><td style="padding: 0.75rem; background: #fff; border: 1px solid #e8e4de; color: #4A5563;">${subject}</td></tr>` : ''}
          </table>
          <div style="background: #fff; border: 1px solid #e8e4de; padding: 1.25rem; margin-bottom: 1.5rem;">
            <p style="font-weight: 700; color: #0e1a2b; margin: 0 0 0.75rem;">Message</p>
            <p style="color: #4A5563; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="font-size: 12px; color: #9a9085;">Sent from dudemd.com/contact · Reply directly to this email to respond to ${name}</p>
        </div>
      `
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
