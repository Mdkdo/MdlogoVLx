(function(global) {
    let _logoLoopCounter = 0;
    const arityMap = Object.assign({}, global.LOGO_COMMAND_SPECS || {});

    function getFullArityMap(userProcs) {
        const fullMap = Object.assign({}, arityMap);
        for (let name in userProcs) { fullMap[name.toUpperCase()] = userProcs[name]; }
        return fullMap;
    }

    global.translateLogoToJS = function(code) {
        _logoLoopCounter = 0;
        const userProcs = {};
        let codeClean = code.replace(/("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^\\`]|\\.)*`|\/\/.*|\/\*[\s\S]*?\*\/)/g, "");
        const procRegex = /\bpour\s+([a-zA-Z0-9_$À-ÿ]+)([^\n]*)/gi;
        let m;
        while ((m = procRegex.exec(codeClean)) !== null) { 
            const name = m[1];
            const params = m[2].trim().split(/\s+/).filter(p => {
                if (p.startsWith(':')) return true;
                if (p === "") return false;
                const u = p.toUpperCase();
                return !global.LOGO_KEYWORDS.includes(u) && !global.LOGO_COMMANDS.includes(u);
            });
            userProcs[name.toUpperCase()] = params.length;
        }
        let js = translateBlocks(code, userProcs);
        js = js.replace(/:([a-zA-Z0-9_$À-ÿ]+)/g, '$1');
        return js;
    };

    function tokenize(input) {
        // Updated regex to support quoted strings "..." and multi-char operators
        return input.split(/(\s+|"(?:[^"\\]|\\.)*"|[\[\]{}();,]|\+\+|--|\+=|-=|\*=|\/=|===|!==|==|!=|<=|>=|=|\+|-|\*|\/|%|>|<|!|\^)/).filter(t => t.length > 0);
    }

    function isBinaryOperator(token) {
        return ["+", "-", "*", "/", "%", ">", "<", ">=", "<=", "=", "==", "===", "!=", "!==", "^"].includes(token.trim());
    }

    function toJSOperator(token) {
        const op = token.trim();
        if (op === "=" || op === "==") return "===";
        if (op === "!=") return "!==";
        return op;
    }

    function syntaxError(message) {
        throw new Error(`Syntaxe Logo: ${message}`);
    }

    function shouldConsumeOptionalArg(tokens, index, fullArityMap) {
        let i = index;
        let sawNewline = false;
        while (i < tokens.length && tokens[i].trim() === "") {
            if (tokens[i].includes('\n')) sawNewline = true;
            i++;
        }
        if (sawNewline || i >= tokens.length) return false;
        const token = tokens[i].trim();
        if (!token || token === "]" || token === ")" || token === ";" || token === ",") return false;
        if (isBinaryOperator(token)) return false;
        return fullArityMap[token.toUpperCase()] === undefined;
    }

    function transpileGroupedExpression(tokens, fullArityMap, userProcs) {
        let i = 0;
        let output = "";
        while (i < tokens.length) {
            if (tokens[i].trim() === "") {
                output += tokens[i];
                i++;
                continue;
            }
            const res = transpileOneCommand(tokens, i, fullArityMap, userProcs);
            output += res.js;
            if (res.nextIdx <= i) {
                i++;
            } else {
                i = res.nextIdx;
            }
        }
        return output.trim();
    }

    function translateBlocks(input, userProcs = {}, isClass = false, addSemicolons = true) {
        const fullArityMap = getFullArityMap(userProcs);
        let tokens = tokenize(input);
        let output = "";
        for (let i = 0; i < tokens.length; i++) {
            let token = tokens[i];
            let trimmed = token.trim();
            if (!trimmed) { output += token; continue; }
            if (trimmed === ",") continue;
            let upper = trimmed.toUpperCase();

            if (upper === 'POUR') {
                let j = i + 1; while (j < tokens.length && tokens[j].trim() === "") j++;
                let name = tokens[j] || "";
                if (!name.trim()) syntaxError("nom de procedure manquant apres POUR");
                j++;
                let params = [];
                while (j < tokens.length) {
                    if (tokens[j].trim() === "") { if (tokens[j].includes('\n')) break; j++; continue; }
                    let t = tokens[j].trim();
                    if (t.startsWith(':')) { params.push(t.substring(1)); j++; continue; }
                    let u = t.toUpperCase();
                    if (t !== "" && !global.LOGO_KEYWORDS.includes(u) && !global.LOGO_COMMANDS.includes(u)) {
                        params.push(t); j++; continue;
                    }
                    break;
                }
                let endIdx = -1; let depth = 0;
                for (let k = j; k < tokens.length; k++) {
                    let tu = tokens[k].toUpperCase().trim();
                    if (tu === 'POUR') depth++;
                    if (tu === 'FIN') { if (depth === 0) { endIdx = k; break; } depth--; }
                }
                if (endIdx !== -1) {
                    let bodyTokens = tokens.slice(j, endIdx);
                    let body = translateBlocks(bodyTokens.join(""), userProcs);
                    output += `async function ${name}(${params.join(', ')}) { ${body} }`;
                    i = endIdx; continue;
                }
                syntaxError(`FIN manquant pour la procedure ${name}`);
            }
            if (upper === 'REPETE' || upper === 'REPEAT') {
                let j = i + 1; while (j < tokens.length && tokens[j].trim() === "") j++;
                let nRes = transpileOneCommand(tokens, j, fullArityMap, userProcs);
                j = nRes.nextIdx; while (j < tokens.length && tokens[j].trim() === "") j++;
                if (tokens[j] === '[') {
                    let endIdx = findBalancedTokens(tokens, '[', ']', j);
                    if (endIdx !== -1) {
                        let body = tokens.slice(j + 1, endIdx).join("");
                        let translatedBody = translateBlocks(body, userProcs);
                        const loopVar = `_i${_logoLoopCounter++}`;
                        output += `for(let ${loopVar}=0; ${loopVar}<${nRes.js}; ${loopVar}++){ __logoCheckLoop(); ${translatedBody} }`;
                        i = endIdx; continue;
                    }
                    syntaxError("crochet fermant ] manquant pour REPETE");
                }
                syntaxError("bloc [ ... ] manquant apres REPETE");
            }
            if (upper === 'SI' || upper === 'IF' || upper === 'TANTQUE' || upper === 'WHILE') {
                const isSi = (upper === 'SI' || upper === 'IF');
                let j = i + 1; let condRes = transpileOneCommand(tokens, j, fullArityMap, userProcs);
                j = condRes.nextIdx; while (j < tokens.length && tokens[j].trim() === "") j++;
                if (tokens[j] === '[') {
                    let endIdx1 = findBalancedTokens(tokens, '[', ']', j);
                    if (endIdx1 !== -1) {
                        let body1 = tokens.slice(j + 1, endIdx1).join("");
                        let translatedBody1 = translateBlocks(body1, userProcs);
                        if (isSi) {
                            let nextJ = endIdx1 + 1; while (nextJ < tokens.length && tokens[nextJ].trim() === "") nextJ++;
                            if (tokens[nextJ] && (tokens[nextJ].toUpperCase() === 'SINON' || tokens[nextJ].toUpperCase() === 'ELSE')) {
                                nextJ++; while (nextJ < tokens.length && tokens[nextJ].trim() === "") nextJ++;
                                if (tokens[nextJ] === '[') {
                                    let endIdx2 = findBalancedTokens(tokens, '[', ']', nextJ);
                                    if (endIdx2 !== -1) {
                                        let body2 = tokens.slice(nextJ + 1, endIdx2).join("");
                                        let translatedBody2 = translateBlocks(body2, userProcs);
                                        output += `if (${condRes.js}) { ${translatedBody1} } else { ${translatedBody2} }`;
                                        i = endIdx2; continue;
                                    }
                                    syntaxError("crochet fermant ] manquant pour SINON");
                                }
                                syntaxError("bloc [ ... ] manquant apres SINON");
                            }
                            output += `if (${condRes.js}) { ${translatedBody1} }`;
                            i = endIdx1; continue;
                        } else {
                            output += `while (${condRes.js}) { __logoCheckLoop(); ${translatedBody1} }`;
                            i = endIdx1; continue;
                        }
                    }
                    syntaxError(`crochet fermant ] manquant pour ${upper}`);
                }
                syntaxError(`bloc [ ... ] manquant apres ${upper}`);
            }
            if (upper === 'CHOISIS' || upper === 'SWITCH') {
                let j = i + 1; let valRes = transpileOneCommand(tokens, i + 1, fullArityMap, userProcs);
                j = valRes.nextIdx; while (j < tokens.length && tokens[j].trim() === "") j++;
                if (tokens[j] === '[') {
                    let endIdx = findBalancedTokens(tokens, '[', ']', j);
                    if (endIdx !== -1) {
                        let body = tokens.slice(j + 1, endIdx).join("");
                        let translatedBody = body;
                        while (true) {
                            let cMatch = /\b(?:case|CASE)\s+([^\[\]\n]+)\[/gi.exec(translatedBody); if (!cMatch) break;
                            let moffset = cMatch.index;
                            let eIdx = findBalancedString(translatedBody, '[', ']', moffset + cMatch[0].length - 1);
                            if (eIdx !== -1) {
                                let cbody = translatedBody.substring(moffset + cMatch[0].length, eIdx);
                                translatedBody = translatedBody.substring(0, moffset) + `case ${cMatch[1].trim()}: ${translateBlocks(cbody, userProcs)}; break; ` + translatedBody.substring(eIdx + 1);
                            } else break;
                        }
                        while (true) {
                            let aMatch = /\b(?:autres|AUTRES|default|DEFAULT)\s*\[/gi.exec(translatedBody); if (!aMatch) break;
                            let moffset = aMatch.index;
                            let eIdx = findBalancedString(translatedBody, '[', ']', moffset + aMatch[0].length - 1);
                            if (eIdx !== -1) {
                                let cbody = translatedBody.substring(moffset + aMatch[0].length, eIdx);
                                translatedBody = translatedBody.substring(0, moffset) + `default: ${translateBlocks(cbody, userProcs)}; break; ` + translatedBody.substring(eIdx + 1);
                            } else break;
                        }
                        output += `switch (${valRes.js}) { ${translatedBody} }`;
                        i = endIdx; continue;
                    }
                }
            }
            if (upper === 'CLASSE' || upper === 'CLASS') {
                let j = i + 1; while (j < tokens.length && tokens[j].trim() === "") j++;
                let name = tokens[j] || ""; j++;
                while (j < tokens.length && tokens[j].trim() === "") j++;
                if (tokens[j] === '[') {
                    let endIdx = findBalancedTokens(tokens, '[', ']', j);
                    if (endIdx !== -1) {
                        let body = tokens.slice(j + 1, endIdx).join("");
                        let translatedBody = translateBlocks(body, userProcs, true);
                        output += `class ${name} { ${translatedBody} }`;
                        i = endIdx; continue;
                    }
                }
            }
            if (upper === 'DONNE' || upper === 'DECLARE' || upper === 'LET' || upper === 'VAR') { 
                let j = i + 1; while (j < tokens.length && tokens[j].trim() === "") j++;
                if (j < tokens.length && tokens[j].startsWith(':')) {
                    let varNameRaw = tokens[j].substring(1);
                    let varName = varNameRaw.replace(/:/g, ''); j++;
                    while (j < tokens.length && tokens[j].trim() === "") j++;
                    if (j < tokens.length && ["=", "+=", "-=", "*=", "/="].includes(tokens[j])) { 
                        let op = tokens[j];
                        let valRes = transpileOneCommand(tokens, j + 1, fullArityMap, userProcs);
                        if (varName.includes('.') || varName.startsWith('this')) output += `${varName} ${op} ${valRes.js}; `;
                        else output += `var ${varName} ${op} ${valRes.js}; `; 
                        i = valRes.nextIdx - 1; 
                    } else {
                        let valRes = transpileOneCommand(tokens, j, fullArityMap, userProcs);
                        if (varName.includes('.') || varName.startsWith('this')) output += `${varName} = ${valRes.js}; `;
                        else output += `var ${varName} = ${valRes.js}; `;
                        i = valRes.nextIdx - 1;
                    }
                }
                continue;
            }

            // New logic: catch :var = , :var +=, :var++, etc. without DONNE
            if (token.startsWith(':')) {
                let varName = token.substring(1);
                let j = i + 1; while (j < tokens.length && tokens[j].trim() === "") j++;
                if (j < tokens.length && ["=", "+=", "-=", "*=", "/=", "++", "--"].includes(tokens[j])) {
                    let op = tokens[j];
                    if (op === "++" || op === "--") {
                        output += `${varName}${op}; `;
                        i = j;
                    } else {
                        let valRes = transpileOneCommand(tokens, j + 1, fullArityMap, userProcs);
                        output += `${varName} ${op} ${valRes.js}; `;
                        i = valRes.nextIdx - 1;
                    }
                    continue;
                }
            }

            if (isClass && trimmed !== "") {
                let j = i + 1; while (j < tokens.length && tokens[j].trim() === "") j++;
                if (j < tokens.length && tokens[j] === "[") {
                    let methodName = (trimmed.toLowerCase() === "constructeur" || trimmed.toLowerCase() === "constructor") ? "constructor" : trimmed;
                    let endIdx = findBalancedTokens(tokens, '[', ']', j);
                    if (endIdx !== -1) {
                        let body = tokens.slice(j + 1, endIdx).join("");
                        let translatedBody = translateBlocks(body, userProcs);
                        output += `${methodName}() { ${translatedBody} } `;
                        i = endIdx; continue;
                    }
                }
            }

            if (upper === 'RENDS' || upper === 'RETURN') { output += "return "; continue; }
            if (upper === 'STOP' || upper === 'BREAK') { output += "break; "; continue; }
            if (upper === 'CONTINUE') { output += "continue; "; continue; }
            if (fullArityMap[upper] !== undefined) {
                let lookBehind = i - 1; while (lookBehind >= 0 && tokens[lookBehind].trim() === "") lookBehind--;
                if (lookBehind >= 0 && (tokens[lookBehind] === "function" || tokens[lookBehind] === "class")) { output += token; continue; }
                let sub = transpileOneCommand(tokens, i, fullArityMap, userProcs);
                output += sub.js + (addSemicolons ? "; " : ""); i = sub.nextIdx - 1;
            } else {
                if (token.startsWith('"')) {
                    if (token.endsWith('"') && token.length > 1) {
                         output += token; // Full quoted string
                    } else {
                         output += JSON.stringify(token.substring(1)); // Old Logo "string
                    }
                }
                else output += token;
            }
        }
        return output;
    }

    function transpileOneCommand(tokens, startIndex, fullArityMap, userProcs) {
        let i = startIndex; 
        while (i < tokens.length && (tokens[i].trim() === "" || tokens[i] === ",")) i++;
        if (i >= tokens.length) return { js: "", nextIdx: i };
        let token = tokens[i].trim(); let upper = token.toUpperCase(); let arity = fullArityMap[upper];
        let resultJS = ""; let currentIdx = i;
        if (arity === undefined) {
            if (token === "(") {
                let end = findBalancedTokens(tokens, '(', ')', i);
                if (end !== -1) { let insideJS = transpileGroupedExpression(tokens.slice(i + 1, end), fullArityMap, userProcs); resultJS = "(" + insideJS + ")"; currentIdx = end + 1; }
                else syntaxError("parenthese fermante ) manquante");
            } else if (token === "-" || token === "!" || token === "+") {
                let sub = transpileOneCommand(tokens, i + 1, fullArityMap, userProcs);
                resultJS = token + sub.js;
                currentIdx = sub.nextIdx;
            } else if (token === "[") {
                let end = findBalancedTokens(tokens, '[', ']', i);
                if (end !== -1) { let inside = tokens.slice(i + 1, end).join("").trim(); resultJS = JSON.stringify(inside); currentIdx = end + 1; }
                else syntaxError("crochet fermant ] manquant");
            } else if (token.startsWith(':')) { resultJS = token.substring(1); currentIdx = i + 1; }
            else if (token.startsWith('"')) {
                if (token.endsWith('"') && token.length > 1) {
                    resultJS = token; // Full quoted string
                } else {
                    resultJS = JSON.stringify(token.substring(1));
                }
                currentIdx = i + 1;
            }
            else { resultJS = token; currentIdx = i + 1; }
        } else {
            let minArity = arity;
            let maxArity = arity;
            if (typeof arity === "string" && arity.includes("-")) {
                const parts = arity.split("-").map(Number);
                minArity = parts[0];
                maxArity = parts[1];
            }
            let args = []; currentIdx = i + 1;
            for (let a = 0; a < minArity; a++) {
                let sub = transpileOneCommand(tokens, currentIdx, fullArityMap, userProcs);
                if (sub.js === "") syntaxError(`argument ${a + 1} manquant pour ${upper}`);
                args.push(sub.js);
                currentIdx = sub.nextIdx;
            }
            for (let a = minArity; a < maxArity && shouldConsumeOptionalArg(tokens, currentIdx, fullArityMap); a++) {
                let sub = transpileOneCommand(tokens, currentIdx, fullArityMap, userProcs);
                if (sub.js === "") break;
                args.push(sub.js);
                currentIdx = sub.nextIdx;
            }
            const commandName = arityMap[upper] !== undefined ? upper : token;
            resultJS = commandName + "(" + args.join(", ") + ")";
            if (upper === "PAUSE" || arityMap[upper] === undefined) {
                resultJS = "await " + resultJS;
            }
        }
        while (currentIdx < tokens.length) {
            let nextTok = tokens[currentIdx]; let nt = nextTok.trim();
            if (nt === "") {
                let peek = currentIdx + 1; while (peek < tokens.length && tokens[peek].trim() === "") peek++;
                if (peek < tokens.length && isBinaryOperator(tokens[peek])) { resultJS += nextTok; currentIdx++; continue; }
                break;
            }
            if (isBinaryOperator(nt)) {
                resultJS += toJSOperator(nt); currentIdx++;
                let sub = transpileOneCommand(tokens, currentIdx, fullArityMap, userProcs); resultJS += sub.js; currentIdx = sub.nextIdx; continue;
            }
            break;
        }
        return { js: resultJS, nextIdx: currentIdx };
    }

    function findBalancedTokens(tokens, start, end, startIndex) {
        let count = 0;
        for (let i = startIndex; i < tokens.length; i++) {
            if (tokens[i] === start) count++;
            else if (tokens[i] === end) { count--; if (count === 0) return i; }
        }
        return -1;
    }

    function findBalancedString(str, start, end, startIndex) {
        let count = 0;
        for (let i = startIndex; i < str.length; i++) {
            if (str[i] === start) count++;
            else if (str[i] === end) { count--; if (count === 0) return i; }
        }
        return -1;
    }
})(window);
