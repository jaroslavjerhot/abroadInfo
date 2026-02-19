function showDialog(type = "info", message = "", title = "") {
  const dialog = document.createElement("dialog");
  dialog.style.width = "400px";      // make dialog wider
    dialog.style.padding = "20px";     // optional: padding

  const styles = {
    info:  { color: "#2b6cb0", icon: "ℹ️" },
    warn:  { color: "#d69e2e", icon: "⚠️" },
    error: { color: "#c53030", icon: "❌" }
  };

  const config = styles[type] || styles.info;

    htmlFormStart = `
    <form method="dialog" style="min-width:300px;padding:20px;">
    `
    htmlTitle = title ? `  
        <h4 style="margin-top:0;color:${config.color}">
        ${title || type.toUpperCase()}
      </h4>` : ''

    htmlMessage = message ?`
      <p>${config.icon} ${message}</p>` : ''
    htmlButtons = `
      <div style="text-align:right;margin-top:20px;">
        <button class="btn btn-success" value="OK">OK</button>
      </div>
      `
    htmlFormEnd = `
      </form>
        `;
  dialog.innerHTML = htmlFormStart + htmlTitle + htmlMessage + htmlButtons + htmlFormEnd

  document.body.appendChild(dialog);
  dialog.showModal();

  dialog.addEventListener("close", () => {
      const result = dialog.returnValue; // 👈 this is the key
      dialog.remove();
      //resolve(result);
    });

}

// const result = await showDialog("Delete this period?");
// const xxx = await showInput('Zadej zemi:', title = "Enter value", defaultValue = sCountryName)

function showInput(message, title = "Enter value", defaultValue = "") {
  return new Promise((resolve) => {
    const dialog = document.createElement("dialog");

    dialog.innerHTML = `
      <form method="dialog" style="padding:20px;min-width:300px;">
        <h4 style="margin-top:0;">${title}</h4>
        <p>${message}</p>
        
        <textarea rows="2" placeholder="Enter search text..."
          name="inputValue"
          lang="en"          autocapitalize="none"
          autocomplete="off" autocorrect="off" style="overflow:hidden"
          spellcheck="false"
          style="width:100%;margin-top:10px;padding:6px;"
          >${defaultValue}</textarea>
        <br>

        <div style="text-align:right;margin-top:20px;">
          <button value='Zruš' class="btn btn-outline-secondary">Zavři</button>
          <button value="ok" class="btn btn-success">OK</button>
        </div>
      </form>
    `;

    document.body.appendChild(dialog);
    //textarea.blur(); // prevent mobile keyboard from opening immediately



    const form = dialog.querySelector("form");
    const input = dialog.querySelector("textarea");

    dialog.showModal();
    input.focus();
    //input.select();

    dialog.addEventListener("close", () => {
      if (dialog.returnValue === "ok") {
        resolve(input.value.trim());
      } else {
        resolve(null);
      }
      dialog.remove();
    });
  });
}

async function showCheckBox(lxd, sId, sLabel, title = "Select items") {
  return new Promise((resolve) => {
    const dialog = document.createElement("dialog");
    dialog.style.width = "400px";      // make dialog wider
    dialog.style.padding = "20px";     // optional: padding

    // Build dialog content
    dialog.innerHTML = `
      <form method="dialog">
        <label><b>${title}</b></label>
        ${lxd.map((dct, i) => `
          <div style="display:flex; align-items:left; gap:6px; margin-bottom:4px;">
            <input type="checkbox" id="chk_${i}" value="${dct[sId]}">
            <label for="chk_${i}" style="margin:0;">${dct[sLabel]}</label>
          </div>
        `).join("")}
        <div style="text-align:right;margin-top:20px;">
          <button value='Zruš' class="btn btn-outline-secondary">Cancel</button>
          <button value="ok" class="btn btn-success">OK</button>
        </div>
      </form>
    `;

    document.body.appendChild(dialog);

    dialog.showModal(); // ⬅ important, makes it appear as a modal

    dialog.addEventListener("close", () => {
      if (dialog.returnValue === "ok") {
        const selected = Array.from(dialog.querySelectorAll("input[type=checkbox]:checked"))
          .map(chk => chk.value);
        resolve(selected);
      } else {
        resolve([]);
      }
      dialog.remove();
    });
  });
}


function showTableDialog(lxd, sHeadline, sLabelKey='sLabel', sIdKey='sId') {
  
  const lxdCustom = lxd.filter(item => item.bCustom === 1);
  
  const dialog = document.createElement("dialog");
  dialog.name = "tableDialog-"+ sHeadline.replace(/\s/g, '');
  dialog.className = "p-4";
    const headline = document.createElement("p");
    headline.textContent = sHeadline;
    headline.className = "fw-bold fs-5 mb-3";

    dialog.appendChild(headline);


  // make it a bit wider
  dialog.style.width = "600px";

  // create table
  const table = document.createElement("table");
  //table.className = "table table-striped"

  lxdCustom.forEach(dct => {
    const tr = document.createElement("tr");

    // label cell
    const tdLabel = document.createElement("td");
    tdLabel.className="w-100"
    tdLabel.textContent = dct[sLabelKey];
    tr.appendChild(tdLabel);

    
    const tdBtns = document.createElement("td");
    tdBtns.className = "text-end"

    const btnContainer = document.createElement("div");
    btnContainer.className = "d-inline-flex gap-1";
    

    btnContainer.appendChild(makeBtn("✎", 'edit-'+dct.sId, 'icon', 'closeAfter', () => fEditBtn(dct)));
    btnContainer.appendChild(makeBtn("✖", 'remove-'+dct.sId, 'icon', 'closeAfter', () => fRemoveBtn(dct)));
    tdBtns.appendChild(btnContainer)
    tr.appendChild(tdBtns);

    table.appendChild(tr);
  });

  dialog.appendChild(table);

  // close button

   const bottomDiv = document.createElement("div");
   bottomDiv.style = "text-align:right;margin-top:20px;"
   
    bottomDiv.appendChild(makeBtn("Nový", '', sClass = 'blue', sType='closeAfter', () => fAddBeforeLastBtn(lxd[0])));
    bottomDiv.appendChild(makeBtn("Zavři", '', sClass='gray', sType='closeAfter', () => {}));
    dialog.appendChild(bottomDiv)

  document.body.appendChild(dialog);
  dialog.showModal();


}

// helper to create button
function makeBtn(sLabel, sId=null, sClass=null, sType=null, handler=null) {
    const btn = document.createElement("button");
    if (sType) btn.type = sType
    if (sId) btn.id = sId
    
    switch (sClass){
        case 'icon': sClass = "btn btn-sm text-primary btn-outline-primary bg-transparent p-1 icon-btn"; break
        case 'ok': sClass = "btn btn-success btn-sm"; break
        case 'blue': sClass = "btn btn-primary btn-sm me-2"; break
        case 'gray': sClass="btn btn-secondary btn-sm"; break
        case 'cancel': sClass = "btn btn-outline-secondary btn-sm"; break
    }
    if (sClass) btn.className = sClass
    btn.textContent = sLabel;

    if (sType === 'closeAfter'){
        btn.addEventListener("click", (e) => {
        e.currentTarget.closest("dialog").close();  // close dialog explicitly
        
          handler();   // call it
        });
    }else{
        btn.addEventListener("click", handler);
    }
    
    
    return btn;

}

function makeClosingBtn_smazat(sLabel, sId=null, sClass=null, sType=null, handler=null) {
    const closeHandler = () => {handler; dialog.close();}
    return makeBtn(sLabel, sId, sClass, sType, closeHandler)
}

// function fAddOverBtn(dct) {
//   console.log("↑＋", id);
// }

async function fAddBeforeLastBtn(dct) {
  
  sSection = dct.sId.split('-')[0]
  switch (sSection){
    case 'btnCountry': {
      const dct2 = await showCountryDialog(null)
      fAddBtnByDct(sSection, dct2, -1); 
      showTableDialog(btns.btnCountry, 'Uprav tlačítka zemí', sLabelKey='sSmallLabel', sIdKey='sId')      
      break}
    case 'btnTime': {
      const dct2 = await showTimePeriodDialog(null)
      fAddBtnByDct(sSection, dct2, -1); 
      showTableDialog(btns.btnTime, 'Uprav tlačítka časových období', sLabelKey='sLabel', sIdKey='sId')      
      break}
    case 'btnMedia': {
      const dct2 = await showMediaDialog(null)
      fAddBtnByDct(sSection, dct2, -1); 
      showTableDialog(btns.btnMedia, 'Uprav tlačítka médií', sLabelKey='sLabel', sIdKey='sId')      
      break}
    case 'btnOutput': break
  }
// this.close()   
}

async function fEditBtn(dct) {
    sSection = dct.sId.split('-')[0]
  switch (sSection){
    case 'btnCountry': {
      const dct2 = await showCountryDialog(dct)
      fReplaceBtnByDct(sSection, dct2); 
      showTableDialog(btns.btnCountry, 'Uprav tlačítka zemí', sLabelKey='sSmallLabel', sIdKey='sId')      
      break}
    case 'btnTime': {
      const dct2 = await showTimePeriodDialog(dct)
      fReplaceBtnByDct(sSection, dct2); 
      showTableDialog(btns.btnTime, 'Uprav tlačítka časových období', sLabelKey='sLabel', sIdKey='sId')      
      break}
    case 'btnMedia': {
      const dct2 = await showMediaDialog(dct)
      fReplaceBtnByDct(sSection, dct2); 
      showTableDialog(btns.btnMedia, 'Uprav tlačítka médií', sLabelKey='sLabel', sIdKey='sId')      
      break}
    case 'btnOutput': break
    }
}


async function fRemoveBtn(dct) {
  sSection = dct.sId.split('-')[0]
  const sAnswer = await showMultiButtonDialog('Opravdu chceš smazat "'+dct.sLabel+'"?', 'Smazat', ['Zrušit', 'Smazat'])
  if (sAnswer === 'Smazat') {
    fRemoveBtnById(sSection, dct.sId); 
  }
 }
// Helper to create input row
function createInputRow(labelText, type = "text", value = "") {
    const div = document.createElement("div");
    div.className = "mb-3";

    const label = document.createElement("label");
    label.textContent = labelText;
    label.className = "form-label";
    
    const input = document.createElement("input");
    input.value = value;
    input.className = "form-control";      
    
    if (type === 'text' || type === 'date') {
      input.type = type;
    } else if (type === 'date-text') {  
      input.type = "text";        // IMPORTANT
      input.setAttribute('inputmode', 'numeric');  // numeric keyboard
      input.setAttribute('pattern', '[0-9/]*');    // optional: help validation

      // Add it to DOM first
     
      
  //     flatpickr(input, {
  //       // appendTo: div.closest('dialog'), // or dialog container
  //       defaultDate: new Date(2020, 11, 31),
  //       dateFormat: "d.m.Y",
  //       allowInput: true,
  //       monthSelectorType: "dropdown",
  //       yearSelectorType: "dropdown",
  //       onOpen: function() {
  //   // Hide the dialog
  //   dialog.modal('hide');
  // },
  // onClose: function() {
  //   // Optional: reopen the dialog if you want
  //   dialog.modal('show');
  // }
  //     });
  //     const x = flatpickr.parseDate(value, "Y-m-d");
     }
    
    div.appendChild(label)
    div.appendChild(input)
    
    return { div, input };
}

async function showTimePeriodDialog(dct) {
    if (dct){
        const dctDates = fGoogleParamToDates(dct.sParamTbs)
        let lstStart = dctDates.start.split('-');
        dct.dStart = lstStart[1] + '.' + lstStart[0] + '.' + lstStart[2];
        let lstEnd = dctDates.end.split('-');
        dct.dEnd = lstEnd[1] + '.' + lstEnd[0] + '.' + lstEnd[2];
    }else{
        dct = {'sId':'', 'sLabel':'', dStart: "1.1.2020", dEnd: "31.12.2020"}
    }
    return new Promise((resolve) => {
    const dialog = document.createElement("dialog");
    dialog.name = "timePeriodDialog";
    dialog.className = "p-4";

    // Headline
    const headline = document.createElement("p");
    headline.textContent = "Definuj časové období";
    headline.className = "fw-bold fs-5 mb-3";
    dialog.appendChild(headline);
    // document.body.appendChild(dialog);
    
    // Inputs
    const startRow = createInputRow("Počáteční datum", "date-text", dct.dStart);
    const endRow = createInputRow("Koncové datum", "date-text", dct.dEnd);
    const nameRow = createInputRow("Název časového období (např. Volby ČR 2021)", "text", dct.sLabel);
    
    dialog.appendChild(startRow.div);
    dialog.appendChild(endRow.div);
    dialog.appendChild(nameRow.div);

    
    
    // ckeck date and Update end date automatically
    startRow.input.addEventListener("blur", () => {
      const startDate = fConvertDMY(startRow.input.value);
      if (startDate) {
        const year = startDate.getFullYear();
        const defaultEnd = `31.12.${year}`;
        
        // if (isNaN(endDate.getTime()) || endDate < startDate) {
          //endRow.input.value = defaultEnd;
        // }
        // nameRow.input.value = nameRow.input.value ? nameRow.input.value : `${year}`; // simple default name based on year
      } else {
        showDialog("error", `Datum ${startRow.input.value} není platné! Použij formát d.m.r`, '');
      }
    });
    endRow.input.addEventListener("blur", () => {
      const endDate = fConvertDMY(endRow.input.value);
      if (endDate) {
        const year = endDate.getFullYear();
        nameRow.input.value = nameRow.input.value ? nameRow.input.value : `${year}`; // simple default name based on year
        } else {
        showDialog("error", `Datum ${endRow.input.value} není platné! Použij formát d.m.r`, '');
      }
    });
    
    // Buttons
    const btnDiv = document.createElement("div");
    btnDiv.className = "text-end mt-3";

    const btnOk = document.createElement("button");
    btnOk.type = "button";
    btnOk.textContent = "OK";
    btnOk.className = "btn btn-primary btn-sm me-2";
    btnOk.addEventListener("click", () => {
      const name = nameRow.input.value.trim();
      const start = startRow.input.value;
      const end = endRow.input.value;

      if (!name) { 
        showDialog("error", "Název období nesmí být prázdný!", "Chyba");
        // alert("Period name cannot be empty!"); 
        return; }
      if (name.length > 20) {
        showDialog("error", "Název období je příliš dlouhý! Max 20 znaků.", "Chyba");
        return; }
      const lstBtnsNames = Array.from(document.querySelectorAll("button[id^='btnTime-']")).map(btn => btn.textContent);
      if (lstBtnsNames.includes(name) && name !== dct.sLabel) {
        showDialog("error", "Tlačítko s názvem '" + name + "' již existuje!", "Chyba");
        return; }
      // if (!start || !end) { 
      //   showDialog("error", "Obě data musí být vyplněna!", "Chyba");
      //   return; }
      if (new Date(start) > new Date(end)) { 
        showDialog("error", "Počáteční datum musí být před koncovým datem!", "Chyba");
        return; }
    
    const dctOut = {'sLabel':name, 'sOuterDescr': fDatesToDescr(start, end), 'sParamTbs': fDatesToGoogleParam(start, end)+','};
    dctOut.sId = dct.sId || 'btnTime-' + name;
    dctOut.bCustom = 1;

    // return dct
      resolve(dctOut);
      dialog.close();
      dialog.remove();


      
    });

    const btnCancel = document.createElement("button");
    btnCancel.type = "button";
    btnCancel.textContent = 'Zruš';
    btnCancel.className = "btn btn-secondary btn-sm";
    btnCancel.addEventListener("click", () => {
      //resolve(null);
      dialog.close();
      dialog.remove();
    });

    btnDiv.appendChild(btnOk);
    btnDiv.appendChild(btnCancel);
    dialog.appendChild(btnDiv);

    document.body.appendChild(dialog);
    dialog.showModal();
   });
}

async function showMediaDialog(dct) {
  dct = dct || {}  
    return new Promise((resolve) => {
    const dialog = document.createElement("dialog");
    dialog.name = "mediaDialog";
    dialog.className = "p-4";

    // Headline
    const headline = document.createElement("p");
    headline.textContent = "Definuj filtr pro média";
    headline.className = "fw-bold fs-5 mb-3";
    dialog.appendChild(headline);

    const descr = document.createElement("p");
    descr.innerHTML = `
      Zadej název domény (třeba <b>seznamzpravy.cz</b>), případně klíčové slovo, které se v URL musí vyskytovat. Klíčové slovo musí mít na začáktu lomítko
      Např. po zadání klíčového slova <b>/prezidentpavel</b> se budou prohledávat Pavlovy sociální sítě, protože ve své adrese mají toto klíčové slovo.
      <br>
      Lze zadat i několik domén nebo klíčových slov oddělených čárkou. 
      <br>
      Pokud na začátku domény nebo klíčového slova zadáš mínus, budou se prohledávat všechny stránky kromě těch, které obsahují toto slovo v URL.
      `
    //descr.className = "small text-muted mb-3";  
    dialog.appendChild(descr);

    
    // Inputs
    const filterRow = createInputRow("Doména nebo klíčové slovo", "text", dct.sOuterDescr || "");
    const nameRow = createInputRow("Název filtru", "text", dct.sLabel);
    
    dialog.appendChild(filterRow.div);
    dialog.appendChild(nameRow.div);
    
    // Update name automatically
    filterRow.input.addEventListener("blur", () => {
      const filter = filterRow.input.value.trim();
      if (filter && !nameRow.input.value.trim()) {
        filterRow.input.value = filter.replace('https://', '').replace('http://', '').replace('www.', '').replace('. ', '.').toLowerCase(); // simple heuristic for name
        nameRow.input.value = filter.split(',')[0].replace('https://', '').replace('http://', '').replace('www.', '').replace('. ', '.'); // simple heuristic for name
      }
    });
        

    // Buttons
    const btnDiv = document.createElement("div");
    btnDiv.className = "text-end mt-3";

    const btnOk = document.createElement("button");
    btnOk.type = "button";
    btnOk.textContent = "OK";
    btnOk.className = "btn btn-primary btn-sm me-2";
    btnOk.addEventListener("click", () => {
      const name = nameRow.input.value.trim();
      const filter = filterRow.input.value.trim();

      if (!name) { 
        showDialog("error", "Název filtru nesmí být prázdný!", "Chyba");
        // alert("Period name cannot be empty!"); 
        return; }
      if (name.length > 20) {
        showDialog("error", "Název filtru je příliš dlouhý! Max 20 znaků.", "Chyba");
        return; }
      const lstBtnsNames = Array.from(document.querySelectorAll("button[id^='btnMedia-']")).map(btn => btn.textContent);
      if (lstBtnsNames.includes(name) && name !== dct.sLabel) {
        showDialog("error", "Tlačítko s názvem '" + name + "' již existuje!", "Chyba");
        return; }
      dctTokens = splitSearchTokens(filter)
      if (!dctTokens) {
        showDialog("error", "Filtr se nepodařilo zpracovat!", "Chyba");
        return; }
      
    
    const dctOut = dctTokens
    dctOut.sId = dct.sId || 'btnMedia-' + name;
    dctOut.sLabel = name;
    dctOut.bCustom = 1;

    // return dct
      resolve(dctOut);
      dialog.close();
      dialog.remove();


      
    });

    const btnCancel = document.createElement("button");
    btnCancel.type = "button";
    btnCancel.textContent = 'Zruš';
    btnCancel.className = "btn btn-secondary btn-sm";
    btnCancel.addEventListener("click", () => {
      //resolve(null);
      dialog.close();
      dialog.remove();
    });

    btnDiv.appendChild(btnOk);
    btnDiv.appendChild(btnCancel);
    dialog.appendChild(btnDiv);

    document.body.appendChild(dialog);
    dialog.showModal();
   });
}

async function showCountryDialog(dct) {
  dct = dct || {}  
  if (!(sCountryCsv)){
      sCountryCsv = await fLoadCsv(sCountryListUrl)
      lxdCountries = fCsvToLxd(sCountryCsv)
      lstCountries = lxdCountries.map(row => row.sSmallLabel);
  }
    return new Promise((resolve) => {
    const dialog = document.createElement("dialog");
    dialog.name = "countryDialog";
    dialog.className = "p-4";

    // Headline
    const headline = document.createElement("p");
    headline.textContent = "Vyber zemi";
    headline.className = "fw-bold fs-5 mb-3";
    dialog.appendChild(headline);

    
    // Inputs
    
    const nameRow = createInputRow("Země", "text", dct.sSmallLabel);
    // const dataList = Object.values(lstCountries).map(dct => dct.sSmallLabel);
    const dataList = lstCountries;
    const dataListId = "country-options";
    const dataListElem = document.createElement("datalist");
    dataListElem.id = dataListId;
    dataList.forEach(label => {
      const option = document.createElement("option");
      option.value = label;
      dataListElem.appendChild(option);
    });
      dialog.appendChild(nameRow.div);
      nameRow.input.setAttribute("list", dataListId);
      dialog.appendChild(dataListElem);

    
    
    // Buttons
    const btnDiv = document.createElement("div");
    btnDiv.className = "text-end mt-3";

    const btnOk = document.createElement("button");
    btnOk.type = "button";
    btnOk.textContent = "OK";
    btnOk.className = "btn btn-primary btn-sm me-2";
    btnOk.addEventListener("click", () => {
      const name = nameRow.input.value.trim();
      
      if (!name) { 
        showDialog("error", "Název filtru nesmí být prázdný!", "Chyba");
        // alert("Period name cannot be empty!"); 
        return; }
      const iCountry = lstCountries.indexOf(name);
      if (iCountry === -1) {
        showDialog("error", "Země '" + name + "' není v seznamu!", "Chyba");
        return; }
      const lstBtnsNames = Array.from(document.querySelectorAll("button[id^='btnCountry-']")).map(btn => btn.textContent.split(' ')[1]);
      if (lstBtnsNames.includes(name) && name !== dct.sLabel) {
        showDialog("error", "Tlačítko s názvem '" + name + "' již existuje!", "Chyba");
        return; }
      
      
    
    const dctOut = lxdCountries[iCountry]
    dctOut.sId = dct.sId || 'btnCountry-' + name;
    dctOut.sParamGl = dctOut.sParamGl + ',';
    dctOut.sParamLr = 'lang_' + dctOut.sParamLr + ',';
    dctOut.bCustom = 1;

    // return dct
      resolve(dctOut);
      dialog.close();
      dialog.remove();


      
    });

    const btnCancel = document.createElement("button");
    btnCancel.type = "button";
    btnCancel.textContent = 'Zruš';
    btnCancel.className = "btn btn-secondary btn-sm";
    btnCancel.addEventListener("click", () => {
      //resolve(null);
      dialog.close();
      dialog.remove();
    });

    btnDiv.appendChild(btnOk);
    btnDiv.appendChild(btnCancel);
    dialog.appendChild(btnDiv);

    document.body.appendChild(dialog);
    dialog.showModal();
   });
}
function showMultiButtonDialog(message, title = "", buttonLabels = []) {
  return new Promise((resolve) => {
    // 1️⃣ Create dialog
    const dialog = document.createElement('dialog');
    dialog.name = "multiDialog";
    dialog.classList.add('multi-dialog');

    // 2️⃣ Add content
    const content = document.createElement('div');
    content.classList.add('dialog-content');
    content.innerHTML = `<h4>${title}</h4><p>${message}</p>`;

    dialog.appendChild(content);

    // 3️⃣ Buttons container
    const buttons = document.createElement('div');
    buttons.classList.add('dialog-buttons');
    buttons.style.textAlign = "right";
    buttons.style.marginTop = "20px";

    buttonLabels.forEach(label => {
      const btn = document.createElement('button');
      btn.textContent = label;
      //btn.classList.add('btn-option text-end mt-3'); // you can style differently if needed
      btn.className = 'btn btn-outline-secondary'; // you can style differently if needed

      // Resolve promise with button label on click
      btn.addEventListener('click', () => {
        resolve(label);
        dialog.close();
      });

      buttons.appendChild(btn);
    });

    dialog.appendChild(buttons);

    // 4️⃣ Remove dialog from DOM after close
    dialog.addEventListener('close', () => {
      dialog.remove();
    });

    // 5️⃣ Append and show
    document.body.appendChild(dialog);
    dialog.showModal();
  });
}


