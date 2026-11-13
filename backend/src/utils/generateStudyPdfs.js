const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const outputDir = path.join(__dirname, '../../public/notes');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const studyMaterials = [
  {
    fileName: 'ada_complete_notes.pdf',
    title: 'Analysis & Design of Algorithms (Course Code: 3150703)',
    faculty: 'Shree Swaminarayan Institute of Technology (SSIT) — Faculty of Engineering',
    author: 'Dharmi Patel (5th Sem Computer Science & Engineering)',
    units: [
      {
        unitTitle: 'Unit 1: Mathematical Foundations & Asymptotic Notations',
        content: [
          '• Asymptotic Analysis: Big-O (Upper bound), Omega Ω (Lower bound), and Theta Θ (Tight bound).',
          '• Master Theorem for Divide-and-Conquer: T(n) = aT(n/b) + f(n)',
          '  - Case 1: If f(n) = O(n^(log_b(a) - ε)), then T(n) = Θ(n^(log_b(a)))',
          '  - Case 2: If f(n) = Θ(n^(log_b(a)) * log^k(n)), then T(n) = Θ(n^(log_b(a)) * log^(k+1)(n))',
          '  - Case 3: If f(n) = Ω(n^(log_b(a) + ε)) and regularity condition af(n/b) <= cf(n), then T(n) = Θ(f(n))',
          '• Strassen Matrix Multiplication: 7 multiplications instead of 8, yielding T(n) = 7T(n/2) + O(n^2) = Θ(n^2.807).'
        ]
      },
      {
        unitTitle: 'Unit 2: Dynamic Programming & Solved Problems',
        content: [
          '• Core Properties: (1) Optimal Substructure, (2) Overlapping Subproblems.',
          '• 0/1 Knapsack Problem: State definition K(i, w) = max(K(i-1, w), val[i] + K(i-1, w - wt[i])). Time Complexity: O(n*W).',
          '• Longest Common Subsequence (LCS): If X[i] == Y[j], dp[i][j] = 1 + dp[i-1][j-1], else max(dp[i-1][j], dp[i][j-1]).',
          '• Matrix Chain Multiplication: Minimizing scalar multiplications for A_1 * A_2 * ... * A_n with O(n^3) DP table.'
        ]
      },
      {
        unitTitle: 'Unit 3: Greedy Algorithms, Graph Theory & NP-Completeness',
        content: [
          '• Fractional Knapsack: Greedy choice by value-to-weight ratio (val/wt). Time Complexity: O(n log n).',
          '• Huffman Coding: Optimal prefix code construction using min-priority queue with O(n log n) compression.',
          '• Single Source Shortest Path: Dijkstra Algorithm using Min-Heap: O((V + E) log V). Bellman-Ford for negative edge weights: O(V*E).',
          '• NP-Complete Problems: Satisfiability (SAT), Clique Problem, Vertex Cover, Traveling Salesperson Problem (TSP).'
        ]
      }
    ]
  },
  {
    fileName: 'computer_networks_cheatsheet.pdf',
    title: 'Computer Networks & TCP/IP Protocol Architecture (3150710)',
    faculty: 'Faculty of Engineering & Information Technology — Swaminarayan University',
    author: 'Harsh Shah (5th Sem Information Technology)',
    units: [
      {
        unitTitle: 'Unit 1: OSI 7-Layer Model vs TCP/IP Suite',
        content: [
          '• Physical Layer: Bit transmission, Manchester encoding, modulation.',
          '• Data Link Layer: Framing, Error detection (CRC-32, Checksum), Flow control (Sliding Window, Go-Back-N, Selective Repeat).',
          '• Network Layer: Logical IP addressing, packet forwarding, routing (OSPF, BGP, RIP).',
          '• Transport Layer: Process-to-process delivery (TCP reliable connection-oriented vs UDP unreliable connectionless).',
          '• Application Layer: HTTP/2, DNS, SMTP, FTP, WebSocket.'
        ]
      },
      {
        unitTitle: 'Unit 2: IPv4 / IPv6 Subnetting & Addressing Numericals',
        content: [
          '• Classless Inter-Domain Routing (CIDR): /24 = 256 IPs, /26 = 64 IPs (62 usable hosts).',
          '• Variable Length Subnet Masking (VLSM) formula: 2^(32 - prefix) - 2 usable host addresses.',
          '• Subnetting Solved Example: Network 192.168.10.0/24 split into 4 subnets: Subnet 0: 192.168.10.0/26, Subnet 1: 192.168.10.64/26, Subnet 2: 192.168.10.128/26, Subnet 3: 192.168.10.192/26.'
        ]
      },
      {
        unitTitle: 'Unit 3: TCP Connection & Congestion Control',
        content: [
          '• TCP 3-Way Handshake: SYN -> SYN-ACK -> ACK. Termination via FIN -> ACK -> FIN -> ACK.',
          '• TCP Congestion Control Algorithms: Slow Start, Congestion Avoidance (Additive Increase Multiplicative Decrease - AIMD), Fast Retransmit, Fast Recovery.'
        ]
      }
    ]
  },
  {
    fileName: 'dbms_normalization_sql.pdf',
    title: 'Database Management Systems & SQL Normalization (BCA-302 / MCA)',
    faculty: 'Faculty of IT & Computer Science — Swaminarayan University, Kalol',
    author: 'Swaminarayan Computer Science Department',
    units: [
      {
        unitTitle: 'Unit 1: Relational Model & Relational Algebra Operators',
        content: [
          '• Selection (σ): Filters rows satisfying predicate (σ_dept="CSE"(Students)).',
          '• Projection (π): Selects specific columns without duplicate rows (π_name,cgpa(Students)).',
          '• Cartesian Product (×) and Natural Join (⨝): Combining relational schemas on matching attributes.',
          '• Set Operations: Union (∪), Set Difference (-), Intersection (∩).'
        ]
      },
      {
        unitTitle: 'Unit 2: Functional Dependencies & Database Normalization',
        content: [
          '• 1st Normal Form (1NF): Each column must contain atomic (indivisible) values with no repeating groups.',
          '• 2nd Normal Form (2NF): Must be in 1NF and have NO Partial Dependencies (non-prime attributes fully dependent on candidate key).',
          '• 3rd Normal Form (3NF): Must be in 2NF and have NO Transitive Dependencies (X -> Y where Y is non-prime and X not superkey).',
          '• Boyce-Codd Normal Form (BCNF): For every functional dependency X -> Y, X MUST be a Super Key.'
        ]
      },
      {
        unitTitle: 'Unit 3: Transaction Processing & ACID Properties',
        content: [
          '• Atomicity (All or Nothing), Consistency (State preservation), Isolation (Concurrent transparency), Durability (Persistence).',
          '• Two-Phase Locking (2PL): Growing phase (locks acquired) & Shrinking phase (locks released) ensures serializability.'
        ]
      }
    ]
  },
  {
    fileName: 'pharmaceutical_organic_chemistry.pdf',
    title: 'Pharmaceutical Organic Chemistry - II (Course Code: BP301T)',
    faculty: 'Shree Swaminarayan Pharmacy College, Kalol',
    author: 'Priya Prajapati (B.Pharm 3rd Semester)',
    units: [
      {
        unitTitle: 'Unit 1: Benzene & Electrophilic Aromatic Substitution',
        content: [
          '• Kekulé Structure & Resonance Stability of Benzene ring with 6 delocalized π electrons.',
          '• Nitration Mechanism: Generation of Nitronium ion (NO2+) using H2SO4 + HNO3, forming Arenium ion intermediate.',
          '• Friedel-Crafts Alkylation & Acylation: AlCl3 Lewis acid catalyzed carbocation attack and synthetic limitations.',
          '• Substituent Effects: Ortho/Para directors (activating -OH, -NH2, -CH3) vs Meta directors (deactivating -NO2, -COOH, -SO3H).'
        ]
      },
      {
        unitTitle: 'Unit 2: Phenols & Aromatic Amines Structure-Activity Guide',
        content: [
          '• Acidity of Phenols: Resonance stabilization of Phenoxide ion compared to aliphatic alcohols.',
          '• Synthesis & Quantitative Tests: Ferric Chloride test, Liebermann test, and Bromine water precipitation.',
          '• Basicity of Aromatic Amines: Effect of electron-withdrawing vs donating substituents on pKa.'
        ]
      }
    ]
  },
  {
    fileName: 'dravyaguna_ayurvedic_anatomy.pdf',
    title: 'Dravyaguna Vijnana & Rachana Sharir (Ayurvedic Herbology & Anatomy)',
    faculty: 'Shree Swaminarayan Ayurvedic College & Hospital, Kalol',
    author: 'Dr. Jaydeep Vaghela (BAMS 2nd Professional)',
    units: [
      {
        unitTitle: 'Unit 1: Fundamental Principles of Ayurvedic Pharmacology (Saptapadartha)',
        content: [
          '• Dravya (Substance): Panchamahabhuta constitution (Prithvi, Jala, Teja, Vayu, Akasha).',
          '• Rasa (6 Tastes): Madhura (Sweet), Amla (Sour), Lavana (Salty), Katu (Pungent), Tikta (Bitter), Kashaya (Astringent).',
          '• Guna (20 Attributes): Guru/Laghu, Sheeta/Ushna, Snigdha/Ruksha, Manda/Tikshna.',
          '• Virya (Potency): Sheeta (Cooling) vs Ushna (Heating) metabolic action.',
          '• Vipaka (Post-digestive effect): Madhura, Amla, Katu.',
          '• Prabhava: Specific therapeutic action exceeding chemical attributes (e.g. Danti virechana).'
        ]
      },
      {
        unitTitle: 'Unit 2: Classical Medicinal Plant Classifications (Mahakashaya)',
        content: [
          '• Ashwagandha (Withania somnifera): Balya (Strength promoter), Rasayana, Vata-Kapha shamaka.',
          '• Shatavari (Asparagus racemosus): Stanyajanana (Galactagogue), Pitta shamaka, Medhya.',
          '• Guduchi (Tinospora cordifolia): Jvaraghna (Anti-pyretic), Deepana, Tridosha shamaka.'
        ]
      }
    ]
  },
  {
    fileName: 'physiotherapy_biomechanics.pdf',
    title: 'Kinesiology & Biomechanics of Human Movement (Course: BPT-201)',
    faculty: 'Shree Swaminarayan Physiotherapy College, Kalol',
    author: 'Rahul Joshi (BPT 4th Semester)',
    units: [
      {
        unitTitle: 'Unit 1: Kinematics & Kinetics of Human Joints',
        content: [
          '• Newton Laws applied to musculoskeletal movements: Force vectors, Center of Mass (CoM), Center of Pressure (CoP).',
          '• Levers in the Human Body: 1st Class (Atlanto-occipital joint), 2nd Class (Plantar flexion of ankle), 3rd Class (Biceps brachii flexion).',
          '• Convex-Concave Rule: When concave surface moves on convex, roll and glide occur in the SAME direction; when convex moves on concave, roll and glide occur in OPPOSITE directions.'
        ]
      },
      {
        unitTitle: 'Unit 2: Gait Cycle & Movement Pathologies',
        content: [
          '• Stance Phase (60%): Initial Contact (Heel strike), Loading Response, Mid-Stance, Terminal Stance, Pre-Swing (Toe-off).',
          '• Swing Phase (40%): Initial Swing, Mid-Swing, Terminal Swing.',
          '• Pathological Gaits: Trendelenburg Gait (Gluteus medius weakness), Hemiplegic Circumduction Gait, Parkinsonian Festinating Gait.'
        ]
      }
    ]
  },
  {
    fileName: 'nursing_adult_health.pdf',
    title: 'Medical Surgical Nursing - I: Adult Health Blueprint & Care Plans',
    faculty: 'Shree Swaminarayan College of Nursing, Kalol',
    author: 'Hetal Chaudhari (B.Sc Nursing 3rd Semester)',
    units: [
      {
        unitTitle: 'Unit 1: Nursing Assessment & Perioperative Nursing',
        content: [
          '• Pre-Operative Checklist: Informed consent, NPO status, preoperative antibiotic prophylaxis, deep breathing exercises.',
          '• Intra-Operative Asepsis: Surgical scrubbing, PPE protocol, surgical count verification (sponges and sharps).',
          '• Post-Operative Complications: Atelectasis, Deep Vein Thrombosis (DVT), Surgical site infection (SSI) monitoring using ASEPSIS score.'
        ]
      },
      {
        unitTitle: 'Unit 2: Cardiovascular & Respiratory System Disorders',
        content: [
          '• Myocardial Infarction (MI): MONA protocol (Morphine, Oxygen, Nitroglycerin, Aspirin), ECG ST-elevation identification.',
          '• Chronic Obstructive Pulmonary Disease (COPD): Pursed-lip breathing, controlled oxygen therapy (Venturi mask), nebulization therapy.'
        ]
      }
    ]
  },
  {
    fileName: 'financial_management_mba.pdf',
    title: 'Financial Management & Corporate Capital Budgeting (MBA / BBA)',
    faculty: 'Faculty of Commerce & Management (SSIM) — Swaminarayan University',
    author: 'Anjali Sharma (MBA 4th Semester)',
    units: [
      {
        unitTitle: 'Unit 1: Time Value of Money & Capital Budgeting Techniques',
        content: [
          '• Net Present Value (NPV): NPV = Sum(CF_t / (1+r)^t) - Initial Outlay. Project accepted if NPV > 0.',
          '• Internal Rate of Return (IRR): The discount rate at which NPV = 0. Accept if IRR > Cost of Capital (WACC).',
          '• Profitability Index (PI): PV of Future Cash Flows / Initial Investment.',
          '• Payback Period & Discounted Payback Period analysis.'
        ]
      },
      {
        unitTitle: 'Unit 2: Working Capital & Financial Ratio Analysis',
        content: [
          '• Operating Cycle = Inventory Conversion Period + Debtors Collection Period - Creditors Deferral Period.',
          '• Liquidity Ratios: Current Ratio = Current Assets / Current Liabilities (Ideal 2:1), Quick Ratio (Ideal 1:1).',
          '• Leverage & Profitability Ratios: Debt-Equity Ratio, Interest Coverage Ratio, Return on Equity (ROE).'
        ]
      }
    ]
  },
  {
    fileName: 'constitutional_law_llb.pdf',
    title: 'Constitutional Law of India: Fundamental Rights & Judicial Precedents',
    faculty: 'Faculty of Law — Swaminarayan University, Kalol',
    author: 'Pooja Trivedi (LL.B 3rd Semester)',
    units: [
      {
        unitTitle: 'Unit 1: Part III Fundamental Rights (Articles 12 to 35)',
        content: [
          '• Article 12: Definition of "State" — Government, Parliament, Local Authorities & State Instrumentalities (Ajay Hasia test).',
          '• Article 14: Equality before Law & Equal Protection of Laws. Doctrine of Non-Arbitrariness (E.P. Royappa case).',
          '• Article 19: Six Basic Freedoms (Speech, Assembly, Association, Movement, Residence, Profession) subject to reasonable restrictions (Art 19(2)).',
          '• Article 21: Right to Life and Personal Liberty. Procedure Established by Law vs Due Process of Law (Maneka Gandhi v. UOI).'
        ]
      },
      {
        unitTitle: 'Unit 2: Constitutional Remedies & Writ Jurisdiction (Article 32 & 226)',
        content: [
          '• Habeas Corpus: "To have the body" — remedy against unlawful detention.',
          '• Mandamus: "We command" — directing public authority to perform statutory duty.',
          '• Prohibition & Certiorari: Quashing orders passed in excess of jurisdiction.',
          '• Quo Warranto: Challenging title of person to public office.',
          '• Basic Structure Doctrine: Kesavananda Bharati v. State of Kerala (1973) — Parliament cannot amend the basic structure.'
        ]
      }
    ]
  }
];

function generatePDF(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const filePath = path.join(outputDir, data.fileName);
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);

    // Header Badge
    doc
      .rect(40, 35, 515, 65)
      .fillAndStroke('#FFFBEB', '#D97706');

    doc
      .fontSize(12)
      .fillColor('#D97706')
      .font('Helvetica-Bold')
      .text('SWAMINARAYAN UNIVERSITY, KALOL — SCHOLAR ACADEMIC PORTAL', 50, 48, { align: 'center' });

    doc
      .fontSize(9)
      .fillColor('#4A5568')
      .font('Helvetica')
      .text(data.faculty, 50, 66, { align: 'center' });

    doc.moveDown(3);

    // Title
    doc
      .fontSize(16)
      .fillColor('#1A202C')
      .font('Helvetica-Bold')
      .text(data.title, 40, 120);

    // Metadata Bar
    doc
      .fontSize(9)
      .fillColor('#718096')
      .font('Helvetica')
      .text(`Uploaded By: ${data.author}  |  Official Course Curriculum  |  Peer Verified ★ 4.9`, 40, 148);

    doc
      .moveTo(40, 165)
      .lineTo(555, 165)
      .strokeColor('#E2E8F0')
      .stroke();

    let yPosition = 180;

    data.units.forEach((unit, uIdx) => {
      if (yPosition > 650) {
        doc.addPage();
        yPosition = 50;
      }

      // Unit Header
      doc
        .rect(40, yPosition, 515, 24)
        .fill('#F0F9FF');

      doc
        .fontSize(11)
        .fillColor('#0284C7')
        .font('Helvetica-Bold')
        .text(unit.unitTitle, 48, yPosition + 6);

      yPosition += 36;

      unit.content.forEach((line) => {
        if (yPosition > 740) {
          doc.addPage();
          yPosition = 50;
        }

        doc
          .fontSize(9.5)
          .fillColor('#2D3748')
          .font('Helvetica')
          .text(line, 50, yPosition, { width: 495, lineGap: 3 });

        yPosition += doc.heightOfString(line, { width: 495, lineGap: 3 }) + 8;
      });

      yPosition += 12;
    });

    // Footer on all pages
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(8)
        .fillColor('#A0AEC0')
        .text(
          `Swaminarayan University CampusConnect Academic Material  •  Page ${i + 1} of ${pageCount}`,
          40,
          790,
          { align: 'center', width: 515 }
        );
    }

    doc.end();

    writeStream.on('finish', () => {
      console.log(`✅ Generated: ${data.fileName}`);
      resolve(filePath);
    });

    writeStream.on('error', reject);
  });
}

async function run() {
  console.log('⏳ Generating 100% Genuine Academic Subject PDFs for all Faculties...');
  for (const mat of studyMaterials) {
    await generatePDF(mat);
  }
  console.log('🎉 All 9 Genuine Academic PDFs generated in backend/public/notes/');
}

run();
