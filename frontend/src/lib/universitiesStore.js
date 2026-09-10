import { lsGet, lsSet } from './syncedStore'

const KEY = 'ausi_universities'

export const REGIONS = ['West India', 'South India', 'North India', 'East India', 'Central India']

// Default AUSI partner universities shown before admin customises the list
const DEFAULTS = [
  { id: 'd1', name: 'GITAM University',                       city: 'Visakhapatnam', region: 'South India' },
  { id: 'd2', name: 'RK University',                          city: 'Rajkot',         region: 'West India'  },
  { id: 'd3', name: 'Marwadi University',                     city: 'Rajkot',         region: 'West India'  },
  { id: 'd4', name: 'Symbiosis International University',     city: 'Pune',           region: 'West India'  },
  { id: 'd5', name: 'KL University',                          city: 'Vijayawada',     region: 'South India' },
  { id: 'd6', name: 'Andhra University',                      city: 'Visakhapatnam', region: 'South India' },
  { id: 'd7', name: 'AIIMS',                                  city: 'New Delhi',      region: 'North India' },
  { id: 'd8', name: 'Manipal Academy of Higher Education',    city: 'Manipal',        region: 'South India' },
  { id: 'd9', name: 'VIT University',                         city: 'Vellore',        region: 'South India' },
  { id: 'd10', name: 'SRM Institute of Science and Technology', city: 'Chennai',      region: 'South India' },
  { id: 'd11', name: 'Amity University',                      city: 'Noida',          region: 'North India' },
  { id: 'd12', name: 'Lovely Professional University',        city: 'Phagwara',       region: 'North India' },
  { id: 'd13', name: 'Sharda University',                     city: 'Greater Noida',  region: 'North India' },
  { id: 'd14', name: 'Chandigarh University',                 city: 'Chandigarh',     region: 'North India' },
  { id: 'd15', name: 'REVA University',                       city: 'Bengaluru',      region: 'South India' },
  { id: 'd16', name: 'Christ University',                     city: 'Bengaluru',      region: 'South India' },
  { id: 'd17', name: 'DY Patil University',                   city: 'Pune',           region: 'West India'  },
  { id: 'd18', name: 'Saveetha University',                   city: 'Chennai',        region: 'South India' },
]

export function getUniversities() {
  try {
    const stored = lsGet(KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return DEFAULTS
}

export function saveUniversities(list) {
  lsSet(KEY, JSON.stringify(list))
}
