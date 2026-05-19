const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'shruthi23ms@gmail.com',
    pass: 'otih zgqv jorw hybt',
  },
});

function emailHTML(name, empId, month, year) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <div style="background:#1d4ed8;padding:28px 30px">
        <h1 style="color:white;margin:0;font-size:22px;font-weight:800;letter-spacing:1px">DATACLAP DIGITAL</h1>
        <p style="color:#93c5fd;margin:6px 0 0;font-size:12px">Enterprise AI Data Services | www.dataclap.digital</p>
      </div>
      <div style="background:#eff6ff;padding:14px 30px;border-bottom:1px solid #dbeafe">
        <p style="margin:0;font-size:13px;font-weight:700;color:#1d4ed8">SALARY SLIP — ${month.toUpperCase()} ${year}</p>
      </div>
      <div style="padding:28px 30px;background:#ffffff">
        <p style="font-size:15px;color:#111827;margin:0 0 16px">Dear <strong>${name}</strong>,</p>
        <p style="color:#6b7280;margin:0 0 24px;line-height:1.6;font-size:14px">
          Your salary slip for <strong>${month} ${year}</strong> has been generated and is attached to this email as a PDF document.
        </p>
        <div style="background:#eff6ff;border:1px solid #dbeafe;border-radius:8px;padding:16px 20px;margin-bottom:24px">
          <p style="margin:0;color:#1d4ed8;font-size:13px;font-weight:700">Employee ID: ${empId}</p>
          <p style="margin:8px 0 0;color:#1d4ed8;font-size:14px;font-weight:700">📎 Please open the attached PDF to view your salary details.</p>
          <p style="margin:6px 0 0;color:#6b7280;font-size:12px">This document is confidential. Do not share with anyone.</p>
        </div>
        <p style="color:#9ca3af;font-size:12px;margin:0;line-height:1.6">
          For any discrepancies please contact HR within 7 days of receipt.
        </p>
      </div>
      <div style="background:#f9fafb;padding:20px 30px;border-top:1px solid #e5e7eb">
        <p style="color:#6b7280;font-size:13px;margin:0">
          Regards,<br>
          <strong style="color:#374151">Dataclap Digital Manager</strong>
        </p>
      </div>
      <div style="background:#1d4ed8;padding:14px 30px">
        <p style="color:#93c5fd;font-size:11px;margin:0">
          www.dataclap.digital | © 2026 Dataclap Digital. All rights reserved.
        </p>
      </div>
    </div>
  `;
}

app.post('/send-salary', async (req, res) => {
  const { to, name, pdfBase64, month, year, employee_id, id } = req.body;
  const empId = employee_id || `DC${String(id).padStart(3, '0')}`;
  try {
    await transporter.sendMail({
      from: '"Dataclap Digital Manager" <shruthi23ms@gmail.com>',
      to: to,
      subject: `Dataclap Digital — Salary Slip ${month} ${year}`,
      html: emailHTML(name, empId, month, year),
      attachments: [{
        filename: `${name.replace(/ /g, '_')}_Salary_Slip_${month}_${year}.pdf`,
        content: pdfBase64,
        encoding: 'base64',
      }],
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/send-all-salaries', async (req, res) => {
  const { employees, month, year } = req.body;
  const results = [];
  for (const emp of employees) {
    const empId = emp.employee_id || `DC${String(emp.id).padStart(3, '0')}`;
    try {
      await transporter.sendMail({
        from: '"Dataclap Digital Manager" <shruthi23ms@gmail.com>',
        to: emp.email,
        subject: `Dataclap Digital — Salary Slip ${month} ${year}`,
        html: emailHTML(emp.full_name, empId, month, year),
        attachments: [{
          filename: `${emp.full_name.replace(/ /g, '_')}_Salary_Slip_${month}_${year}.pdf`,
          content: emp.pdfBase64,
          encoding: 'base64',
        }],
      });
      results.push({ name: emp.full_name, status: 'sent' });
      console.log(`✅ Sent to ${emp.email}`);
    } catch (err) {
      results.push({ name: emp.full_name, status: 'failed', error: err.message });
      console.error(`❌ Failed for ${emp.email}:`, err.message);
    }
  }
  res.json({ results });
});

app.listen(3001, () => {
  console.log('✅ Email server running at http://localhost:3001');
});



// helloooo