import { Suspense,lazy } from "react"
import { Route, Routes } from "react-router-dom"



const L=(exportname,filename)=>lazy(()=>import(`${filename}`).then(m=>({default:m[exportname]|| m.default})))

const Home=L("Home","./page/Home")
const Contact=L("Contact","./page/Contact")
const C=L("C","./page/Contact")
const Navbar=L("Navber","./Components/layout/Navber")
const Products=L("Products","./page/Products")
const Cart=L("Cart","./page/Cart")
const ProductDetail=L("ProductDetail","./page/ProductDetail")
const Notfound=L("Notfound","./page/Notfound")
const Footer=L("Footer","./Components/layout/Footer")
const Test=L("Test","./page/Test")






export const App=()=>{

    return(
        <div>
            
            <Suspense fallback={<div>Loading...</div>}>
            <Navbar />
                <Routes>
                    <Route path="/" element={<Home/>} />
                    <Route path="/contact" element={<Contact/>} />
                    <Route path="/c" element={<C/>} />
                    <Route path="/products" element={<Products/>} />
                    <Route path="/cart" element={<Cart/>} />
                    <Route path="/product/:id" element={<ProductDetail/>} />
                    <Route path="/test" element ={<Test/>} />
                    <Route path="*" element={<Notfound/>} />
                </Routes>
                <Footer />
            </Suspense>
            
        </div>
    )
}