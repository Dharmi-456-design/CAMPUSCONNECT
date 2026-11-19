const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const User = require('../models/User');

const REAL_SWAMINARAYAN_SUBJECTS = [
  // Semester 6 Core Subjects (Dharmi Patel - 6th Sem Computer Engineering)
  {
    code: 'CSE-601',
    name: 'Machine Learning & Deep Learning',
    credits: 4,
    semester: 6,
    department: 'Computer Science & Engineering',
    instructor: 'Dr. Rajesh Sharma',
    grade: 'AA',
    color: '#10B981',
    category: 'my_subjects',
    description: 'Supervised, Unsupervised Learning, Neural Networks, CNN, RNN and TensorFlow implementations.'
  },
  {
    code: 'CSE-602',
    name: 'Web Technologies & Cloud Native Architecture',
    credits: 4,
    semester: 6,
    department: 'Computer Science & Engineering',
    instructor: 'Prof. Harsh Patel',
    grade: 'AA',
    color: '#3B82F6',
    category: 'my_subjects',
    description: 'Full-stack MERN ecosystem, REST APIs, Microservices and Docker containerization.'
  },
  {
    code: 'CSE-603',
    name: 'Compiler Design & Language Translators',
    credits: 4,
    semester: 6,
    department: 'Computer Science & Engineering',
    instructor: 'Prof. Nidhi Shah',
    grade: 'AB',
    color: '#8B5CF6',
    category: 'my_subjects',
    description: 'Lexical analysis, syntax-directed translation, parsing techniques and code generation.'
  },
  {
    code: 'CSE-604',
    name: 'Mobile App Development (React Native & Android)',
    credits: 3,
    semester: 6,
    department: 'Computer Science & Engineering',
    instructor: 'Prof. Sneha Prajapati',
    grade: 'AA',
    color: '#F59E0B',
    category: 'my_subjects',
    description: 'Cross-platform mobile apps with React Native, Expo, mobile device hardware APIs, and state management.'
  },
  {
    code: 'CSE-605',
    name: 'Cyber Security & Cryptography',
    credits: 3,
    semester: 6,
    department: 'Computer Science & Engineering',
    instructor: 'Prof. Viral Mehta',
    grade: 'AB',
    color: '#EF4444',
    category: 'my_subjects',
    description: 'Network security protocols, symmetric/asymmetric encryption, SHA-256, and penetration testing.'
  },
  {
    code: 'CSE-606',
    name: 'Software Testing & Quality Assurance',
    credits: 3,
    semester: 6,
    department: 'Computer Science & Engineering',
    instructor: 'Prof. Bhavin Joshi',
    grade: 'AA',
    color: '#06B6D4',
    category: 'my_subjects',
    description: 'Automated unit testing, integration tests, test case design, and CI/CD pipelines.'
  },

  // Main Hub & Electives
  {
    code: 'CSE-607',
    name: 'Cloud Computing & DevOps',
    credits: 3,
    semester: 6,
    department: 'Computer Science & Engineering',
    instructor: 'Dr. Alok Verma',
    grade: 'AA',
    color: '#6366F1',
    category: 'main_hub',
    description: 'AWS, GCP Cloud architecture, Kubernetes, Terraform and infrastructure as code.'
  },
  {
    code: 'CSE-608',
    name: 'Artificial Intelligence & Robotics',
    credits: 4,
    semester: 6,
    department: 'Computer Science & Engineering',
    instructor: 'Prof. Pooja Trivedi',
    grade: 'AA',
    color: '#EC4899',
    category: 'main_hub',
    description: 'Search algorithms, heuristic searches, computer vision, and expert systems.'
  }
];

async function seedSubjects() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Find all users (or create for all existing users)
    const users = await User.find({});
    console.log(`Found ${users.length} users in database.`);

    // Clear old subjects
    await Subject.deleteMany({});
    console.log('Cleaned old subjects.');

    let insertedTotal = 0;
    for (const u of users) {
      const docs = REAL_SWAMINARAYAN_SUBJECTS.map(s => ({
        ...s,
        user: u._id
      }));
      await Subject.insertMany(docs);
      insertedTotal += docs.length;
    }

    console.log(`🎉 Successfully seeded ${insertedTotal} real Swaminarayan University subjects for all users!`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding subjects:', err);
    process.exit(1);
  }
}

seedSubjects();
