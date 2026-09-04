const KEY = 'ausi_cabinet_data'

const PALETTE = [
  { color:'rgba(201,146,10,.16)', border:'rgba(201,146,10,.28)', text:'#8a6310' },
  { color:'rgba(168,32,43,.14)',  border:'rgba(168,32,43,.28)',  text:'#8a1525' },
  { color:'rgba(13,122,74,.14)',  border:'rgba(13,122,74,.28)',  text:'#0a5c38' },
  { color:'rgba(29,93,200,.14)',  border:'rgba(29,93,200,.28)',  text:'#1d4d9e' },
  { color:'rgba(124,58,237,.14)', border:'rgba(124,58,237,.28)', text:'#5b21b6' },
  { color:'rgba(234,88,12,.14)',  border:'rgba(234,88,12,.28)',  text:'#9a3412' },
  { color:'rgba(190,24,93,.14)',  border:'rgba(190,24,93,.28)',  text:'#9d174d' },
  { color:'rgba(16,185,129,.14)', border:'rgba(16,185,129,.28)', text:'#065f46' },
  { color:'rgba(201,146,10,.12)', border:'rgba(201,146,10,.22)', text:'#7a5800' },
  { color:'rgba(29,93,200,.12)',  border:'rgba(29,93,200,.22)',  text:'#1a4a9e' },
  { color:'rgba(13,122,74,.12)',  border:'rgba(13,122,74,.22)',  text:'#0a5035' },
]

export const DEFAULT_CABINET = [
  { id:1,  initials:'AC', photo:'/colleb.png',   ...PALETTE[0],  badge:'President',              name:'Abaho Colleb',              pos:'President',                     uni:'AIIMS New Delhi · NCT Delhi',          email:'collebabaho4@gmail.com',      phone:'9898914059',      resp:'Chief spokesperson for AUSI; chairs the executive committee; represents the association before the Uganda High Commission, university administrations, and partner organisations.' },
  { id:2,  initials:'AM', photo:'/alinda.png',   ...PALETTE[1],  badge:'Vice President',         name:'Alinda Charity Martha',     pos:'Vice President',                 uni:'Manipal University · Karnataka',       email:'arindacharity29@gmail.com',   phone:'+256 741569926',  resp:'Deputises for the President; oversees coordination across all 5 branches; leads the annual National Convention planning committee.' },
  { id:3,  initials:'MB', photo:'/brendah.png',  ...PALETTE[2],  badge:'Speaker',                name:'Mayokia Brendah',           pos:'Speaker',                        uni:'Osmania University · Telangana',       email:'brendamayokia@gmail.com',     phone:null,              resp:'Presides over all general assembly meetings; ensures constitutional order and decorum during proceedings; rules on points of order and moderates debate.' },
  { id:4,  initials:'MJ', photo:'/jairus.png',   ...PALETTE[3],  badge:'Operations Officer',     name:'Muwumba Jairus Hephzibah',  pos:'Operations Officer',             uni:'GITAM University · Andhra Pradesh',    email:'jairushephizibah@gmail.com',  phone:'+256 709362200',  resp:'Manages day-to-day operational logistics of the association; coordinates inter-branch communications; ensures continuity of all executive programmes.' },
  { id:5,  initials:'NK', photo:'/shufurah.png', ...PALETTE[4],  badge:'Asst. Operations Officer',name:'Namayanja Shufufrah Kiyaga',pos:'Assistant Operations Officer',   uni:'Symbiosis International · Pune',       email:'shufurahkiyaga11@gmail.com',  phone:'+256 764602029',  resp:'Supports the Operations Officer in logistics; manages member attendance records; coordinates branch-level operational reporting.' },
  { id:6,  initials:'MD', photo:'/dinton.png',   ...PALETTE[5],  badge:'Organising Secretary',   name:'Muganzi Dinton',            pos:'Organising Secretary',           uni:'VIT University · Tamil Nadu',          email:'muganzidinton@gmail.com',     phone:'+256 703548104',  resp:'Plans and coordinates all official AUSI events and conventions; manages scheduling, logistics, and vendor coordination for national programmes.' },
  { id:7,  initials:'NM', photo:'/martha.png',   ...PALETTE[6],  badge:'Asst. Organising Sec.', name:'Nassali Martha',            pos:'Assistant Organising Secretary', uni:'Christ University · Karnataka',         email:'nassalimartha9@gmail.com',    phone:'+256 708901217',  resp:'Supports event planning and coordination; manages volunteer rosters; handles on-ground logistics during conventions and branch events.' },
  { id:8,  initials:'AJ', photo:'/judith.png',   ...PALETTE[7],  badge:'Treasurer',              name:'Ayikoru Judith',            pos:'National Treasurer',             uni:'DY Patil Medical College · Pune',      email:'judithayikoru353@gmail.com',  phone:'9963082478',      resp:'Manages AUSI finances, membership dues, and sponsorship funds; prepares the annual financial report; approves branch event budgets.' },
  { id:9,  initials:'AL', photo:'/liz.png',      ...PALETTE[8],  badge:'Privy Council',          name:'Atukunda Liz',              pos:'Privy Council Member',           uni:'REVA University · Karnataka',          email:'lizatukunda58@gmail.com',     phone:'+256 783815052',  resp:'Provides constitutional guidance to the executive; reviews decisions for compliance with the AUSI constitution; advises on precedent and governance disputes.' },
  { id:10, initials:'BA', photo:'/ashraf.png',   ...PALETTE[9],  badge:'Privy Council',          name:'Bukenya Ashiraf',           pos:'Privy Council Member',           uni:'University of Hyderabad · Telangana',  email:'ashirafbukenya678@gmail.com', phone:'+256 761498057',  resp:'Provides constitutional guidance to the executive; reviews decisions for compliance with the AUSI constitution; advises on precedent and governance disputes.' },
  { id:11, initials:'AS', photo:'/shadia.png',   ...PALETTE[10], badge:'Privy Council',          name:'Ampurire Shadiah Bany',     pos:'Privy Council Member',           uni:'Jawaharlal Nehru University · Delhi',  email:'banyshadiah@gmail.com',       phone:null,              resp:'Provides constitutional guidance to the executive; reviews decisions for compliance with the AUSI constitution; advises on precedent and governance disputes.' },
]

export function getCabinet() {
  try {
    const stored = localStorage.getItem(KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return DEFAULT_CABINET
}

export function saveCabinet(members) {
  localStorage.setItem(KEY, JSON.stringify(members))
}

export function makeMember({ name, pos, uni, email, phone, resp, photo, index }) {
  const style = PALETTE[index % PALETTE.length]
  const initials = (name || '').split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
  return { id: Date.now(), initials, photo: photo || '', ...style, badge: pos, name, pos, uni, email, phone: phone || null, resp }
}
