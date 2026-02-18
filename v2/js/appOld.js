
/* ===============================
   CONFIG
================================ */
/* ===============================
   INIT
================================ */

const dctDefaultForm = {
    sText: 'Česko',
    sLang: 'cs',
    sGeo: 'CZ',
}

const dctCurrForm = { ...dctDefaultForm }    

let dctTrans = {}; // translation cache

const queryInput = document.getElementById('queryInput')
const eventSelect = document.getElementById('eventSelect');
const resultsLink = document.getElementById('open-results');
const createBtn = document.getElementById('create-query');
const searchType = document.getElementsByName('searchType');
    
dctTrans[dctDefaultForm.sLang] = queryInput.value.trim(); // reset default language


document.addEventListener('DOMContentLoaded', () => {
    setDefaultQueryFromUrl();
    updateTitleFromInput(); // <-- set title immediately on load
    createCountryButtons();
    createYearButtons();
    createMediaButtons();
    setSearchTypeFromStorage();
    //loadEventsCSV();
    //initEventSelector();

})


/* ===============================
   QUERY FROM URL
================================ */


function setDefaultQueryFromUrl() {
    const params = new URLSearchParams(window.location.search)
    dctCurrForm.sText = (params.get('q') || '').trim() || localStorage.getItem('queryInput')  || dctDefaultForm.sText;
    dctCurrForm.sLang = (params.get('l') || '').trim() || dctDefaultForm.sLang;
    dctCurrForm.sGeo = (params.get('g') || '').trim() || dctDefaultForm.sGeo;
    queryInput.value = dctCurrForm.sText;
    return dctCurrForm;
}

function updateTitleFromInput() {
    dctCurrForm.sText = queryInput.value.trim() ;
    //document.title = 'aInfo' + (text ? ': ' + text : 'Česko');
    document.title = 'a: ' + dctCurrForm.sText;
}

function setSearchTypeFromStorage() {
    const lastType = localStorage.getItem('lastSearchType');
    if (lastType) {
        const r = document.querySelector(`input[name="searchType"][value="${lastType}"]`)
        if (r) r.checked = true
    }
}

// nastavi country config
const dctCountryConfig = {
    //CZ: { hl: dctDefaultForm.shl, gl: dctDefaultForm.sGeo },
    CZ: { lang: 'cs', hl: 'cs', gl: 'CZ', descr: 'Česko', 
        mainMedia:['https://www.CTK.cz', 'https://CT24.CeskaTelevize.cz', 'https://www.iRozhlas.cz'],
        archMedia: ['era21.cz', 'asb-portal.cz', 'archiweb.cz', 'stavbaweb.cz', 'modernibyt.cz'],},
    EN: { lang: 'en', lr: 'lang_en', descr: 'Global', 
        mainMedia: ['https://www.Reuters.com', 'https://APNews.com', 'https://www.AFP.com',
            'https://www.Bloomberg.com', 'https://www.BBC.com', 'https://www.AlJazeera.com', 
            'https://www.DW.com', 'https://www3.NHK.or.jp/nhkworld', 'https://www.France24.com/en',
             'https://English.News.cn', 'https://TASS.com', 'https://www.AA.com.tr/en', 
             'https://www.PTINews.com', 'https://en.YNA.co.kr'],
        archMedia:['archdaily.com', 'dezeen.com', 'designboom.com', 'domusweb.it', 'architectural-review.com', 'architecturaldigest.com', 'frameweb.com', 'wallpaper.com']},
    SK: { lang: 'sk', gl: 'SK', descr: 'Slovensko',
        mainMedia:['https://www.TASR.sk', 'https://Spravy.RTVS.sk'],
        archMedia:['arch.sk', 'asb.sk', 'interiermagazin.sk'],},
    UA: { lang: 'uk', hl: 'uk', gl: 'UA', descr: 'Ukrajina', 
        mainMedia:['https://www.UkrInform.net', 'https://www.Unian.net'],
        archMedia:['hmarochos.kiev.ua', 'telegraf.design', 'platforma.design'],},
    US: { lang: 'en', hl: 'en', gl: 'US', descr: 'USA', 
        mainMedia:['https://APNews.com', 'https://www.Reuters.com', 'https://www.Bloomberg.com'],
        archMedia: ['archpaper.com', 'architecturaldigest.com', 'archinect.com',
                'metropolismag.com', 'archdaily.com', 'designboom.com', 
                'curbed.com', 'journal.record.net', 'interiordesign.net']},
    RU: { lang: 'ru', hl: 'ru', gl: 'RU', descr: 'Rusko', 
        mainMedia:['https://TASS.com', 'https://RIA.ru', 'https://www.InterFax.ru', 'https://Meduza.io'],
        archMedia:['archdaily.ru', 'prorus.ru', 'archspeech.com', 'admagazine.ru'],},
    DE: { lang: 'de', hl: 'de', gl: 'DE', descr: 'Německo', 
        mainMedia:['https://www.DPA.com', 'https://www.DW.com'],
        archMedia: ['baunetz.de', 'detail.de', 'bauwelt.de', 'archdaily.de'],},
    AT: { lang: 'de', hl: 'de', gl: 'AT', descr: 'Rakousko', 
        mainMedia:['https://www.APA.at', 'https://ORF.at'],
        archMedia: ['ait-architektur.at', 'baunetz.at', 'derstandard.at'],},
    HU: { lang: 'hu', hl: 'hu', gl: 'HU', descr: 'Maďarsko', 
        mainMedia:['https://Hirado.hu', 'https://Telex.hu'],
        archMedia: ['epiteszforum.hu', 'octogon.hu', 'hg.hu'],},
    PL: { lang: 'pl', hl: 'pl', gl: 'PL', descr: 'Polsko', 
        mainMedia:['https://www.PAP.pl', 'https://TVN24.pl'],
        archMedia: ['architektura.muratorplus.pl', 'bryla.pl', 'whitemad.pl', 'archdaily.pl'], 
}}

Object.entries(dctCountryConfig).forEach(([key, o]) => {
    o.g =
        (o.hl ? `&hl=${o.hl}` : '') +
        (o.gl ? `&gl=${o.gl}` : '') +
        (o.lr ? `&lr=${o.lr}` : '');
        o.mainMediaDescr = o.mainMedia ? o.mainMedia.join(', '): ''
        o.mainMediaDescr = o.mainMediaDescr.replace(/https?:\/\/(www\.)?/g, '').replace(/\/+/g, ', ')
        o.mainMedia = o.mainMedia ? o.mainMedia.map(site => `site:${new URL(site).hostname.replace('www.', '')}`).join(' OR ') : ''

        o.archMediaDescr = o.archMedia ? o.archMedia.join(', '): ''
        o.archMediaDescr = o.archMediaDescr.replace(/https?:\/\/(www\.)?/g, '').replace(/\/+/g, ', ')
        o.archMedia = 'site:'+(o.archMedia.join(' OR site:'))
        
    })

const currentYear = new Date().getFullYear()
const previousYear = currentYear - 1;
const lstTimePeriods = [
    { label: 'bez limitu', start: currentYear, end: currentYear, tbs: '' },
    { label: 'posl. 24h', start: currentYear, end: currentYear, tbs: 'qdr:d' },
    { label: 'posl. týden', start: currentYear, end: currentYear, tbs: 'qdr:w' },
    { label: 'posl. měsíc', start: currentYear, end: currentYear, tbs: 'qdr:m' },
    { label: 'posl. rok', start: currentYear, end: currentYear, tbs: 'qdr:y' },
    { label: 'posl. 3 roky', start: currentYear, end: currentYear, tbs: `cdr:1,cd_min:1/1/${currentYear - 3}` },
];

const lstMedia = [
    { id: 'nothing', label: 'vše', descr: 'Všechna média' },
    { id: 'mainMediaOnly', label: 'hlavní', descr: 'Pouze hlavní média: #' },
    { id: 'archMediaOnly', label: 'arch', descr: 'Pouze architektura/design média: #' },
    { id: 'excludeSocial', label: 'bez soc.', descr: 'Kromě: Wiki, X, FB, YT, Insta, Reddit' },
    { id: 'statsOnly', label: 'stats', descr: 'Pouze statistiky na TradingEconomics.com'   },
    { id: 'prOnly', label: 'TZ', descr: 'Pouze tiskové zprávy' },
];

const lstOutputs = [
    { id: 'nothing', label: 'W', descr: 'Weby' },
    { id: 'imagesOnly', label: 'O', descr: 'Obrázky' },
    { id: 'imagesOnly8', label: 'O 8', descr: '>8 cm'},
    { id: 'imagesOnly15', label: 'O 12', descr: '> 15 cm'},
    { id: 'videosOnly', label: 'V', descr: 'Videa' },
    { id: 'podcastsOnly', label: 'P', descr: 'Podcasty' },
    { id: 'pptOnly', label: 'PPT', descr: 'Prezentace' },
    { id: 'pdfOnly', label: 'PDF', descr: 'Dokumenty' },
    

    
];
let selectedCountry = localStorage.getItem('lastCountry') || 'CZ'
let selectedYearRangeIndex = localStorage.getItem('lastYearIndex') ? Number(localStorage.getItem('lastYearIndex')) : 2 // default last = currentYear
let selectedMedia = localStorage.getItem('lastMedia') || 'nothing'

document.getElementById("mediaDescr").innerText = localStorage.getItem('lastMediaDescr') || 'Media'
document.getElementById("outputDescr").innerText = localStorage.getItem('lastOutputDescr') || 'Output'
    



/* ===============================
   UI BUILDERS
================================ */
function createMediaButtons() {
    const containerMedia = document.getElementById('mediaButtons')
    containerMedia.innerHTML = ''
    lstMedia.forEach((media, index) => {
    
        const btn = document.createElement('button')
        btn.className = 'btn btn-outline-primary btn-media'
        btn.innerHTML = media.label
        if(media.id === selectedMedia) btn.classList.add('active')
        btn.onclick = () => setMedia(btn, index)
        containerMedia.appendChild(btn)
    })
    return
}

function createOutputButtons() {
    const containerOutput = document.getElementById('outputButtons')
    containerOutput.innerHTML = ''
    lstOutputs.forEach((output, index) => {
    
            const btn = document.createElement('button')
            btn.className = 'btn btn-outline-primary btn-output'
        btn.innerHTML = output.label
            `${output.label} <small><br>${output.descr}</small>`
        if(output.id === selectedMedia) btn.classList.add('active')
        btn.onclick = () => setMedia(btn, index)
        containerOutput.appendChild(btn)
    })
    return
}



function createCountryButtons() {
    const containerCountries = document.getElementById('countryButtons')
    containerCountries.innerHTML = ''
    Object.keys(dctCountryConfig).forEach(code => {
        const btn = document.createElement('button')
        btn.className = 'btn btn-outline-primary btn-country'
        // btn.innerText = code
        // btn.innerHTML = `${code} <span class="text-muted">${dctCountryConfig[code].descr}</span>`
        btn.innerHTML = `${code} <small><br>${dctCountryConfig[code].descr}</small>`
        if(code === selectedCountry) btn.classList.add('active')
        btn.onclick = () => setCountry(btn, code)
        containerCountries.appendChild(btn)
    })
}

function createYearButtons() {
    const containerYears = document.getElementById('yearButtons')
    containerYears.innerHTML = ''
    lstTimePeriods.forEach((range, index) => {
        const btn = document.createElement('button')
        btn.className = 'btn btn-outline-secondary btn-year'
        btn.innerText = range.label
        if(index === selectedYearRangeIndex) btn.classList.add('active')
        btn.onclick = () => setYear(btn, index)
        containerYears.appendChild(btn)
    })
    const btn = document.createElement('button')
        btn.className = 'btn btn-outline-secondary btn-year'
        btn.innerText = 'vyber roky'
        btn.onclick = () => openYearDialog()
        containerYears.appendChild(btn)                    
}

/* ===============================
   HANDLERS
================================ */
function setMedia(btn, index) {
    document.querySelectorAll('.btn-media').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    selectedMedia = index   
    localStorage.setItem('lastMedia', selectedMedia)
    //localStorage.setItem('mainMediaDescr', dctCountryConfig[selectedCountry].mainMediaDescr);
    document.title = 'a: ' + queryInput.value.trim();
    switch (lstMedia[index].id) {
        case 'mainMediaOnly':
            document.getElementById("mediaDescr").innerText = 
                lstMedia[index].descr.replace('#', dctCountryConfig[selectedCountry].mainMediaDescr);
            break
        case 'archMediaOnly':
            document.getElementById("mediaDescr").innerText = 
                lstMedia[index].descr.replace('#', dctCountryConfig[selectedCountry].archMediaDescr);
            break
        default:
            document.getElementById("mediaDescr").innerText = lstMedia[index].descr;
    }
    localStorage.setItem('lastMediaDescr', document.getElementById("mediaDescr").innerText)
    //runSearch()
}

function setCountry(btn, country) {
    document.querySelectorAll('.btn-country').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    selectedCountry = country
    localStorage.setItem('lastCountry', selectedCountry)
    //localStorage.setItem('mainMediaDescr', dctCountryConfig[selectedCountry].mainMediaDescr);
    document.title = 'a: ' + queryInput.value.trim();
    document.getElementById("mainMediaDescr").innerText = dctCountryConfig[selectedCountry].mainMediaDescr;
    document.getElementById("archMediaDescr").innerText = dctCountryConfig[selectedCountry].archMediaDescr;
    //runSearch()
}

function setYear(btn, index) {
    document.querySelectorAll('.btn-year').forEach(b => b.classList.remove('active'))
    if (index === -1) {return}; // no selection, just remove se
    if(btn) {btn.classList.add('active')}
    selectedYearRangeIndex = index
    localStorage.setItem('lastYearIndex', selectedYearRangeIndex);
    // eventSelect.value = '';
    document.title = 'a: ' + queryInput.value.trim();
    //runSearch()
}



/* ===============================
   SEARCH LOGIC
================================ */
async function runSearch(sDevice = 'desktop') {
    const text = queryInput.value.trim()
    if(!text) return

    if (text !== dctTrans[dctDefaultForm.sLang]) {
        dctTrans = {}  // clear dictionary
        dctTrans[dctDefaultForm.sLang] = text
        document.title = 'a: ' + text;
    }
        //document.title = '1: ' + text;

    const lang = dctCountryConfig[selectedCountry].lang
    //alert('Searching for: ' + text + '\nLanguage: ' + lang)
    if (!(lang in dctTrans)) {
        try {
            const translated = await translateText(text, lang);
            // Prompt the user to edit/confirm the search query
            let finalText = prompt("Uprav přeložený text, pokud je třeba:", translated);
            if (!finalText) return;
            dctTrans[lang] = finalText;
            openGoogleSearch(finalText, sDevice)
        } catch {
            openGoogleSearch(text, sDevice)
        }
    } else {
        openGoogleSearch(dctTrans[lang], sDevice)
    }
}

async function translateText(text, lang) {
    if(lang === dctDefaultForm.sLang) return text
    const url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text) + '&langpair=cs|' + lang
    const response = await fetch(url)
    const data = await response.json()
    if(!data.responseData?.translatedText) throw new Error('Translation failed')
    return data.responseData.translatedText
}

function openGoogleSearch(queryText, sDevice) {
    let query = encodeURIComponent(queryText)
    localStorage.setItem('queryInput', queryInput.value.trim());

    let tbs = (lstTimePeriods[selectedYearRangeIndex].tbs ? '&tbs=' + lstTimePeriods[selectedYearRangeIndex].tbs : '')
    let cntry = dctCountryConfig[selectedCountry].g    

    const sSearchTypeChecked = Array.from(searchType).find(radio => radio.checked).value;
    localStorage.setItem('lastSearchType', sSearchTypeChecked);
    switch (sSearchTypeChecked) {
        case 'nothing': query += ''
            break
        case 'excludeSocial': query = '-site:facebook.com -site:instagram.com -site:youtube.com -site:x.com -site:wikipedia.org -site:reddit.com ' + query
            break
        case 'mainMediaOnly': 
            query += ' (' + dctCountryConfig[selectedCountry].mainMedia + ') '
            break
        case 'archMediaOnly': 
            query += ' (' + dctCountryConfig[selectedCountry].archMedia + ') '
            break
        case 'prOnly': query += ' press release'
            break
        case 'imagesOnly': query += '&tbm=isch'
            break
        case 'largeImagesOnly': query += '&tbm=isch&tbs=isz:lt,islt:4mp'
            break
        case 'podcastsOnly': 
            query += ' (site:podcasts.apple.com OR site:open.spotify.com OR site:listennotes.com OR site:podchaser.com) '
            //query += ' (site:podcasts.apple.com OR site:open.spotify.com) '
            cntry = cntry.replace('&hl=', '&lang:') // replace lang for podcasts
            
            break
        case 'videosOnly': query += '&tbm=vid'
            cntry = cntry.replace('&hl=', '&lr=lang_') // replace lang for video search
            break
        case 'pdfOnly': query += ' filetype:pdf'
            break
        case 'pptOnly': query += ' filetype:ppt'
            break
    }
    if(!['CZ','EN'].includes(selectedCountry) && !query.includes(' site:')) {
        query = '-site:.cz ' + query;
        }
    
    let url = '';
    if (sSearchTypeChecked === 'statsOnly') {
        url = 'https://tradingeconomics.com/search.aspx?q=' + encodeURIComponent(queryText);
    // } else if (sSearchTypeChecked === 'podcastsOnly') {
    //     url = 'https://podcasts.google.com/search/' + query + cntry + tbs
    } else {
        url = 'https://www.google.com/search?q=' + query + cntry + tbs
    }


        // for mobile open direct google search, for desktop create link page
    if (sDevice === 'desktop') {
        // createLinkPage(url);
        // location.href = url; 
        const a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            //a.click();

            document.body.appendChild(a);
            a.click();                    // 👈 Safari allows this
            a.remove();

    } else {
        window.open(url, '_blank')
    }

}
/* ===============================
   ADMIN EVENTS CSV LOAD
================================ */
async function loadEventsCSV() {
    let csv = localStorage.getItem('eventsCSV');

    if (!csv) {
        const res = await fetch('events.csv');
        csv = await res.text();
    }
    return parseCSV(csv);
}

function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines.shift().split(';');

    return lines.map(l => {
        const o = {};
        l.split(';').forEach((v, i) => o[headers[i]] = v || null);
        return o;
    });
}



function dateToYYYY_MM(str) {
    // str = "31.12.2025"
    if (!str) return '_____-___';
    const [day, month, year] = str.split('.');
    return `${year}-${month.padStart(2,'0')}`;
}

function dateToUsformat(str) {
    if (!str) return '';
    const parts = str.split('.');
    if (parts.length !== 3) return '';
    const [day, month, year] = parts;
    return `${month.padStart(2,'0')}/${day.padStart(2,'0')}/${year}`;
}
function createLinkPage(google_url) {
    // Build a full HTML document as a string
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset='UTF-8', content='notranslate'>
    <title>aInfo</title>
    <meta name='viewport' content='width=device-width, initial-scale=1, viewport-fit=cover'>
    <link href='https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css' rel='stylesheet'>
    <link rel="icon" type="image/png" sizes="32x32" href="img/FaviconWhite32.png">
    <link rel="apple-touch-icon" href="img/FaviconWhite180.png">
    <link rel="icon" href="img/FaviconBlack32.png">
    <!-- CSS -->
    <link rel="stylesheet" href="css/style.css">
<style>
  body { background-color: #121212; color: #f0f0f0; }
  .desc { margin-bottom: 1rem; }
</style>
</head>
<body class="p-3 text-center">
  <h3>Open Google Search</h3>
  <a href="${google_url}" class="btn btn-success" rel="noopener">
    Open Google Search
  </a>
</body>
</html>
    `;

    // Create a Blob containing the HTML
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    // Open the new page in a new tab
    window.open(url, '_blank');
}

/* ===============================
   YEAR PICKER WIDGET
================================ */ 

const dialog = document.getElementById('yearDialog')
const yearsDiv = document.getElementById('years')
const result = document.getElementById('result')

let startYear = null
let endYear = null

// generate years
//const currentYear = new Date().getFullYear();
const startYearLimit = 2000;
for (let y = startYearLimit; y <= currentYear; y++) {
  const div = document.createElement('div')
  div.textContent = y===startYearLimit ?'<'+startYearLimit : y;
  div.className = 'btn btn-outline-secondary year btn-small'
  div.dataset.year = y
  yearsDiv.appendChild(div)
}


yearsDiv.addEventListener('click', e => {
  if (!e.target.classList.contains('year')) return

  const year = Number(e.target.dataset.year)

  if (startYear === null || endYear !== null) {
    startYear = year
    endYear = null
  } else if (year >= startYear) {
    endYear = year
  } else {
    startYear = year
    endYear = null
  }

  updateUI()
})

function openYearDialog() {
  startYear = null
  endYear = null
  updateUI()
  dialog.showModal()
}

function updateUI() {
  document.querySelectorAll('.year').forEach(el => {
    const y = Number(el.dataset.year)
    el.classList.remove('selected', 'in-range')

    if (y === startYear || y === endYear) {
      el.classList.add('selected')
    }
    if (startYear !== null && endYear !== null && y > startYear && y < endYear) {
      el.classList.add('in-range')
    }
  })
}

// buttons
//document.getElementById('openYearPicker').onclick = () => dialog.showModal()
//document.getElementById('openYearPicker').onclick = () => alert('Year picker is under development.')
document.getElementById('cancel').onclick = () => dialog.close()

document.getElementById('confirm').onclick = () => {
    if (endYear === null) {endYear = startYear }
    lstTimePeriods.push({
    label: endYear!=startYear ? `${startYear}–${endYear}` : `${startYear}`,
    start: startYear, end: endYear,
    tbs: `cdr:1,cd_min:1/1/${startYear},cd_max:12/31/${endYear}` })

    const lastYearIndex = lstTimePeriods.length - 1

    const btn = document.createElement('button')
    btn.className = 'btn btn-outline-secondary btn-year'
    btn.innerText = lstTimePeriods[lastYearIndex].label
    btn.classList.add('active')
    btn.onclick = () => setYear(btn, lastYearIndex)
    document.getElementById('yearButtons').appendChild(btn)

    btn.click()


    dialog.close()

}
