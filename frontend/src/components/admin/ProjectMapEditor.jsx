import React, { useMemo, useRef } from 'react'
import PropTypes from 'prop-types'
import { Box, Button, Card, CardContent, IconButton, Menu, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material'
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt'
import DeleteIcon from '@mui/icons-material/Delete'
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { DEFAULT_MAP_ZOOM, DEFAULT_POI_COLOR, DEFAULT_PROJECT_LOCATION } from '../../constants/location.js'
import 'leaflet/dist/leaflet.css'

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const MIN_MAP_ZOOM = 1
const MAX_MAP_ZOOM = 22
const COLOR_CHOICES = ['#FF6F00', '#1976d2', '#2E7D32', '#D32F2F', '#F06292', '#7B1FA2', '#FFB300', '#455A64']

const defaultMainIcon = new L.DivIcon({
  html: `<div style="width:22px;height:22px;border-radius:50%;background:#1976d2;border:3px solid #fff;box-shadow:0 0 6px rgba(0,0,0,0.4);"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  className: '',
})

function createPoiIcon(color) {
  return new L.DivIcon({
    html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 0 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    className: '',
  })
}

const createPoiId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `poi-${Date.now()}-${Math.round(Math.random() * 100000)}`
}

function MapClickHandler({ canEdit, onLocationChange }) {
  useMapEvents({
    click(e) {
      if (!canEdit || !onLocationChange) return
      onLocationChange({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

function ViewportSync({ coords, zoom }) {
  const map = useMap()
  React.useEffect(() => {
    if (!coords) return
    const nextZoom = typeof zoom === 'number' ? zoom : map.getZoom()
    map.setView([coords.lat, coords.lng], nextZoom, { animate: true })
  }, [coords, zoom, map])
  return null
}

function ZoomListener({ canEdit, zoom, onZoomChange }) {
  const map = useMap()
  React.useEffect(() => {
    if (!canEdit || !onZoomChange) return
    const handler = () => {
      const currentZoom = clampZoom(Math.round(map.getZoom()))
      if (typeof zoom === 'number' && currentZoom === zoom) return
      onZoomChange(currentZoom)
    }
    map.on('zoomend', handler)
    return () => {
      map.off('zoomend', handler)
    }
  }, [canEdit, map, onZoomChange, zoom])

  React.useEffect(() => {
    if (typeof zoom === 'number' && map.getZoom() !== zoom) {
      map.setZoom(zoom)
    }
  }, [map, zoom])

  return null
}

const clampZoom = (value) => {
  if (Number.isNaN(value)) return DEFAULT_MAP_ZOOM
  return Math.max(MIN_MAP_ZOOM, Math.min(MAX_MAP_ZOOM, value))
}

const normalizeColor = (value) => {
  if (typeof value !== 'string') return DEFAULT_POI_COLOR
  const trimmed = value.trim()
  return trimmed || DEFAULT_POI_COLOR
}

export default function ProjectMapEditor({
  canEdit = false,
  location,
  mapZoom,
  pointsOfInterest,
  onLocationChange,
  onZoomChange,
  onPointsChange,
}) {
  const safeLocation = typeof location?.lat === 'number' && typeof location?.lng === 'number'
    ? location
    : DEFAULT_PROJECT_LOCATION
  const safeZoom = typeof mapZoom === 'number' ? mapZoom : DEFAULT_MAP_ZOOM
  const pois = Array.isArray(pointsOfInterest)
    ? pointsOfInterest.map((poi) => ({ ...poi, color: normalizeColor(poi?.color) }))
    : []
  const nextLabel = `POI ${pois.length + 1}`

  const markerIcon = useMemo(() => defaultMainIcon, [])
  const poiIconCache = useRef(new Map())
  const mapWrapperRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [colorMenu, setColorMenu] = React.useState({ anchorEl: null, index: -1 })

  React.useEffect(() => {
    const map = mapInstanceRef.current
    const wrapper = mapWrapperRef.current
    if (!map || !wrapper) return undefined
    if (typeof ResizeObserver === 'undefined') {
      const timer = setTimeout(() => map.invalidateSize(), 100)
      return () => clearTimeout(timer)
    }
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(wrapper)
    const timer = setTimeout(() => map.invalidateSize(), 100)
    return () => {
      observer.disconnect()
      clearTimeout(timer)
    }
  }, [])


  const getPoiIcon = (color) => {
    const key = normalizeColor(color)
    if (!poiIconCache.current.has(key)) {
      poiIconCache.current.set(key, createPoiIcon(key))
    }
    return poiIconCache.current.get(key)
  }

  const openColorMenu = (event, index) => {
    setColorMenu({ anchorEl: event.currentTarget, index })
  }

  const closeColorMenu = () => setColorMenu({ anchorEl: null, index: -1 })

  const handleColorPick = (color) => {
    if (colorMenu.index < 0) return
    updatePoi(colorMenu.index, { color })
    closeColorMenu()
  }

  const addPoint = () => {
    if (!canEdit) return
    const base = safeLocation
    const next = { label: nextLabel, lat: base.lat, lng: base.lng, id: createPoiId(), color: DEFAULT_POI_COLOR }
    onPointsChange?.([...pois, next])
  }

  const updatePoi = (index, changes) => {
    if (!canEdit) return
    const updated = pois.map((poi, idx) => {
      if (idx !== index) return poi
      const next = { ...poi, ...changes }
      if (Object.prototype.hasOwnProperty.call(changes, 'color')) {
        next.color = normalizeColor(changes.color)
      }
      return next
    })
    onPointsChange?.(updated)
  }

  const removePoi = (index) => {
    if (!canEdit) return
    const updated = pois.filter((_, idx) => idx !== index)
    onPointsChange?.(updated)
  }

  const handleZoomInputChange = (value) => {
    if (!canEdit || !onZoomChange) return
    const parsed = Number(value)
    if (Number.isNaN(parsed)) return
    const next = clampZoom(Math.round(parsed))
    onZoomChange(next)
  }

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Project location</Typography>
              <Typography variant="body2" color="text.secondary">
                {canEdit
                  ? 'Click anywhere on the map to define the main project location. Drag secondary markers to adjust them.'
                  : 'Preview of the project location and its points of interest.'}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }} />
            {canEdit && (
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ xs: 'stretch', md: 'center' }}>
                <TextField
                  size="small"
                  label="Default zoom"
                  type="number"
                  value={safeZoom}
                  onChange={(e) => handleZoomInputChange(e.target.value)}
                  inputProps={{ min: MIN_MAP_ZOOM, max: MAX_MAP_ZOOM }}
                  sx={{ width: { xs: '100%', md: 160 } }}
                />
                <Button
                  size="small"
                  startIcon={<AddLocationAltIcon />}
                  variant="outlined"
                  onClick={addPoint}
                  sx={{ textTransform: 'none' }}
                >
                  Add point of interest
                </Button>
              </Stack>
            )}
          </Stack>
          <Box ref={mapWrapperRef} sx={{ height: 360, width: '100%', borderRadius: 2, overflow: 'hidden' }}>
            <MapContainer
              whenCreated={(instance) => {
                mapInstanceRef.current = instance
              }}
              center={[safeLocation.lat, safeLocation.lng]}
              zoom={safeZoom}
              scrollWheelZoom
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url={TILE_URL} attribution="&copy; OpenStreetMap contributors" />
              <MapClickHandler canEdit={canEdit} onLocationChange={onLocationChange} />
              <ViewportSync coords={safeLocation} zoom={safeZoom} />
              <ZoomListener canEdit={canEdit} zoom={safeZoom} onZoomChange={onZoomChange} />
              <Marker position={[safeLocation.lat, safeLocation.lng]} icon={markerIcon}>
                <Popup>Main project location</Popup>
              </Marker>
              {pois.map((poi, idx) => {
                const lat = typeof poi.lat === 'number' ? poi.lat : safeLocation.lat
                const lng = typeof poi.lng === 'number' ? poi.lng : safeLocation.lng
                const pointKey = poi._id || poi.id || `marker-${idx}`
                const color = normalizeColor(poi.color)
                return (
                  <Marker
                    key={pointKey}
                    position={[lat, lng]}
                    icon={getPoiIcon(color)}
                    draggable={canEdit}
                    eventHandlers={
                      canEdit
                        ? {
                            dragend: (event) => {
                              const { lat, lng } = event.target.getLatLng()
                              updatePoi(idx, { lat, lng })
                            },
                          }
                        : undefined
                    }
                  >
                    <Popup>{poi.label}</Popup>
                  </Marker>
                )
              })}
            </MapContainer>
          </Box>
          <Stack spacing={1}>
            <Typography variant="subtitle2">
              {canEdit ? 'Points of interest' : 'Points of interest overview'}
            </Typography>
            {!pois.length && (
              <Typography variant="body2" color="text.secondary">
                {canEdit ? 'No points added yet. Use the button above to create POIs.' : 'No points of interest recorded for this project.'}
              </Typography>
            )}
            {pois.map((poi, idx) => {
              const latText = typeof poi.lat === 'number' ? poi.lat.toFixed(5) : '0.00000'
              const lngText = typeof poi.lng === 'number' ? poi.lng.toFixed(5) : '0.00000'
              const pointKey = poi._id || poi.id || `poi-${idx}`
              return (
                <Stack
                  key={pointKey}
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={1}
                  alignItems={{ xs: 'flex-start', md: 'center' }}
                  sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}
                >
                  {canEdit ? (
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1}
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      sx={{ flex: 1, minWidth: 220 }}
                    >
                      <TextField
                        size="small"
                        label="Label"
                        value={poi.label}
                        onChange={(e) => updatePoi(idx, { label: e.target.value })}
                        sx={{ flex: 1 }}
                      />
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={(event) => openColorMenu(event, idx)}
                          sx={{ textTransform: 'none' }}
                          startIcon={
                            <Box
                              sx={{
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                border: '1px solid',
                                borderColor: 'divider',
                                bgcolor: normalizeColor(poi.color),
                              }}
                            />
                          }
                        >
                          Colour
                        </Button>
                      </Stack>
                    </Stack>
                  ) : (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{poi.label}</Typography>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          border: '1px solid',
                          borderColor: 'divider',
                          bgcolor: normalizeColor(poi.color),
                        }}
                      />
                    </Stack>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {latText}, {lngText}
                  </Typography>
                  {canEdit && (
                    <Tooltip title="Remove point">
                      <IconButton onClick={() => removePoi(idx)} size="small" color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              )
            })}
          </Stack>
        </Stack>
      </CardContent>
      <Menu
        open={Boolean(colorMenu.anchorEl)}
        anchorEl={colorMenu.anchorEl}
        onClose={closeColorMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        {COLOR_CHOICES.map((color) => (
          <MenuItem key={color} onClick={() => handleColorPick(color)}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: color,
                }}
              />
              <Typography variant="body2">{color}</Typography>
            </Stack>
          </MenuItem>
        ))}
      </Menu>
    </Card>
  )
}

ProjectMapEditor.propTypes = {
  canEdit: PropTypes.bool,
  location: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
  mapZoom: PropTypes.number,
  pointsOfInterest: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
      color: PropTypes.string,
    })
  ),
  onLocationChange: PropTypes.func,
  onZoomChange: PropTypes.func,
  onPointsChange: PropTypes.func,
}