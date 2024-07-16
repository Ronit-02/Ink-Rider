import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar/Navbar";
import Bottombar from "../components/Bottombar";

const Layout = () => {
  return (
    <>
      <Navbar />   
      <main>
          <Outlet />  
      </main>
      <Bottombar />
    </>
  )
}

export default Layout;