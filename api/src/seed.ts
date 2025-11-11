import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { Project } from './models/Project.js';
import { Question } from './models/Question.js';

export async function seedAll() {
  // Users
  const users = [
    { email: 'admin@indux.local', name: 'Admin', role: 'admin' as const, password: 'admin123' },
    { email: 'manager@indux.local', name: 'Manager', role: 'manager' as const, password: 'manager123' },
    { email: 'worker@indux.local', name: 'Worker', role: 'worker' as const, password: 'worker123' },
  ];
  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      await User.create({ email: u.email, name: u.name, role: u.role, password: passwordHash, status: 'approved', emailVerified: true, emailVerifiedAt: new Date() });
      console.log('Seeded user', u.email);
    }
  }

  // Project
  let project = await Project.findOne({ name: 'Demo Project' });
  if (!project) {
    project = await Project.create({
      name: 'Demo Project',
      description: 'Sample project for induction',
      steps: [
        { key: 'personal', enabled: true, required: true, order: 1, version: 1 },
        { key: 'uploads', enabled: true, required: true, order: 2, version: 1 },
        { key: 'slides', enabled: true, required: true, order: 3, version: 1 },
        { key: 'quiz', enabled: true, required: true, order: 4, version: 1, pass_mark: 3 },
        { key: 'sign', enabled: true, required: true, order: 5, version: 1 },
      ]
    });
    console.log('Seeded project');
  }

  // Questions
  const qCount = await Question.countDocuments({ projectId: project._id });
  if (qCount < 5) {
    const samples = [
      { text: 'PPE must be worn at all times?', options: ['No', 'Yes'], answerIndex: 1 },
      { text: 'Report hazards to your supervisor?', options: ['No', 'Yes'], answerIndex: 1 },
      { text: 'Can you enter restricted zones?', options: ['Yes', 'No'], answerIndex: 1 },
      { text: 'Alcohol allowed on site?', options: ['Yes', 'No'], answerIndex: 1 },
      { text: 'Use tools as instructed?', options: ['No', 'Yes'], answerIndex: 1 },
    ];
    await Question.insertMany(samples.map(s => ({ ...s, projectId: project!._id })));
    console.log('Seeded questions');
  }
}
