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
import { useTheme } from "@mui/material/styles"
import QuizIcon from "@mui/icons-material/Quiz"
import DeleteIcon from "@mui/icons-material/Delete"
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"

export default function QuestionsSection({ questions, onChange, readOnly = false }) {
  const list = Array.isArray(questions) ? questions : []
  const theme = useTheme()
  const accent = theme.palette.primary.main

  const setQ = (idx, patch) => {
    if (readOnly) return
    onChange(list.map((q, i) => (i === idx ? { ...q, ...patch } : q)))
  }
  const add = () => {
    if (readOnly) return
    onChange([...list, { question: '', options: ['', ''], answerIndex: 0 }])
  }
  const remove = (idx) => {
    if (readOnly) return
    onChange(list.filter((_, i) => i !== idx))
  }
  const setAnswer = (idx, aidx, val) => setQ(idx, { options: list[idx].options.map((a, i) => (i === aidx ? val : a)) })
  const addAnswer = (idx) => setQ(idx, { options: [...list[idx].options, ''] })

  return (
    <Card elevation={1} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <CardHeader
        avatar={<QuizIcon sx={{ color: accent }} />}
        title={<Typography variant="h6" sx={{ fontWeight: 600 }}>Quiz</Typography>}
        subheader={<Typography variant="body2" color="text.secondary">Manage questions. Settings live in the Settings tab.</Typography>}
        sx={{ pb: 0 }}
      />
      <CardContent>
        <Stack spacing={2}>
          <Button startIcon={<AddCircleOutlineIcon />} variant="outlined" onClick={add} disabled={readOnly} sx={{ textTransform: 'none', alignSelf: 'flex-start' }}>
            Add Question
          </Button>

          {list.map((q, idx) => (
            <Paper key={idx} variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: 'divider', '&:hover': { borderColor: accent } }}>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TextField fullWidth label={`Question ${idx + 1}`} value={q.question} onChange={(e) => setQ(idx, { question: e.target.value })} disabled={readOnly} />
                  <IconButton color="error" onClick={() => remove(idx)} aria-label="Remove question" disabled={readOnly}><DeleteIcon /></IconButton>
                </Stack>
                <Typography variant="subtitle2">Answers</Typography>
                {q.options.map((a, aidx) => (
                  <Stack key={aidx} direction="row" alignItems="center" spacing={1}>
                    <RadioGroup row value={q.answerIndex} onChange={(e) => setQ(idx, { answerIndex: Number(e.target.value) })} disabled={readOnly}>
                      <FormControlLabel value={aidx} control={<Radio disabled={readOnly} />} label="" />
                    </RadioGroup>
                    <TextField fullWidth value={a} onChange={(e) => setAnswer(idx, aidx, e.target.value)} disabled={readOnly} />
                  </Stack>
                ))}
                <Button size="small" onClick={() => addAnswer(idx)} sx={{ textTransform: 'none', alignSelf: 'flex-start' }} disabled={readOnly}>Add Answer Option</Button>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}
