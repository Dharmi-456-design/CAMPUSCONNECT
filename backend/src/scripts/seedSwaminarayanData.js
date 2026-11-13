const mongoose = require('mongoose');
const env = require('../config/env');
const EventNotice = require('../models/EventNotice');

async function seedData() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await EventNotice.deleteMany({ university: 'Swaminarayan University' });

    const items = [
      // 1. Ganesh Mahotsav 10-Day Grand Festival Schedule
      {
        title: '🚩 Swaminarayan University Ganesh Mahotsav 2026 — 10 Days Grand Schedule',
        type: 'event',
        category: 'Cultural & Festival',
        university: 'Swaminarayan University',
        department: 'All Departments (Engineering, Pharmacy, Management, Ayurvedic)',
        description: 'Join the 10-day university celebrations:\n• Day 1: Ganesh Sthapana & Maha Aarti (9:00 AM @ Central Plaza)\n• Day 3: Rangoli & Modak Making Competition (2:00 PM @ Auditorium)\n• Day 5: Bhajan Sandhya & Musical Night (6:30 PM @ Open Air Theatre)\n• Day 7: Inter-College Cultural Garba Raas (7:00 PM @ Main Ground)\n• Day 10: Grand Visarjan Shobha Yatra (3:00 PM from Main Campus Gate to Highway).',
        venue: 'Swaminarayan University Central Ground & Auditorium, Kalol',
        date: new Date('2026-09-07T09:00:00Z'),
        isUrgent: true
      },
      // 2. Public Holiday Announcement - Ganesh Visarjan
      {
        title: '🌴 Public Holiday Notification — Ganesh Visarjan',
        type: 'holiday',
        category: 'Holiday',
        university: 'Swaminarayan University',
        department: 'All Departments',
        description: 'All colleges and administrative offices of Swaminarayan University, Kalol will remain closed on the auspicious occasion of Ganesh Visarjan. Regular academic lectures and lab sessions will resume the next day.',
        venue: 'Swaminarayan University, Kalol Campus',
        date: new Date('2026-09-17T00:00:00Z'),
        isUrgent: true
      },
      // 3. Mid-Semester Examination Schedule
      {
        title: '📢 Mid-Semester Examination Schedule — Sem 3, 5 & 7',
        type: 'notice',
        category: 'Academic',
        university: 'Swaminarayan University',
        department: 'Faculty of Engineering & Technology (Computer, IT, Civil, Mech)',
        description: 'Official Mid-Semester Exams will commence from 14th October 2026. Detailed subject-wise timetable and seating arrangement has been uploaded to the student portal. Reporting time is 10:15 AM with mandatory university ID cards.',
        venue: 'Examination Block C, Swaminarayan University',
        date: new Date('2026-10-14T10:30:00Z'),
        isUrgent: true
      },
      // 4. Diwali Vacation & Semester Break
      {
        title: '🌴 Diwali Vacation & Academic Semester Break 2026',
        type: 'holiday',
        category: 'Academic Calendar',
        university: 'Swaminarayan University',
        department: 'All Departments (Engineering, Pharmacy, Management, Ayurvedic)',
        description: 'The University announces official Diwali Vacation from 28th October 2026 to 12th November 2026 for all undergraduate and postgraduate students. University hostels and mess will operate on special vacation timings.',
        venue: 'Swaminarayan University Campus, Kalol',
        date: new Date('2026-10-28T00:00:00Z'),
        isUrgent: false
      },
      // 5. TechFest & National Hackathon
      {
        title: '🎪 TechSparks 2026 — National Hackathon & Robotics Championship',
        type: 'event',
        category: 'Technical & Hackathon',
        university: 'Swaminarayan University',
        department: 'Faculty of Engineering & Technology',
        description: '36-hour non-stop Hackathon, Line Follower Robotics, CAD Design, and Web Dev Sprint. Total Cash Prize pool: ₹1,50,000. Free accommodation for outstation participants.',
        venue: 'Tech Innovation Centre & Computer Labs Block, Kalol',
        date: new Date('2026-11-20T09:00:00Z'),
        isUrgent: false
      },
      // 6. Pharmacy & Ayurvedic Research Conference
      {
        title: '🌿 National Conference on Ayurvedic Sciences & Modern Pharmacology',
        type: 'workshop',
        category: 'Medical & Science',
        university: 'Swaminarayan University',
        department: 'Faculty of Pharmacy & Faculty of Ayurvedic Science',
        description: 'Guest lectures by senior pharmacologists and clinical researchers from AIIMS and Gujarat Forensic Sciences University on herbal drug discovery and patient care.',
        venue: 'Ayurvedic Medical Research Auditorium, Kalol',
        date: new Date('2026-11-25T10:00:00Z'),
        isUrgent: false
      },
      // 7. Management Placement Drive
      {
        title: '💼 Campus Placement Drive — TCS, Infosys, HDFC Bank & L&T',
        type: 'event',
        category: 'Placement',
        university: 'Swaminarayan University',
        department: 'Faculty of Management & Commerce (BBA, MBA) & Engineering',
        description: 'Aptitude tests, technical interviews, and HR rounds for final year graduating students. Minimum CGPA required: 6.0.',
        venue: 'Main University Placement Hall, Kalol',
        date: new Date('2026-12-05T09:30:00Z'),
        isUrgent: false
      }
    ];

    await EventNotice.insertMany(items);
    console.log('Swaminarayan University Kalol Complete Academic Calendar Seeded Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seedData();
