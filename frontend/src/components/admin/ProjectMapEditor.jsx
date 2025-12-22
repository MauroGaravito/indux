import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { Box, Button, Card, CardContent, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material'
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt'
import DeleteIcon from '@mui/icons-material/Delete'
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { DEFAULT_PROJECT_LOCATION } from '../../constants/location.js'
import 'leaflet/dist/leaflet.css'

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

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

const poiIcon = createPoiIcon('#FF6F00')

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

function RecenterOnChange({ coords }) {
  const map = useMap()
  React.useEffect(() => {
    if (!coords) return
    map.setView([coords.lat, coords.lng], map.getZoom(), { animate: true })
  }, [coords, map])
  return null
}

export default function ProjectMapEditor({
  canEdit = false,
  location,
  pointsOfInterest,
  onLocationChange,
  onPointsChange,
}) {
  const safeLocation = typeof location?.lat === 'number' && typeof location?.lng === 'number'
    ? location
    : DEFAULT_PROJECT_LOCATION
  const pois = Array.isArray(pointsOfInterest) ? pointsOfInterest : []
  const nextLabel = `POI ${pois.length + 1}`

  const markerIcon = useMemo(() => defaultMainIcon, [])
  const secondaryIcon = useMemo(() => poiIcon, [])

  const addPoint = () => {
    if (!canEdit) return
    const base = safeLocation
    const next = { label: nextLabel, lat: base.lat, lng: base.lng, id: createPoiId() }
    onPointsChange?.([...pois, next])
  }

  const updatePoi = (index, changes) => {
    if (!canEdit) return
    const updated = pois.map((poi, idx) => (idx === index ? { ...poi, ...changes } : poi))
    onPointsChange?.(updated)
  }

  const removePoi = (index) => {
    if (!canEdit) return
    const updated = pois.filter((_, idx) => idx !== index)
    onPointsChange?.(updated)
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
              <Button
                size="small"
                startIcon={<AddLocationAltIcon />}
                variant="outlined"
                onClick={addPoint}
                sx={{ textTransform: 'none' }}
              >
                Add point of interest
              </Button>
            )}
          </Stack>
          <Box sx={{ height: 360, width: '100%', borderRadius: 2, overflow: 'hidden' }}>
            <MapContainer
              center={[safeLocation.lat, safeLocation.lng]}
              zoom={14}
              scrollWheelZoom
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url={TILE_URL} attribution="&copy; OpenStreetMap contributors" />
              <MapClickHandler canEdit={canEdit} onLocationChange={onLocationChange} />
              <RecenterOnChange coords={safeLocation} />
              <Marker position={[safeLocation.lat, safeLocation.lng]} icon={markerIcon}>
                <Popup>Main project location</Popup>
              </Marker>
              {pois.map((poi, idx) => {
                const lat = typeof poi.lat === 'number' ? poi.lat : safeLocation.lat
                const lng = typeof poi.lng === 'number' ? poi.lng : safeLocation.lng
                const pointKey = poi._id || poi.id || `marker-${idx}`
                return (
                  <Marker
                    key={pointKey}
                    position={[lat, lng]}
                    icon={secondaryIcon}
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
                    <TextField
                      size="small"
                      label="Label"
                      value={poi.label}
                      onChange={(e) => updatePoi(idx, { label: e.target.value })}
                      sx={{ flex: 1, minWidth: 180 }}
                    />
                  ) : (
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{poi.label}</Typography>
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
    </Card>
  )
}

ProjectMapEditor.propTypes = {
  canEdit: PropTypes.bool,
  location: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
  pointsOfInterest: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
    })
  ),
  onLocationChange: PropTypes.func,
  onPointsChange: PropTypes.func,
}
