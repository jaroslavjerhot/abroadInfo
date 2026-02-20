async function fAddCountryBtn_smaz(iPos=0){
  if (!(sCountryCsv)){
      sCountryCsv = await fLoadCsv(sCountryListUrl)
      lxdCountries = fCsvToLxd(sCountryCsv)
      const lstCountries = lxdCountries.map(row => row.sSmallLabel);
  
      
      dlCountryList.innerHTML = ''
      lstCountries.forEach((opt) =>{
        const optEl = document.createElement('option')
        optValue = opt.split(', ')[0]
        optEl.value = optValue  
        optEl.id = optValue
        dlCountryList.appendChild(optEl)})

    dlgCountryAdd.addEventListener('close', () => {
      if (dlgCountryAdd.returnValue !== 'ok') {
        //resolve(null)
        return
      }else{
      btn = fCountryNameToBtn(inpCountry.value, iPos=0)
      }
    })

  }
  dlgCountryAdd.showModal()
}

async function fRemoveBtns(sSection){
  // const lstCustom = Object.values(getAllStored(sFilter='btnCountry-')).map(row => row.sSmallLabel)
  const dctCurrentVals = getAllStored('currentVals')['currentVals'] || {}
  const btnsCustom = getAllStored(sFilter=sSection + '-')

  if (Object.entries(btnsCustom).length === 0) {
    showDialog('warn','Nejsou žádná tlačítka k vymazání','')
    return}
  const lxdCustom = Object.values(btnsCustom)
  const lstToDelete = await showCheckBox(lxdCustom, 'sId', 'sLabel', 'Vymaž tlačítka:')
  
  if (!(lstToDelete) || lstToDelete.length===0) return

  lstToDelete.forEach(sId => {
    
    const btn = document.getElementById(sId)
    btn.remove()
    localStorage.removeItem(sId)
    const iPos = btnsIds[sSection][sId]
    btns[sSection].splice(iPos,1)
      
    if (dctCurrentVals[sSection] === sId){
      const dctFirst = btns[sSection][0]
      const btnFirst = document.getElementById(dctFirst.sId)
      //dctCurrentVals[sSection] = btnFirst.id
      //localStorage.setItem('currentVals', JSON.stringify(dctCurentVals));
      fOnBtnClick(btnFirst, dctFirst)
    }

  })
  btnsIds = fGetIdsFromLxd(btns)
}

async function fCountryNameToBtn_smaz(sCountryName, sIdAfter){
  const dct = lxdCountries.find(c => c.sSmallLabel === sCountryName);
  
  if (dct){
    const sSectionId = 'btnCountry'
    dct.sId = sSectionId + '-' + dct.sLabel
    const used = btns.btnCountry.find(c => c.sId === dct.sId);
      if(!(used)){
        dct.sParamGl = dct.sParamGl + ', '
        dct.sParamLr = 'lang_' + dct.sParamLr + ','
        const dct2 = {'sElement': 'btn', 'sOuterDescr': 'Bez:.cz', sSearchEngine: 'google', 'sSiteMinus': ' -site:.cz'}
        const dctBtn = {...dct, ...dct2}
        localStorage.setItem(dctBtn.sId, JSON.stringify(dctBtn));
        btns.btnCountry.push(dctBtn)
        btnsIds = fGetIdsFromLxd(btns)
        const btnContainer = document.getElementById(sSectionId)
        const btn = createButton(btnContainer, dctBtn, iPos)
        fOnBtnClick(btn, dctBtn)
        return btn
      } else {
        showDialog(type = "warn", message = `Tlačítko pro ${sCountryName} již existuje.`, title = "")
      }
  } else {
        showDialog(type = "warn", message = `Země ${sCountryName} není v seznamu.`, title = "")
      }
  return null
}


function fillDatalist(sList, lxdOptions) {
  if (!(lxdOptions)) return 
  const dl = document.getElementById(sList)
    dl.innerHTML = ''
    
  if (sList === 'mediaList'){
    // getStoredUrls().forEach(url => {
      // const opt = document.createElement('option')
      // opt.value = url
      // dl.appendChild(opt)})
      lst = getStoredList('mediaAdded')
      lst.forEach((opt) =>{
        const optEl = document.createElement('option')
        optValue = opt.split(', ')[0]
        optEl.value = optValue  
        optEl.id = optValue
        dl.appendChild(optEl)})
  } else if (sList === 'countryList'){
      lxdOptions.forEach((opt) =>{
        const optEl = document.createElement('option')
        optEl.value = opt.sCountry
        optEl.id = opt.sGl
        dl.appendChild(optEl)})
  }
}

function normalizeAndValidateUrl(value) {
  const v = value.trim().toLowerCase()

  // reject protocol or spaces
  if (/https?:\/\//.test(v) || /\s/.test(v)) return null

  // simple domain validation
  const domainRegex = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/
  if (!domainRegex.test(v)) return null

  return v
}
function openDialog(sInput, sList, sDialog, lxdOptions) {
  return new Promise(resolve => {
    const dialog = document.getElementById(sDialog)
    const input = document.getElementById(sInput)
    const sStorageKey = sList.replace('List','Added')

    fillDatalist(sList, lxdOptions)
    //input.value = ''

    dialog.showModal()

    dialog.addEventListener('close', () => {
      if (dialog.returnValue !== 'ok') {
        resolve(null)
        return
      }

      let sVerified = input.value;
      if (sList === 'mediaList') {
        const sInputName = document.getElementById(sInput.replace('Input', 'Name')).value.trim()
        if (!(sInputName) || !(sVerified)) {
          alert('Musí být zadán název média a/nebo doména, případně klíčové slovo, které se v URL musí vyskytovat.')
          resolve(null)
          return
        }
        sVerified = sInputName + ', ' + sVerified
        //let sVerified = normalizeAndValidateUrl(sVerified)
        // if (!sVerified) {
        //   alert('Musí být zadána URL, např.: seznam.cz')
        //   resolve(null)
        //   return}
        //do nothing
        } else if (sList === 'countryList'){
          const dl = document.getElementById(sList)
          const allowed = Array.from(dl.options).map(o => o.value);
          if (!allowed.includes(sVerified)){
            alert('Musí být zadána země ze seznamu.')
            resolve(null)
            return
          }
        }

      appendStoredList(sVerified, sStorageKey)
      resolve(sVerified)
    }, { once: true })
  })
}
// async function selectMedia() {
//   const url = await selectMediaUrl()
//   if (url) {
//     console.log('Selected:', url)
//   }
// }

function splitSearchTokens(csv, bPure=false) {
  if (!(csv)) return null
  const result = {
    sLabel: '',
    sSitePlus: '',
    sSiteMinus: '',
    sInUrlPlus: '',
    sInUrlMinus: '',
    sCsv: csv,
  };
  csv = csv.replaceAll(' ', '').replaceAll(';', ',') // remove all whitespace
  const parts = csv.split(',').map(p => p.trim()).filter(Boolean);

  //const sLabel = csv.split(',')[0].trim()
  //parts.shift() // remove label from parts
  const sitePlus = [];
  const siteMinus = [];
  const inUrlPlus = [];
  const inUrlMinus = [];

  parts.forEach(p => {
    const isMinus = p.startsWith('-');
    let clean = isMinus ? p.slice(1) : p;

    const isDomain = clean.includes('.') && !clean.startsWith('/') 
    clean = clean.replace(/^\/+|\/+$/g, '');
    if (isDomain) clean = clean.toLowerCase().replace('https://', '').replace('http://', '').replace('www.', '').replace('. ', '.')
    

    if (isDomain && !isMinus) sitePlus.push(clean);
    else if (isDomain && isMinus) siteMinus.push(clean);
    else if (!isDomain && !isMinus) inUrlPlus.push(clean);
    else if (!isDomain && isMinus) inUrlMinus.push(clean);
  });

  let sDescr = '';
  if (sitePlus.length > 0) sDescr += sitePlus.join(', ') + ', ';
  if (siteMinus.length > 0) sDescr += ' -' + siteMinus.join(', -') + ', ';
  if (inUrlPlus.length > 0) sDescr += '/' + inUrlPlus.join(', /') + ', ';
  if (inUrlMinus.length > 0) sDescr += ' -' + inUrlMinus.join(', -/') + ', ';
  sDescr = sDescr.slice(0, -2) // remove trailing comma and space

  if (sitePlus.length + siteMinus.length + inUrlPlus.length + inUrlMinus.length === 0) {
    return null
  }
  if (bPure) return { 
    'sSitePlus': sitePlus.join(','), 
    'sSiteMinus': siteMinus.join(','), 
    'sInUrlPlus': inUrlPlus.join(','), 
    'sInUrlMinus': inUrlMinus.join(','), 
    //'sLabel': sLabel,
    'sDescr': sDescr,
    'sCsv': csv};

  result.sSitePlus = sitePlus[0] ? ' site:' + sitePlus.join(' OR site:'): '';
  result.sSiteMinus = siteMinus[0] ? ' -site:' + siteMinus.join(' -site:').toLowerCase(): '';
  result.sInUrlPlus = inUrlPlus[0] ? ' inurl:' + inUrlPlus.join(' OR inurl:'): '';
  result.sInUrlMinus = inUrlMinus[0] ? ' -inurl:' + inUrlMinus.join(' -inurl:').toLowerCase(): '';
  //result.sLabel = csv.split(',')[0].trim()
  result.sOuterDescr = sDescr
  return result;
}

function fGoogleParamToDates(str) {
  if (!str) return null;

  // Split into key:value pairs
  const parts = str.split(",");
  const obj = {};

  parts.forEach(p => {
    const [key, value] = p.split(":");
    obj[key] = value;
  });

  function normalize(dateStr) {
    if (!dateStr) return null;

    const [d, m, y] = dateStr.split("/");

    const dd = d.padStart(2, "0");
    const mm = m.padStart(2, "0");

    return `${dd}-${mm}-${y}`;
  }

  return {
    start: normalize(obj.cd_min),
    end: normalize(obj.cd_max)
  };
}
function fDatesToGoogleParam(start, end) {
  function format(dateStr) {
    if (!dateStr) return null;
    const [dd, mm, y] = dateStr.split(".");
    // return `${dd}/${mm}/${y}`;
    return `${mm}/${dd}/${y}`;
  }

  const startFormatted = format(start);
  const endFormatted = format(end);

  if (!startFormatted && !endFormatted) return '';
  if (!startFormatted) return `cdr:1,cd_max:${endFormatted}`
  if (!endFormatted) return `cdr:1,cd_min:${startFormatted}`
  return `cdr:1,cd_min:${startFormatted},cd_max:${endFormatted}`;
}

function fDatesToDescr(start, end) {
  if (!start && !end) return '';
  start = start.replaceAll('-0', '-')  
  end = end.replaceAll('-0', '-')
  start = start ? start.split("-").reverse().join(".") : null
  end = end ? end.split("-").reverse().join(".") : null
  if (!start) return `do: ${end}`;
  if (!end) return `od: ${start}`;
  return `od: ${start} do: ${end}`;
}

function fAddBtnByDct(sSection, dct, iPos=0){
  const btnContainer = document.getElementById(sSection)
  const dctBtn = Object.assign({'sElement': 'btn', sSearchEngine: 'google'}, dct)
  localStorage.setItem(dctBtn.sId, JSON.stringify(dctBtn));
  
  btns[sSection].splice(btns[sSection].length+iPos, 0, dctBtn);
  const btn = createButton(btnContainer, dctBtn, iPos)
  btnsIds = fGetIdsFromLxd(btns)
  fOnBtnClick(btn, dctBtn)
}

function fReplaceBtnByDct(sSection, dct){
  const dctBtn = Object.assign({'sElement': 'btn', sSearchEngine: 'google'}, dct)
  localStorage.setItem(dctBtn.sId, JSON.stringify(dctBtn));
  const iPos = btnsIds[sSection][dctBtn.sId]
  btns[sSection][iPos] = dctBtn
  //btnsIds = fGetIdsFromLxd(btns)
  const btn = document.getElementById(dctBtn.sId)
  btn.innerText = dctBtn.sLabel
  fOnBtnClick(btn, dctBtn)
}

function fRemoveBtnById(sSection, sId){
  const btn = document.getElementById(sId)
  btn.remove()
  localStorage.removeItem(sId)
  const iPos = btnsIds[sSection][sId]
  btns[sSection].splice(iPos,1)
  btnsIds = fGetIdsFromLxd(btns)
  const btnFirst = document.getElementById(btns[sSection][0].sId)
  fOnBtnClick(btnFirst, btns[sSection][0])
}

function fTextAreaClear() {
  const textArea = document.getElementById("searchedText");
  textArea.value = "";
  textArea.focus();
}