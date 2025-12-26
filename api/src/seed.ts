import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { Project } from './models/Project.js';
import { InductionModule } from './models/InductionModule.js';
import { InductionModuleField } from './models/InductionModuleField.js';
import { Assignment } from './models/Assignment.js';
import { InspectionTemplate } from './models/InspectionTemplate.js';
import { InductionTemplate } from './models/InductionTemplate.js';

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
      location: { lat: -33.865143, lng: 151.2099 },
      mapZoom: 14,
      pointsOfInterest: [
        { label: 'Site office', lat: -33.865143, lng: 151.2099, color: '#FF6F00' },
      ],
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

  // Default induction template
  const defaultInductionTemplate = {
    name: 'Indux Induct Template',
    description: 'Starter induction template with common WHS personal data fields and quiz.',
    type: 'induction' as const,
    config: {
      steps: ['personal', 'uploads', 'slides', 'quiz', 'sign'],
      slides: [],
      quiz: {
        questions: [
          { question: 'All personnel must sign in at the site office?', options: ['No', 'Yes'], answerIndex: 1 },
          { question: 'Report hazards immediately to your supervisor?', options: ['No', 'Yes'], answerIndex: 1 },
          { question: 'PPE must be worn in designated areas?', options: ['No', 'Yes'], answerIndex: 1 },
        ],
      },
      settings: { passMark: 80, randomizeQuestions: false, allowRetry: true },
    },
    fields: [
      { key: 'fullName', label: 'Full Name', type: 'text', required: true, order: 1, step: 'personal' },
      { key: 'email', label: 'Email', type: 'text', required: true, order: 2, step: 'personal' },
      { key: 'phone', label: 'Phone', type: 'text', required: false, order: 3, step: 'personal' },
      { key: 'position', label: 'Position', type: 'text', required: false, order: 4, step: 'personal' },
      { key: 'companyName', label: 'Company Name', type: 'text', required: false, order: 5, step: 'personal' },
      {
        key: 'medicalCondition',
        label: 'Medical Condition',
        type: 'select',
        required: true,
        order: 6,
        step: 'personal',
        options: ['Yes', 'No'],
      },
      {
        key: 'medicalConditionDetails',
        label: 'Medical Condition Details',
        type: 'textarea',
        required: false,
        order: 7,
        step: 'personal',
        visibleIf: { fieldKey: 'medicalCondition', equals: 'Yes' },
      },
    ],
  };

  const templateExists = await InductionTemplate.exists({ name: defaultInductionTemplate.name });
  if (!templateExists) {
    await InductionTemplate.create(defaultInductionTemplate);
    console.log('Seeded induction template', defaultInductionTemplate.name);
  }

  // Inspection templates
  const inspectionTemplates = [
    {
      name: 'PPE Inspection',
      description: 'Daily inspection to verify personal protective equipment is present and in good condition.',
      requirePOI: false,
      requireSignature: true,
      categories: [
        {
          key: 'ppe',
          label: 'PPE Checks',
          order: 1,
        },
      ],
      items: [
        {
          key: 'helmet',
          categoryKey: 'ppe',
          label: 'Helmet condition',
          photoRequiredOnFail: true,
          notesRequiredOnFail: true,
        },
        {
          key: 'highVis',
          categoryKey: 'ppe',
          label: 'High-vis worn correctly',
          notesRequiredOnFail: true,
        },
        {
          key: 'boots',
          categoryKey: 'ppe',
          label: 'Safety boots worn',
          notesRequiredOnFail: true,
        },
        {
          key: 'eyeProtection',
          categoryKey: 'ppe',
          label: 'Eye protection available',
          notesRequiredOnFail: true,
        },
      ],
    },
    {
      name: 'Pre-Start Heavy Machinery Inspection',
      description: 'Pre-start safety inspection for plant and heavy machinery.',
      requirePOI: false,
      requireSignature: true,
      categories: [
        {
          key: 'equipment',
          label: 'Equipment Checklist',
          order: 1,
        },
      ],
      items: [
        {
          key: 'leaks',
          categoryKey: 'equipment',
          label: 'No visible leaks',
          photoRequiredOnFail: true,
        },
        {
          key: 'emergencyStop',
          categoryKey: 'equipment',
          label: 'Emergency stop functional',
          photoRequiredOnFail: true,
        },
        {
          key: 'guards',
          categoryKey: 'equipment',
          label: 'Guards in place',
          photoRequiredOnFail: true,
          notesRequiredOnFail: true,
        },
        {
          key: 'alarms',
          categoryKey: 'equipment',
          label: 'Warning alarms operational',
          notesRequiredOnFail: true,
        },
      ],
    },
    {
      name: 'Site Safety Inspection (HazCheck)',
      description: 'General site safety inspection to identify hazards and unsafe conditions.',
      requirePOI: true,
      requireSignature: true,
      categories: [
        {
          key: 'site',
          label: 'Site Conditions',
          order: 1,
        },
      ],
      items: [
        {
          key: 'walkways',
          categoryKey: 'site',
          label: 'Walkways clear',
          photoRequiredOnFail: true,
          notesRequiredOnFail: true,
        },
        {
          key: 'signage',
          categoryKey: 'site',
          label: 'Adequate signage installed',
          photoRequiredOnFail: true,
        },
        {
          key: 'hazards',
          categoryKey: 'site',
          label: 'No uncontrolled hazards present',
          photoRequiredOnFail: true,
          notesRequiredOnFail: true,
          enableRiskLevel: true,
        },
      ],
    },
    {
      name: 'First Aid Kit Audit',
      description: 'Periodic audit of first aid kits and medical supplies.',
      requirePOI: false,
      requireSignature: false,
      categories: [
        {
          key: 'firstAid',
          label: 'First Aid Kit',
          order: 1,
        },
      ],
      items: [
        {
          key: 'stocked',
          categoryKey: 'firstAid',
          label: 'Kit fully stocked',
          notesRequiredOnFail: true,
        },
        {
          key: 'expiry',
          categoryKey: 'firstAid',
          label: 'Items within expiry date',
          notesRequiredOnFail: true,
        },
        {
          key: 'accessible',
          categoryKey: 'firstAid',
          label: 'Kit easily accessible',
          notesRequiredOnFail: true,
        },
      ],
    },
    {
      name: 'High-Risk Work Permit',
      description: 'Pre-task safety inspection for high-risk activities such as hot works or working at heights.',
      requirePOI: true,
      requireSignature: true,
      categories: [
        {
          key: 'highRisk',
          label: 'High-Risk Controls',
          order: 1,
        },
      ],
      items: [
        {
          key: 'swms',
          categoryKey: 'highRisk',
          label: 'SWMS reviewed and approved',
          notesRequiredOnFail: true,
        },
        {
          key: 'extinguisher',
          categoryKey: 'highRisk',
          label: 'Fire extinguisher available',
          photoRequiredOnFail: true,
        },
        {
          key: 'fallProtection',
          categoryKey: 'highRisk',
          label: 'Fall protection in place',
          photoRequiredOnFail: true,
          notesRequiredOnFail: true,
          enableRiskLevel: true,
        },
      ],
    },
  ];

  for (const template of inspectionTemplates) {
    const exists = await InspectionTemplate.exists({ name: template.name });
    if (!exists) {
      await InspectionTemplate.create(template);
      console.log('Seeded inspection template', template.name);
    }
  }
}

