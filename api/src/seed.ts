import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { Project } from './models/Project.js';
import { InductionModule } from './models/InductionModule.js';
import { InductionModuleField } from './models/InductionModuleField.js';
import { Assignment } from './models/Assignment.js';

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
      await User.create({ email: u.email, name: u.name, role: u.role, password: passwordHash });
      console.log('Seeded user', u.email);
    }
  }

  // Project (clean, no induction data)
  let project = await Project.findOne({ name: 'Demo Project' });
  if (!project) {
    project = await Project.create({
      name: 'Demo Project',
      description: 'Sample project for induction module',
      status: 'active',
    });
    console.log('Seeded project');
  }

  // Induction module
  let module = await InductionModule.findOne({ projectId: project._id, type: 'induction' });
  if (!module) {
    module = await InductionModule.create({
      projectId: project._id,
      type: 'induction',
      reviewStatus: 'approved',
      config: {
        steps: ['personal', 'uploads', 'slides', 'quiz', 'sign'],
        slides: [],
        quiz: {
          questions: [
            { question: 'PPE must be worn at all times?', options: ['No', 'Yes'], answerIndex: 1 },
            { question: 'Report hazards to your supervisor?', options: ['No', 'Yes'], answerIndex: 1 },
            { question: 'Alcohol allowed on site?', options: ['Yes', 'No'], answerIndex: 1 },
          ],
        },
        settings: { passMark: 70, randomizeQuestions: false, allowRetry: true },
      },
    });
    console.log('Seeded induction module');
  }

  // Fields
  const fieldCount = await InductionModuleField.countDocuments({ moduleId: module._id });
  if (fieldCount === 0) {
    await InductionModuleField.insertMany([
      { moduleId: module._id, key: 'fullName', label: 'Full Name', type: 'text', required: true, order: 1, step: 'personal' },
      { moduleId: module._id, key: 'dob', label: 'Date of Birth', type: 'date', required: true, order: 2, step: 'personal' },
      { moduleId: module._id, key: 'phone', label: 'Phone', type: 'text', required: false, order: 3, step: 'personal' },
    ]);
    console.log('Seeded induction fields');
  }

  // Assign manager and worker to the project for quick testing
  const manager = await User.findOne({ email: 'manager@indux.local' });
  const worker = await User.findOne({ email: 'worker@indux.local' });
  if (manager) {
    await Assignment.updateOne({ user: manager._id, project: project._id }, { role: 'manager', assignedBy: manager._id }, { upsert: true });
  }
  if (worker) {
    await Assignment.updateOne({ user: worker._id, project: project._id }, { role: 'worker', assignedBy: manager?._id }, { upsert: true });
  }
}

