import { createContext, useContext, useEffect } from "react";


const AppProvider=createContext();

export const MainappProvider=({children})=>{

//এখানে সব লজিক

const value={

    

}
    return (
        <AppProvider.Provider value={value}>
            {children}
        </AppProvider.Provider>
    )
}



export const appcontext=()=>useContext(appProvider)