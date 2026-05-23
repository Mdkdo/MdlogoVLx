(function(global) {
    global.updateLineNumbers = function() {
        const el = document.getElementById('codeEditor');
        const ln = document.getElementById('line-numbers');
        if (el && ln) ln.innerHTML = el.value.split('\n').map((_, i) => i + 1).join('<br>') + '<br>';
    };

    global.updateHighlight = function() {
        const el = document.getElementById('codeEditor');
        const hl = document.getElementById('highlighting-content');
        if (!el || !hl) return;
        global.updateLineNumbers();
        let code = el.value;
        const keywords = global.LOGO_KEYWORDS || [];
        const commands = global.LOGO_COMMANDS || [];
        const combinedRegex = new RegExp('(\\/\/.*|\\/\\*[\\s\\S]*?\\*\\/)|' + '("(?:[^"\\\\\\n]|\\.)*"|\'(?:[^\'\\\\\\n]|\\.)*\'|`(?:[^\\\\`]|\\.)*`)|' + '(\\b\\d+(?:\\.\\d+)?\\b)|' + '(:[a-zA-Z0-9_$À-ÿ]+)|' + '([^a-zA-Z0-9_À-ÿ]|^)(' + keywords.join('|') + ')(?![a-zA-Z0-9_À-ÿ])|' + '([^a-zA-Z0-9_À-ÿ]|^)(' + commands.join('|') + ')(?![a-zA-Z0-9_À-ÿ])|' + '([\\+\\-\\*/\\(\\),\\;\\(\\)\\[\\]\\{\\}\\.])|' + '([a-zA-Z_$À-ÿ][a-zA-Z0-9_$À-ÿ]*)', 'gi');
        let res = ''; let last = 0;
        code.replace(combinedRegex, (match, com, str, num, v, kp, kw, cp, cmd, op, unk, off) => {
            res += code.substring(last, off).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            if (com) res += `<span class="hl-comment">${com.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>`;
            else if (str) res += `<span class="hl-string">${str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>`;
            else if (num) res += `<span class="hl-number">${num}</span>`;
            else if (v) res += `<span class="hl-variable">${v}</span>`;
            else if (kw) { res += kp; res += `<span class="hl-keyword">${kw.toUpperCase()}</span>`; }
            else if (cmd) { res += cp; res += `<span class="hl-command">${cmd.toUpperCase()}</span>`; }
            else if (op) res += `<span class="hl-operator">${op.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>`;
            else if (unk) {
                const procSearch = code.replace(/("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^\\`]|\\.)*`|\/\/.*|\/\*[\s\S]*?\*\/)/g, "");
                const ups = []; const pr = /\bpour\s+([a-zA-Z0-9_$À-ÿ]+)/gi; let m;
                while ((m = pr.exec(procSearch)) !== null) ups.push(m[1].toUpperCase());
                if (ups.includes(unk.toUpperCase())) res += `<span class="hl-userproc">${unk}</span>`;
                else res += `<span class="hl-unknown">${unk}</span>`;
            }
            last = off + match.length; return match;
        });
        hl.innerHTML = res + code.substring(last).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + (code.endsWith('\n') ? ' ' : '');
    };

    global.syncScroll = function() {
        const el = document.getElementById('codeEditor');
        const hl = document.getElementById('highlighting');
        const ln = document.getElementById('line-numbers');
        if (el && hl) { hl.scrollTop = el.scrollTop; hl.scrollLeft = el.scrollLeft; if (ln) ln.scrollTop = el.scrollTop; }
    };

})(window);
