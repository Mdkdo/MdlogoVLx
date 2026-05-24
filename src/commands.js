(function(global) {
    global.turtle = null;
    const colorMap = { 'rouge': 'red', 'vert': 'green', 'bleu': 'blue', 'jaune': 'yellow', 'noir': 'black', 'blanc': 'white', 'rose': 'pink', 'orange': 'orange', 'violet': 'purple', 'gris': 'gray', 'marron': 'brown', 'cyan': 'cyan', 'magenta': 'magenta' };
    const translateColor = (c) => (typeof c === 'string') ? (colorMap[c.toLowerCase()] || c) : c;
    const parseTableText = (value) => String(value).split(",").map(item => {
        const trimmed = item.trim();
        const asNumber = Number(trimmed);
        return trimmed !== "" && Number.isFinite(asNumber) ? asNumber : trimmed;
    });
    const parseStringTableText = (value) => {
        const items = [];
        let current = "";
        let escaped = false;
        for (const char of String(value)) {
            if (escaped) {
                current += char;
                escaped = false;
            } else if (char === "\\") {
                escaped = true;
            } else if (char === ",") {
                items.push(current.trim());
                current = "";
            } else {
                current += char;
            }
        }
        if (escaped) current += "\\";
        items.push(current.trim());
        return items;
    };
    class LogoTable {
        constructor(items = []) {
            this.items = Array.isArray(items) ? items.slice() : [];
        }
        ajouter(value) { this.items.push(value); return this; }
        modifier(index, value) { this.items[Number(index)] = value; return this; }
        lire(index) { return this.items[Number(index)]; }
        supprimer(index) { return this.items.splice(Number(index), 1)[0]; }
        taille() { return this.items.length; }
        vider() { this.items = []; return this; }
        texte() { return this.items.join(', '); }
        toString() { return this.texte(); }
    }
    global.fd = (n) => global.turtle.fd(n);
    global.bk = (n) => global.turtle.bk(n);
    global.rt = (n) => global.turtle.rt(n);
    global.lt = (n) => global.turtle.lt(n);
    global.pu = () => global.turtle.pu();
    global.pd = () => global.turtle.pd();
    global.cs = () => global.turtle.cs();
    global.clean = () => global.turtle.clean();
    global.home = () => global.turtle.home();
    global.setcolor = (c) => global.turtle.setcolor(translateColor(c));
    global.setwidth = (w) => global.turtle.setwidth(w);
    global.ps = global.setwidth;
    global.arc = (a, r) => global.turtle.arc(a, r);
    global.circle = (r) => global.turtle.circle(r);
    global.rectangle = (w, h) => global.turtle.rectangle(w, h);
    global.ellipse = (w, h) => global.turtle.ellipse(w, h);
    global.line = (x1, y1, x2, y2) => global.turtle.line(x1, y1, x2, y2);
    global.rect = (x1, y1, x2, y2) => global.turtle.rectangle(x1, y1, x2, y2);
    global.elip = (x1, y1, x2, y2) => global.turtle.ellipse(x1, y1, x2, y2);
    global.write = (t) => global.turtle.writeLine(t);
    global.log = (t) => { if (typeof global.logToTerminal === 'function') global.logToTerminal(String(t), 'log'); else console.log(t); };
    global.newline = (n = 1) => global.turtle.newline(n);
    global.pause = (ms) => new Promise(resolve => setTimeout(resolve, Math.max(0, Number(ms) || 0)));
    global.font = (s) => global.turtle.font(s);
    global.fontsize = (n) => global.turtle.setFontSize(n);
    global.fontstyle = (s) => global.turtle.setFontStyle(s);
    global.fontname = (n) => global.turtle.setFontFamily(n);
    global.polygon = (sides, size) => global.turtle.polygon(sides, size);
    global.star = (points, outer, inner) => global.turtle.star(points, outer, inner);
    global.stamp = () => global.turtle.stamp();
    global.drawimage = (url, x1, y1, x2, y2) => global.turtle.drawImageBox(url, x1, y1, x2, y2);
    global.gradient = (type, ...colors) => global.turtle.gradient(type, colors);
    global.opacity = (val) => global.turtle.opacity(val);
    global.smooth = (val) => global.turtle.smooth(val);
    global.setxy = (x, y) => global.turtle.setxy(x, y);
    global.setheading = (d) => global.turtle.setheading(d);
    global.ht = () => global.turtle.ht();
    global.st = () => global.turtle.st();
    global.posx = () => global.turtle.x;
    global.posy = () => global.turtle.y;
    global.heading = () => global.turtle.heading();
    global.distance = (x, y) => global.turtle.distance(x, y);
    global.towards = (x, y) => global.turtle.towards(x, y);
    global.pencolor = (c) => global.turtle.pencolor(translateColor(c));
    global.fillcolor = (c) => global.turtle.fillcolor(translateColor(c));
    global.fill = (c) => global.turtle.fill(c);
    global.canvascolor = (c) => global.turtle.canvascolor(translateColor(c));
    global.pi = Math.PI; global.sqrt = Math.sqrt; global.pow = Math.pow; global.abs = Math.abs; global.exp = Math.exp; global.ln = Math.log; global.integer = Math.floor; global.round = Math.round; global.ceil = Math.ceil; global.min = Math.min; global.max = Math.max;
    const degToRad = (d) => (d * Math.PI) / 180;
    const radToDeg = (r) => (r * 180) / Math.PI;
    global.sin = (d) => Math.sin(degToRad(d)); global.cos = (d) => Math.cos(degToRad(d)); global.tan = (d) => Math.tan(degToRad(d)); global.atan = (y, x) => radToDeg(Math.atan2(y, x)); global.random = (n) => Math.random() * n; global.mod = (a, b) => a % b; global.rgb = (r, g, b) => `rgb(${r},${g},${b})`;
    global.playsound = (url) => global.turtle.playSound(url);
    global.showimage = global.drawimage;
    global.showvideo = (url, x1, y1, x2, y2) => global.turtle.playVideo(url, x1, y1, x2, y2);
    global.stopvideo = () => global.turtle.stopVideo();
    global.stopson = () => global.turtle.stopSound();
    global.msg = (message) => alert(String(message));
    global.lisinfo = (message) => prompt(String(message), "");
    global.toNumber = (value) => Number(value);
    global.toText = (value) => String(value);
    global.tableFromText = (value) => new LogoTable(parseTableText(value));
    global.stringTableFromText = (value) => new LogoTable(parseStringTableText(value));
    global.pixel = (x, y, color) => global.turtle.setPixel(x, y, translateColor(color));
    global.valpixel = (x, y) => global.turtle.getPixel(x, y);
    global.tableau = (...items) => new LogoTable(items);
    global.ajoute = (table, value) => table.ajouter(value);
    global.modifie = (table, index, value) => table.modifier(index, value);
    global.lis = (first, index) => index === undefined ? global.lisinfo(first) : first.lire(index);
    global.supprime = (table, index) => table.supprimer(index);
    global.taille = (table) => table.taille();
    global.vide = (table) => table.vider();
    global.texte = (table) => table.texte();
    global.print = global.log;
    global.AV = global.fd; global.RE = global.bk; global.TD = global.rt; global.TG = global.lt; global.LC = global.pu; global.BC = global.pd; global.VE = global.cs; global.NETTOIE = global.clean; global.ORIGINE = global.home; global.CT = global.ht; global.MT = global.st; global.FCC = global.setcolor; global.FCB = global.fillcolor; global.FCAP = global.setheading; global.FPOS = global.setxy; global.FCA = global.canvascolor; global.FTC = global.setwidth; global.LIGNE = global.line; global.RECT = global.rect; global.ELIP = global.elip; global.CERCLE = global.circle; global.POLYGONE = global.polygon; global.ETOILE = global.star; global.REMPLIS = global.fill; global.TAMPON = global.stamp; global.OPACITE = global.opacity; global.FLUIDE = global.smooth; global.DEGRADE = global.gradient; global.JOUE = global.playsound; global.LIRESON = global.playsound; global.STOPSON = global.stopson; global.AFFICHEIMAGE = global.showimage; global.LIREVIDEO = global.showvideo; global.AFFICHEVIDEO = global.showvideo; global.STOPVIDEO = global.stopvideo; global.ECRIS = global.write; global.LOG = global.log; global.MSG = global.msg; global.RETOURLIGNE = global.newline; global.NL = global.newline; global.PAUSE = global.pause; global.POLICE_TAILLE = global.fontsize; global.POLICE_STYLE = global.fontstyle; global.POLICE_NOM = global.fontname; global._NOMBRE = global.toNumber; global._TEXTE = global.toText; global._TABLEAU = global.tableFromText; global._S_TABLEAU = global.stringTableFromText; global.PIXEL = global.pixel; global.VALPIXEL = global.valpixel; global.TAB_AJOUTE = global.ajoute; global.TAB_MODIFIE = global.modifie; global.TAB_LIS = (table, index) => table.lire(index); global.TAB_SUPPRIME = global.supprime; global.TAB_TAILLE = global.taille; global.TAB_VIDE = global.vide; global.TAB_TEXTE = global.texte;
    global.POSX = global.posx; global.POSY = global.posy; global.CAP = global.heading; global.RECTANGLE = global.rectangle; global.ELLIPSE = global.ellipse; global.ARC = global.arc; global.DISTANCE = global.distance; global.VERS = global.towards; global.DS = global.distance;
    global.PI = global.pi; global.RACINE = global.sqrt; global.PUISSANCE = global.pow; global.VALABS = global.abs; global.EXP = global.exp; global.LOGN = global.ln; global.ENTIER = global.integer; global.ARRONDI = global.round; global.PLAFOND = global.ceil; global.MIN = global.min; global.MAX = global.max; global.SIN = global.sin; global.COS = global.cos; global.TAN = global.tan; global.ATAN = global.atan; global.HASARD = global.random; global.MODULO = global.mod; global.RVB = global.rgb;
    global.FD = global.fd; global.BK = global.bk; global.RT = global.rt; global.LT = global.lt; global.PU = global.pu; global.PD = global.pd; global.CS = global.cs; global.CLEAN = global.clean; global.HOME = global.home; global.HT = global.ht; global.ST = global.st; global.STAMP = global.stamp; global.SETCOLOR = global.setcolor; global.FILLCOLOR = global.fillcolor; global.SETHEADING = global.setheading; global.SETXY = global.setxy; global.CANVASCOLOR = global.canvascolor; global.SETWIDTH = global.setwidth; global.LINE = global.line; global.RECT = global.rect; global.ELIP = global.elip; global.CIRCLE = global.circle; global.POLYGON = global.polygon; global.STAR = global.star; global.FILL = global.fill; global.OPACITY = global.opacity; global.SMOOTH = global.smooth; global.GRADIENT = global.gradient; global.PLAYSOUND = global.playsound; global.STOPSOUND = global.stopson; global.SHOWIMAGE = global.showimage; global.SHOWVIDEO = global.showvideo; global.STOPVIDEO = global.stopvideo; global.WRITE = global.write; global.HEADING = global.heading; global.TOWARDS = global.towards; global.RECTANGLE = global.rectangle; global.ELLIPSE = global.ellipse; global.ARC = global.arc; global.RGB = global.rgb; global.RANDOM = global.random; global.SQRT = global.sqrt; global.POW = global.pow; global.ABS = global.abs; global.LN = global.ln; global.INTEGER = global.integer; global.ROUND = global.round; global.CEIL = global.ceil; global.MOD = global.mod; global.PAUSE = global.pause; global.TABLEAU = global.tableau; global.AJOUTE = global.ajoute; global.MODIFIE = global.modifie; global.LIS = global.lis; global.SUPPRIME = global.supprime; global.TAILLE = global.taille; global.VIDE = global.vide; global.TEXTE = global.texte; global.TAB_AJOUTE = global.TAB_AJOUTE; global.TAB_MODIFIE = global.TAB_MODIFIE; global.TAB_LIS = global.TAB_LIS; global.TAB_SUPPRIME = global.TAB_SUPPRIME; global.TAB_TAILLE = global.TAB_TAILLE; global.TAB_VIDE = global.TAB_VIDE; global.TAB_TEXTE = global.TAB_TEXTE; global.PIXEL = global.pixel; global.VALPIXEL = global.valpixel;
    global.LOGO_KEYWORDS = [ "DONNE", "DECLARE", "SI", "SINON", "TANTQUE", "REPETE", "CLASSE", "POUR", "FIN", "RENDS", "STOP", "CONTINUE", "CHOISIS", "CASE", "AUTRES" ];
    global.LOGO_COMMAND_SPECS = {
        AV: 1, RE: 1, TD: 1, TG: 1, LC: 0, BC: 0, VE: 0, NETTOIE: 0, ORIGINE: 0, CT: 0, MT: 0,
        FCC: 1, FCB: 1, FCAP: 1, FPOS: 2, FCA: 1, FTC: 1, LIGNE: 4, RECT: 4, ELIP: 4, CERCLE: 1, ARC: 2, RECTANGLE: 2, ELLIPSE: 2,
        POLYGONE: 2, ETOILE: 3, REMPLIS: 0, TAMPON: 0, OPACITE: 1, FLUIDE: 1, DEGRADE: 3, JOUE: 1,
        AFFICHEIMAGE: 5, LIREVIDEO: 5, AFFICHEVIDEO: 5, STOPVIDEO: 0, LIRESON: 1, STOPSON: 0, ECRIS: 1, LOG: 1, MSG: 1, RETOURLIGNE: 0, NL: 0, PAUSE: 1, POLICE_TAILLE: 1, POLICE_STYLE: 1, POLICE_NOM: 1, POSX: 0, POSY: 0, CAP: 0, DISTANCE: 2, VERS: 2, DS: 2,
        RACINE: 1, PUISSANCE: 2, VALABS: 1, EXP: 1, LOGN: 1, ENTIER: 1, ARRONDI: 1, PLAFOND: 1,
        MIN: 2, MAX: 2, SIN: 1, COS: 1, TAN: 1, ATAN: 2, HASARD: 1, MODULO: 2, RVB: 3,
        FD: 1, BK: 1, RT: 1, LT: 1, PU: 0, PD: 0, CS: 0, CLEAN: 0, HOME: 0, HT: 0, ST: 0, STAMP: 0,
        SETCOLOR: 1, FILLCOLOR: 1, SETHEADING: 1, SETXY: 2, CANVASCOLOR: 1, SETWIDTH: 1, CIRCLE: 1,
        POLYGON: 2, STAR: 3, FILL: 0, OPACITY: 1, SMOOTH: 1, GRADIENT: 3, PLAYSOUND: 1, SHOWIMAGE: 1,
        SHOWIMAGE: 5, SHOWVIDEO: 5, STOPVIDEO: 0, WRITE: 1, HEADING: 0, TOWARDS: 2, RGB: 3, RANDOM: 1, SQRT: 1, POW: 2, ABS: 1,
        LN: 1, INTEGER: 1, ROUND: 1, CEIL: 1, MOD: 2, LINE: 4, RECT: 4, ELIP: 4, _NOMBRE: 1, _TEXTE: 1, _TABLEAU: 1, _S_TABLEAU: 1, PIXEL: 3, VALPIXEL: 2, TABLEAU: 0, AJOUTE: 2, MODIFIE: 3, LIS: "1-2", SUPPRIME: 2, TAILLE: 1, VIDE: 1, TEXTE: 1, TAB_AJOUTE: 2, TAB_MODIFIE: 3, TAB_LIS: 2, TAB_SUPPRIME: 2, TAB_TAILLE: 1, TAB_VIDE: 1, TAB_TEXTE: 1
    };
    global.LOGO_COMMANDS = Object.keys(global.LOGO_COMMAND_SPECS).concat(["PI"]);
    global.LOGO_ALL_CAPS = [...global.LOGO_KEYWORDS, ...global.LOGO_COMMANDS];
})(window);
