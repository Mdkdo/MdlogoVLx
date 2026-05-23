(function(global) {
    global.logToTerminal = function(msg, type = 'log') {
        const terminal = document.getElementById('terminalOutput');
        if (!terminal) return;
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
