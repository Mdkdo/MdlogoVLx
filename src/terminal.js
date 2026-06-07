(function(global) {
    global.logToTerminal = function(msg, type = 'log') {
        const terminal = document.getElementById('terminalOutput');
        if (!terminal) return;
        const terminalSection = document.getElementById('terminal-section');
        const showTerminalBtn = document.getElementById('showTerminalBtn');
        if (terminalSection) terminalSection.classList.remove('hidden');
        if (showTerminalBtn) showTerminalBtn.classList.add('hidden');
        const div = document.createElement('div');
        div.className = `terminal-msg terminal-${type}`;
        div.textContent = msg;
        terminal.appendChild(div);
        terminal.scrollTop = terminal.scrollHeight;
    };

    global.clearTerminal = function() {
        const terminal = document.getElementById('terminalOutput');
        if (terminal) terminal.innerHTML = '';
    };
})(window);
