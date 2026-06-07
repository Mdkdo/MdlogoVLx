(function(global) {
    global.createSettingsController = function(options) {
        const { canvas, themeSelect, bgColorPicker, turtleImgSelect } = options;

        function saveSettings() {
            try {
                const settings = { theme: themeSelect.value, bgColor: bgColorPicker.value, turtleImg: turtleImgSelect.value };
                localStorage.setItem('logoJsSettings', JSON.stringify(settings));
            } catch (err) {
                global.logToTerminal(`Parametres non sauvegardes: ${err.message}`, 'warn');
            }
        }

        function loadSettings() {
            try {
                const saved = localStorage.getItem('logoJsSettings');
                if (!saved) {
                    themeSelect.value = 'theme-midnight';
                    document.body.className = themeSelect.value;
                    return;
                }
                const settings = JSON.parse(saved);
                themeSelect.value = settings.theme || 'theme-midnight';
                document.body.className = themeSelect.value;
                bgColorPicker.value = settings.bgColor || '#ffffff';
                canvas.style.backgroundColor = bgColorPicker.value;
                turtleImgSelect.value = settings.turtleImg || 'default';
                global.turtle.setTurtleImage(turtleImgSelect.value);
            } catch (err) {
                localStorage.removeItem('logoJsSettings');
                global.logToTerminal(`Parametres reinitialises: ${err.message}`, 'warn');
            }
        }

        function saveDraft(codeEditor) {
            try {
                localStorage.setItem('logoJsDraft', codeEditor.value);
            } catch (err) {
                global.logToTerminal(`Brouillon non sauvegarde: ${err.message}`, 'warn');
            }
        }

        function loadDraft(codeEditor) {
            try {
                const draft = localStorage.getItem('logoJsDraft');
                if (draft !== null) codeEditor.value = draft;
            } catch (err) {
                localStorage.removeItem('logoJsDraft');
                global.logToTerminal(`Brouillon reinitialise: ${err.message}`, 'warn');
            }
        }

        return { saveSettings, loadSettings, saveDraft, loadDraft };
    };
})(window);
