require('./backend/node_modules/dotenv').config({ path: './backend/.env' });
const { loadModel } = require('./backend/models/symptomModel');
const { searchHospitals } = require('./backend/controllers/hospitalController');

const model = loadModel('_MedP_AI_V2.0');
const diseases = model.labels.map(l => ({ name: l.condition, spec: l.specialization, id: l.condition_id }));

async function run() {
  console.log(`Testing ${diseases.length} diseases in Surat...`);
  
  for (const d of diseases) {
    const req = {
      query: {
        q: d.name,
        confirmedCondition: d.name,
        confidence: '100',
        directRouting: 'true',
        city: 'Surat',
        state: 'Gujarat',
        lat: '21.1702',
        lng: '72.8311',
        locationScope: 'city',
        radiusKm: '20',
        minRating: '0',
        sortBy: 'distance'
      }
    };
    
    let resData = null;
    const res = {
      status: () => ({ json: () => {} }),
      json: (data) => { resData = data; }
    };
    
    await searchHospitals(req, res);
    
    const verified = (resData.data || []).filter(h => (h.source || '').includes('Verified') || (h.source || '').includes('Registry'));
    const osm = (resData.data || []).filter(h => (h.source || '').toLowerCase().includes('openstreet') || (h.source || '').toLowerCase().includes('osm'));
    const google = (resData.data || []).filter(h => (h.source || '').toLowerCase().includes('google'));
    
    const vNames = verified.slice(0, 3).map(h => (h.hospital_name || h.name) + ' [T' + h.matchTier + ']').join('; ');
    const osmNames = osm.slice(0, 3).map(h => (h.hospital_name || h.name) + ' [T' + h.matchTier + ']').join('; ');
    console.log(`[${d.name}] (${d.spec})`);
    console.log(`  -> Verified (${verified.length}): ${vNames}`);
    console.log(`  -> OSM      (${osm.length}): ${osmNames}`);
    if (google.length > 0) {
      console.log(`  -> Google   (${google.length}): ${google.slice(0, 2).map(h => h.hospital_name || h.name).join('; ')}`);
    }
  }
}

run();
