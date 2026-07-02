import {  createContext, useContext,useState } from "react";



const ContextMy=createContext();

export const Golovalcontext=({children})=>{




    const [pro,setpro]=useState('')
    const [open,setOpen]=useState(false)
    const all=(item)=>{
    setpro(item)
    setOpen(true)
    }



    const value={
    setpro,
    pro,
    open,
    setOpen,
    all
    }

    return (
        <ContextMy.Provider value={value}>
            {children}
        </ContextMy.Provider>
    )
}


export const context=()=>useContext(ContextMy)