import React, { useState } from 'react';
import { Outlet, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  CssBaseline,
  Divider,
  Button,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';
import RateReviewIcon from '@mui/icons-material/RateReview';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import ChecklistIcon from '@mui/icons-material/Checklist';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuthStore } from '../store/auth.js';

const drawerWidth = 240;

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuthStore();
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:900px)');
  const [open, setOpen] = useState(!isMobile);
  const navigate = useNavigate();

  const role = user?.role;

  const items = role === 'admin'
    ? [
        { label: 'Dashboard', to: '/admin', icon: <DashboardIcon /> },
        { label: 'Projects', to: '/admin/projects', icon: <FolderIcon /> },
        { label: 'Reviews', to: '/admin/reviews', icon: <RateReviewIcon /> },
        { label: 'Users', to: '/admin/users', icon: <PeopleIcon /> },
        { label: 'Settings', to: '/admin/settings', icon: <SettingsIcon /> },
      ]
    : role === 'manager'
      ? [
          { label: 'Dashboard', to: '/manager', icon: <DashboardIcon /> },
          { label: 'Projects', to: '/manager/projects', icon: <FolderIcon /> },
          { label: 'Review', to: '/review', icon: <RateReviewIcon /> },
        ]
      : [
          { label: 'Wizard', to: '/wizard', icon: <ChecklistIcon /> },
        ];

  // Fallback title
  const title = role === 'admin' ? 'Admin Console' : role === 'manager' ? 'Manager' : 'Worker';

  const DrawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ fontWeight: 800, color: theme.palette.text.primary }}>{title}</Toolbar>
      <Divider />
      <List>
        {items.map((i) => (
          <ListItemButton key={i.to} component={RouterLink} to={i.to} onClick={() => isMobile && setOpen(false)}>
            <ListItemIcon>{i.icon}</ListItemIcon>
            <ListItemText primary={i.label} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" sx={{ opacity: 0.7 }}>© {new Date().getFullYear()} Indux</Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', background: theme.palette.background.default, minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar position="fixed" color="primary" sx={{ ml: { md: `${drawerWidth}px` } }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setOpen(!open)} sx={{ mr: 2, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>{title}</Typography>
          <Typography sx={{ mr: 2 }}>{user?.name || user?.email}</Typography>
          <Button color="inherit" onClick={() => { logout(); navigate('/login'); }}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={open}
          onClose={() => setOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: drawerWidth } }}
        >
          {DrawerContent}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, px: { xs: 2, md: 2 }, py: 3, width: { md: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        {children || <Outlet />}
      </Box>
    </Box>
  );
}
