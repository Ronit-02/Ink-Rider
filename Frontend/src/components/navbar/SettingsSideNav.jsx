import NavbarLink from "../../components/NavbarLink";

const SettingsSideNav = () => {
  return (
    <nav className="flex flex-col h-full gap-4 w-[150px] flex-none">
        <NavbarLink linkTo="/profile" title="Profile" />
        <NavbarLink linkTo="/profile-posts" title="Your Posts" />
        <NavbarLink linkTo="/profile-edit" title="Edit Profile" />
        <NavbarLink linkTo="/profile-changepass" title="Change Password" />
    </nav>
  )
}

export default SettingsSideNav;