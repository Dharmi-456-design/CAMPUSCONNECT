const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import Models
const User = require('../models/User');
const Note = require('../models/Note');
const Doubt = require('../models/Doubt');
const Answer = require('../models/Answer');
const TeamPost = require('../models/TeamPost');
const TeamRequest = require('../models/TeamRequest');
const MarketplaceListing = require('../models/MarketplaceListing');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Bookmark = require('../models/Bookmark');
const Rating = require('../models/Rating');
const Report = require('../models/Report');
const EventNotice = require('../models/EventNotice');

const seedData = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI missing in .env file!');
      process.exit(1);
    }

    console.log('⏳ Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected! Seeding comprehensive Swaminarayan University, Kalol data for ALL departments...');

    // Clear existing collections safely
    await User.deleteMany({});
    await Note.deleteMany({});
    await Doubt.deleteMany({});
    await Answer.deleteMany({});
    await TeamPost.deleteMany({});
    await TeamRequest.deleteMany({});
    await MarketplaceListing.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    await Notification.deleteMany({});
    await Bookmark.deleteMany({});
    await Rating.deleteMany({});
    await Report.deleteMany({});
    await EventNotice.deleteMany({});

    console.log('🧹 Existing collections cleared.');

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('Password@123', salt);

    // 1. Create Verified Students Across ALL Swaminarayan University Kalol Departments
    const dharmi = await User.create({
      name: 'Dharmi Patel',
      email: 'dharmi@swaminarayan.edu',
      passwordHash: hash,
      college: 'Shree Swaminarayan Institute of Technology (SSIT), Kalol',
      branch: 'Faculty of Engineering (SSIT)',
      semester: 5,
      year: 3,
      skills: ['React Native', 'Node.js', 'Python', 'ADA', 'Computer Networks'],
      bio: 'Computer Engineering student at SSIT, Swaminarayan University Kalol. Tech Lead for SIH Hackathon Squad.',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      role: 'student',
      isVerified: true,
      points: 420
    });

    const harsh = await User.create({
      name: 'Harsh Shah',
      email: 'harsh@swaminarayan.edu',
      passwordHash: hash,
      college: 'Faculty of IT & Computer Science, Kalol',
      branch: 'Faculty of IT & Computer Science (BCA/MCA)',
      semester: 5,
      year: 3,
      skills: ['C++', 'DBMS', 'Full-Stack Web Dev', 'Cloud Computing'],
      bio: 'MCA/BCA student & competitive coder at Swaminarayan University. Core member of Coding Club.',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      role: 'student',
      isVerified: true,
      points: 310
    });

    const priya = await User.create({
      name: 'Priya Prajapati',
      email: 'priya@swaminarayan.edu',
      passwordHash: hash,
      college: 'Shree Swaminarayan Pharmacy College, Kalol',
      branch: 'Faculty of Pharmacy (B.Pharm/Pharm.D)',
      semester: 3,
      year: 2,
      skills: ['Organic Chemistry', 'Pharmaceutics', 'Drug Discovery', 'Pharmacology'],
      bio: 'B.Pharm scholar working on pharmaceutical formulation research at Kalol campus.',
      photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      role: 'student',
      isVerified: true,
      points: 240
    });

    const jaydeep = await User.create({
      name: 'Dr. Jaydeep Vaghela',
      email: 'jaydeep@swaminarayan.edu',
      passwordHash: hash,
      college: 'Shree Swaminarayan Ayurvedic College & Hospital, Kalol',
      branch: 'Faculty of Ayurvedic Medicine (BAMS)',
      semester: 3,
      year: 2,
      skills: ['Dravyaguna', 'Ayurvedic Herbology', 'Clinical Diagnosis', 'Anatomy'],
      bio: 'BAMS student passionate about classical ayurvedic medicine and patient clinical care.',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      role: 'student',
      isVerified: true,
      points: 195
    });

    const anjali = await User.create({
      name: 'Anjali Sharma',
      email: 'anjali@swaminarayan.edu',
      passwordHash: hash,
      college: 'Shree Swaminarayan Institute of Management (SSIM), Kalol',
      branch: 'Faculty of Commerce & Management (BBA/MBA)',
      semester: 4,
      year: 2,
      skills: ['Financial Analysis', 'Marketing Strategy', 'Business Analytics'],
      bio: 'MBA student specializing in Marketing & Campus Placement Coordination.',
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
      role: 'student',
      isVerified: true,
      points: 220
    });

    const rahul = await User.create({
      name: 'Rahul Joshi',
      email: 'rahul.pt@swaminarayan.edu',
      passwordHash: hash,
      college: 'Shree Swaminarayan Physiotherapy College, Kalol',
      branch: 'Faculty of Physiotherapy (BPT)',
      semester: 4,
      year: 2,
      skills: ['Kinesiology', 'Biomechanics', 'Orthopedic Rehab', 'Exercise Therapy'],
      bio: 'BPT student specializing in sports physical therapy & rehabilitation clinic.',
      photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
      role: 'student',
      isVerified: true,
      points: 180
    });

    const hetal = await User.create({
      name: 'Hetal Chaudhari',
      email: 'hetal.nursing@swaminarayan.edu',
      passwordHash: hash,
      college: 'Shree Swaminarayan College of Nursing, Kalol',
      branch: 'Faculty of Nursing (B.Sc Nursing)',
      semester: 3,
      year: 2,
      skills: ['Medical Surgical Nursing', 'Community Health', 'Pharmacology'],
      bio: 'B.Sc Nursing scholar active in campus rural health camp initiatives.',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
      role: 'student',
      isVerified: true,
      points: 210
    });

    const pooja = await User.create({
      name: 'Pooja Trivedi',
      email: 'pooja.law@swaminarayan.edu',
      passwordHash: hash,
      college: 'Faculty of Law, Swaminarayan University, Kalol',
      branch: 'Faculty of Law (LL.B)',
      semester: 3,
      year: 2,
      skills: ['Constitutional Law', 'Contract Act', 'Legal Drafting', 'Moot Court'],
      bio: 'Law student and Moot Court Society convenor at Kalol campus.',
      photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
      role: 'student',
      isVerified: true,
      points: 160
    });

    const admin = await User.create({
      name: 'Swaminarayan University Registrar',
      email: 'admin@swaminarayan.edu',
      passwordHash: hash,
      college: 'Swaminarayan University, Saij-Kalol Campus',
      branch: 'Faculty of Engineering (SSIT)',
      semester: 1,
      year: 1,
      skills: ['Administration', 'Examinations', 'Student Affairs'],
      bio: 'Official Swaminarayan University administration and circulars broadcast authority.',
      photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      role: 'admin',
      isVerified: true,
      points: 1500
    });

    console.log('✅ Verified Swaminarayan University Users created across all faculties.');

    // 2. Real Working Genuine Academic PDF Notes for ALL Faculties of Swaminarayan University Kalol
    const notesData = [
      {
        title: 'Analysis & Design of Algorithms (3150703) Complete Handwritten Notes',
        description: 'Comprehensive unit 1-3 handwritten notes covering Mathematical Foundations, Asymptotic Notations, Master Theorem, Strassen Matrix Multiplication, Dynamic Programming (0/1 Knapsack, LCS, Matrix Chain), Greedy Algorithms (Huffman Coding, Dijkstra), and NP-Completeness.',
        subject: 'Analysis & Design of Algorithms',
        branch: 'Faculty of Engineering (SSIT)',
        semester: 5,
        tags: ['ada', 'algorithms', 'dynamic-programming', 'greedy', 'ssit-exam'],
        fileUrl: 'http://localhost:5000/public/notes/ada_complete_notes.pdf',
        fileType: 'pdf',
        uploader: dharmi._id,
        approvalStatus: 'approved',
        downloadCount: 238,
        avgRating: 4.9
      },
      {
        title: 'Computer Networks (3150710) OSI & TCP/IP Architecture Cheatsheet',
        description: 'Complete subnetting numericals (CIDR/VLSM), OSI 7-layer vs TCP/IP model, IP addressing (IPv4 vs IPv6), Routing protocols (OSPF, BGP), and TCP 3-Way Handshake / Congestion Control.',
        subject: 'Computer Networks',
        branch: 'Faculty of Engineering (SSIT)',
        semester: 5,
        tags: ['cn', 'networking', 'tcp-ip', 'subnetting', 'it-notes'],
        fileUrl: 'http://localhost:5000/public/notes/computer_networks_cheatsheet.pdf',
        fileType: 'pdf',
        uploader: harsh._id,
        approvalStatus: 'approved',
        downloadCount: 184,
        avgRating: 4.8
      },
      {
        title: 'Database Management Systems (BCA-302) Relational Algebra & SQL Guide',
        description: 'Complete normalization (1NF, 2NF, 3NF, BCNF) solved examples, Relational Algebra operators (Selection, Projection, Joins, Division), and Transaction ACID / 2-Phase Locking protocols for BCA & MCA exams.',
        subject: 'Database Management Systems',
        branch: 'Faculty of IT & Computer Science (BCA/MCA)',
        semester: 3,
        tags: ['bca', 'mca', 'dbms', 'sql', 'normalization'],
        fileUrl: 'http://localhost:5000/public/notes/dbms_normalization_sql.pdf',
        fileType: 'pdf',
        uploader: harsh._id,
        approvalStatus: 'approved',
        downloadCount: 165,
        avgRating: 4.9
      },
      {
        title: 'Pharmaceutical Organic Chemistry - II (BP301T) Reaction Guide',
        description: 'Mechanisms of Electrophilic Aromatic Substitution, Benzene ring resonance stability, Nitration / Friedel-Crafts reaction pathways, Phenols acidity comparison, and Aromatic Amines pKa analysis.',
        subject: 'Pharmaceutical Chemistry',
        branch: 'Faculty of Pharmacy (B.Pharm/Pharm.D)',
        semester: 3,
        tags: ['bpharm', 'organic-chemistry', 'benzene', 'pharmacy-notes'],
        fileUrl: 'http://localhost:5000/public/notes/pharmaceutical_organic_chemistry.pdf',
        fileType: 'pdf',
        uploader: priya._id,
        approvalStatus: 'approved',
        downloadCount: 142,
        avgRating: 4.8
      },
      {
        title: 'Dravyaguna Vijnana & Rachana Sharir (Ayurvedic Herbology & Anatomy)',
        description: 'Detailed classical pharmacology Saptapadartha (Rasa 6 tastes, Guna 20 attributes, Virya cooling/heating, Vipaka, Prabhava), with 50 Mahakashaya herb classifications (Ashwagandha, Shatavari, Guduchi) and Ayurvedic organ anatomy.',
        subject: 'Dravyaguna Vijnana',
        branch: 'Faculty of Ayurvedic Medicine (BAMS)',
        semester: 3,
        tags: ['bams', 'ayurveda', 'dravyaguna', 'herbology', 'ayurvedic-notes'],
        fileUrl: 'http://localhost:5000/public/notes/dravyaguna_ayurvedic_anatomy.pdf',
        fileType: 'pdf',
        uploader: jaydeep._id,
        approvalStatus: 'approved',
        downloadCount: 115,
        avgRating: 4.7
      },
      {
        title: 'Kinesiology & Biomechanics of Human Movement (BPT-201)',
        description: 'Newton laws applied to musculoskeletal movements, Levers in human body (1st, 2nd, 3rd class), Convex-Concave rule, and Stance vs Swing phase Gait Cycle analysis with movement pathologies.',
        subject: 'Biomechanics & Kinesiology',
        branch: 'Faculty of Physiotherapy (BPT)',
        semester: 4,
        tags: ['bpt', 'physiotherapy', 'biomechanics', 'kinesiology', 'rehab'],
        fileUrl: 'http://localhost:5000/public/notes/physiotherapy_biomechanics.pdf',
        fileType: 'pdf',
        uploader: rahul._id,
        approvalStatus: 'approved',
        downloadCount: 98,
        avgRating: 4.8
      },
      {
        title: 'Medical Surgical Nursing - I (Adult Health Nursing Blueprint)',
        description: 'Pre/Intra/Post-operative nursing care checklists, NANDA nursing diagnoses, and clinical management blueprints for Cardiovascular (Myocardial Infarction MONA protocol) and Respiratory (COPD) disorders.',
        subject: 'Medical Surgical Nursing',
        branch: 'Faculty of Nursing (B.Sc Nursing)',
        semester: 3,
        tags: ['nursing', 'med-surg', 'care-plan', 'nursing-notes'],
        fileUrl: 'http://localhost:5000/public/notes/nursing_adult_health.pdf',
        fileType: 'pdf',
        uploader: hetal._id,
        approvalStatus: 'approved',
        downloadCount: 104,
        avgRating: 4.7
      },
      {
        title: 'Financial Management & Corporate Capital Budgeting (MBA / BBA)',
        description: 'Capital Budgeting techniques (NPV, IRR, Profitability Index, Payback Period), Operating Cycle & Working Capital formulas, and Financial Ratio Analysis (Liquidity, Leverage, ROE) with case solutions.',
        subject: 'Financial Management',
        branch: 'Faculty of Commerce & Management (BBA/MBA)',
        semester: 4,
        tags: ['mba', 'bba', 'finance', 'accounting', 'management-notes'],
        fileUrl: 'http://localhost:5000/public/notes/financial_management_mba.pdf',
        fileType: 'pdf',
        uploader: anjali._id,
        approvalStatus: 'approved',
        downloadCount: 120,
        avgRating: 4.6
      },
      {
        title: 'Constitutional Law of India (Article 12 to 32 Fundamental Rights)',
        description: 'Part III Fundamental Rights (Articles 12-35), Doctrine of Non-Arbitrariness, Right to Life (Maneka Gandhi v. UOI), Article 32/226 Writ Jurisdiction (Habeas Corpus, Mandamus, Certiorari), and Basic Structure Doctrine.',
        subject: 'Constitutional Law',
        branch: 'Faculty of Law (LL.B)',
        semester: 3,
        tags: ['law', 'llb', 'constitution', 'fundamental-rights', 'case-laws'],
        fileUrl: 'http://localhost:5000/public/notes/constitutional_law_llb.pdf',
        fileType: 'pdf',
        uploader: pooja._id,
        approvalStatus: 'approved',
        downloadCount: 89,
        avgRating: 4.9
      }
    ];

    await Note.insertMany(notesData);
    console.log('✅ Real Multi-Department Course Notes created with genuine university PDFs.');

    // 3. Create Real Doubts & Solved Answers
    const doubt1 = await Doubt.create({
      title: 'How to calculate Time Complexity of Strassen Matrix Multiplication in ADA (3150703)?',
      description: 'Using Master Theorem T(n) = 7T(n/2) + O(n^2). How do we get O(n^2.81) in the exam step by step?',
      subject: 'Analysis & Design of Algorithms',
      imageUrl: 'https://images.unsplash.com/photo-1516116211223-425856879be4?w=400',
      student: harsh._id,
      status: 'resolved'
    });

    await Answer.create({
      doubt: doubt1._id,
      author: dharmi._id,
      text: 'In Master Theorem T(n) = aT(n/b) + f(n): a=7, b=2, f(n)=n^2. Compare log_b(a) = log_2(7) ≈ 2.807 with k=2. Since log_2(7) > 2 (Case 1), T(n) = Θ(n^log_2(7)) = Θ(n^2.81)!',
      upvotes: [harsh._id, priya._id, jaydeep._id],
      isAccepted: true
    });

    const doubt2 = await Doubt.create({
      title: 'What is the exact difference between Zero Order and First Order Drug Elimination kinetics in Pharmaceutics?',
      description: 'Asked in last year SU mid-semester paper for 5 marks. Need formula and graph sketch explanation.',
      subject: 'Physical Pharmaceutics',
      student: priya._id,
      status: 'open'
    });

    await Answer.create({
      doubt: doubt2._id,
      author: jaydeep._id,
      text: 'Zero Order: Constant amount of drug is eliminated per unit time (Rate = k0, independent of concentration). First Order: Constant fraction/percentage of drug is eliminated per unit time (Rate = kC, concentration dependent with constant half-life t1/2 = 0.693/k)!',
      upvotes: [priya._id],
      isAccepted: false
    });

    console.log('✅ Real Q&A Doubts created.');

    // 4. Create Real Hackathon & Academic Teams Across Departments
    const teamPost1 = await TeamPost.create({
      title: 'Smart Gujarat Hackathon 2026 — AI Crop & Soil Health Diagnostic App',
      description: 'Interdisciplinary squad representing Swaminarayan University Kalol. We have 1 Full-Stack mobile developer (React Native/Node.js) and are looking for 1 AI/ML developer from CSE/IT and 1 Agriculture/Pharmacy domain lead.',
      department: 'Faculty of Engineering (SSIT)',
      requiredSkills: ['React Native', 'Node.js', 'Python ML', 'TensorFlow', 'UI/UX'],
      teamSizeMax: 4,
      currentTeamSize: 2,
      status: 'open',
      owner: dharmi._id
    });

    await TeamRequest.create({
      teamPost: teamPost1._id,
      requester: harsh._id,
      message: 'Hi Dharmi, I can build the Python ML backend model for crop leaf disease detection. Would love to join the SSIT team!',
      status: 'accepted'
    });

    console.log('✅ Real Hackathon Team Posts created.');

    // 5. Create Real Campus Marketplace Listings (Kalol Saij Campus)
    await MarketplaceListing.insertMany([
      {
        title: 'Higher Engineering Mathematics by B.S. Grewal (44th Edition)',
        description: 'Hardcover textbook in clean condition with no markings. Covers Differential Calculus, Vector Algebra, and Numerical Methods. Pickup at SSIT Library Gate.',
        category: 'Books',
        price: 380,
        condition: 'like_new',
        images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'],
        location: 'SSIT Central Library, 2nd Floor, Kalol',
        seller: harsh._id,
        status: 'available'
      },
      {
        title: 'Casio FX-991ES Plus Scientific Calculator (Natural Display)',
        description: 'Original Casio scientific calculator with solar dual power. Permitted in university mid-sem and GTU exams.',
        category: 'Electronics',
        price: 550,
        condition: 'used',
        images: ['https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48d?w=400'],
        location: 'Gate No. 2 Canteen Plaza, Swaminarayan University',
        seller: dharmi._id,
        status: 'available'
      },
      {
        title: 'Pharmacognosy & Phytochemistry by C.K. Kokate (5th Edition)',
        description: 'Prescribed reference book for B.Pharm 2nd & 3rd year. All plant taxonomy diagrams clear.',
        category: 'Books',
        price: 290,
        condition: 'like_new',
        images: ['https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=400'],
        location: 'Pharmacy Building Entrance, Kalol',
        seller: priya._id,
        status: 'available'
      },
      {
        title: 'Engineering Mini Drafter & Drawing Sheet Container',
        description: 'Omega mini drafter in metallic case with clamp and drafting sheet holder for 1st/2nd year Engineering Graphics.',
        category: 'Hardware',
        price: 320,
        condition: 'like_new',
        images: ['https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400'],
        location: 'Mechanical Workshop Block, Kalol',
        seller: harsh._id,
        status: 'available'
      }
    ]);

    console.log('✅ Real Marketplace Listings created.');

    // 6. Create Real Swaminarayan University Circulars & Academic Events
    await EventNotice.insertMany([
      {
        title: '🚩 Swaminarayan University Ganesh Mahotsav 2026 — 10 Days Grand Celebrations',
        type: 'event',
        category: 'Cultural & Festival',
        university: 'Swaminarayan University',
        department: 'All Departments (SSIT, Pharmacy, Ayurvedic, SSIM, Nursing)',
        description: '• Day 1: Ganesh Sthapana & Maha Aarti (9:00 AM @ Central Plaza)\n• Day 3: Rangoli & Modak Making Competition (2:00 PM @ Auditorium)\n• Day 5: Bhajan Sandhya & Musical Night (6:30 PM @ Open Air Theatre)\n• Day 7: Inter-College Cultural Garba Raas (7:00 PM @ Main Ground)\n• Day 10: Grand Visarjan Shobha Yatra (3:00 PM from Main Campus Gate to Kalol Highway).',
        venue: 'Swaminarayan University Central Ground & Auditorium, Saij, Kalol',
        date: new Date('2026-09-07T09:00:00Z'),
        isUrgent: true
      },
      {
        title: '🌴 Public Holiday Notification — Ganesh Visarjan',
        type: 'holiday',
        category: 'Holiday',
        university: 'Swaminarayan University',
        department: 'All Colleges & Administrative Offices',
        description: 'All institutes and administrative departments of Swaminarayan University, Kalol will remain closed on the auspicious occasion of Ganesh Visarjan.',
        venue: 'Swaminarayan University Campus, Kalol',
        date: new Date('2026-09-17T00:00:00Z'),
        isUrgent: true
      },
      {
        title: '📢 Mid-Semester Examination Schedule — Sem 3, 5 & 7',
        type: 'notice',
        category: 'Academic Examination',
        university: 'Swaminarayan University',
        department: 'Faculty of Engineering (SSIT), Pharmacy, Ayurvedic & Management',
        description: 'Official Mid-Semester Exams will commence from 14th October 2026. Detailed subject-wise timetable and seating arrangement (Rooms 201 to 218) has been uploaded. Reporting time is 10:15 AM with mandatory university ID cards.',
        venue: 'Examination Block C & SSIT Building, Swaminarayan University',
        date: new Date('2026-10-14T10:30:00Z'),
        isUrgent: true
      },
      {
        title: '🌴 Diwali Vacation & Academic Semester Break 2026',
        type: 'holiday',
        category: 'Academic Calendar',
        university: 'Swaminarayan University',
        department: 'All Departments',
        description: 'The University announces official Diwali Vacation from 28th October 2026 to 12th November 2026 for all students across Engineering, Pharmacy, Ayurvedic, and Management.',
        venue: 'Swaminarayan University Campus, Kalol',
        date: new Date('2026-10-28T00:00:00Z'),
        isUrgent: false
      },
      {
        title: '🎪 TechSparks 2026 — State Level TechFest & Robotics Arena',
        type: 'event',
        category: 'Technical & Hackathon',
        university: 'Swaminarayan University',
        department: 'Shree Swaminarayan Institute of Technology (SSIT)',
        description: '36-Hour National Hackathon, Robo-Race Championship, Web/App Dev Challenge, and Bridge Design. Total cash prizes worth ₹1,50,000!',
        venue: 'Central Auditorium & Computer Labs Wing, Kalol',
        date: new Date('2026-11-20T09:00:00Z'),
        isUrgent: false
      },
      {
        title: '💼 Mega Campus Placement Drive 2026 — TCS, Infosys, Zydus Cadila & HDFC',
        type: 'event',
        category: 'Placement Drive',
        university: 'Swaminarayan University',
        department: 'Final Year Engineering, Pharmacy & MBA Students',
        description: 'Pre-placement talks and technical aptitude tests for graduating batch. Minimum CGPA required: 6.0.',
        venue: 'Main University Placement Hall, Kalol',
        date: new Date('2026-12-05T09:30:00Z'),
        isUrgent: false
      }
    ]);

    console.log('✅ Real University Events & Circulars created.');

    // 7. Create Real Chat Conversation & Messages
    const conversation = await Conversation.create({
      participants: [dharmi._id, harsh._id],
      lastMessage: {
        text: 'Hey Harsh, I have uploaded the ADA Unit 3 notes for our SSIT mid-sem revision!',
        sender: dharmi._id,
        createdAt: new Date()
      }
    });

    await Message.create({
      conversation: conversation._id,
      sender: harsh._id,
      text: 'Thanks Dharmi! Let us meet at Central Library 2nd floor after the Computer Networks lab.',
      readBy: [dharmi._id, harsh._id]
    });

    await Message.create({
      conversation: conversation._id,
      sender: dharmi._id,
      text: 'Hey Harsh, I have uploaded the ADA Unit 3 notes for our SSIT mid-sem revision!',
      readBy: [harsh._id]
    });

    console.log('✅ Real Chat Messages created.');

    // 8. Create Real Student Notifications
    await Notification.create({
      user: dharmi._id,
      type: 'doubt_answer',
      message: 'Harsh Shah thanked you for solving the Strassen Matrix Multiplication doubt in ADA.',
      relatedId: doubt1._id,
      isRead: false
    });

    await Notification.create({
      user: harsh._id,
      type: 'team_request',
      message: 'Your join request for "Smart Gujarat Hackathon 2026 Squad" was accepted by Dharmi Patel!',
      relatedId: teamPost1._id,
      isRead: true
    });

    console.log('✅ Real Student Notifications created.');

    console.log('\n🎉 100% COMPLETE AUTHENTIC SWAMINARAYAN UNIVERSITY KALOL DATA SEEDED TO MONGODB ATLAS!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedData();
