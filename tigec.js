// tigec.js - Node.js-ভিত্তিক Tige কম্পাইলার
const fs = require('fs');

function compile(tigeCode) {
    let asm = `
section .data
    msg db "Hello from Tige!", 10, 0
    fmt_int db "%d", 10, 0

section .text
    global main
    extern printf

main:
    push    rbp
    mov     rbp, rsp
`;

    // সহজ টোকেনাইজার
    const lines = tigeCode.split('\n').filter(l => l.trim());
    for (const line of lines) {
        if (line.includes('@') && line.includes('=')) {
            const match = line.match(/@(\w+)\s*=\s*(.+)/);
            if (match && !isNaN(match[2].trim())) {
                asm += `    mov     eax, ${match[2].trim()}\n`;
            }
        }
        if (line.includes('print(')) {
            asm += `    mov     rdi, msg\n`;
            asm += `    xor     eax, eax\n`;
            asm += `    call    printf\n`;
        }
    }

    asm += `    pop     rbp\n`;
    asm += `    xor     eax, eax\n`;
    asm += `    ret\n`;
    return asm;
}

const code = fs.readFileSync(process.argv[2], 'utf8');
fs.writeFileSync('output.asm', compile(code));
console.log('Generated output.asm');