import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { Project } from './models/Project.js';
import { InductionModule } from './models/InductionModule.js';
import { InductionModuleField } from './models/InductionModuleField.js';
import { Assignment } from './models/Assignment.js';

export async function seedAll() {
  // Users
  const users = [
    { email: 'admin@indux.local', name: 'Admin', role: 'admin' as const, password: 'admin123', position: 'Administrator', phone: '+1-555-0001', companyName: 'Indux HQ', avatarUrl: '' },
    { email: 'manager@indux.local', name: 'Manager', role: 'manager' as const, password: 'manager123', position: 'Site Manager', phone: '+1-555-0002', companyName: 'Indux HQ', avatarUrl: '' },
    { email: 'worker@indux.local', name: 'Worker', role: 'worker' as const, password: 'worker123', position: 'Electrician', phone: '+1-555-0003', companyName: 'Subcontractor LLC', avatarUrl: '' },
  ];
  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      await User.create({
        email: u.email,
        name: u.name,
        role: u.role,
        password: passwordHash,
        position: u.position,
        phone: u.phone,
        companyName: u.companyName,
        avatarUrl: u.avatarUrl,
      });
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
      { moduleId: module._id, key: 'email', label: 'Email', type: 'text', required: true, order: 2, step: 'personal' },
      { moduleId: module._id, key: 'phone', label: 'Phone', type: 'text', required: false, order: 3, step: 'personal' },
      { moduleId: module._id, key: 'position', label: 'Position', type: 'text', required: false, order: 4, step: 'personal' },
      { moduleId: module._id, key: 'companyName', label: 'Company Name', type: 'text', required: false, order: 5, step: 'personal' },
      {
        moduleId: module._id,
        key: 'medicalCondition',
        label: 'Medical Condition',
        type: 'select',
        required: true,
        order: 6,
        step: 'personal',
        options: ['Yes', 'No'],
      },
      {
        moduleId: module._id,
        key: 'medicalConditionDetails',
        label: 'Medical Condition Details',
        type: 'textarea',
        required: false,
        order: 7,
        step: 'personal',
        visibleIf: { fieldKey: 'medicalCondition', equals: 'Yes' },
      },
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

