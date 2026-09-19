import { lsGet, lsSet } from './syncedStore'

const KEY = 'ausi_universities'

export const REGIONS = ['West India', 'South India', 'North India', 'East India', 'Central India']

// Default AUSI partner universities shown before admin customises the list.
// Kept in sync with the full set used across the public site and dashboards
// (see DashboardUniversities.jsx KNOWN) so every university a student can be
// matched against on the dashboard is also selectable here.
const DEFAULTS = [
  // West India
  { id: 'd1',  name: 'RK University',                          city: 'Rajkot',         region: 'West India'  },
  { id: 'd2',  name: 'Gujarat University',                     city: 'Ahmedabad',      region: 'West India'  },
  { id: 'd3',  name: 'Marwadi University',                     city: 'Rajkot',         region: 'West India'  },
  { id: 'd4',  name: 'Parul University',                       city: 'Vadodara',       region: 'West India'  },
  { id: 'd5',  name: 'Symbiosis International University',     city: 'Pune',           region: 'West India'  },
  { id: 'd6',  name: 'DY Patil University',                    city: 'Pune',           region: 'West India'  },
  { id: 'd7',  name: 'Savitribai Phule Pune University',       city: 'Pune',           region: 'West India'  },
  { id: 'd8',  name: 'Mumbai University',                      city: 'Mumbai',         region: 'West India'  },
  { id: 'd9',  name: 'Bharati Vidyapeeth University',          city: 'Pune',           region: 'West India'  },
  { id: 'd10', name: 'MATS University',                        city: 'Raipur',         region: 'West India'  },
  // South India
  { id: 'd11', name: 'GITAM University',                       city: 'Visakhapatnam',  region: 'South India' },
  { id: 'd12', name: 'Andhra University',                      city: 'Visakhapatnam',  region: 'South India' },
  { id: 'd13', name: 'KL University',                          city: 'Vijayawada',     region: 'South India' },
  { id: 'd14', name: "Vignan's Foundation University",         city: 'Guntur',         region: 'South India' },
  { id: 'd15', name: 'University of Hyderabad',                city: 'Hyderabad',      region: 'South India' },
  { id: 'd16', name: 'Osmania University',                     city: 'Hyderabad',      region: 'South India' },
  { id: 'd17', name: 'BITS Pilani Hyderabad',                  city: 'Hyderabad',      region: 'South India' },
  { id: 'd18', name: 'IIT Hyderabad',                          city: 'Hyderabad',      region: 'South India' },
  { id: 'd19', name: 'Cochin University of Science and Technology', city: 'Kochi',     region: 'South India' },
  { id: 'd20', name: 'Kerala University',                      city: 'Thiruvananthapuram', region: 'South India' },
  { id: 'd21', name: 'SRM University',                         city: 'Chennai',        region: 'South India' },
  { id: 'd22', name: 'Saveetha University',                    city: 'Chennai',        region: 'South India' },
  { id: 'd23', name: 'REVA University',                        city: 'Bengaluru',      region: 'South India' },
  { id: 'd24', name: 'Christ University',                      city: 'Bengaluru',      region: 'South India' },
  { id: 'd25', name: 'Manipal Academy of Higher Education',    city: 'Manipal',        region: 'South India' },
  { id: 'd26', name: 'PES University',                         city: 'Bengaluru',      region: 'South India' },
  { id: 'd27', name: 'VIT University',                         city: 'Vellore',        region: 'South India' },
  // East India
  { id: 'd28', name: 'Royal Global University',                city: 'Guwahati',       region: 'East India'  },
  { id: 'd29', name: 'Gauhati University',                     city: 'Guwahati',       region: 'East India'  },
  { id: 'd30', name: 'KIIT University',                        city: 'Bhubaneswar',    region: 'East India'  },
  // North India
  { id: 'd31', name: 'Delhi University',                       city: 'New Delhi',      region: 'North India' },
  { id: 'd32', name: 'IIT Delhi',                               city: 'New Delhi',      region: 'North India' },
  { id: 'd33', name: 'AIIMS New Delhi',                        city: 'New Delhi',      region: 'North India' },
  { id: 'd34', name: 'Jamia Millia Islamia',                   city: 'New Delhi',      region: 'North India' },
  { id: 'd35', name: 'Amity University',                       city: 'Noida',          region: 'North India' },
  { id: 'd36', name: 'Lovely Professional University',         city: 'Phagwara',       region: 'North India' },
  { id: 'd37', name: 'Sharda University',                      city: 'Greater Noida',  region: 'North India' },
  { id: 'd38', name: 'Chandigarh University',                  city: 'Chandigarh',     region: 'North India' },
  { id: 'd39', name: 'Graphic Era University',                 city: 'Dehradun',       region: 'North India' },
  { id: 'd40', name: 'LNCT University',                        city: 'Bhopal',         region: 'North India' },
  { id: 'd41', name: 'University of Lucknow',                  city: 'Lucknow',        region: 'North India' },
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
