(function(global) {
    global.logoExecutionState = {
        isRunning: false,
        stopRequested: false,
        loopIterations: 0,
        maxLoopIterations: 100000
    };

    global.resetLogoExecutionState = function() {
        global.logoExecutionState.isRunning = true;
        global.logoExecutionState.stopRequested = false;
        global.logoExecutionState.loopIterations = 0;
    };

    global.requestLogoStop = function() {
        const shouldReportStop = global.logoExecutionState.isRunning || (global.turtle && global.turtle.isProcessing);
        global.logoExecutionState.stopRequested = true;
        if (global.turtle) global.turtle.stop();
        if (shouldReportStop && typeof global.logToTerminal === "function") {
            global.logToTerminal("Arret demande.", "warn");
        }
    };

    global.getHelpers = function() {
        const helpers = {};
        const keys = global.LOGO_ALL_CAPS || [];
        keys.forEach(k => { if (global[k] !== undefined) helpers[k] = global[k]; });
        ["fd", "bk", "rt", "lt", "pu", "pd", "cs", "clean", "home", "setcolor", "setwidth", "ps", "arc", "circle", "rectangle", "ellipse", "line", "write", "font", "polygon", "star", "stamp", "drawimage", "gradient", "opacity", "smooth", "setxy", "setheading", "ht", "st", "posx", "posy", "heading", "distance", "towards", "ds", "pencolor", "pc", "fillcolor", "fill", "canvascolor", "pi", "sqrt", "pow", "abs", "exp", "ln", "integer", "round", "ceil", "min", "max", "sin", "cos", "tan", "atan", "random", "mod", "rgb", "playsound", "showimage", "showvideo"].forEach(k => { if (global[k] !== undefined) helpers[k] = global[k]; });
        helpers.console = {
            log: (...args) => global.logToTerminal(args.join(' '), 'log'),
            error: (...args) => global.logToTerminal(args.join(' '), 'error'),
            warn: (...args) => global.logToTerminal(args.join(' '), 'warn'),
            clear: () => global.clearTerminal()
        };
        return helpers;
    };

    global.runCode = function() {
        global.clearTerminal();
        const code = document.getElementById('codeEditor').value;
        if (global.turtle) global.turtle.reset();
        global.executeSnippet(code);
    };

    global.executeSnippet = function(code) {
        global.resetLogoExecutionState();
        let preparedCode = global.translateLogoToJS(code);
        preparedCode = preparedCode.replace(/\^/g, '**');
        try {
            const helpers = global.getHelpers();
            helpers.__logoCheckLoop = () => {
                const state = global.logoExecutionState;
                if (state.stopRequested) {
                    throw new Error("Execution arretee par l'utilisateur");
                }
                state.loopIterations++;
                if (state.loopIterations > state.maxLoopIterations) {
                    throw new Error(`Boucle interrompue: limite de ${state.maxLoopIterations} iterations atteinte`);
                }
            };
            const keys = Object.keys(helpers);
            const values = Object.values(helpers);
            const execute = new Function(...keys, '"use strict";\n' + preparedCode);
            execute(...values);
        } catch (err) {
            let lineNo = "Inconnue";
            if (err.stack) {
                const sl = err.stack.split('\n');
                for (let s of sl) {
                    const m = s.match(/<anonymous>:(\d+):(\d+)/) || s.match(/eval at.*<anonymous>:(\d+):(\d+)/) || s.match(/eval:(\d+):(\d+)/);
                    if (m) { lineNo = parseInt(m[m.length - 2]) - 2; if (lineNo < 0) lineNo = "Inconnue"; break; }
                }
            }
            const logoLines = code.split('\n');
            let errorMsg = `Erreur: ${err.message}\n`;
            if (lineNo !== "Inconnue" && logoLines[lineNo - 1] !== undefined) errorMsg += `Ligne ${lineNo}: ${logoLines[lineNo - 1].trim()}`;
            else errorMsg += `Ligne: ${lineNo}`;
            global.logToTerminal(errorMsg, 'error');
        } finally {
            global.logoExecutionState.isRunning = false;
        }
    };
})(window);
