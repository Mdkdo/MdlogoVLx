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
        document: fakeDocument
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

function test(name, fn) {
    try {
        fn();
        console.log(`ok - ${name}`);
    } catch (error) {
        console.error(`not ok - ${name}`);
        throw error;
    }
}

const logo = loadLogoRuntime();

test("transpile les commandes de dessin documentees", () => {
    assert.strictEqual(compact(logo.translateLogoToJS("RECTANGLE 20 10")), "RECTANGLE(20, 10);");
    assert.strictEqual(compact(logo.translateLogoToJS("ELLIPSE 40 20")), "ELLIPSE(40, 20);");
    assert.strictEqual(compact(logo.translateLogoToJS("ARC 90 50")), "ARC(90, 50);");
});

test("transpile les fonctions d'etat et mathematiques", () => {
    assert.strictEqual(compact(logo.translateLogoToJS("ECRIS POSX")), "ECRIS(POSX());");
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

    assert.match(js, /function CARRE\(taille\)/);
    assert.match(js, /AV\(taille\);/);
    assert.match(js, /CARRE\(50\);$/);
});

test("transpile les variables et affectations directes", () => {
    const js = compact(logo.translateLogoToJS("DONNE :x 10 :x += 5 :x++ ECRIS :x"));

    assert.match(js, /var x = 10;/);
    assert.match(js, /x \+= 5;/);
    assert.match(js, /x\+\+;/);
    assert.match(js, /ECRIS\(x\);/);
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

test("interrompt les boucles qui depassent la limite d'execution", () => {
    let lastError = "";
    logo.logToTerminal = (message, type) => {
        if (type === "error") lastError = message;
    };
    logo.logoExecutionState.maxLoopIterations = 3;
    logo.executeSnippet("TANTQUE (1 = 1) []");

    assert.match(lastError, /Boucle interrompue/);
    assert.strictEqual(logo.logoExecutionState.isRunning, false);
    logo.logoExecutionState.maxLoopIterations = 100000;
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

console.log("Tous les tests du transpilateur sont passes.");
