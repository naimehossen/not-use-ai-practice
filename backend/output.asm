
section .data
    msg db "Hello from Tige!", 10, 0
    fmt_int db "%d", 10, 0

section .text
    global main
    extern printf

main:
    push    rbp
    mov     rbp, rsp
    mov     eax, 42
    mov     eax, 58
    mov     rdi, msg
    xor     eax, eax
    call    printf
    pop     rbp
    xor     eax, eax
    ret
