document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    const canvas = document.getElementById('turtleCanvas');
    const turtleLayer = document.getElementById('turtleLayer');
    const canvasStage = document.getElementById('canvas-stage');
    function prepareCanvasForRun() {
        const container = canvas.parentElement;
        const w = container.parentElement.clientWidth - 32;
        const h = container.parentElement.clientHeight - 32;
        if (w <= 0 || h <= 0) return;
        const width = Math.round(w * 0.95);
        const height = Math.round(h * 0.95);
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
        if (separators.includes(lastChar)) {
            const textBefore = text.substring(0, pos - 1);
            const wordMatch = textBefore.match(/([a-zA-Z0-9_$À-ÿ]+)$/);
            if (wordMatch) {
                const word = wordMatch[1];
                const upperWord = word.toUpperCase();
                const allCaps = window.LOGO_ALL_CAPS || [];
                const procSearch = text.replace(/("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^\\`]|\\.)*`|\/\/.*|\/\*[\s\S]*?\*\/)/g, "");
                const procRegex = /\bpour\s+([a-zA-Z0-9_$À-ÿ]+)/gi;
                const userProcs = []; let m;
                while ((m = procRegex.exec(procSearch)) !== null) { userProcs.push(m[1].toUpperCase()); }
                if (allCaps.includes(upperWord) || userProcs.includes(upperWord)) {
                    const start = pos - 1 - word.length;
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
    document.querySelectorAll('.example-btn').forEach(btn => { btn.addEventListener('click', () => { setEditorCode(btn.getAttribute('data-code')); }); });
    codeEditor.addEventListener('scroll', window.syncScroll);
    window.updateHighlight();
});
