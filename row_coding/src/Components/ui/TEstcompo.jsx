import { memo,useCallback,useState } from "react";
import { IoPhonePortraitOutline } from "react-icons/io5";
import { FaTabletAlt } from "react-icons/fa";
import { RiComputerFill } from "react-icons/ri";
import { IoIosDesktop } from "react-icons/io";
import { RiExpandWidthFill } from "react-icons/ri";
import { RiExpandHeightFill } from "react-icons/ri";
import { RiBox3Line } from "react-icons/ri";
import Custom from "../../hooks/hooksone";

const TEstcompo =memo(()=>{
    const {width,height,breakpoint}=Custom()
      const [scrollTop, setScrollTop] = useState(0);

    const data=Array.from({length:100},(_, P)=>{

        return (
            {
        id:P + 1,
        cous:`cures${P+1}`

            }
        )

    })

    console.log(scrollTop);
    
    


  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

    return (
        <div>
            <h1 className=" text-center font-bold text-2xl p-4"> Response virtual list</h1>
            <div className=" flex gap-2 p-4 bg-black text-white rounded-md  h-10 mx-3 ">
{breakpoint==="sm"?<IoPhonePortraitOutline/>:''}
{breakpoint==="md"?<FaTabletAlt/>:''}
{breakpoint==="lg"?<RiComputerFill/>:''}
{breakpoint==="xl"?<IoIosDesktop/>:""}
<h1 className=" -mt-1 font-medium">{breakpoint}</h1>
<span className=" text-xl"><RiExpandWidthFill/> </span>
<h1 className=" ">{width+'x'+ height}</h1>
<span className=" text-xl"><RiExpandHeightFill/></span>
        <p><RiBox3Line/></p>
        <span>{data.length}</span>
            </div>
            



        <div  style={{
            height:" calc(100vh-200px)",
            overflow:"auto"
        }}

        className={`bg-white rounded-xl shadow-sm border border-gray-200 `}
        onScroll={handleScroll}
        >
            <div style={{height:`7900px`,position:"relative"}}>

                <div style={{transform:`translateY(${100}px)`}}>

                    <div style={{display:'grid',gridTemplateColumns:`repeat(${2}, 1fr)`,gap:'5px'}}>
            <div class="h-20 overflow-y-scroll scrollbar scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full">
                {data.map(d=>(
                    <div> 
                    <h1>{d.cous}</h1> <p></p>
                    <h1>{d.id}</h1>
                    </div>
                ))}
</div>
                    </div>

                </div>

            </div>


        </div>















        </div>
    )
})

export default TEstcompo;