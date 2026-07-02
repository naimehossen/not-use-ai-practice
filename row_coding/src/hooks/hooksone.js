import { useEffect, useState } from "react"
function point(width) {
    if (width<640) return 'sm';
    if (width<768) return 'md';
    if (width<1024) return 'lg';
    return 'xl'

}
 const Custom=() =>{

const [state,setState]=useState({
    width:window.innerWidth,
    height:window.innerHeight,
    breakpoint:point(window.innerWidth)

})


useEffect(()=>{
    const value=()=>{

        setState({
            width:window.innerWidth,
            height:window.innerHeight,
            breakpoint:point(window.innerWidth)
        })
    }

    window.addEventListener('resize',value)
    return ()=>window.removeEventListener('resize',value)
},[])

return state



}

export default Custom;

