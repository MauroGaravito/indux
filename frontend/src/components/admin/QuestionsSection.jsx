import React from "react"
import {
  Card,
  CardHeader,
  CardContent,
  Stack,
  Typography,
  TextField,
  IconButton,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper
} from "@mui/material"
import QuizIcon from "@mui/icons-material/Quiz"
import DeleteIcon from "@mui/icons-material/Delete"
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"

export default function QuestionsSection({ questions, onChange, settings, onSettingsChange }) {
  const list = Array.isArray(questions) ? questions : []
  const accent = '#1976d2'

  const setQ = (idx, patch) => {
    onChange(list.map((q, i) => (i === idx ? { ...q, ...patch } : q)))
  }
  const add = () => onChange([...list, { question: '', options: ['', ''], answerIndex: 0 }])
  const remove = (idx) => onChange(list.filter((_, i) => i !== idx))
  const setAnswer = (idx, aidx, val) => setQ(idx, { options: list[idx].options.map((a, i) => (i === aidx ? val : a)) })
  const addAnswer = (idx) => setQ(idx, { options: [...list[idx].options, ''] })

  return (
    <Card elevation={1} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <CardHeader
        avatar={<QuizIcon sx={{ color: accent }} />}
        title={<Typography variant="h6" sx={{ fontWeight: 600 }}>Quiz</Typography>}
        subheader={<Typography variant="body2" color="text.secondary">Multiple choice questions stored in module.config.quiz</Typography>}
        sx={{ pb: 0 }}
      />
      <CardContent>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Pass mark (%)"
              type="number"
              value={settings?.passMark ?? 80}
              onChange={(e) => onSettingsChange({ ...settings, passMark: Number(e.target.value) })}
            />
            <TextField
              select
              SelectProps={{ native: true }}
              label="Randomize questions"
              value={settings?.randomizeQuestions ? 'yes' : 'no'}
              onChange={(e) => onSettingsChange({ ...settings, randomizeQuestions: e.target.value === 'yes' })}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </TextField>
            <TextField
              select
              SelectProps={{ native: true }}
              label="Allow retry"
              value={settings?.allowRetry ? 'yes' : 'no'}
              onChange={(e) => onSettingsChange({ ...settings, allowRetry: e.target.value === 'yes' })}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </TextField>
          </Stack>

          <Button startIcon={<AddCircleOutlineIcon />} variant="outlined" onClick={add} sx={{ textTransform: 'none', alignSelf: 'flex-start' }}>
            Add Question
          </Button>

          {list.map((q, idx) => (
            <Paper key={idx} variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: 'divider', '&:hover': { borderColor: accent } }}>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TextField fullWidth label={`Question ${idx + 1}`} value={q.question} onChange={(e) => setQ(idx, { question: e.target.value })} />
                  <IconButton color="error" onClick={() => remove(idx)} aria-label="Remove question"><DeleteIcon /></IconButton>
                </Stack>
                <Typography variant="subtitle2">Answers</Typography>
                {q.options.map((a, aidx) => (
                  <Stack key={aidx} direction="row" alignItems="center" spacing={1}>
                    <RadioGroup row value={q.answerIndex} onChange={(e) => setQ(idx, { answerIndex: Number(e.target.value) })}>
                      <FormControlLabel value={aidx} control={<Radio />} label="" />
                    </RadioGroup>
                    <TextField fullWidth value={a} onChange={(e) => setAnswer(idx, aidx, e.target.value)} />
                  </Stack>
                ))}
                <Button size="small" onClick={() => addAnswer(idx)} sx={{ textTransform: 'none', alignSelf: 'flex-start' }}>Add Answer Option</Button>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}
