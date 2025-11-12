import React, { useEffect, useMemo, useState } from 'react'
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]import {
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  Alert, Button, Paper, Stack, Typography, Tabs, Tab, Chip, Dialog, DialogTitle,
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  DialogContent, DialogActions, TextField, Grid, Box, Divider, List, ListItem, ListItemText,
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  Table, TableBody, TableCell, TableHead, TableRow, Tooltip, MenuItem
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]} from '@mui/material'
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]import GroupIcon from '@mui/icons-material/Group'
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]import DownloadIcon from '@mui/icons-material/Download'
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]import DescriptionIcon from '@mui/icons-material/Description'
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]import SlideshowIcon from '@mui/icons-material/Slideshow'
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]import ImageIcon from '@mui/icons-material/Image'
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]import api from '../utils/api.js'
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]import { presignGet } from '../utils/upload.js'
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]import AsyncButton from '../components/AsyncButton.jsx'
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]import { useAuthStore } from '../store/auth.js'
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]import { notifyError, notifySuccess } from '../notifications/store.js'
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]function StatusChip({ status }) {
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const color = status === 'approved' ? 'success' : status === 'declined' ? 'error' : status === 'cancelled' ? 'default' : 'warning'
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const label = status ? (status === 'cancelled' ? 'Cancelled' : status.charAt(0).toUpperCase() + status.slice(1)) : 'Pending'
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  return <Chip size="small" color={color} label={label} />
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]}
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]// Project Configuration viewer with tabs
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]function ProjectConfigViewer({ config }) {
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [tab, setTab] = React.useState(0)
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const cfg = config || {}
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const pinfoAll = cfg.projectInfo || {}
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const mapKey = pinfoAll?.projectMapKey || pinfoAll?.mapKey || ''
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [projectMapUrl, setProjectMapUrl] = React.useState('')
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  React.useEffect(() => {
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]    let cancelled = false
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]    async function load() {
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]      try {
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]        if (!mapKey) { setProjectMapUrl(''); return }
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]        if (/^https?:/i.test(mapKey)) { setProjectMapUrl(mapKey); return }
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]        const { url } = await presignGet(mapKey)
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]        if (!cancelled) setProjectMapUrl(url || '')
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]      } catch (_) {
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]        if (!cancelled) setProjectMapUrl(mapKey ? `/${mapKey}` : '')
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]      }
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]    }
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]    load()
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]    return () => { cancelled = true }
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  }, [mapKey])
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const hasProjectInfo = !!cfg.projectInfo && Object.keys(cfg.projectInfo || {}).length > 0
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const hasPersonal = !!cfg.personalDetails && Array.isArray(cfg.personalDetails?.fields) && cfg.personalDetails.fields.length > 0
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const slides = cfg.slides || cfg.materials
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const uploads = cfg?.uploads || cfg?.files
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const hasSlides = !!slides && ((Array.isArray(slides) && slides.length > 0) || (!!slides && Object.keys(slides).length > 0))
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]    || (Array.isArray(uploads) && uploads.length > 0)
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const hasQuestions = Array.isArray(cfg.questions) && cfg.questions.length > 0
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const tabs = [
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]    hasProjectInfo && { key: 'info', label: 'Project Info' },
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]    hasPersonal && { key: 'personal', label: 'Personal Details' },
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]    hasSlides && { key: 'slides', label: 'Slides & Files' },
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]    hasQuestions && { key: 'questions', label: 'Questions' }
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  ].filter(Boolean)
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const effectiveIndex = Math.min(tab, Math.max(0, tabs.length - 1))
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const doExport = () => {
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]    try {
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]      const blob = new Blob([JSON.stringify(cfg, null, 2)], { type: 'application/json' })
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]      const url = URL.createObjectURL(blob)
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]      const a = document.createElement('a')
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]      a.href = url
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]      a.download = 'project-config.json'
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]      document.body.appendChild(a)
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]      a.click()
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]      document.body.removeChild(a)
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]      URL.revokeObjectURL(url)
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]    } catch (_) {}
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  }
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  return (
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]    <Box sx={{ py: 1 }}>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]        <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>Project Configuration</Typography>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]        <Button size="small" startIcon={<DownloadIcon />} onClick={doExport}>Export JSON</Button>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]      </Box>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]      <Tabs value={effectiveIndex} onChange={(_,v)=> setTab(v)} sx={{ borderBottom: '1px solid #eee' }} variant="scrollable" scrollButtons allowScrollButtonsMobile>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]        {tabs.map((t, idx) => (<Tab key={t.key} label={t.label} value={idx} />))}
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]      </Tabs>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]      <Box sx={{ mt: 2 }}>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]        {tabs[effectiveIndex]?.key === 'info' && (
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]          <Paper variant="outlined" sx={{ p: 2, maxHeight: '60vh', overflowY: 'auto' }}>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]            {(() => {
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              const pinfo = cfg.projectInfo || {}
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              const mapKey = pinfo?.projectMapKey || pinfo?.mapKey
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              return (
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                <>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  {mapKey ? (
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    <Box sx={{ mb: 2 }}>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                      <Box component="img" src={projectMapUrl || (mapKey ? `/${mapKey}` : '')} alt="Project Map" sx={{ width: '100%', maxWidth: 300, borderRadius: 1 }} />
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>Map key: {String(mapKey)}</Typography>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    </Box>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  ) : null}
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  {Object.keys(pinfo).length ? (
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    <Table size="small">
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                      <TableBody>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                        {Object.entries(pinfo).map(([k, v]) => (
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                          <TableRow key={k}>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                            <TableCell sx={{ width: '35%' }}><Typography variant="subtitle2">{String(k)}</Typography></TableCell>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                            <TableCell>{typeof v === 'object' ? JSON.stringify(v) : String(v ?? '')}</TableCell>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                          </TableRow>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                        ))}
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                      </TableBody>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    </Table>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  ) : (
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    <Typography color="text.secondary">No data available</Typography>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  )}
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                </>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              )
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]            })()}
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]          </Paper>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]        )}
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]        {tabs[effectiveIndex]?.key === 'personal' && (
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]          <Paper variant="outlined" sx={{ p: 2, maxHeight: '60vh', overflowY: 'auto' }}>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]            {Array.isArray(cfg.personalDetails?.fields) && cfg.personalDetails.fields.length ? (
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              <Table size="small">
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                <TableHead>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  <TableRow>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    <TableCell>Label</TableCell>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    <TableCell>Type</TableCell>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    <TableCell>Required</TableCell>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  </TableRow>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                </TableHead>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                <TableBody>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  {cfg.personalDetails.fields.map((f, idx) => (
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    <TableRow key={idx}>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                      <TableCell>{f.label || f.name || '-'}</TableCell>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                      <TableCell>{f.type || '-'}</TableCell>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                      <TableCell>{f.required ? <Chip size="small" color="success" label="Required" /> : <Chip size="small" label="Optional" />}</TableCell>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    </TableRow>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  ))}
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                </TableBody>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              </Table>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]            ) : (
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              <Typography color="text.secondary">No data available</Typography>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]            )}
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]          </Paper>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]        )}
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]        {tabs[effectiveIndex]?.key === 'slides' && (
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]          <Paper variant="outlined" sx={{ p: 2, maxHeight: '60vh', overflowY: 'auto' }}>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]            {(() => {
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              const toArray = (v) => Array.isArray(v) ? v : (v && typeof v === 'object' ? Object.values(v) : [])
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              const raw = [
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                ...toArray(cfg.slides || cfg.materials),
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                ...toArray(cfg.uploads),
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                ...toArray(cfg.files)
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              ]
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              const norm = raw.map((item) => {
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                if (typeof item === 'string') {
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  const key = item
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  const name = key.split('/').pop() || key
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  const url = `/${key}`
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  return { key, name, url }
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                }
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                const key = item?.key || item?.path || item?.url || ''
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                const name = item?.name || item?.title || (typeof key === 'string' ? (key.split('/').pop() || key) : 'file')
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                const url = item?.url || (item?.key ? `/${item.key}` : (typeof key === 'string' ? `/${key}` : ''))
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                const type = item?.type || item?.mime
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                return { key, name, url, type }
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              }).filter((f) => f && (f.url || f.key))
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              if (!norm.length) return <Typography color="text.secondary">No files uploaded</Typography>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              const ext = (s) => {
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                try { return String(s || '').split('?')[0].split('#')[0].split('.').pop().toLowerCase() } catch { return '' }
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              }
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              const isImage = (s, t) => ['png','jpg','jpeg','webp','gif','bmp'].includes(ext(s)) || (typeof t === 'string' && t.startsWith('image'))
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              const iconFor = (s) => {
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                const e = ext(s)
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                if (['pdf'].includes(e)) return <PictureAsPdfIcon sx={{ fontSize: 48, color: 'error.main' }} />
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                if (['ppt','pptx','key'].includes(e)) return <SlideshowIcon sx={{ fontSize: 48, color: 'warning.main' }} />
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                if (['doc','docx','txt','rtf','csv','xls','xlsx'].includes(e)) return <DescriptionIcon sx={{ fontSize: 48, color: 'info.main' }} />
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                return <InsertDriveFileIcon sx={{ fontSize: 42, color: 'text.secondary' }} />
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              }
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              const isSlidesKey = (k) => /^slides\//.test(String(k || ''))
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              const displayName = (f) => f?.name || f?.title || (isSlidesKey(f?.key) ? 'Slides' : ((f?.key || '').split('/').pop() || 'file'))
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              const openItem = async (f) => {
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                try {
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  if (f?.key && isSlidesKey(f.key)) {
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    const e = ext(f?.name) || ext(f?.title) || ext(f?.url) || 'pptx'
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    const n = displayName(f) || 'Slides'
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    const params = new URLSearchParams({ key: f.key, name: n, ext: e })
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    window.open(`/slides-viewer?${params.toString()}`, '_blank', 'noopener,noreferrer')
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    return
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  }
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  if (f?.url) { window.open(f.url, '_blank', 'noopener,noreferrer'); return }
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  if (f?.key) {
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    const { url } = await presignGet(f.key)
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    if (url) window.open(url, '_blank', 'noopener,noreferrer')
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  }
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                } catch (_) {}
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              }
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              return (
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                <Box>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                <Grid container spacing={2}>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  {norm.map((f, idx) => (
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    <Grid key={`${f.key || f.url || idx}-${idx}`} item xs={12} sm={6} md={4} lg={3}>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, height: '100%' }}>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                          <Box sx={{ width: 72, height: 72, borderRadius: 1, border: '1px solid', borderColor: 'divider', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1.5 }}>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                            {isImage(f.url || f.key, f.type) ? (
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                              <Box component="img" src={f.url} alt={f.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                            ) : (
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                              iconFor(f.url || f.key)
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                            )}
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                          </Box>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                          <Box sx={{ minWidth: 0, flex: 1 }}>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                            <Typography variant="subtitle2" noWrap title={displayName(f)}>{displayName(f)}</Typography>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                              <Button size="small" variant="outlined" onClick={()=> openItem(f)}>Open</Button>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                            </Stack>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                          </Box>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                        </Box>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                      </Paper>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    </Grid>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  ))}
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                </Grid>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                <List>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  {norm.map((f, idx) => {
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    const url = f?.url || ''
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    const type = f?.type || ext(f?.name) || ext(url) || (f?.key ? ext(f.key) : '-')
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    const title = displayName(f)
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    return (
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                      <ListItem key={idx} secondaryAction={<Button size="small" onClick={()=> openItem(f)}>Open</Button>}>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                        <ListItemText primary={title} secondary={`Type: ${type}${(url || f?.key) ? ' • link' : ''}`} />
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                      </ListItem>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    )
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  })}
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                </List>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                </Box>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              )
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]            })()}
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]          </Paper>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]        )}
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]        {tabs[effectiveIndex]?.key === 'questions' && (
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]          <Paper variant="outlined" sx={{ p: 2, maxHeight: '60vh', overflowY: 'auto' }}>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]            {Array.isArray(cfg.questions) && cfg.questions.length ? (
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              <Table size="small">
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                <TableHead>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  <TableRow>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    <TableCell>Question</TableCell>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    <TableCell>Type</TableCell>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    <TableCell>Correct Answer(s)</TableCell>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  </TableRow>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                </TableHead>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                <TableBody>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  {cfg.questions.map((q, idx) => {
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    const qText = q?.text || q?.question || `Q${idx+1}`
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    const qType = q?.type || (Array.isArray(q?.options) ? 'multiple-choice' : '-')
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    const correct = q?.correct ?? q?.answer ?? q?.answers
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    let correctText = '-'
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    if (Array.isArray(correct)) correctText = correct
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    else if (typeof correct === 'object' && correct != null) correctText = [JSON.stringify(correct)]
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    else if (correct != null) correctText = [String(correct)]
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    return (
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                      <TableRow key={idx}>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                        <TableCell>{qText}</TableCell>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                        <TableCell>{qType}</TableCell>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                        <TableCell>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                          {Array.isArray(correctText)
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                            ? correctText.map((a, i) => (<Typography key={i} component="span" sx={{ fontWeight: 600, mr: 1 }}>{String(a)}</Typography>))
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                            : <Typography color="text.secondary">-</Typography>}
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                        </TableCell>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                      </TableRow>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                    )
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                  })}
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]                </TableBody>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              </Table>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]            ) : (
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]              <Typography color="text.secondary">No data available</Typography>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]            )}
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]          </Paper>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]        )}
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]      </Box>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]    </Box>
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  )
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]}
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]export default function ReviewQueue() {
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const { user } = useAuthStore()
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [tab, setTab] = useState(0)
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [subs, setSubs] = useState([])
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [allSubs, setAllSubs] = useState([])
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [historyFilter, setHistoryFilter] = useState('all') // all | pending | approved | declined
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [projReviews, setProjReviews] = useState([])
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [projects, setProjects] = useState([])
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [team, setTeam] = useState([])
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [teamLoading, setTeamLoading] = useState(false)
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [teamQueried, setTeamQueried] = useState(false)
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [viewOpen, setViewOpen] = useState(false)
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [viewTitle, setViewTitle] = useState('')
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [viewJson, setViewJson] = useState(null)
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [declineOpen, setDeclineOpen] = useState(false)
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [declineId, setDeclineId] = useState(null)
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [declineKind, setDeclineKind] = useState('submission')
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [declineReason, setDeclineReason] = useState('Not adequate')
 
  // My Team (manager) state
  const [teamProjectId, setTeamProjectId] = useState("")
  const [projectWorkers, setProjectWorkers] = useState([])
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [addWorkerId, setAddWorkerId] = useState("")
  const [workerOptions, setWorkerOptions] = useState([])
  const openAddWorker = async () => {
    setAddWorkerOpen(true)
    try {
      const r = await api.get("/users");
      const list = Array.isArray(r.data) ? r.data : []
      setWorkerOptions(list.filter(u => u.role === "worker"))
    } catch { setWorkerOptions([]) }
  }
  const closeAddWorker = () => { setAddWorkerOpen(false); setAddWorkerId("") }
  const loadProjectWorkers = async (pid) => {
    if (!pid) { setProjectWorkers([]); return }
    try {
      const r = await api.get(`/assignments/project/${pid}`)
      const list = Array.isArray(r.data) ? r.data : []
      setProjectWorkers(list.filter(a => a.role === "worker"))
    } catch { setProjectWorkers([]) }
  }
  const addWorker = async () => {
    if (!teamProjectId || !addWorkerId) return
    await api.post("/assignments", { user: addWorkerId, project: teamProjectId, role: "worker" })
    closeAddWorker()
    await loadProjectWorkers(teamProjectId)
  }
  const removeWorker = async (assignmentId) => {
    if (!assignmentId) return
    await api.delete(`/assignments/${assignmentId}`)
    await loadProjectWorkers(teamProjectId)
  } System.Object[]  const [viewUploadUrls, setViewUploadUrls] = useState({}) // { [key:string]: url }