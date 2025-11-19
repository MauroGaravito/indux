import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import RateReviewIcon from '@mui/icons-material/RateReview';
import GroupIcon from '@mui/icons-material/Group';
import api from '../../utils/api.js';
import AsyncButton from '../../components/AsyncButton.jsx';
import PersonalDetailsSection from '../../components/admin/PersonalDetailsSection.jsx';
import SlidesSection from '../../components/admin/SlidesSection.jsx';
import QuestionsSection from '../../components/admin/QuestionsSection.jsx';

const defaultConfig = {
  steps: ['personal', 'uploads', 'slides', 'quiz', 'sign'],
  slides: [],
  quiz: { questions: [] },
  settings: { passMark: 80, randomizeQuestions: false, allowRetry: true },
};

export default function ModuleEditor() {
  const { projectId, moduleId } = useParams();
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState('');
  const [module, setModule] = useState(null);
  const [moduleConfig, setModuleConfig] = useState(defaultConfig);
  const [fields, setFields] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [tab, setTab] = useState(0);

  const moduleStatus = module?.reviewStatus || 'draft';

  const normalizeConfig = (cfg) => ({
    steps: Array.isArray(cfg?.steps) ? cfg.steps : defaultConfig.steps,
    slides: Array.isArray(cfg?.slides) ? cfg.slides : [],
    quiz: cfg?.quiz && Array.isArray(cfg.quiz.questions) ? { questions: cfg.quiz.questions } : { questions: [] },
    settings: cfg?.settings ? { ...defaultConfig.settings, ...cfg.settings } : { ...defaultConfig.settings },
  });

  useEffect(() => {
    async function loadProject() {
      try {
        const r = await api.get('/projects');
        const found = (r.data || []).find((p) => p._id === projectId);
        setProjectName(found?.name || '');
      } catch {
        setProjectName('');
      }
    }
    loadProject();
  }, [projectId]);

  const loadModule = async () => {
    try {
      const r = await api.get(`/projects/${projectId}/modules/induction`);
      const mod = r.data?.module;
      if (!mod || (moduleId && mod._id !== moduleId)) {
        setModule(null);
        return;
      }
      setModule(mod);
      setModuleConfig(normalizeConfig(mod.config));
      setFields(r.data.fields || []);
    } catch {
      setModule(null);
      setModuleConfig(defaultConfig);
      setFields([]);
    }
  };

  const loadReviews = async () => {
    if (!moduleId) return;
    try {
      const r = await api.get(`/modules/${moduleId}/reviews`);
      setReviews(r.data || []);
    } catch {
      setReviews([]);
    }
  };

  const loadAssignments = async () => {
    try {
      const r = await api.get(`/assignments/project/${projectId}`);
      setAssignments(r.data || []);
    } catch {
      setAssignments([]);
    }
  };

  useEffect(() => {
    loadModule();
    loadReviews();
    loadAssignments();
  }, [projectId, moduleId]);

  const saveModule = async () => {
    if (!moduleId) return;
    // Ensure fields carry a key; generate if missing
    const existingKeys = fields.map((f) => f.key).filter(Boolean);
    const sanitizedFields = fields.map((f, idx) => {
      if (f.key) return f;
      const base = toCamelKey(f.label) || `field${idx + 1}`;
      const unique = makeUniqueKey(base, existingKeys);
      existingKeys.push(unique);
      return { ...f, key: unique };
    });

    const payload = { config: moduleConfig, fields: sanitizedFields };
    const r = await api.put(`/modules/${moduleId}`, payload);
    setModule(r.data?.module || module);
    setFields(r.data?.fields || sanitizedFields);
  };

  const sendForReview = async () => {
    if (!moduleId) return;
    await api.post(`/modules/${moduleId}/reviews`);
    await Promise.all([loadModule(), loadReviews()]);
  };

  const SettingsTab = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <TextField
          label="Pass mark (%)"
          type="number"
          fullWidth
          value={moduleConfig.settings?.passMark ?? 80}
          onChange={(e) => setModuleConfig({ ...moduleConfig, settings: { ...moduleConfig.settings, passMark: Number(e.target.value) } })}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField
          label="Randomize questions"
          select
          fullWidth
          SelectProps={{ native: true }}
          value={moduleConfig.settings?.randomizeQuestions ? 'yes' : 'no'}
          onChange={(e) => setModuleConfig({ ...moduleConfig, settings: { ...moduleConfig.settings, randomizeQuestions: e.target.value === 'yes' } })}
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </TextField>
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField
          label="Allow retry"
          select
          fullWidth
          SelectProps={{ native: true }}
          value={moduleConfig.settings?.allowRetry ? 'yes' : 'no'}
          onChange={(e) => setModuleConfig({ ...moduleConfig, settings: { ...moduleConfig.settings, allowRetry: e.target.value === 'yes' } })}
        >
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </TextField>
      </Grid>
    </Grid>
  );

  if (!module) {
    return (
      <Card elevation={1} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button startIcon={<ArrowBackIcon />} component={RouterLink} to="/admin/projects">
                Back to Projects
              </Button>
              <Typography variant="h6">Module not found</Typography>
            </Stack>
            <Alert severity="warning">No induction module exists for this project. Create one from the Projects page.</Alert>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={1} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Button startIcon={<ArrowBackIcon />} component={RouterLink} to="/admin/projects">Back</Button>
          <Typography variant="h6">Induction Module</Typography>
          <Chip label={`Project: ${projectName || projectId}`} />
          <Chip label={`Status: ${moduleStatus}`} color={moduleStatus === 'approved' ? 'success' : moduleStatus === 'pending' ? 'warning' : 'default'} />
          <Box sx={{ flex: 1 }} />
          <AsyncButton startIcon={<SaveIcon />} variant="outlined" onClick={saveModule}>Save</AsyncButton>
          <AsyncButton startIcon={<SendIcon />} variant="contained" color="secondary" onClick={sendForReview}>Send For Review</AsyncButton>
        </Stack>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid #eee' }}>
          <Tab label="Fields" />
          <Tab label="Slides" />
          <Tab label="Quiz" />
          <Tab label="Settings" />
          <Tab label="Review" />
          <Tab label="Assignments" />
        </Tabs>

        <Box sx={{ mt: 2 }} hidden={tab !== 0}>
          <PersonalDetailsSection fields={fields} onChange={setFields} />
        </Box>

        <Box sx={{ mt: 2 }} hidden={tab !== 1}>
          <SlidesSection slides={moduleConfig.slides} onChange={(slides) => setModuleConfig({ ...moduleConfig, slides })} />
        </Box>

        <Box sx={{ mt: 2 }} hidden={tab !== 2}>
          <QuestionsSection
            questions={moduleConfig.quiz?.questions || []}
            onChange={(qs) => setModuleConfig({ ...moduleConfig, quiz: { questions: qs } })}
          />
        </Box>

        <Box sx={{ mt: 2 }} hidden={tab !== 3}>
          <SettingsTab />
        </Box>

        <Box sx={{ mt: 2 }} hidden={tab !== 4}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <RateReviewIcon color="action" />
              <Typography variant="subtitle2">Reviews</Typography>
            </Stack>
            {reviews.length === 0 && <Alert severity="info">No reviews yet.</Alert>}
            {reviews.length > 0 && (
              <Stack spacing={1}>
                {reviews.map((r) => (
                  <Box key={r._id} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip size="small" label={r.status} color={r.status === 'approved' ? 'success' : r.status === 'declined' ? 'error' : 'default'} />
                      <Typography variant="body2" sx={{ flex: 1 }}>Requested: {new Date(r.createdAt).toLocaleString()}</Typography>
                      {r.reason && <Typography variant="body2" color="text.secondary">Reason: {r.reason}</Typography>}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Stack>
        </Box>

        <Box sx={{ mt: 2 }} hidden={tab !== 5}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <GroupIcon color="action" />
              <Typography variant="subtitle2">Project Assignments</Typography>
            </Stack>
            <List>
              {assignments.map((a) => (
                <ListItemButton key={a._id} sx={{ borderRadius: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}><GroupIcon /></ListItemIcon>
                  <ListItemText primary={`${a?.user?.name || a?.user} - ${a.role}`} secondary={a?.user?.email || ''} />
                </ListItemButton>
              ))}
            </List>
            {!assignments.length && <Alert severity="info">No assignments found for this project.</Alert>}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
  const toCamelKey = (label) => {
    if (!label) return ''
    const clean = label
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9 ]/g, ' ')
      .trim()
    if (!clean) return ''
    const parts = clean.split(/\s+/)
    const [first, ...rest] = parts
    return [first.toLowerCase(), ...rest.map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())].join('')
  }

  const makeUniqueKey = (base, existing) => {
    if (!base) return ''
    if (!existing.includes(base)) return base
    let counter = 2
    let candidate = `${base}${counter}`
    while (existing.includes(candidate)) {
      counter += 1
      candidate = `${base}${counter}`
    }
    return candidate
  }
