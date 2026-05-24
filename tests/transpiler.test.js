const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const rootDir = path.resolve(__dirname, "..");

function loadLogoRuntime() {
    const fakeDocument = {
        addEventListener() {},
        getElementById() { return null; },
        querySelector() { return null; },
        querySelectorAll() { return []; }
    };
    const context = {
        window: {},
        document: fakeDocument,
        setTimeout,
        clearTimeout
    };
    context.window.window = context.window;
    context.window.document = fakeDocument;

    vm.createContext(context);
    [
        "src/commands.js",
        "src/transpiler.js",
        "src/terminal.js",
        "src/runtime.js"
    ].forEach((file) => {
        vm.runInContext(fs.readFileSync(path.join(rootDir, file), "utf8"), context);
    });

    return context.window;
}

function compact(js) {
    return js.replace(/\s+/g, " ").trim();
}

const pendingTests = [];
let testChain = Promise.resolve();

function test(name, fn) {
    testChain = testChain
        .then(fn)
        .then(() => {
            console.log(`ok - ${name}`);
        })
        .catch((error) => {
            console.error(`not ok - ${name}`);
            throw error;
        });
    pendingTests.push(testChain);
}

const logo = loadLogoRuntime();

test("transpile les commandes de dessin documentees", () => {
    assert.strictEqual(compact(logo.translateLogoToJS("RECTANGLE 20 10")), "RECTANGLE(20, 10);");
    assert.strictEqual(compact(logo.translateLogoToJS("ELLIPSE 40 20")), "ELLIPSE(40, 20);");
    assert.strictEqual(compact(logo.translateLogoToJS("ARC 90 50")), "ARC(90, 50);");
});

test("transpile les fonctions d'etat et mathematiques", () => {
    assert.strictEqual(compact(logo.translateLogoToJS("ECRIS POSX")), "ECRIS(POSX());");
    assert.strictEqual(compact(logo.translateLogoToJS("LOG CAP")), "LOG(CAP());");
    assert.strictEqual(compact(logo.translateLogoToJS("PAUSE 250")), "await PAUSE(250);");
    assert.strictEqual(compact(logo.translateLogoToJS("ECRIS CAP")), "ECRIS(CAP());");
    assert.strictEqual(compact(logo.translateLogoToJS("PUISSANCE 2 3")), "PUISSANCE(2, 3);");
    assert.strictEqual(compact(logo.translateLogoToJS("MIN 4 7")), "MIN(4, 7);");
});

test("normalise les commandes saisies en minuscules", () => {
    assert.strictEqual(compact(logo.translateLogoToJS("rectangle 20 10")), "RECTANGLE(20, 10);");
    assert.strictEqual(compact(logo.translateLogoToJS("av sin 90")), "AV(SIN(90));");
});

test("transpile les procedures utilisateur et leurs appels", () => {
    const js = compact(logo.translateLogoToJS(`
POUR CARRE :taille
  REPETE 4 [ AV :taille TD 90 ]
FIN
CARRE 50
`));

    assert.match(js, /async function CARRE\(taille\)/);
    assert.match(js, /AV\(taille\);/);
    assert.match(js, /CARRE\(50\);$/);
});

test("transpile PAUSE dans une procedure utilisateur", () => {
    const js = compact(logo.translateLogoToJS(`
POUR ATTENDS
  PAUSE 10
FIN
ATTENDS
`));

    assert.match(js, /async function ATTENDS\(\)/);
    assert.match(js, /await PAUSE\(10\);/);
    assert.match(js, /await ATTENDS\(\);$/);
});

test("transpile les variables et affectations directes", () => {
    const js = compact(logo.translateLogoToJS("DONNE :x 10 :x += 5 :x++ ECRIS :x"));

    assert.match(js, /var x = 10;/);
    assert.match(js, /x \+= 5;/);
    assert.match(js, /x\+\+;/);
    assert.match(js, /ECRIS\(x\);/);
});

test("transpile les fonctions de tableau avec prefixe TAB", () => {
    const js = compact(logo.translateLogoToJS("DONNE :t TABLEAU TAB_AJOUTE :t \"A\" TAB_MODIFIE :t 0 \"B\" ECRIS TAB_LIS :t 0 LOG TAB_TAILLE :t"));

    assert.match(js, /var t = TABLEAU\(\);/);
    assert.match(js, /TAB_AJOUTE\(t, "A"\);/);
    assert.match(js, /TAB_MODIFIE\(t, 0, "B"\);/);
    assert.match(js, /ECRIS\(TAB_LIS\(t, 0\)\);/);
    assert.match(js, /LOG\(TAB_TAILLE\(t\)\);/);
});

test("transpile les entrees et conversions", () => {
    const js = compact(logo.translateLogoToJS("DONNE :nom LIS \"Nom ?\" MSG :nom DONNE :n _NOMBRE \"42\" ECRIS _TEXTE :n DONNE :t _TABLEAU \"1, 2, 3\" DONNE :s _S_TABLEAU \"a, b\\, c, d\""));

    assert.match(js, /var nom = LIS\("Nom \?"\);/);
    assert.match(js, /MSG\(nom\);/);
    assert.match(js, /var n = _NOMBRE\("42"\);/);
    assert.match(js, /ECRIS\(_TEXTE\(n\)\);/);
    assert.match(js, /var t = _TABLEAU\("1, 2, 3"\);/);
    assert.match(js, /var s = _S_TABLEAU\("a, b\\, c, d"\);/);
});

test("transpile les commandes de police", () => {
    const js = compact(logo.translateLogoToJS("POLICE_TAILLE 24 POLICE_STYLE \"gi\" POLICE_NOM \"Calibri\" RETOURLIGNE ECRIS \"POUR FIN\""));

    assert.match(js, /POLICE_TAILLE\(24\);/);
    assert.match(js, /POLICE_STYLE\("gi"\);/);
    assert.match(js, /POLICE_NOM\("Calibri"\);/);
    assert.match(js, /RETOURLIGNE\(\);/);
    assert.match(js, /ECRIS\("POUR FIN"\);/);
});

test("transpile les primitives graphiques directes et medias", () => {
    const js = compact(logo.translateLogoToJS("LIGNE 0 0 10 10 RECT 0 0 20 20 ELIP 0 0 30 20 AFFICHEIMAGE \"a.png\" 0 0 20 20 LIREVIDEO \"v.mp4\" 0 0 40 30 STOPVIDEO LIRESON \"s.mp3\" STOPSON PIXEL 1 2 \"rouge\" ECRIS VALPIXEL 1 2"));

    assert.match(js, /LIGNE\(0, 0, 10, 10\);/);
    assert.match(js, /RECT\(0, 0, 20, 20\);/);
    assert.match(js, /ELIP\(0, 0, 30, 20\);/);
    assert.match(js, /AFFICHEIMAGE\("a\.png", 0, 0, 20, 20\);/);
    assert.match(js, /LIREVIDEO\("v\.mp4", 0, 0, 40, 30\);/);
    assert.match(js, /STOPVIDEO\(\);/);
    assert.match(js, /LIRESON\("s\.mp3"\);/);
    assert.match(js, /STOPSON\(\);/);
    assert.match(js, /PIXEL\(1, 2, "rouge"\);/);
    assert.match(js, /ECRIS\(VALPIXEL\(1, 2\)\);/);
});

test("transpile SI SINON avec appels imbriques", () => {
    const js = compact(logo.translateLogoToJS("SI (:x > MIN 3 4) [ AV 10 ] SINON [ RE 10 ]"));

    assert.match(js, /if \(\(x >MIN\(3, 4\)\)\)/);
    assert.match(js, /AV\(10\);/);
    assert.match(js, /else \{ RE\(10\);/);
});

test("ajoute le garde anti-boucle dans REPETE et TANTQUE", () => {
    assert.match(logo.translateLogoToJS("REPETE 3 [ AV 10 ]"), /__logoCheckLoop\(\)/);
    assert.match(logo.translateLogoToJS("DONNE :x 0 TANTQUE \(:x < 3\) [ :x\+\+ ]"), /while \(\(x <3\)\) \{ __logoCheckLoop\(\);/);
});

test("convertit les comparaisons Logo dans les conditions", () => {
    assert.match(logo.translateLogoToJS("SI (:x = 5) [ AV 10 ]"), /x ===5/);
    assert.match(logo.translateLogoToJS("SI (:x != 5) [ AV 10 ]"), /x !==5/);
    assert.match(logo.translateLogoToJS("SI (:x <= 5) [ AV 10 ]"), /x <=5/);
    assert.match(logo.translateLogoToJS("SI (:x >= 5) [ AV 10 ]"), /x >=5/);
});

test("signale les erreurs de syntaxe Logo courantes", () => {
    assert.throws(() => logo.translateLogoToJS("REPETE 4 [ AV 10"), /Syntaxe Logo: crochet fermant \] manquant pour REPETE/);
    assert.throws(() => logo.translateLogoToJS("SI (:x = 1) AV 10"), /Syntaxe Logo: bloc \[ \.\.\. \] manquant apres SI/);
    assert.throws(() => logo.translateLogoToJS("POUR CARRE :t AV :t"), /Syntaxe Logo: FIN manquant pour la procedure CARRE/);
    assert.throws(() => logo.translateLogoToJS("AV"), /Syntaxe Logo: argument 1 manquant pour AV/);
});

test("interrompt les boucles qui depassent la limite d'execution", async () => {
    let lastError = "";
    logo.logToTerminal = (message, type) => {
        if (type === "error") lastError = message;
    };
    logo.logoExecutionState.maxLoopIterations = 3;
    await logo.executeSnippet("TANTQUE (1 = 1) []");

    assert.match(lastError, /Boucle interrompue/);
    assert.strictEqual(logo.logoExecutionState.isRunning, false);
    logo.logoExecutionState.maxLoopIterations = 100000;
});

test("execute PAUSE sans erreur", async () => {
    let warningCount = 0;
    logo.logToTerminal = (message, type) => {
        if (type === "warn") warningCount++;
    };
    await logo.executeSnippet("PAUSE 1");

    assert.strictEqual(warningCount, 0);
    assert.strictEqual(logo.logoExecutionState.isRunning, false);
});

test("ne signale pas un arret quand aucune execution ne tourne", () => {
    let warningCount = 0;
    logo.logToTerminal = (message, type) => {
        if (type === "warn") warningCount++;
    };
    logo.logoExecutionState.isRunning = false;
    logo.requestLogoStop();

    assert.strictEqual(warningCount, 0);
});

Promise.all(pendingTests)
    .then(() => {
        console.log("Tous les tests du transpilateur sont passes.");
    })
    .catch(() => {
        process.exitCode = 1;
    });
