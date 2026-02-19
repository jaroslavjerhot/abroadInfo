
/* ===============================
   CONFIG
   
================================ */
//const sAppScriptPath = 'c:\Users\jarda\Documents\.My Life\Programovani\JS\abroadInfo\abroadInfo\'
const sTitlePrefix = 'ai: '
//const dctStored = getAllStored();
// removeAllStored()
let dctCurrentVals = getAllStored('currentVals')['currentVals'] || {}
let lstCountries = []


let sCountryCsv = ''
// let dlgCountryAdd = document.getElementById('countryDialog')
// let dlCountryList = document.getElementById('countryList')
// let inpCountry = document.getElementById('countryInput')
let lxdCountries = []

const dctDefaultForm = {
    sText: 'Česko',
    sLang: 'xx',
    //sGeo: 'CZ',
}

//let dctTrans = {}; // translation cache
let dctUrlParams = {}
let sSourceLng = ''

//dctTrans[dctDefaultForm.sLang] = searchedText.value.trim(); // reset default language
// nastaví se radio lng a search URL query nebo podle local storage nebo podle defaultu

function getInitialValues() {
    dctUrlParams = getUrlParams() 
    sSourceLng = dctUrlParams.mLang || dctCurrentVals.sLang || dctDefaultForm.sLang;
    searchedText.value = dctUrlParams.q || dctCurrentVals.sText || dctDefaultForm.sText;
    searchTextOnBlur(); // to set title and store current text in local storage on load

    const radioStored = document.querySelector(
    `input[name="translLng"][value="${sSourceLng}"]`
    );

    if (radioStored) {
    radioStored.checked = true;
    searchedText.setAttribute("lang", radioStored.value);
    }

    const radioTranslLng = document.querySelectorAll('input[name="translLng"]');
    radioTranslLng.forEach(radio => {
    radio.addEventListener("change", function () {
        if (this.checked) {
        searchedText.setAttribute("lang", this.value);
        dctCurrentVals.sLang = this.value;
        const json = JSON.stringify(dctCurrentVals)
        localStorage.setItem('currentVals', json);

        }
    });
    });
}
    // nacte se vstupni query z URL 
searchedText.addEventListener("blur", searchTextOnBlur);

function searchTextOnBlur() {  
    // if text is the same as stored, do nothing
    if (dctCurrentVals.sText == searchedText.value.trim()) return
    // delete all keys strting wit sText- to reset translated texts if query text is changed

    Object.keys(dctCurrentVals).forEach(key => {
        if (key.startsWith('sText-')) {
            delete dctCurrentVals[key]
        }
    })

    dctCurrentVals.sText = searchedText.value.trim();
    dctCurrentVals['sQuery-google'] = ''
    const json = JSON.stringify(dctCurrentVals)
    localStorage.setItem('currentVals', json);
    document.title = sTitlePrefix + dctCurrentVals.sText.trim();
    
}   







let btns = {}

const sBtnClass = 'btn btn-outline-primary'

const periodDialog = document.getElementById('periodDialog')
// const yearsDiv = document.getElementById('years')
//const result = document.getElementById('result')
const translLng = document.getElementById("translLng")

// let startYear = null
// let endYear = null

// const currentYear = new Date().getFullYear()
// const previousYear = currentYear - 1;
// const startYearLimit = 2000;
//     for (let y = startYearLimit; y <= currentYear; y++) {
//         const div = document.createElement('div')
//         div.textContent = y===startYearLimit ?'<'+startYearLimit : y;
//         div.className = 'btn btn-outline-secondary year btn-small'
//         div.dataset.year = y
//         yearsDiv.appendChild(div)
//     }

window.addEventListener('DOMContentLoaded', async () => {
    
    getInitialValues()
    
    const sButtonsCsv = await fLoadCsv(sButtonsListUrl)
    btns = fCsvToGroupedLxd(sButtonsCsv)
    btns = fModifyButtons(btns)
// get stored custom btns and // add them to btns to pos -1
    let lstBtnTypes = ['btnCountry', 'btnTime', 'btnMedia', 'btnOutput']
    let iPos = -1
    lstBtnTypes.forEach(sType => {
        const lxdCustom = Object.values(getAllStored(sFilter=sType+'-'))
        if (lxdCustom.length > 0) {
            lxdCustom.sort((a, b) => a.sLabel.localeCompare(b.sLabel));
            btns[sType].splice(btns[sType].length+iPos, 0, ...lxdCustom);
        }
    })


    btnsIds = fGetIdsFromLxd(btns)

     // load current form from local storage
    dctCurrent = fGetDctFromLocStorage(dctFormKeys, btns)
    // create buttons
    fCreateBtns('btnCountry')
    fCreateBtns('btnTime')
    fCreateBtns('btnMedia')
    fCreateBtns('btnOutput')
})

function fAddButtons_smaz(sSectionId, lst){
    lstBtns = []
    // const dctBase = {'sLxdName': sSection, 'sElement': 'btn', 'sSearchEngine': 'google'}
    const dctBase = {'sElement': 'btn', 'sSearchEngine': 'google'}
    lst.forEach(sToAdd => {
        if (sSectionId === 'btnCountry'){
            const dct = lxdCountries.find(d => d.sCountry === sToAdd)
            let dctToAdd = {'sId': dct.sGl, 'sLabel': dct.sGl,'sSmallLabel': dct.sCountry,
                'sOuterDescr': 'Bez:', 'sSiteMinus': '.cz',
                'sParamGl': dct.sGl, 'sParamLr': dct.sLr }
            dctToAdd = { ...dctBase, ...dctToAdd };
            lstBtns.push(dctToAdd)
        } else if (sSectionId === 'btnMedia'){
            const dct = splitSearchTokens(sToAdd, bPure=true);
            let dctToAdd = {'sOuterDescr': '', 'sSiteMinus': dct.sSiteMinus, 
                'sSitePlus': dct.sSitePlus, 'sInUrlPlus': dct.sInUrlPlus, 'sInUrlMinus': dct.sInUrlMinus,
                'sId': dct.sLabel, 'sLabel': dct.sLabel, 'sSmallLabel': ''}
            dctToAdd = { ...dctBase, ...dctToAdd };
            lstBtns.push(dctToAdd)

        }
    })
    return lstBtns
}

function fModifyButtons(lxd) {
    // go thru sections
    Object.entries(lxd).forEach(([key, list]) => {
        let sSection = key
        // go thru buttons
        list.forEach((dct) => {
            //dct.sParams = ''
            // uprav label
            //dct.sLabel = dct.sLabel + ' '  
            // adds section name to id
            dct.sId = sSection + '-' + dct.sId
            // process prefix and suffix
            dct.sPrefix = dct.sPrefix ? dct.sPrefix + ' ': ''
            dct.sSuffix = dct.sSuffix ? ' ' + dct.sSuffix : ''
            // process sitePlus
            if (dct.sSitePlus){
                dct.sOuterDescr = dct.sOuterDescr + dct.sSitePlus
                dct.sSitePlus = ' site:' + dct.sSitePlus.toLowerCase().replaceAll(',',' OR site:') + ' '
                dct.sSitePlus = dct.sSitePlus.replaceAll(': ', ':') // remove space after colon if exists
                //dct.sParams += dct.sSitePlus
            }
            // process siteMinus
            if (dct.sSiteMinus){
                dct.sOuterDescr = dct.sOuterDescr + dct.sSiteMinus
                dct.sSiteMinus = ' -site:' + dct.sSiteMinus.toLowerCase().replaceAll(',',' -site:') + ' '
                dct.sSiteMinus = dct.sSiteMinus.replaceAll(': ', ':') // remove space after colon if exists
                //dct.sParams += dct.sSiteMinus
            }
            if (dct.sInUrlPlus){
                dct.sOuterDescr = dct.sOuterDescr + dct.sInUrlPlus
                dct.sInUrlPlus = ' inurl:' + dct.sInUrlPlus.toLowerCase().replaceAll(',',' OR inurl:') + ' '
                dct.sInUrlPlus = dct.sInUrlPlus.replaceAll(': ', ':') // remove space after colon if exists
                //dct.sParams += dct.sInUrlPlus
            }
            // process siteMinus
            if (dct.sInUrlMinus){
                dct.sOuterDescr = dct.sOuterDescr + dct.sInUrlMinus
                dct.sInUrlMinus = ' -inurl:' + dct.sInUrlMinus.toLowerCase().replaceAll(',',' -inurl:') + ' '
                dct.sInUrlMinus = dct.sInUrlMinus.replaceAll(': ', ':') // remove space after colon if exists
                //dct.sParams += dct.sInUrlMinus
            }
            if (dct.sParamTbs) {
                dct.sParamTbs = dct.sParamTbs.replace('currentYear-3', new Date().getFullYear()-3)
                if (dct.sParamTbs.includes('last')){
                    const lastMon = getLastWeekDay(1) // get last Monday
                    dct.sParamTbs = dct.sParamTbs.replace('lastMon', formatGoogleDate(lastMon))
                    const lastSun = getLastWeekDay(7) // get last Sunday
                    dct.sParamTbs = dct.sParamTbs.replace('lastSun', formatGoogleDate(lastSun))
                }
                dct.sParamTbs = dct.sParamTbs + ','
            }
                // param lr needs prefix lang_
            dct.sParamLr = dct.sParamLr ? 'lang_' + dct.sParamLr + ',' : ''
            dct.sParamGl = dct.sParamGl ? dct.sParamGl + ',' : ''
            dct.sParamTbm = dct.sParamTbm ? dct.sParamTbm + ',' : ''
            
            
            // cleans up outer description
                dct.sOuterDescr = dct.sOuterDescr.replaceAll(':', ': ').replaceAll(',', ', ').replaceAll('  ', ' ').trim()

            //Object.entries(dct).forEach(([key, value]) => {
            // concatenate all google params
            //     if (value && key.slice(0,6) === 'sParam') {
            //                dct[key]= value + ','

            //     }
            // })
            
            
        })
    })
    return lxd
}

function fModifyMedia_smaz(lxd) {
    // go thru sections
    Object.entries(lxd).forEach(([key, list]) => {
        let sSection = key
        // go thru media
        list.forEach((dct, index) => {
            // adds section name to id
            dct.sId = sSection + '-' + dct.sCountry
            let lstMedia = []
            Object.entries(dct).forEach(([key, value]) => {
            // concatenate all media
                if (value && key.slice(0,6) === 'sMedia') {
                    lstMedia.push(value)}
            })
            // param lr needs prefix lang_

            dct.sMediaSites = ' site:' + lstMedia.join(' OR site:')
            dct.sMediaList = lstMedia.join(', ')
        })
    })
    return lxd
}


function fCreateBtns(sSection) {
    const btnContainer = document.getElementById(sSection)
    btnContainer.innerHTML = ''
    btns[sSection].forEach((dct, index) => {
        const btn = createButton(btnContainer, dct)
        
        if ((dctCurrentVals) && (dctCurrentVals[sSection]===btn.id)) fOnBtnClick(btn, dct)
    })
}

function fSetBtnOnClick(btn, dct){
    if (dct.sOnClick){
        switch (dct.sOnClick){
            case 'modifyCountryBtns': btn.onclick = () => showTableDialog(btns.btnCountry, 'Uprav tlačítka zemí', sLabelKey='sSmallLabel', sIdKey='sId'); break;
            case 'modifyTimeBtns': btn.onclick = () => showTableDialog(btns.btnTime, 'Uprav tlačítka časových období', sLabelKey='sLabel', sIdKey='sId'); break;
            case 'modifyMediaBtns': btn.onclick = () => showTableDialog(btns.btnMedia, 'Uprav tlačítka médií', sLabelKey='sLabel', sIdKey='sId'); break;
            case 'modifyOutputBtns': btn.onclick = () => showTableDialog(btns.btnOutput, 'Uprav tlačítka formátu výstupu', sLabelKey='sLabel', sIdKey='sId'); break;
            default: btn.onclick = () => fOnBtnClick(btn, dct)
        }
    } else {
       btn.onclick = () => fOnBtnClick(btn, dct) 
    }
}

function createButton(btnContainer, dctBtn, iPos=0){
    const btn = document.createElement('button')
        btn.className = dctBtn.sBtnClass || sBtnClass
        btn.id = dctBtn.sId
        // big and small label if exists
        btn.innerHTML = dctBtn.sSmallLabel ? `${dctBtn.sLabel} <small><br>${dctBtn.sSmallLabel}</small>`: dctBtn.sLabel
        // sets onClick event
        fSetBtnOnClick(btn, dctBtn)
        
        
        if (iPos<0){
            const anchorChild = btnContainer.children[btnContainer.children.length + iPos];
            btnContainer.insertBefore(btn, anchorChild);
        } else if (iPos>0){
            const anchorChild = btnContainer.children[iPos];
            btnContainer.insertAfter(btn, anchorChild);
        } else {
            btnContainer.appendChild(btn)
        }
    return btn   
        
}

function fOnBtnClick(btn, dct) {
    const sSection = btn.id.split('-')[0]
    dctCurrentVals = getAllStored('currentVals')['currentVals'] || {}
    const sBtnPrevId = dctCurrentVals[sSection] || btns[sSection][0].sId
    // let dct = fGetDctById(btns, btn.id)
    // const sSection = btn.id.split('-')[0]
    const btnPrev = document.getElementById(sBtnPrevId) || null
    dctCurrentVals[sSection] = btn.id

    
    if (btnPrev) {
        btnPrev.classList.remove('active')
        btnPrev.setAttribute('aria-pressed', 'false')
    }

btn.classList.add('active')
    btn.setAttribute('aria-pressed', 'true')

    document.getElementById(sSection + 'Descr').innerText = dct.sOuterDescr || ''
    dctCurrentVals['sQuery-google'] = ''
    const json = JSON.stringify(dctCurrentVals)
    localStorage.setItem('currentVals', json);
    // localStorage.setItem('currentVals', JSON.stringify({[sSection]: btn.id}));
    // const x = getAllStored('currentVals')

}

async function fOpenSelectDialog_smaz(sSectionId) {
    if (sSectionId === 'btnTime'){
        //openPeriodDialog()
        const sTimeToAdd = await openDialog('timeInput', 'timeList', 'timeDialog', null)
        
    }
    if (sSectionId === 'btnMedia'){
        const sMediaToAdd = await openDialog('mediaInput', 'mediaList', 'mediaDialog', btns.btnMedia)
        const dct = splitSearchTokens(sMediaToAdd);
        if (!(dct)) return
        const btnContainer = document.getElementById(sSectionId)
        dctBtn = {'sElement': 'btn', 'sSearchEngine': 'google', 'sOuterDescr': dct.sDescr, 'sSiteMinus': dct.sSiteMinus, 
            'sSitePlus': dct.sSitePlus, 'sInUrlPlus': dct.sInUrlPlus, 'sInUrlMinus': dct.sInUrlMinus,
            'sId': sSectionId + '-' + dct.sLabel, 'sLabel': dct.sLabel, 'sSmallLabel': ''}
        btns.btnMedia.push(dctBtn)

        const btn = createButton(btnContainer, sBtnClass, dctBtn.sId, dctBtn.sLabel, dctBtn.sSmallLabel, '', -1)
        btn.click()
    }if (sSectionId === 'btnCountry'){
        const sCountryToAdd = await openDialog('countryInput', 'countryList', 'countryDialog', lxdCountries)
        if (!(sCountryToAdd)) return
        dct = lxdCountries.find(d => d.sCountry === sCountryToAdd)
        const btnContainer = document.getElementById(sSectionId)
        dctBtn = {'sElement': 'btn', 'sSearchEngine': 'google', 'sOuterDescr': 'Bez:.cz', 'sSiteMinus': " (-site:.cz)",
            'sId': 'btnCountry-' + dct.sGl, 'sLabel': dct.sGl, 'sSmallLabel': dct.sCountry,
            'sParamGl': dct.sGl + ',', 'sParamLr': 'lang_' + dct.sLr + ','}
        // const btn = createButton(btnContainer, sBtnClass, 'btnCountry-' + dct.sGl, dct.sGl, dct.sCountry, '', -1)
        btns.btnCountry.push(dctBtn)
        const btn = createButton(btnContainer, sBtnClass, dctBtn.sId, dctBtn.sLabel, dctBtn.sSmallLabel, '', -1)
        btn.click()
    }
    
    const x=0
    //const dialog = document.getElementById(sSectionId + 'Dialog')
    
}





// document.addEventListener('DOMContentLoaded', () => {
    
    // setDefaultQueryFromUrl();
    //updateTitleFromInput(); // <-- set title immediately on load
    // createCountryButtons();
    // createYearButtons();
    // createMediaButtons();
    // setSearchTypeFromStorage();
    //loadEventsCSV();
    //initEventSelector();

// })


/* ===============================
   QUERY FROM URL
================================ */


function setDefaultQueryFromUrlsmazat() {
    const params = new URLSearchParams(window.location.search)
    dctCurrForm.sText = (params.get('q') || '').trim() || localStorage.getItem('searchedText')  || dctDefaultForm.sText;
    dctCurrForm.sLang = (params.get('l') || '').trim() || dctDefaultForm.sLang;
    dctCurrForm.sGeo = (params.get('g') || '').trim() || dctDefaultForm.sGeo;
    searchedText.value = dctCurrForm.sText;
    return dctCurrForm;
}

function updateTitleFromInputsmaz() {
    dctCurrentVals.sText = searchedText.value.trim() ;
    //dctCurrForm.sText = searchedText.value.trim() ;
    //document.title = 'aInfo' + (text ? ': ' + text : 'Česko');
    document.title = sTitlePrefix + dctCurrentVals.sText;
}

function setSearchTypeFromStorage_smaz() {
    const lastType = localStorage.getItem('lastSearchType');
    if (lastType) {
        const r = document.querySelector(`input[name="searchType"][value="${lastType}"]`)
        if (r) r.checked = true
    }
}





/* ===============================
   SEARCH LOGIC
================================ */
async function runSearch_smazat(sDevice = 'desktop') {
    const text = searchedText.value.trim()
    if(!text) return
    
    if (text !== dctTrans[dctDefaultForm.sLang]) {
        dctTrans = {}  // clear dictionary
        dctTrans[dctDefaultForm.sLang] = text
        document.title = sTitlePrefix + text;
    }
    
    const sSrcLang = document.querySelector('input[name="translLng"]:checked').value
    
    dctCurrent.sSrcLang = sSrcLang
    if (sSrcLang!='xx') dctTrans[dctCurrent.sSrcLang] = text
    dctCurrent.sTargetLang = btns.btnCountry.find(d => d.sId === dctCurrent.btnCountry).sParamLr
    dctCurrent.sTargetLang = dctCurrent.sTargetLang.replace('lang_','').replace(',','')
    //const lang = dctCountryConfig[selectedCountry].lang
    //alert('Searching for: ' + text + '\nLanguage: ' + lang)
    if (!(dctCurrent.sTargetLang in dctTrans)  && sSrcLang!='xx') {
        try {
            const translated = await translateText(text, dctCurrent.sSrcLang, dctCurrent.sTargetLang);
            // Prompt the user to edit/confirm the search query
            let finalText = prompt('Uprav do ' + dctCurrent.sTargetLang.toUpperCase() + ' přeložený text, pokud je třeba:', translated);
            if (!finalText) return;
            dctTrans[dctCurrent.sTargetLang] = finalText;
            runEngineQuery(finalText, sDevice)
        } catch {
            runEngineQuery(searchedText.value.trim(), sDevice)
        }
    } else {
        runEngineQuery(searchedText.value.trim(), sDevice)
    }
}

async function translateText(text, src, target) {
    //if(lang === dctDefaultForm.sLang) return text
    if (!src || !target || src === target) return text;
    const url = 
        'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text) + '&langpair='+src+'|'+target
    const response = await fetch(url)
    const data = await response.json()
    if(!data.responseData?.translatedText) throw new Error('Translation failed')
    return data.responseData.translatedText
}

function getParamsStrFromActiveBtnsSmaz(sType){
    const dict = btns[sType].find(d => d.sId === dctCurrent[sType])
    const qs = Object.entries(dict)
        .filter(([k, v]) => k.startsWith('sParam') && v)
        .map(([k, v]) => {
            const param = k.slice('sParam'.length).toLowerCase()
            return `&${param}=${encodeURIComponent(v)}`
        })
        .join('')
    return qs
}

async function runEngineQuery(sDevice, sEngine) {

    const lxdSelected = [
        btns.btnCountry.find(d => d.sId === dctCurrentVals.btnCountry) || btns.btnCountry[0],
        btns.btnTime.find(d => d.sId === dctCurrentVals.btnTime) || btns.btnTime[0],
        btns.btnMedia.find(d => d.sId === dctCurrentVals.btnMedia) || btns.btnMedia[0],
        btns.btnOutput.find(d => d.sId === dctCurrentVals.btnOutput) || btns.btnOutput[0]]

    let dctMerged = {}
    dctMerged = {}
    lxdSelected.forEach((dct) => {
        Object.entries(dct).forEach(([key, value]) => {
            dctMerged[key] = (dctMerged[key] ??  '') + value
        })
    })

    dctMerged.sParams = ''
    let sTargetLng = ''
    Object.entries(dctMerged).forEach(([key, value]) => {
        if (value && key.slice(0,6) === 'sParam') {
            dctMerged[key]='&' + key.slice(6,).toLowerCase() + '=' + value.toLowerCase().slice(0,-1)
            dctMerged.sParams += dctMerged[key]
        }
        if (key === 'sParamLr') {
            sTargetLng = value.replace('lang_','').replace(',','')
        }
        if (!(dctMerged[key])) dctMerged[key] = ''
    });

    if (dctMerged.sSitePlus + dctMerged.sInUrlPlus + dctCurrentVals.sText === '') {
        showDialog('err', 'Nebylo nic zadáno k hledání.', '')
        return
    }
    // if site plus is set remove gl and hl to avoid google ignoring site: in favor of lang/geo
    if (dctMerged.sSitePlus) {
        dctMerged.sParams = dctMerged.sParams.replace(/&gl=[^&]+/, '').replace(/&lr=[^&]+/, '')
        dctMerged.sSiteMinus = ''
    }
    // for trading economics force hl=en to get english results even for other country selection
    dctMerged.sSearchEngine = dctMerged.sSearchEngine.replaceAll('google','') 
    if (dctMerged.sSearchEngine) {
        sTargetLng = lxdSelected[2].sParamLr.replace('lang_','').replace(',','') || 'en'
    }
    // translate query back to source language for search if needed
    let sQueryText = dctCurrentVals.sText
    if (sQueryText &&!dctCurrentVals['sText-'+sTargetLng] && sTargetLng && sSourceLng && sSourceLng !== 'xx') {
        try {
            sQueryText = await translateText(sQueryText, sSourceLng, sTargetLng)
            sQueryText = await showInput('Uprav do ' + sTargetLng.toUpperCase() + ' přeložený text, pokud je třeba:','', sQueryText)
            if (!sQueryText) return;
            dctCurrentVals['sText-'+sTargetLng] = sQueryText
            const json = JSON.stringify(dctCurrentVals)
            localStorage.setItem('currentVals', json);
        } catch (e) {
            console.error(e)
        }
    } else {
        sQueryText = dctCurrentVals['sText-'+dctCurrent.sTargetLng] || sQueryText
    }
    let sUrl = ''
    if (dctMerged.sSearchEngine) {

        sUrl = dctMerged.sSearchEngine.replace('#', encodeURIComponent(sQueryText))
    } else {
        dctMerged.sSearchEngine = 'https://www.google.com/search?q=#'
        sQueryText = dctMerged.sSitePlus + ' ' + dctMerged.sSiteMinus + ' ' + dctMerged.sInUrlPlus + ' ' + dctMerged.sInUrlMinus + ' ' +
            dctMerged.sQueryPrefix + ' ' + sQueryText + ' ' + dctMerged.sQuerySuffix

            
        sQueryText = sQueryText.replaceAll('  ', ' ').replaceAll('  ', ' ').trim()
        sQueryText = encodeURIComponent(sQueryText)
        sUrl = dctMerged.sSearchEngine.replace('#', sQueryText + dctMerged.sParams)

        // add parameters from url config
        const sSrcMedia = dctUrlParams.m || 'aBroadInfo';
        sUrl += '&sourceMedia=' + sSrcMedia +
            '&sourceTitle=' + (dctCurrentVals.sText || dctMerged.sSitePlus || dctMerged.sInUrlPlus).trim() +
            '&targetCountry=' + lxdSelected[0].sSmallLabel
    }
    document.title = sTitlePrefix + (dctCurrentVals.sText || dctMerged.sSitePlus || dctMerged.sInUrlPlus).trim();

    //dctCurrentVals['sQuery-google'] = sUrl

    sUrl = translateQuery(sEngine, sUrl) // to set query for other engines based on google query
    doClick(sDevice, sUrl)

}
/* ===============================
   ADMIN EVENTS CSV LOAD
================================ */
async function loadEventsCSVsmaz() {
    let csv = localStorage.getItem('eventsCSV');

    if (!csv) {
        const res = await fetch('events.csv');
        csv = await res.text();
    }
    return parseCSV(csv);
}

function parseCSVsmaz(text) {
    const lines = text.trim().split('\n');
    const headers = lines.shift().split(';');

    return lines.map(l => {
        const o = {};
        l.split(';').forEach((v, i) => o[headers[i]] = v || null);
        return o;
    });
}



function dateToYYYY_MM_smaz(str) {
    // str = "31.12.2025"
    if (!str) return '_____-___';
    const [day, month, year] = str.split('.');
    return `${year}-${month.padStart(2,'0')}`;
}

function dateToUsformat_smaz(str) {
    if (!str) return '';
    const parts = str.split('.');
    if (parts.length !== 3) return '';
    const [day, month, year] = parts;
    return `${month.padStart(2,'0')}/${day.padStart(2,'0')}/${year}`;
}

function translateQuery(sEngine, sUrl){
    if (!dctCurrentVals['sQuery-google']){
// vymazou se i ostatni query
        Object.keys(dctCurrentVals).forEach(key => {
        if (key.startsWith('sQuery-')) {
            delete dctCurrentVals[key]
        }
    });
    }
    dctCurrentVals['sQuery-google'] = sUrl
    if (dctCurrentVals['sQuery-google']) {
        json = JSON.stringify(dctCurrentVals)
        localStorage.setItem('currentVals', json)
    } else {
        showDialog('err', 'Něco se pokazilo.', '')
        return
    }
    // pokud pro dany engine neni query, vytvori se z google query a ulozi
    if (!dctCurrentVals['sQuery-' + sEngine]) {
        dctCurrentVals['sQuery-' + sEngine] = convertGoogleTo(sEngine, dctCurrentVals['sQuery-google'])
        json = JSON.stringify(dctCurrentVals)
        localStorage.setItem('currentVals', json)
    }
    const sUrlTransl = dctCurrentVals['sQuery-' + sEngine]
    return sUrlTransl
}

function doClick(sDevice, sUrl){
    
    if (sDevice === 'desktop') {
        // createLinkPage(url);
        
        const a = document.createElement('a');
            a.href = sUrl;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            document.body.appendChild(a);
            a.click();                    // 👈 Safari allows this
            a.remove();

    } else {
        window.open(sUrl, '_blank')
    }



}