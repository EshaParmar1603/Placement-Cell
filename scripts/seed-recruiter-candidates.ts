import { prisma } from '../src/config/database.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { UserRole, AccountStatus, PlacementStatus, ResumeProcessingStatus } from '@prisma/client';

async function seedCandidates() {
  console.log('Seeding recruiter candidate resumes...');

  // 1. Check Ananya Verma & Vikram Singh
  const ananya = await prisma.studentProfile.findFirst({
    where: { fullName: { contains: 'Ananya' } },
    include: { resumes: true },
  });

  if (ananya && ananya.resumes.length === 0) {
    const resumeId = uuidv4();
    await prisma.resume.create({
      data: {
        id: resumeId,
        studentId: ananya.id,
        fileName: 'ananya_verma_resume_v1.pdf',
        originalName: 'Ananya_Verma_AI_Resume.pdf',
        mimeType: 'application/pdf',
        fileSize: 184000,
        filePath: 'uploads/resumes/ananya_verma_resume_v1.pdf',
        version: 1,
        processingStatus: ResumeProcessingStatus.COMPLETED,
        extractedText: `Ananya Verma | B.Tech Computer Science (AI & ML) | Parul University | CGPA: 8.4/10\nEmail: ananya.verma@example.com | GitHub: github.com/ananya-ai\n\nTECHNICAL SKILLS:\nLanguages: Python, C++, SQL, JavaScript\nFrameworks: PyTorch, TensorFlow, Scikit-Learn, FastAPI, React\nTools: Docker, Git, NVIDIA CUDA, Weights & Biases\n\nPROJECTS:\n1. Medical Vision AI: Built CNN-based diagnostic tool for chest X-ray classification achieving 94.2% ROC-AUC.\n2. LLM RAG Document Intelligence: Retrieval-Augmented Generation agent with LangChain, ChromaDB and Llama-3.\n\nEXPERIENCE:\nAI Engineering Intern at DataScale Labs (May 2025 - July 2025): Developed model inference pipelines cutting latency by 45%.`,
        parsedData: {
          name: 'Ananya Verma',
          cgpa: 8.4,
          skills: ['Python', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'FastAPI', 'React', 'Docker', 'NVIDIA CUDA', 'Computer Vision', 'NLP'],
          education: [{ degree: 'B.Tech Computer Science (AI & ML)', year: 2026, cgpa: 8.4, institute: 'Parul University' }],
          projects: [
            { title: 'Medical Vision AI', tech: 'PyTorch, CUDA, FastAPI', description: 'Diagnostic classification achieving 94.2% ROC-AUC across 15,000 images.' },
            { title: 'LLM RAG Document Intelligence', tech: 'LangChain, Llama-3, ChromaDB', description: 'Semantic search and question answering on enterprise PDFs.' }
          ],
          workExperience: [
            { company: 'DataScale Labs', role: 'AI Engineering Intern', duration: 'May 2025 - July 2025', description: 'Optimized inference microservices reducing latency by 45%.' }
          ]
        },
        analyses: {
          create: {
            qualityScore: 92,
            summary: 'Outstanding AI/ML engineering profile with specialized deep learning projects and production internship experience.',
            strengths: [
              'Clear applied AI/ML domain specialization with PyTorch & CUDA',
              'Concrete quantified performance metrics (94.2% ROC-AUC, 45% latency reduction)',
              'Relevant industry internship experience at DataScale Labs'
            ],
            weaknesses: [
              'Could highlight traditional data structures / systems programming experience',
              'Expand on backend testing and CI/CD pipelines'
            ],
            missingInfo: ['HuggingFace or Kaggle portfolio rankings'],
            recommendations: [
              'Add benchmark comparison table for medical imaging model',
              'Highlight deployment architecture (ONNX / TensorRT)'
            ]
          }
        }
      }
    });
    console.log('Seeded resume for Ananya Verma');
  }

  const vikram = await prisma.studentProfile.findFirst({
    where: { fullName: { contains: 'Vikram' } },
    include: { resumes: true },
  });

  if (vikram && vikram.resumes.length === 0) {
    const resumeId = uuidv4();
    await prisma.resume.create({
      data: {
        id: resumeId,
        studentId: vikram.id,
        fileName: 'vikram_singh_resume_v1.pdf',
        originalName: 'Vikram_Singh_FullStack_Resume.pdf',
        mimeType: 'application/pdf',
        fileSize: 162000,
        filePath: 'uploads/resumes/vikram_singh_resume_v1.pdf',
        version: 1,
        processingStatus: ResumeProcessingStatus.COMPLETED,
        extractedText: `Vikram Singh | B.Tech Information Technology | Parul University | CGPA: 9.1/10 (Top 2%)\nPhone: +91 9876543213 | Email: vikram.singh@example.com\n\nCORE COMPETENCIES:\nLanguages: Java, TypeScript, Go, SQL\nBackend: Spring Boot, Node.js, Express, Microservices Architecture, Kafka, Redis\nDatabases: PostgreSQL, MongoDB, Redis\nCloud & DevOps: AWS (EC2, S3, RDS), Docker, Kubernetes, GitHub Actions CI/CD\n\nPROJECTS:\n1. High-Throughput E-Commerce Microservices: Spring Boot + Apache Kafka order fulfillment system handling 12,000 requests/second.\n2. Cloud Cost Optimizer: Automated AWS resource scaling utility utilizing Lambda and CloudWatch.\n\nEXPERIENCE:\nBackend Engineering Intern at TechVanguard Solutions (Jan 2025 - Jun 2025).`,
        parsedData: {
          name: 'Vikram Singh',
          cgpa: 9.1,
          skills: ['Java', 'Spring Boot', 'Kafka', 'Redis', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'Microservices', 'TypeScript'],
          education: [{ degree: 'B.Tech Information Technology', year: 2026, cgpa: 9.1, institute: 'Parul University' }],
          projects: [
            { title: 'High-Throughput E-Commerce Microservices', tech: 'Java 21, Spring Boot, Apache Kafka', description: 'Event-driven order fulfillment handling 12k req/sec with 99.99% availability.' },
            { title: 'Cloud Infrastructure Optimizer', tech: 'Go, AWS SDK, Docker', description: 'Serverless cost optimization tool reducing idle EC2 overhead.' }
          ],
          workExperience: [
            { company: 'TechVanguard Solutions', role: 'Backend Engineering Intern', duration: 'Jan 2025 - Jun 2025', description: 'Designed high-concurrency pub/sub pipelines and database indexing.' }
          ]
        },
        analyses: {
          create: {
            qualityScore: 95,
            summary: 'Exceptional enterprise-grade backend engineering candidate with top-tier 9.1 CGPA and high-throughput microservices background.',
            strengths: [
              'Top academic record (9.1 CGPA - Top 2% of department)',
              'Enterprise stack mastery: Java, Spring Boot, Kafka, Microservices',
              'Demonstrated scalability metrics (12,000 req/sec benchmark)'
            ],
            weaknesses: [
              'Frontend UI experience is secondary compared to backend expertise',
              'Include test coverage metrics (JUnit, Testcontainers)'
            ],
            missingInfo: ['AWS certifications credentials badge'],
            recommendations: [
              'Mention unit/integration test coverage percentages',
              'Highlight fault tolerance patterns implemented (Circuit breaker, retry queues)'
            ]
          }
        }
      }
    });
    console.log('Seeded resume for Vikram Singh');
  }

  // Add 2 more candidate profiles: Priya Patel (ECE/IoT/Robotics) and Rohan Mehta (CSE Cloud/DevOps)
  const priyaUser = await prisma.user.findFirst({ where: { email: 'priya.patel@example.com' } });
  if (!priyaUser) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123!', salt);
    const u = await prisma.user.create({
      data: {
        email: 'priya.patel@example.com',
        passwordHash,
        role: UserRole.STUDENT,
        status: AccountStatus.ACTIVE,
        isEmailVerified: true,
        studentProfile: {
          create: {
            fullName: 'Priya Patel',
            enrollmentNumber: 'EN2022ECE042',
            department: 'Electronics & Communication',
            course: 'B.Tech',
            graduationYear: 2026,
            cgpa: 8.7,
            percentage: 87.0,
            skills: ['Embedded C', 'C++', 'Python', 'RTOS', 'ARM Cortex', 'IoT Protocols', 'MQTT', 'ROS2', 'MATLAB', 'PCB Design'],
            targetRoles: ['Embedded Systems Engineer', 'IoT Firmware Developer'],
            preferredLocations: ['Bangalore', 'Pune', 'Ahmedabad'],
            placementStatus: PlacementStatus.NOT_PLACED,
            profileCompletion: 95,
            resumes: {
              create: {
                fileName: 'priya_patel_ece_resume.pdf',
                originalName: 'Priya_Patel_Embedded_IoT_Resume.pdf',
                mimeType: 'application/pdf',
                fileSize: 151000,
                filePath: 'uploads/resumes/priya_patel_ece_resume.pdf',
                version: 1,
                processingStatus: ResumeProcessingStatus.COMPLETED,
                extractedText: `Priya Patel | B.Tech Electronics & Communication | Parul University | CGPA: 8.7/10\nSpecialization: Embedded Systems, RTOS & IoT Robotics\n\nSKILLS:\nEmbedded C, C++, FreeRTOS, ESP32, STM32, ARM Cortex-M, MQTT, I2C, SPI, ROS2, Linux Kernel Device Drivers.\n\nPROJECTS:\n1. Autonomous Industrial Mobile Robot (AMR): Built obstacle-avoiding LiDAR navigation stack on ROS2 & STM32.\n2. Smart Agriculture Mesh IoT Gateway: Low-power LoRaWAN sensor node with 18-month battery life.`,
                parsedData: {
                  name: 'Priya Patel',
                  cgpa: 8.7,
                  skills: ['Embedded C', 'C++', 'FreeRTOS', 'STM32', 'ARM Cortex', 'MQTT', 'ROS2', 'LoRaWAN', 'Linux', 'PCB Design'],
                  education: [{ degree: 'B.Tech Electronics & Communication', year: 2026, cgpa: 8.7, institute: 'Parul University' }],
                  projects: [
                    { title: 'Autonomous Industrial Mobile Robot', tech: 'ROS2, STM32, C++, LiDAR', description: 'SLAM mapping and collision avoidance navigation.' },
                    { title: 'Smart Agriculture Mesh IoT Gateway', tech: 'LoRaWAN, ESP32, FreeRTOS', description: 'Low-power distributed telemetry with 18-month battery lifecycle.' }
                  ],
                  workExperience: [
                    { company: 'RoboTech Solutions', role: 'Firmware Engineering Intern', duration: 'Jun 2025 - Aug 2025', description: 'Programmed motor driver PWM controllers and CAN bus telemetry.' }
                  ]
                },
                analyses: {
                  create: {
                    qualityScore: 90,
                    summary: 'Standout hardware-software embedded engineer with strong RTOS, robotics, and edge computing credentials.',
                    strengths: [
                      'Rare high-demand embedded firmware specialization (FreeRTOS, STM32)',
                      'Practical robotics project using ROS2 and LiDAR',
                      'Strong academic performance (8.7 CGPA)'
                    ],
                    weaknesses: [
                      'Could add more information on PCB layout software (Altium / KiCad)',
                      'Include test benches or hardware-in-the-loop (HIL) verification details'
                    ],
                    missingInfo: ['Hardware lab certifications or IEEE conference papers'],
                    recommendations: [
                      'Mention Altium / KiCad schematic design experience',
                      'Quantify battery life optimization formulas in IoT projects'
                    ]
                  }
                }
              }
            }
          }
        }
      }
    });
    console.log('Created candidate Priya Patel with resume & analysis');
  }

  const rohanUser = await prisma.user.findFirst({ where: { email: 'rohan.mehta@example.com' } });
  if (!rohanUser) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123!', salt);
    await prisma.user.create({
      data: {
        email: 'rohan.mehta@example.com',
        passwordHash,
        role: UserRole.STUDENT,
        status: AccountStatus.ACTIVE,
        isEmailVerified: true,
        studentProfile: {
          create: {
            fullName: 'Rohan Mehta',
            enrollmentNumber: 'EN2022CSE088',
            department: 'Computer Science',
            course: 'B.Tech',
            graduationYear: 2026,
            cgpa: 8.6,
            percentage: 86.0,
            skills: ['Golang', 'Kubernetes', 'Docker', 'Terraform', 'AWS', 'Prometheus', 'Grafana', 'CI/CD', 'Linux', 'Python'],
            targetRoles: ['DevOps Engineer', 'Cloud Infrastructure Engineer', 'SRE'],
            preferredLocations: ['Bangalore', 'Hyderabad', 'Mumbai'],
            placementStatus: PlacementStatus.NOT_PLACED,
            profileCompletion: 95,
            resumes: {
              create: {
                fileName: 'rohan_mehta_devops_resume.pdf',
                originalName: 'Rohan_Mehta_Cloud_DevOps_Resume.pdf',
                mimeType: 'application/pdf',
                fileSize: 168000,
                filePath: 'uploads/resumes/rohan_mehta_devops_resume.pdf',
                version: 1,
                processingStatus: ResumeProcessingStatus.COMPLETED,
                extractedText: `Rohan Mehta | B.Tech CSE (Cloud Computing) | Parul University | CGPA: 8.6/10\nCertifications: AWS Certified Solutions Architect Associate (2025)\n\nTECHNICAL STACK:\nCloud & Containers: AWS, Docker, Kubernetes, Helm\nInfrastructure as Code: Terraform, Ansible\nCI/CD & Monitoring: GitHub Actions, ArgoCD, Prometheus, Grafana, OpenTelemetry\nLanguages: Go, Python, Bash, YAML\n\nPROJECTS:\n1. GitOps Automated Multi-Cluster K8s Delivery: Automated zero-downtime canary deployments via ArgoCD.\n2. Cloud Infrastructure Cost Sentinel: Go CLI tool that analyzes Terraform plans to estimate cloud spend.`,
                parsedData: {
                  name: 'Rohan Mehta',
                  cgpa: 8.6,
                  skills: ['Go', 'Kubernetes', 'Docker', 'Terraform', 'AWS', 'ArgoCD', 'Prometheus', 'Grafana', 'GitOps', 'CI/CD'],
                  education: [{ degree: 'B.Tech CSE (Cloud Computing)', year: 2026, cgpa: 8.6, institute: 'Parul University' }],
                  projects: [
                    { title: 'GitOps Multi-Cluster Kubernetes Delivery', tech: 'ArgoCD, Kubernetes, Helm, GitHub Actions', description: 'Zero-downtime canary deployment pipeline across staging and production.' },
                    { title: 'Cloud Infrastructure Cost Sentinel', tech: 'Go, Terraform, AWS Cost Explorer', description: 'Automated cost estimation CLI flagging over-provisioned infrastructure.' }
                  ],
                  workExperience: [
                    { company: 'CloudOps Matrix', role: 'Cloud Platform Intern', duration: 'Jan 2025 - Apr 2025', description: 'Configured centralized Prometheus & Grafana alerting dashboards for 40+ microservices.' }
                  ]
                },
                analyses: {
                  create: {
                    qualityScore: 91,
                    summary: 'Highly capable Cloud / DevOps candidate with AWS certification, GitOps experience, and Go automation skills.',
                    strengths: [
                      'Industry-standard modern DevOps toolset (Kubernetes, ArgoCD, Terraform)',
                      'Official AWS Solutions Architect Associate credential',
                      'Solid systems programming with Go'
                    ],
                    weaknesses: [
                      'Could detail security practices (e.g. HashiCorp Vault, vulnerability scanning)',
                      'Add disaster recovery or multi-region failover metrics'
                    ],
                    missingInfo: ['Terraform Associate or CKA certification status'],
                    recommendations: [
                      'Highlight container image security scanning (Trivy / Snyk)',
                      'Mention SLA / SLO / MTTR operational metrics achieved'
                    ]
                  }
                }
              }
            }
          }
        }
      }
    });
    console.log('Created candidate Rohan Mehta with resume & analysis');
  }

  console.log('Seeding candidate resumes complete!');
}

seedCandidates().catch(console.error).finally(() => prisma.$disconnect());
