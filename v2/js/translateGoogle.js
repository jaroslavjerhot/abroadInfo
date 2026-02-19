function convertGoogleTo(engine, googleUrl) {
    const url = new URL(googleUrl);
    const params = url.searchParams;

    const q      = params.get('q') || '';
    const tbm    = params.get('tbm') || '';
    const tbs    = params.get('tbs') || '';
    const hl     = params.get('hl') || '';
    const gl     = params.get('gl') || '';
    const lr     = params.get('lr') || '';
    const cdMin  = params.get('cd_min');
    const cdMax  = params.get('cd_max');

    let base = '';
    let newParams = new URLSearchParams();
    let finalQuery = q;

    // ----------------------------
    // Extract language from lr
    // ----------------------------
    function extractLang(lrParam) {
        if (!lrParam.startsWith('lang_')) return '';
        return lrParam.replace('lang_', '');
    }

    const lang = extractLang(lr);

    // ----------------------------
    // Inject date range into query if needed
    // ----------------------------
    if (cdMin) finalQuery += ` after:${formatDate(cdMin)}`;
    if (cdMax) finalQuery += ` before:${formatDate(cdMax)}`;

    function formatDate(dateStr) {
        // Converts MM/DD/YYYY to YYYY-MM-DD
        const parts = dateStr.split('/');
        if (parts.length !== 3) return dateStr;
        return `${parts[2]}-${parts[0].padStart(2,'0')}-${parts[1].padStart(2,'0')}`;
    }

    switch (engine.toLowerCase()) {

        // =================================================
        // BING
        // =================================================
        case 'bing':
            base = tbm === 'isch'
                ? 'https://www.bing.com/images/search'
                : 'https://www.bing.com/search';

            newParams.set('q', finalQuery);

            if (hl) newParams.set('setlang', hl);
            if (gl) newParams.set('cc', gl);

            let filters = [];

            if (lang) filters.push(`+filterui:language-${lang}`);

            if (tbs.includes('qdr:d')) filters.push('+filterui:age-lt1440');
            if (tbs.includes('qdr:w')) filters.push('+filterui:age-lt10080');
            if (tbs.includes('qdr:m')) filters.push('+filterui:age-lt43200');
            if (tbs.includes('qdr:y')) filters.push('+filterui:age-lt525600');

            if (tbs.includes('isz:l')) filters.push('+filterui:imagesize-large');

            if (filters.length)
                newParams.set('qft', filters.join(''));

            break;

        // =================================================
        // DUCKDUCKGO
        // =================================================
        case 'duck':
        case 'duckduckgo':
            base = 'https://duckduckgo.com/';
            newParams.set('q', finalQuery);

            if (tbm === 'isch') {
                newParams.set('ia', 'images');
                newParams.set('iax', 'images');
            }

            if (gl && lang)
                newParams.set('kl', `${gl}-${lang}`);

            if (tbs.includes('qdr:d')) newParams.set('df', 'd');
            if (tbs.includes('qdr:w')) newParams.set('df', 'w');
            if (tbs.includes('qdr:m')) newParams.set('df', 'm');
            if (tbs.includes('qdr:y')) newParams.set('df', 'y');

            if (tbs.includes('cdr:1')) {
                let sDf = convertGoogleTbsToDuck(tbs);
                newParams.set('df', sDf);
            }
            

            break;

        // =================================================
        // STARTPAGE
        // =================================================
        case 'startpage':
            base = 'https://www.startpage.com/search';
            newParams.set('query', finalQuery);

            if (tbm === 'isch')
                newParams.set('cat', 'images');

            if (lang)
                newParams.set('language', lang);

            break;

        // =================================================
        // YANDEX
        // =================================================
        case 'yandex':
            base = tbm === 'isch'
                ? 'https://yandex.com/images/search'
                : 'https://yandex.com/search/';

            newParams.set('text', finalQuery);

            if (gl)
                newParams.set('lr', gl);

            if (cdMin)
                newParams.set('from_date', formatDate(cdMin));

            break;

        // =================================================
        // BAIDU
        // =================================================
        case 'baidu':
            base = tbm === 'isch'
                ? 'https://image.baidu.com/search/index'
                : 'https://www.baidu.com/s';

            newParams.set(tbm === 'isch' ? 'word' : 'wd', finalQuery);

            if (lang)
                finalQuery += ` language:${lang}`;

            break;

        default:
            throw new Error('Unsupported engine');
    }

    let sUrl = `${base}?${newParams.toString()}`;
    sUrl = sUrl.replace('++', '+');
    return sUrl;
}
function convertGoogleDatesToDuck(str) {
  return str.replace(/(\d{1,2})\/(\d{1,2})\/(\d{4})/g, (_, m, d, y) => {
    return `${y}-${d.padStart(2, "0")}-${m.padStart(2, "0")}`;
  });
}

function convertGoogleTbsToDuck(sTbs) {
    let sDf = sTbs
    sDf = convertGoogleDatesToDuck(sDf);

    return sDf.replace('cdr:1', '').replace('cd_min:', '').replace('cd_max:', '..').replaceAll(',', '');
}
