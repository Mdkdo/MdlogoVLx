(function(global) {
    global.turtle = null;
    const colorMap = { 'rouge': 'red', 'vert': 'green', 'bleu': 'blue', 'jaune': 'yellow', 'noir': 'black', 'blanc': 'white', 'rose': 'pink', 'orange': 'orange', 'violet': 'purple', 'gris': 'gray', 'marron': 'brown', 'cyan': 'cyan', 'magenta': 'magenta' };
    const translateColor = (c) => (typeof c === 'string') ? (colorMap[c.toLowerCase()] || c) : c;
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
    global.write = (t) => global.turtle.write(t);
    global.font = (s) => global.turtle.font(s);
    global.polygon = (sides, size) => global.turtle.polygon(sides, size);
    global.star = (points, outer, inner) => global.turtle.star(points, outer, inner);
    global.stamp = () => global.turtle.stamp();
    global.drawimage = (url, w, h) => global.turtle.drawImage(url, w, h);
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
    global.playsound = (url) => { const audio = new Audio(url); audio.play(); };
    global.showimage = (url, x, y, w, h) => { const img = new Image(); img.onload = () => { const ix = (x !== undefined) ? x : global.turtle.x; const iy = (y !== undefined) ? y : global.turtle.y; const sx = global.turtle.originX + ix; const sy = global.turtle.originY - iy; if (w !== undefined && h !== undefined) { global.turtle.ctx.drawImage(img, sx - w/2, sy - h/2, w, h); } else { global.turtle.ctx.drawImage(img, sx - img.width/2, sy - img.height/2); } }; img.src = url; };
    global.showvideo = (url, x, y, w, h) => { const video = document.createElement('video'); video.src = url; video.autoplay = true; video.loop = true; video.muted = true; video.onplay = () => { const drawVideo = () => { if (video.paused || video.ended) return; const ix = (x !== undefined) ? x : global.turtle.x; const iy = (y !== undefined) ? y : global.turtle.y; const sx = global.turtle.originX + ix; const sy = global.turtle.originY - iy; const vw = w || 320; const vh = h || 240; global.turtle.ctx.drawImage(video, sx - vw/2, sy - vh/2, vw, vh); requestAnimationFrame(drawVideo); }; drawVideo(); }; };
    function _logoLog(msg) { if (typeof global.logToTerminal === 'function') { global.logToTerminal(String(msg), 'log'); } else { console.log(msg); } }
    global.print = _logoLog;
    global.AV = global.fd; global.RE = global.bk; global.TD = global.rt; global.TG = global.lt; global.LC = global.pu; global.BC = global.pd; global.VE = global.cs; global.NETTOIE = global.clean; global.ORIGINE = global.home; global.CT = global.ht; global.MT = global.st; global.FCC = global.setcolor; global.FCB = global.fillcolor; global.FCAP = global.setheading; global.FPOS = global.setxy; global.FCA = global.canvascolor; global.FTC = global.setwidth; global.CERCLE = global.circle; global.POLYGONE = global.polygon; global.ETOILE = global.star; global.REMPLIS = global.fill; global.TAMPON = global.stamp; global.OPACITE = global.opacity; global.FLUIDE = global.smooth; global.DEGRADE = global.gradient; global.JOUE = global.playsound; global.AFFICHEIMAGE = global.showimage; global.AFFICHEVIDEO = global.showvideo; global.ECRIS = _logoLog;
    global.POSX = global.posx; global.POSY = global.posy; global.CAP = global.heading; global.RECTANGLE = global.rectangle; global.ELLIPSE = global.ellipse; global.ARC = global.arc; global.DISTANCE = global.distance; global.VERS = global.towards; global.DS = global.distance;
    global.PI = global.pi; global.RACINE = global.sqrt; global.PUISSANCE = global.pow; global.VALABS = global.abs; global.EXP = global.exp; global.LOGN = global.ln; global.ENTIER = global.integer; global.ARRONDI = global.round; global.PLAFOND = global.ceil; global.MIN = global.min; global.MAX = global.max; global.SIN = global.sin; global.COS = global.cos; global.TAN = global.tan; global.ATAN = global.atan; global.HASARD = global.random; global.MODULO = global.mod; global.RVB = global.rgb;
    global.FD = global.fd; global.BK = global.bk; global.RT = global.rt; global.LT = global.lt; global.PU = global.pu; global.PD = global.pd; global.CS = global.cs; global.CLEAN = global.clean; global.HOME = global.home; global.HT = global.ht; global.ST = global.st; global.STAMP = global.stamp; global.SETCOLOR = global.setcolor; global.FILLCOLOR = global.fillcolor; global.SETHEADING = global.setheading; global.SETXY = global.setxy; global.CANVASCOLOR = global.canvascolor; global.SETWIDTH = global.setwidth; global.CIRCLE = global.circle; global.POLYGON = global.polygon; global.STAR = global.star; global.FILL = global.fill; global.OPACITY = global.opacity; global.SMOOTH = global.smooth; global.GRADIENT = global.gradient; global.PLAYSOUND = global.playsound; global.SHOWIMAGE = global.showimage; global.SHOWVIDEO = global.showvideo; global.WRITE = global.write; global.HEADING = global.heading; global.TOWARDS = global.towards; global.RECTANGLE = global.rectangle; global.ELLIPSE = global.ellipse; global.ARC = global.arc; global.RGB = global.rgb; global.RANDOM = global.random; global.SQRT = global.sqrt; global.POW = global.pow; global.ABS = global.abs; global.LN = global.ln; global.INTEGER = global.integer; global.ROUND = global.round; global.CEIL = global.ceil; global.MOD = global.mod;
    global.LOGO_KEYWORDS = [ "DONNE", "DECLARE", "SI", "SINON", "TANTQUE", "REPETE", "CLASSE", "POUR", "FIN", "RENDS", "STOP", "CONTINUE", "CHOISIS", "CASE", "AUTRES" ];
    global.LOGO_COMMAND_SPECS = {
        AV: 1, RE: 1, TD: 1, TG: 1, LC: 0, BC: 0, VE: 0, NETTOIE: 0, ORIGINE: 0, CT: 0, MT: 0,
        FCC: 1, FCB: 1, FCAP: 1, FPOS: 2, FCA: 1, FTC: 1, CERCLE: 1, ARC: 2, RECTANGLE: 2, ELLIPSE: 2,
        POLYGONE: 2, ETOILE: 3, REMPLIS: 0, TAMPON: 0, OPACITE: 1, FLUIDE: 1, DEGRADE: 3, JOUE: 1,
        AFFICHEIMAGE: 1, AFFICHEVIDEO: 1, ECRIS: 1, POSX: 0, POSY: 0, CAP: 0, DISTANCE: 2, VERS: 2, DS: 2,
        RACINE: 1, PUISSANCE: 2, VALABS: 1, EXP: 1, LOGN: 1, ENTIER: 1, ARRONDI: 1, PLAFOND: 1,
        MIN: 2, MAX: 2, SIN: 1, COS: 1, TAN: 1, ATAN: 2, HASARD: 1, MODULO: 2, RVB: 3,
        FD: 1, BK: 1, RT: 1, LT: 1, PU: 0, PD: 0, CS: 0, CLEAN: 0, HOME: 0, HT: 0, ST: 0, STAMP: 0,
        SETCOLOR: 1, FILLCOLOR: 1, SETHEADING: 1, SETXY: 2, CANVASCOLOR: 1, SETWIDTH: 1, CIRCLE: 1,
        POLYGON: 2, STAR: 3, FILL: 0, OPACITY: 1, SMOOTH: 1, GRADIENT: 3, PLAYSOUND: 1, SHOWIMAGE: 1,
        SHOWVIDEO: 1, WRITE: 1, HEADING: 0, TOWARDS: 2, RGB: 3, RANDOM: 1, SQRT: 1, POW: 2, ABS: 1,
        LN: 1, INTEGER: 1, ROUND: 1, CEIL: 1, MOD: 2
    };
    global.LOGO_COMMANDS = Object.keys(global.LOGO_COMMAND_SPECS).concat(["PI"]);
    global.LOGO_ALL_CAPS = [...global.LOGO_KEYWORDS, ...global.LOGO_COMMANDS];
})(window);
