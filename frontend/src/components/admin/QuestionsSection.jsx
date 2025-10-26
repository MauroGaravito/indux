import React from 'react'
import { Stack, Typography, TextField, IconButton, Button, RadioGroup, FormControlLabel, Radio } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'

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

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Section 4 – Test Questions</Typography>
      <Button variant="outlined" onClick={add}>Add Question</Button>
      {questions.map((q, idx) => (
        <Stack key={idx} spacing={1} sx={{ border:'1px solid #ddd', p:2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <TextField fullWidth label={`Question ${idx+1}`} value={q.questionText} onChange={e=> setQ(idx, { questionText: e.target.value })} />
            <IconButton color="error" onClick={()=> remove(idx)}><DeleteIcon /></IconButton>
          </Stack>
          <Typography variant="subtitle2">Answers</Typography>
          {q.answers.map((a, aidx) => (
            <Stack key={aidx} direction="row" alignItems="center" spacing={1}>
              <RadioGroup row value={q.correctIndex} onChange={(e)=> setQ(idx, { correctIndex: Number(e.target.value) })}>
                <FormControlLabel value={aidx} control={<Radio />} label="" />
              </RadioGroup>
              <TextField fullWidth value={a} onChange={e=> setAnswer(idx, aidx, e.target.value)} />
            </Stack>
          ))}
          <Button size="small" onClick={()=> addAnswer(idx)}>Add Answer Option</Button>
        </Stack>
      ))}
    </Stack>
  )
}

