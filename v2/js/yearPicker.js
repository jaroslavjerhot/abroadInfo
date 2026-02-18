
const dialog = document.getElementById('yearDialog')
const yearsDiv = document.getElementById('years')
const result = document.getElementById('result')

let startYear = null
let endYear = null

// generate years
const currentYear = new Date().getFullYear();
for (let y = currentYear - 30; y = currentYear + 5; y++) {
  const div = document.createElement('div')
  div.textContent = y
  div.className = 'year'
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
  if (startYear !== null) {
    result.textContent = endYear
      ? `Selected: ${startYear} – ${endYear}`
      : `Selected: ${startYear}`
  }
  dialog.close()
}

