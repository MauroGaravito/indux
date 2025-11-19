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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
import { useAuthStore } from '../../store/auth.js';
import LockIcon from '@mui/icons-material/Lock';
import EditIcon from '@mui/icons-material/Edit';

const defaultConfig = {
  steps: ['personal', 'uploads', 'slides', 'quiz', 'sign'],
  slides: [],
  quiz: { questions: [] },
  settings: { passMark: 80, randomizeQuestions: false, allowRetry: true },
};

export default function ModuleEditor({ mode = 'admin' }) {
  const { projectId, moduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [projectName, setProjectName] = useState('');
  const [module, setModule] = useState(null);
  const [moduleConfig, setModuleConfig] = useState(defaultConfig);
  const [fields, setFields] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [tab, setTab] = useState(0);
  const [validationOpen, setValidationOpen] = useState(false);
  const [validationMessages, setValidationMessages] = useState([]);
  const [submitError, setSubmitError] = useState('');

  const moduleStatus = module?.reviewStatus || 'draft';
  const isManagerMode = mode === 'manager';
  const canEditModule = !isManagerMode || ['draft', 'declined'].includes(moduleStatus);
  const isReadOnly = isManagerMode && !canEditModule;
  const isManagerOfProject = useMemo(() => {
    if (!isManagerMode || !user?.sub) return false;
    return assignments.some((a) => String(a?.user?._id || a?.user) === String(user.sub) && a.role === 'manager');
  }, [assignments, isManagerMode, user]);
  const showActions = canEditModule && (!isManagerMode || isManagerOfProject);
  const bannerPalette = {
    draft: 'rgba(0, 0, 0, 0.04)',
    pending: 'rgba(255, 152, 0, 0.16)',
    approved: 'rgba(76, 175, 80, 0.16)',
    declined: 'rgba(244, 67, 54, 0.16)',
  };
  const bannerColor = bannerPalette[moduleStatus] || 'rgba(0, 0, 0, 0.04)';
  const bannerTextColors = {
    draft: 'text.primary',
    pending: 'warning.dark',
    approved: 'success.dark',
    declined: 'error.dark',
  };
  const bannerTextColor = bannerTextColors[moduleStatus] || 'text.primary';
  const bannerLabel = isReadOnly ? 'Read-only Mode' : 'Manager Editing Mode';
  const BannerIcon = isReadOnly ? LockIcon : EditIcon;

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
    if (!canEditModule) return;
    if (!moduleId) return;
    setSubmitError('');
    // Build a request payload that passes backend validation, but keep local state intact (allows drafts with incomplete fields)
    const existingKeys = fields.map((f) => f.key).filter(Boolean);
    const sanitizedFields = fields
      .map((f, idx) => {
        if (!f.key) {
          const base = toCamelKey(f.label) || `field${idx + 1}`;
          const unique = makeUniqueKey(base, existingKeys);
          existingKeys.push(unique);
          return { ...f, key: unique };
        }
        return f;
      })
      // backend requires label/type/key; drop invalid ones for the request (but keep them in UI state)
      .filter((f) => f.key && f.label && String(f.label).trim() && f.type);

    const validSlides = (moduleConfig?.slides || []).filter((s) => s?.fileKey);
    const validQuestions = (moduleConfig?.quiz?.questions || []).filter((q) => {
      const hasText = q?.question && String(q.question).trim();
      const opts = Array.isArray(q?.options) ? q.options : [];
      const answerOk = typeof q?.answerIndex === 'number' && q.answerIndex >= 0 && q.answerIndex < opts.length;
      return hasText && opts.length >= 2 && answerOk;
    });
    const settings = moduleConfig?.settings || {};
    const safeSettings = {
      passMark: typeof settings.passMark === 'number' ? settings.passMark : 80,
      randomizeQuestions: typeof settings.randomizeQuestions === 'boolean' ? settings.randomizeQuestions : false,
      allowRetry: typeof settings.allowRetry === 'boolean' ? settings.allowRetry : true,
    };

    const payload = {
      config: {
        steps: Array.isArray(moduleConfig?.steps) ? moduleConfig.steps : defaultConfig.steps,
        slides: validSlides,
        quiz: { questions: validQuestions },
        settings: safeSettings,
      },
      fields: sanitizedFields,
    };

    try {
      const r = await api.put(`/modules/${moduleId}`, payload);
      // Preserve local state (including drafts), but refresh module metadata
      setModule(r.data?.module || module);
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to save module';
      setSubmitError(typeof msg === 'string' ? msg : 'Failed to save module');
    }
  };

  const validateBeforeReview = () => {
    const errors = [];

    // Module status
    if (module?.reviewStatus && !['draft', 'declined'].includes(module.reviewStatus)) {
      errors.push('Module status must be draft or declined to request a new review.');
    }

    // Fields
    const flds = Array.isArray(fields) ? fields : [];
    flds.forEach((f, idx) => {
      if (!f.label || !String(f.label).trim()) {
        errors.push(`Field ${idx + 1}: label is required`);
      }
      if (!f.key || !String(f.key).trim()) {
        errors.push(`Field ${idx + 1}: key is required`);
      }
      if (!f.type) {
        errors.push(`Field ${idx + 1}: type is required`);
      }
    });

    // Slides
    const slides = moduleConfig?.slides || [];
    if (!slides.length || slides.some((s) => !s?.fileKey)) {
      errors.push('Slides: at least one slide with fileKey is required');
    }

    // Quiz
    const questions = moduleConfig?.quiz?.questions || [];
    if (!questions.length) {
      errors.push('Quiz: at least one question is required');
    } else {
      questions.forEach((q, idx) => {
        if (!q.question || !String(q.question).trim()) {
          errors.push(`Question ${idx + 1}: question text is required`);
        }
        const opts = Array.isArray(q.options) ? q.options : [];
        if (opts.length < 2) {
          errors.push(`Question ${idx + 1}: must have at least 2 options`);
        }
        if (typeof q.answerIndex !== 'number' || q.answerIndex < 0 || q.answerIndex >= opts.length) {
          errors.push(`Question ${idx + 1}: answerIndex is invalid`);
        }
      });
    }

    // Settings
    const settings = moduleConfig?.settings || {};
    if (typeof settings.passMark !== 'number') {
      errors.push('Settings: pass mark is missing');
    }
    if (typeof settings.randomizeQuestions !== 'boolean') {
      errors.push('Settings: randomizeQuestions must be boolean');
    }
    if (typeof settings.allowRetry !== 'boolean') {
      errors.push('Settings: allowRetry must be boolean');
    }

    return errors;
  };

  const sendForReview = async () => {
    if (!canEditModule) return;
    if (!moduleId) return;
    setSubmitError('');
    const errors = validateBeforeReview();
    if (errors.length) {
      setValidationMessages(errors);
      setValidationOpen(true);
      return;
    }
    try {
      await api.post(`/modules/${moduleId}/reviews`);
      await Promise.all([loadModule(), loadReviews()]);
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to send for review';
      setSubmitError(typeof msg === 'string' ? msg : 'Failed to send for review');
    }
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
    <>
      {isManagerMode && (
        <Box
          sx={{
            mb: 2,
            p: 2,
            borderRadius: 2,
            bgcolor: bannerColor,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <BannerIcon fontSize="small" sx={{ color: bannerTextColor }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: bannerTextColor }}>
            {bannerLabel}
          </Typography>
          <Chip label={`Status: ${moduleStatus}`} size="small" color={moduleStatus === 'pending' ? 'warning' : moduleStatus === 'approved' ? 'success' : moduleStatus === 'declined' ? 'error' : 'default'} />
          {isReadOnly && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Updates are disabled for pending/approved modules.
            </Typography>
          )}
        </Box>
      )}
      <Card elevation={1} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <CardContent>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {typeof submitError === 'string' ? submitError : 'Unexpected error'}
            </Alert>
          )}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Button startIcon={<ArrowBackIcon />} component={RouterLink} to={mode === 'manager' ? '/manager/projects' : '/admin/projects'}>Back</Button>
            <Typography variant="h6">Induction Module</Typography>
            <Chip label={`Project: ${projectName || projectId}`} />
            <Chip label={`Status: ${moduleStatus}`} color={moduleStatus === 'approved' ? 'success' : moduleStatus === 'pending' ? 'warning' : 'default'} />
            {isReadOnly && <Chip label="Read-only" color="info" />}
            <Box sx={{ flex: 1 }} />
            {showActions && (
              <>
                <AsyncButton startIcon={<SaveIcon />} variant="outlined" onClick={saveModule}>Save</AsyncButton>
                <AsyncButton startIcon={<SendIcon />} variant="contained" color="secondary" onClick={sendForReview}>Send For Review</AsyncButton>
              </>
            )}
          </Stack>
          {isManagerMode && !isManagerOfProject && (
            <Alert severity="warning" sx={{ mb: 2 }}>You are not assigned as manager to this project. Module is read-only.</Alert>
          )}

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid #eee' }}>
            <Tab label="Fields" />
            <Tab label="Slides" />
            <Tab label="Quiz" />
            <Tab label="Settings" />
            <Tab label="Review" />
            <Tab label="Assignments" />
          </Tabs>

          <Box sx={{ mt: 2 }} hidden={tab !== 0}>
            <PersonalDetailsSection fields={fields} onChange={isReadOnly ? () => {} : setFields} readOnly={isReadOnly} />
          </Box>

          <Box sx={{ mt: 2 }} hidden={tab !== 1}>
            <SlidesSection slides={moduleConfig.slides} onChange={isReadOnly ? () => {} : (slides) => setModuleConfig({ ...moduleConfig, slides })} readOnly={isReadOnly} />
          </Box>

          <Box sx={{ mt: 2 }} hidden={tab !== 2}>
            <QuestionsSection
              questions={moduleConfig.quiz?.questions || []}
              onChange={isReadOnly ? () => {} : (qs) => setModuleConfig({ ...moduleConfig, quiz: { questions: qs } })}
              readOnly={isReadOnly}
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
      <ValidationDialog open={validationOpen} onClose={() => setValidationOpen(false)} messages={validationMessages} />
    </>
  );
}

// Validation dialog
function ValidationDialog({ open, onClose, messages }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Validation Required</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Please complete the following before submitting the module for review:
        </Typography>
        <Stack component="ul" spacing={1} sx={{ pl: 2, mb: 1 }}>
          {(messages || []).map((m, idx) => (
            <Typography component="li" variant="body2" key={idx}>
              • {m}
            </Typography>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>OK</Button>
      </DialogActions>
    </Dialog>
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


