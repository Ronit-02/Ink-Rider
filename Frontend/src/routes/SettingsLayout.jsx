import { Outlet } from "react-router-dom";
import SettingsSideNav from "../components/navbar/SettingsSideNav";

const SettingsLayout = () => {
  return (
    <div className="flex gap-4">
        <SettingsSideNav />
        <section className="flex-auto">
            <Outlet />
        </section>
    </div>
  )
}

export default SettingsLayout;