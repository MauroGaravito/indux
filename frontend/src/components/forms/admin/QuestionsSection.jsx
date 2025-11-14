import React from 'react'
import {
  Box,
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
  Paper,
  Divider
} from '@mui/material'
import QuizIcon from '@mui/icons-material/Quiz'
import DeleteIcon from '@mui/icons-material/Delete'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'

export default function QuestionsSection({ value, onChange }) {
  const questions = value || []
  const setQ = (idx, patch) => {
    const next = questions.map((q,i)=> i===idx ? { ...q, ...patch } : q)
    onChange(next)
  }
  const add = () => onChange([ ...questions, { questionText: '', answers: ['',''], correctIndex: 0 } ])
  const remove = (idx) => onChange(questions.filter((_,i)=> i!==idx))
  const setAnswer = (idx, aidx, val) => setQ(idx, { answers: questions[idx].answers.map((a,i)=> i===aidx ? val : a) })
  const addAnswer = (idx) => setQ(idx, { answers: [...questions[idx].answers, ''] })

  const accent = '#1976d2'

  return (
    <Card elevation={1} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <CardHeader
        avatar={
          <Box sx={{ bgcolor: 'rgba(25,118,210,0.1)', color: accent, width: 36, height: 36, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <QuizIcon fontSize="small" />
          </Box>
        }
        title={<Typography variant="h6" sx={{ fontWeight: 600 }}>Section 4 — Test Questions</Typography>}
        subheader={<Typography variant="body2" color="text.secondary">Add multiple-choice questions and select the correct answer</Typography>}
        sx={{ pb: 0 }}
      />
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Button startIcon={<AddCircleOutlineIcon />} variant="outlined" onClick={add} sx={{ textTransform: 'none' }}>
              Add Question
            </Button>
          </Box>

          {questions.map((q, idx) => (
            <Paper key={idx} variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: 'divider', '&:hover': { borderColor: accent } }}>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TextField fullWidth label={`Question ${idx+1}`} value={q.questionText} onChange={e=> setQ(idx, { questionText: e.target.value })} />
                  <IconButton color="error" onClick={()=> remove(idx)} aria-label="Remove question"><DeleteIcon /></IconButton>
                </Stack>
                <Divider />
                <Typography variant="subtitle2">Answers</Typography>
                {q.answers.map((a, aidx) => (
                  <Stack key={aidx} direction="row" alignItems="center" spacing={1}>
                    <RadioGroup row value={q.correctIndex} onChange={(e)=> setQ(idx, { correctIndex: Number(e.target.value) })}>
                      <FormControlLabel value={aidx} control={<Radio />} label="" />
                    </RadioGroup>
                    <TextField fullWidth value={a} onChange={e=> setAnswer(idx, aidx, e.target.value)} />
                  </Stack>
                ))}
                <Box>
                  <Button size="small" onClick={()=> addAnswer(idx)} sx={{ textTransform: 'none' }}>Add Answer Option</Button>
                </Box>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}

