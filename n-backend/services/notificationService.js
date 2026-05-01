const cron = require('node-cron');
const nodemailer = require('nodemailer');
const IssuedBook = require('../models/IssuedBook');
const User = require('../models/User');
const Book = require('../models/Book');

// Email Transporter (Placeholder - User should update with real SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  port: process.env.EMAIL_PORT || 587,
  auth: {
    user: process.env.EMAIL_USER || 'ethereal.user@example.com',
    pass: process.env.EMAIL_PASS || 'ethereal_password'
  }
});

const sendEmail = async (to, subject, text) => {
  try {
    if (!to) return;
    await transporter.sendMail({
      from: '"Library Pro" <noreply@librarypro.com>',
      to,
      subject,
      text
    });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error(`Failed to send email to ${to}:`, err.message);
  }
};

const runNotificationCheck = async () => {
  console.log('Running daily notification check...');
  const today = new Date();
  
  // 1. Due Date Reminders (2 days before)
  const twoDaysFromNow = new Date();
  twoDaysFromNow.setDate(today.getDate() + 2);
  const twoDaysStart = new Date(twoDaysFromNow.setHours(0,0,0,0));
  const twoDaysEnd   = new Date(twoDaysFromNow.setHours(23,59,59,999));

  const reminders = await IssuedBook.find({
    status: 'issued',
    due_date: { $gte: twoDaysStart, $lte: twoDaysEnd }
  }).populate('student_id').populate('book_id');

  for (const record of reminders) {
    const email = record.student_id?.email;
    if (email) {
      const subject = "Library Reminder: Book Due in 2 Days";
      const text = `Hello ${record.student_id.name},\n\nThis is a reminder that the book "${record.book_id.title}" is due on ${record.due_date.toLocaleDateString()}. Please return it on time to avoid fines.\n\nThank you,\nLibrary Pro Team`;
      await sendEmail(email, subject, text);
    }
  }

  // 2. Overdue/Fine Alerts
  const Settings = require('../models/Settings');
  const settings = await Settings.findOne() || { fineRate: 5 };
  
  const overdue = await IssuedBook.find({
    status: 'issued',
    due_date: { $lt: today }
  }).populate('student_id').populate('book_id');

  for (const record of overdue) {
    const email = record.student_id?.email;
    if (email) {
      const daysOverdue = Math.max(0, Math.ceil((today - new Date(record.due_date)) / (1000 * 60 * 60 * 24)));
      const fine = daysOverdue * settings.fineRate;
      
      const subject = "URGENT: Overdue Book Alert & Fine Notice";
      const text = `Hello ${record.student_id.name},\n\nThe book "${record.book_id.title}" was due on ${record.due_date.toLocaleDateString()} and is now ${daysOverdue} days overdue. 
      
An outstanding fine of ${fine} ETB has been applied to your account. Please return the book immediately to stop further charges.\n\nThank you,\nLibrary Pro Team`;
      await sendEmail(email, subject, text);
    }
  }
};

// Schedule: Run every day at 8:00 AM
cron.schedule('0 8 * * *', () => {
  runNotificationCheck();
});

module.exports = { runNotificationCheck, sendEmail };
