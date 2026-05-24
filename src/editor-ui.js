document.addEventListener('DOMContentLoaded', () => {
    const bundledExamples = [
        {
            title: "Spirale",
            file: "examples/spirale.logo",
            code: "DONNE :i 0\nTANTQUE (:i < 100) [\n  AV (:i * 2)\n  TD 91\n  DONNE :i (:i + 1)\n]"
        },
        {
            title: "Hexagone rempli",
            file: "examples/hexagone-rempli.logo",
            code: "FCC \"bleu\"\nFCB \"cyan\"\nREPETE 6 [\n  AV 80\n  TD 60\n]\nREMPLIS"
        },
        {
            title: "Texte sur canvas",
            file: "examples/texte-canvas.logo",
            code: "FCC \"noir\"\nLC\nFPOS -250 120\nBC\nECRIS \"Bonjour depuis le canvas. Ce texte revient automatiquement a la ligne quand il atteint le bord.\"\nRETOURLIGNE\nLOG \"Ce message va dans le terminal.\""
        },
        {
            title: "Tableau",
            file: "examples/tableau.logo",
            code: "DONNE :noms TABLEAU\nTAB_AJOUTE :noms \"Logo\"\nTAB_AJOUTE :noms \"Tortue\"\nTAB_AJOUTE :noms \"Canvas\"\nTAB_MODIFIE :noms 1 \"Dessin\"\nLC\nFPOS -120 60\nBC\nECRIS TAB_TEXTE :noms\nLOG TAB_TAILLE :noms"
        },
        {
            title: "Pause",
            file: "examples/pause.logo",
            code: "REPETE 12 [\n  AV 40\n  TD 30\n  PAUSE 250\n]"
        },
        {
            title: "Primitives",
            file: "examples/primitives.logo",
            code: "DONNE :nom LIS \"Ton nom ?\"\nMSG :nom\n\nDONNE :n _NOMBRE \"42\"\nDONNE :liste _TABLEAU \"1, 2, 3\"\nDONNE :mots _S_TABLEAU \"bonjour, phrase avec virgule\\, ici, fin\"\n\nLIGNE -200 -120 200 -120\nRECT -180 -80 -80 20\nELIP 40 -80 180 20\nPIXEL 0 0 \"rouge\"\n\nLC\nFPOS -200 90\nBC\nECRIS _TEXTE :n\nRETOURLIGNE\nECRIS TAB_TEXTE :liste\nRETOURLIGNE\nECRIS TAB_TEXTE :mots"
        },
		{
			title: "Arbre",
			file:"examples/",
			code:"POUR ARBRE :t\n" +
"  DONNE :cc 150-:t\n" +
"  FCC RVB :cc :cc :cc\n" +
"  SI :t < 5 [\n" +
"    FCC 'vert'\n" +
"    CERCLE 2\n" +
"    RENDS\n" +
"  ]\n" +
"  FTC :t/10\n" +
"  FCC 'noir'\n" +
"  AV :t/3\n" +
"  TG 30 ARBRE :t * 0.7\n" +
"  TD 60 ARBRE :t * 0.7\n" +
"  FCC 'noir'\n" +
"  FTC :t/10\n" +
"  TG 30 RE :t/3\n" +
"FIN\n" +
"\n" +
"LC FPOS 0, -200 BC\n" +
"\n" +
"ARBRE 400"
		},
		{
			title: "Drapeau",
			file:"examples/drapeau.logo",
			code:"CT \n"+
"FTC 5\n"+
"FCB 'rouge'\n"+ 
"LC FPOS -220, -105 BC\n"+  
"RECTANGLE 500 300\n"+
"REMPLIS \n"+
"LC FPOS 0 0 BC\n"+
"TD 17\n"+
"FTC 1\n"+
"REPETE 125\n"+
"[\n"+
"  AV :_i0+100\n"+
"  TD 144\n"+
"  FCC RVB 0 :_i0*2 0\n"+
"]\n"
		},
	{
			title: "Pignon",
			file:"examples/pignon.logo",
			code:"DONNE :x 0\n"+
"FTC 5\n"+
"FCB 'gris'\n"+
"TANTQUE (:x <+360) [ :x++\n"+
"AV 20\n"+
"SI(:x%3==0)[\n"+
"TG 144\n"+
"CONTINUE]\n"+
"TD 60]\n"+
"REMPLIS" 
	}	,
		{
			title: "Sinusoïdal",
			file:"examples/sinusoïdal.logo",
			code:"DONNE :a -400\n"+
"DONNE :s 0\n"+
"DONNE :r 0\n"+
"DONNE :g 0\n"+
"DONNE :b 0\n"+
"FTC 5\n"+
"LC FPOS :a 0 BC\n"+ 
"REPETE 1000\n"+
"[\n"+
"   :s= 100*cos(3.14*:a)\n"+
"   FPOS :a :s \n"+
"   :r=ABS(255*COS(3*:a))\n"+
"   :g=ABS(255*sin(3.14*:a))\n"+
"   :b=0\n"+    
"   FCC RVB :r :g :b\n"+ 
"   AV 2\n"+
"   :a++\n"+
"]"
		},
		{
			title: "Conique",
			file:"examples/conique.logo",
			code:"DONNE :i 0\n"+
"DONNE :j 0.01\n"+
"FTC 3\n"+
"CT \n"+
"TANTQUE(:i<99000)\n"+
"[\n"+
"   FCC RVB 255 :j*89 :j*89\n"+
"   AV :j TD 1\n"+
"   SI(:i%360==0)[:j+=0.01]\n"+
"   :i++\n"+
"]"
		}		
    ];
	
	/*
	,
		{
			title: "",
			file:"examples/",
			code:""
		}
		*/
    const app = document.getElementById('app');
    const canvas = document.getElementById('turtleCanvas');
    const turtleLayer = document.getElementById('turtleLayer');
    const canvasStage = document.getElementById('canvas-stage');
    function prepareCanvasForRun() {
        const container = canvas.parentElement;
        const w = container.parentElement.clientWidth - 32;
        const h = container.parentElement.clientHeight - 32;
        if (w <= 0 || h <= 0) return;
        const width = Math.round(w * 0.97);
        const height = Math.round(h * 0.97);
        canvasStage.style.width = `${width}px`;
        canvasStage.style.height = `${height}px`;
        if (window.turtle) window.turtle.resize(width, height);
    }
    window.turtle = new Turtle(canvas, turtleLayer);
    const mousePosSpan = document.getElementById('mouse-pos');
    [canvas, turtleLayer].forEach(c => {
        c.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect(); const x = Math.round(e.clientX - rect.left - (canvas.width / 2)); const y = Math.round((canvas.height / 2) - (e.clientY - rect.top));
            mousePosSpan.textContent = `${x}, ${y}`;
        });
    });
    function updateStatus() {
        if (!window.turtle) return;
        document.getElementById('turtle-pos').textContent = `${Math.round(window.turtle.x)}, ${Math.round(window.turtle.y)}`;
        document.getElementById('turtle-angle').textContent = `${Math.round(window.turtle.heading())}°`;
        document.getElementById('pen-size').textContent = window.turtle.width;
        const pColor = window.turtle.color; document.getElementById('pen-color').textContent = typeof pColor === 'string' ? pColor : 'Gradient';
        document.getElementById('pen-color-preview').style.backgroundColor = typeof pColor === 'string' ? pColor : 'transparent';
        const fColor = window.turtle.fillColor; document.getElementById('fill-color-status').textContent = fColor;
        document.getElementById('fill-color-preview').style.backgroundColor = fColor;
        const bColor = getComputedStyle(canvas).backgroundColor; document.getElementById('bg-color-status').textContent = bColor;
        document.getElementById('bg-color-preview-status').style.backgroundColor = bColor;
        requestAnimationFrame(updateStatus);
    }
    updateStatus();
    const codeEditor = document.getElementById('codeEditor');
    const themeSelect = document.getElementById('themeSelect');
    const runBtnTop = document.getElementById('runBtnTop'); const backToEditorBtn = document.getElementById('backToEditorBtn');
    const exampleSelect = document.getElementById('exampleSelect');
    const loadExampleBtn = document.getElementById('loadExampleBtn');
    const settingsBtn = document.getElementById('settingsBtn'); const settingsModal = document.getElementById('settings-modal');
    const closeModal = document.querySelector('.close-modal'); settingsBtn.addEventListener('click', () => { settingsModal.classList.remove('hidden'); });
    closeModal.addEventListener('click', () => { settingsModal.classList.add('hidden'); });
    window.addEventListener('click', (e) => { if (e.target === settingsModal) settingsModal.classList.add('hidden'); });
    const bgColorPicker = document.getElementById('bg-color-picker'); const turtleImgSelect = document.getElementById('turtle-img-select');
    const settings = window.createSettingsController({ canvas, themeSelect, bgColorPicker, turtleImgSelect });
    themeSelect.addEventListener('change', (e) => { document.body.className = e.target.value; settings.saveSettings(); });
    bgColorPicker.addEventListener('input', (e) => { canvas.style.backgroundColor = e.target.value; settings.saveSettings(); });
    turtleImgSelect.addEventListener('change', (e) => { window.turtle.setTurtleImage(e.target.value); settings.saveSettings(); });
    settings.loadSettings();
    function setEditorCode(code, shouldSaveDraft = true) {
        codeEditor.value = code;
        if (shouldSaveDraft) settings.saveDraft(codeEditor);
        window.updateHighlight();
    }
    settings.loadDraft(codeEditor);
    bundledExamples.forEach((example, index) => {
        const option = document.createElement('option');
        option.value = String(index);
        option.textContent = example.title;
        exampleSelect.appendChild(option);
    });
    async function loadSelectedExample() {
        const example = bundledExamples[Number(exampleSelect.value)];
        if (!example) return;
        try {
            const response = await fetch(example.file);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            setEditorCode(await response.text());
        } catch (err) {
            setEditorCode(example.code);
        }
    }
    loadExampleBtn.addEventListener('click', loadSelectedExample);
    exampleSelect.addEventListener('change', loadSelectedExample);
    runBtnTop.addEventListener('click', () => { app.className = 'mode-execution'; prepareCanvasForRun(); window.runCode(); });
    backToEditorBtn.addEventListener('click', () => { app.className = 'mode-editor'; window.requestLogoStop(); });
    const newFileBtn = document.getElementById('newFileBtn'); const openFileBtn = document.getElementById('openFileBtn');
    const saveFileBtn = document.getElementById('saveFileBtn'); const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn'); const selectAllBtn = document.getElementById('selectAllBtn');
    const copyBtn = document.getElementById('copyBtn'); const cutBtn = document.getElementById('cutBtn');
    const pasteBtn = document.getElementById('pasteBtn'); const commentBtn = document.getElementById('commentBtn');
    const indentBtn = document.getElementById('indentBtn'); const unindentBtn = document.getElementById('unindentBtn');
    const terminalSection = document.getElementById('terminal-section'); const toggleTerminalBtn = document.getElementById('toggleTerminalBtn');
    const clearTerminalBtn = document.getElementById('clearTerminalBtn'); const showTerminalBtn = document.getElementById('showTerminalBtn');
    toggleTerminalBtn.addEventListener('click', () => { terminalSection.classList.add('hidden'); showTerminalBtn.classList.remove('hidden'); });
    showTerminalBtn.addEventListener('click', () => { terminalSection.classList.remove('hidden'); showTerminalBtn.classList.add('hidden'); });
    clearTerminalBtn.addEventListener('click', () => { document.getElementById('terminalOutput').innerHTML = ''; });
    const stopBtn = document.getElementById('stopBtn'); stopBtn.addEventListener('click', () => { window.requestLogoStop(); });
    const inlineCmdInput = document.getElementById('inlineCmdInput'); const runInlineBtn = document.getElementById('runInlineBtn');
    function runInline() { const cmd = inlineCmdInput.value; if (cmd.trim()) { window.executeSnippet(cmd); inlineCmdInput.value = ''; } }
    runInlineBtn.addEventListener('click', runInline); inlineCmdInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') runInline(); });
    let undoStack = [codeEditor.value]; let redoStack = []; const MAX_STACK = 50;
    function saveState() { const currentCode = codeEditor.value; if (undoStack[undoStack.length - 1] !== currentCode) { undoStack.push(currentCode); if (undoStack.length > MAX_STACK) undoStack.shift(); redoStack = []; } }

    function handleAutoCaps() {
        const text = codeEditor.value;
        const pos = codeEditor.selectionStart;
        const lastChar = text.substring(pos - 1, pos);
        const separators = [' ', '\n', '\t', '[', ']', '(', ')', '{', '}', ',', ';'];
        function isInsideStringOrComment(index) {
            let quote = null;
            let escaped = false;
            let blockComment = false;
            let lineComment = false;
            for (let i = 0; i < index; i++) {
                const ch = text[i];
                const next = text[i + 1];
                if (lineComment) {
                    if (ch === '\n') lineComment = false;
                    continue;
                }
                if (blockComment) {
                    if (ch === '*' && next === '/') { blockComment = false; i++; }
                    continue;
                }
                if (quote) {
                    if (escaped) escaped = false;
                    else if (ch === '\\') escaped = true;
                    else if (ch === quote) quote = null;
                    continue;
                }
                if (ch === '/' && next === '/') { lineComment = true; i++; continue; }
                if (ch === '/' && next === '*') { blockComment = true; i++; continue; }
                if (ch === '"' || ch === "'" || ch === '`') quote = ch;
            }
            return Boolean(quote || blockComment || lineComment);
        }
        if (separators.includes(lastChar)) {
            const textBefore = text.substring(0, pos - 1);
            const wordMatch = textBefore.match(/([a-zA-Z0-9_$À-ÿ]+)$/);
            if (wordMatch) {
                const word = wordMatch[1];
                const start = pos - 1 - word.length;
                if (isInsideStringOrComment(start)) return;
                const upperWord = word.toUpperCase();
                const allCaps = window.LOGO_ALL_CAPS || [];
                const procSearch = text.replace(/("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^\\`]|\\.)*`|\/\/.*|\/\*[\s\S]*?\*\/)/g, "");
                const procRegex = /\bpour\s+([a-zA-Z0-9_$À-ÿ]+)/gi;
                const userProcs = []; let m;
                while ((m = procRegex.exec(procSearch)) !== null) { userProcs.push(m[1].toUpperCase()); }
                if (allCaps.includes(upperWord) || userProcs.includes(upperWord)) {
                    const newText = text.substring(0, start) + upperWord + text.substring(pos - 1);
                    if (newText !== text) {
                        codeEditor.value = newText;
                        codeEditor.setSelectionRange(pos, pos);
                    }
                }
            }
        }
    }

    codeEditor.addEventListener('input', () => {
        handleAutoCaps();
        settings.saveDraft(codeEditor);
        window.updateHighlight();
    });

    codeEditor.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') saveState();
    });
    codeEditor.addEventListener('blur', saveState);
    newFileBtn.addEventListener('click', () => { if (confirm('Nouveau fichier ?')) { setEditorCode(''); window.turtle.reset(); } });
    openFileBtn.addEventListener('click', () => {
        const input = document.createElement('input'); input.type = 'file';
        input.onchange = (e) => { const file = e.target.files[0]; const reader = new FileReader(); reader.onload = (ev) => { setEditorCode(ev.target.result); }; reader.readAsText(file); };
        input.click();
    });
    saveFileBtn.addEventListener('click', () => {
        let filename = prompt('Nom du fichier :', 'code.logo'); if (!filename) return;
        const blob = new Blob([codeEditor.value], { type: 'text/plain' }); const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    });
    undoBtn.addEventListener('click', () => { if (undoStack.length > 1) { redoStack.push(undoStack.pop()); setEditorCode(undoStack[undoStack.length - 1]); } });
    redoBtn.addEventListener('click', () => { if (redoStack.length > 0) { const state = redoStack.pop(); undoStack.push(state); setEditorCode(state); } });
    selectAllBtn.addEventListener('click', () => { codeEditor.select(); });
    copyBtn.addEventListener('click', () => { navigator.clipboard.writeText(codeEditor.value.substring(codeEditor.selectionStart, codeEditor.selectionEnd)); });
    cutBtn.addEventListener('click', () => {
        const start = codeEditor.selectionStart; const end = codeEditor.selectionEnd;
        const text = codeEditor.value; const selected = text.substring(start, end);
        if (selected) { navigator.clipboard.writeText(selected); saveState(); setEditorCode(text.substring(0, start) + text.substring(end)); codeEditor.selectionStart = codeEditor.selectionEnd = start; }
    });
    pasteBtn.addEventListener('click', async () => {
        const text = await navigator.clipboard.readText(); const start = codeEditor.selectionStart; const end = codeEditor.selectionEnd;
        saveState(); setEditorCode(codeEditor.value.substring(0, start) + text + codeEditor.value.substring(end));
        codeEditor.selectionStart = codeEditor.selectionEnd = start + text.length;
    });
    function modifySelection(fn) {
        const start = codeEditor.selectionStart; const end = codeEditor.selectionEnd; const text = codeEditor.value; const before = text.substring(0, start); const selection = text.substring(start, end); const after = text.substring(end);
        const lines = selection.split('\n'); const newSelection = lines.map(fn).join('\n');
        saveState(); setEditorCode(before + newSelection + after); codeEditor.selectionStart = start; codeEditor.selectionEnd = start + newSelection.length;
    }
    commentBtn.addEventListener('click', () => { modifySelection(line => line.trim().startsWith('//') ? line.replace('// ', '').replace('//', '') : '// ' + line); });
    indentBtn.addEventListener('click', () => { modifySelection(line => '  ' + line); });
    unindentBtn.addEventListener('click', () => { modifySelection(line => line.replace(/^  ?/, '')); });
    codeEditor.addEventListener('scroll', window.syncScroll);
    window.updateHighlight();
});
