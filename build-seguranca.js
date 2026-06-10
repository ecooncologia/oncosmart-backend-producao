/**
 * build-seguranca.js
 * Ofusca o global.js do frontend ONCO SMART usando javascript-obfuscator.
 *
 * USO:
 *   node build-seguranca.js          → gera versão ofuscada (produção)
 *   node build-seguranca.js --check  → só valida sintaxe, não substitui
 *
 * O arquivo original é preservado em global.js.src
 * Para editar o código, sempre edite global.js.src e rode este script.
 */

const JavaScriptObfuscator = require('javascript-obfuscator');
const fs   = require('fs');
const path = require('path');

const FRONT_DIR  = path.join(__dirname, 'ONCO-SMART-FRONT');
const SRC_FILE   = path.join(FRONT_DIR, 'global.js');
const DIST_FILE  = path.join(FRONT_DIR, 'global.js');         // substitui no lugar
const BACKUP_SRC = path.join(FRONT_DIR, 'global.js.src');     // guarda o original

const checkOnly = process.argv.includes('--check');

// ── Opções de ofuscação ───────────────────────────────────────────────────────
const OBF_OPTIONS = {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.3,
    deadCodeInjection: false,
    debugProtection: true,
    debugProtectionInterval: 0,      // 0 = apenas na carga, sem loop contínuo
    disableConsoleOutput: false,
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: false,
    renameGlobals: false,
    selfDefending: true,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 20,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayCallsTransformThreshold: 0.5,
    stringArrayEncoding: ['base64'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 1,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 2,
    stringArrayWrappersType: 'function',
    stringArrayThreshold: 0.5,
    transformObjectKeys: false,
    unicodeEscapeSequence: false,
    sourceMap: false,
};

function run() {
    if (!fs.existsSync(SRC_FILE)) {
        console.error(`❌ Arquivo não encontrado: ${SRC_FILE}`);
        process.exit(1);
    }

    const src = fs.readFileSync(SRC_FILE, 'utf8');

    console.log(`📦 Lendo: ${SRC_FILE} (${(src.length / 1024).toFixed(1)} KB)`);

    let result;
    try {
        result = JavaScriptObfuscator.obfuscate(src, OBF_OPTIONS);
    } catch (err) {
        console.error(`❌ Erro na ofuscação: ${err.message}`);
        process.exit(1);
    }

    const obfCode = result.getObfuscatedCode();

    console.log(`✅ Ofuscação concluída. Tamanho: ${(obfCode.length / 1024).toFixed(1)} KB`);

    if (checkOnly) {
        console.log('ℹ️  --check: nenhum arquivo foi alterado.');
        return;
    }

    // Preserva o fonte original (para edição futura)
    fs.copyFileSync(SRC_FILE, BACKUP_SRC);
    console.log(`💾 Fonte original preservado em: ${BACKUP_SRC}`);

    // Escreve versão ofuscada no lugar do original
    fs.writeFileSync(DIST_FILE, obfCode, 'utf8');
    console.log(`🔒 Arquivo ofuscado gravado em: ${DIST_FILE}`);
    console.log('');
    console.log('⚠️  Para editar o código novamente:');
    console.log(`   cp ${BACKUP_SRC} ${SRC_FILE}`);
    console.log('   # edite o global.js.src, depois rode: node build-seguranca.js');
}

run();
