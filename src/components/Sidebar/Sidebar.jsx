import { useState, useRef } from "react";
import { BiLogOut } from "react-icons/bi";
import { IoSettingsOutline } from "react-icons/io5";
import Logo from "../../assets/copartner.png";
import { Link, Outlet, useLocation } from "react-router-dom";
import userIcon from "../../assets/user-octagon.png";
import { click } from "@testing-library/user-event/dist/click";
import { ToastContainer } from "react-toastify";

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef();
  const location = useLocation();

  const Logout = () => {
    sessionStorage.removeItem("creds");
    window.location.reload();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      closeSidebar();
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  const isLinkActive = (path) => {
    return location.pathname === path;
  };

  const links = [
    // { to: "/notification", title: "Notification", label: "Notification", icon: userIcon },
    { to: "/", title: "Dashboard", label: "A.P", icon: userIcon },
    { to: "/r.a", title: "Overview", label: "R.A", icon: userIcon },
    {
      to: "/ApCpTotal",
      title: "totalRAAp",
      label: "CP Earning",
      icon: userIcon,
    },
    {
      to: "/blogs",
      title: "Settings",
      label: "Blog Upload",
      icon: IoSettingsOutline,
    },
    {
      to: "/radetails",
      title: "Settings",
      label: "R.A Details",
      icon: IoSettingsOutline,
    },
    {
      to: "/apdetails",
      title: "Settings",
      label: "A.P Details",
      icon: IoSettingsOutline,
    },
    {
      to: "/Onboarding",
      title: "Settings",
      label: "Onboarding",
      icon: userIcon,
    },
    {
      to: "/minisub",
      title: "Settings",
      label: "Mini Sub",
      icon: IoSettingsOutline,
    },

    {
      to: "/agencylist",
      title: "Settings",
      label: "Ad Agency",
      icon: userIcon,
    },
    {
      to: "/transaction",
      title: "Settings",
      label: "Transaction",
      icon: userIcon,
    },
    {
      to: "/marketingcontent",
      title: "Settings",
      label: "Marketing Content",
      icon: userIcon,
    },
    { to: "/userdata", title: "Settings", label: "User Data", icon: userIcon },
    {
      to: "/relationship",
      title: "Settings",
      label: "Relationship Management",
      icon: userIcon,
    },
    { to: "/join", title: "Settings", label: "Join", icon: userIcon },
    {
      to: "/sub-admin",
      title: "Settings",
      label: "Sub Admin Management",
      icon: userIcon,
    },
    {
      to: "/login",
      title: "Settings",
      label: "Login Credentials",
      icon: userIcon,
    },
    {
      to: "/rauserdata",
      title: "Settings",
      label: "RA User Data",
      icon: userIcon,
    },
    { to: "/chatids", title: "Settings", label: "Chat IDs", icon: userIcon },
    {
      to: "/telegrampage",
      title: "Settings",
      label: "Telegram Page",
      icon: userIcon,
    },
    {
      to: "/CPDiscount",
      title: "Settings",
      label: "CP Discount",
      icon: userIcon,
    },
    {
      to: "/Onboarding",
      title: "Settings",
      label: "Onboarding",
      icon: userIcon,
    },
    {
      to: "/WhatsappCamp",
      title: "Settings",
      label: "Whatsapp Camp",
      icon: userIcon,
    },
    {
      to: "/posters",
      title: "Settings",
      label: "Posters",
      icon: userIcon,
    },
  ];

  return (
    <>
      <button
        aria-controls="logo-sidebar"
        type="button"
        className="inline-flex items-center p-2 mt-2 ml-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
        onClick={toggleSidebar}
      >
        <span className="sr-only">Open sidebar</span>
        <svg
          className="w-6 h-6"
          aria-hidden="true"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M3 5a1 1 0 000 2h14a1 1 0 100-2H3zm-1 7a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zm1-4a1 1 0 100 2h14a1 1 0 100-2H3z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <aside
        ref={sidebarRef}
        id="logo-sidebar"
        className={`fixed top-0 left-0 w-60 h-screen transition-transform bg-gray-50 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
        }`}
        aria-label="Sidebar"
      >
        <div className="flex flex-col h-full overflow-hidden">
          <Link
            onClick={() => handleClickOutside(click)}
            to="/"
            className="flex items-center py-6 px-7"
          >
            <img src={Logo} className="h-10 mr-3" alt="Logo" />
          </Link>
          <div className="overflow-y-auto">
            <ul className="space-y-4 font-medium px-4">
              {links.map(({ to, title, label, icon: Icon }, index) => (
                <li key={to}>
                  <Link
                    onClick={() => handleClickOutside(click)}
                    to={to}
                    title={title}
                    className={`flex items-center px-7 py-3 rounded-lg hover:bg-gray-200 ${
                      isLinkActive(to) ? "bg-gray-200" : ""
                    }`}
                  >
                    {typeof Icon === "string" ? (
                      <img src={Icon} alt="icon" className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                    <span className="ml-3 text-base font-bold">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <button
            className="flex items-center px-7 py-3 mt-auto text-gray-900 rounded-lg hover:bg-gray-200"
            onClick={Logout}
            title="Sign Out"
          >
            <BiLogOut className="text-2xl" />
            <span className="ml-3 text-base font-bold">Logout</span>
          </button>
        </div>
      </aside>
      <Outlet />
      <ToastContainer />
    </>
  );
};

export default Sidebar;
