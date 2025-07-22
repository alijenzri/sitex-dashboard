import React, { useState } from "react";
import { HiOutlineBell } from 'react-icons/hi';
import { FaUserCircle, FaBars } from 'react-icons/fa';
import sitexLogo from '../assets/sitex-logo.jpeg';

const links = [
    { name: "Tableau de bord", href: "#", section: "dashboard" },
    { name: "Reports & Export Center", href: "#", section: "reports-center" },
    { name: "Production", href: "#", section: "production" },
    { name: "Articles", href: "#", section: "articles" },
];

export default function NavBar({ onNavigate, currentSection }) {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState("Tableau de bord");
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = React.useRef();

    React.useEffect(() => {
        function handleClickOutside(event) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNavigation = (link) => {
        setActive(link.name);
        if (link.section) {
            onNavigate(link.section);
        }
        setOpen(false);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('sitexadmin_logged_in');
        window.location.href = '/login';
    };

    return (
        <header className="bg-white shadow-sm">
            <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* Left: Logo + Name + Nav Links */}
                <div className="flex items-center gap-8">
                    {/* Logo + Name */}
                    <a href="#" className="flex items-center text-blue-800 font-semibold text-lg">
                        <img src={sitexLogo} alt="Sitex Logo" className='w-13 h-13 object-cover rounded' />
                        <span>Sitex</span>
                    </a>

                    {/* Navigation Links */}
                    <nav className="hidden md:block">
                        <ul className="flex items-center gap-6 text-sm font-medium">
                            {links.map((link) => (
                                <li key={link.name}>
                                    <a
                                        href={link.href}
                                        className={`text-gray-700 hover:text-blue-600 ${
                                            active === link.name ? "underline underline-offset-4 decoration-2 decoration-blue-600" : ""
                                        }`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleNavigation(link);
                                        }}
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                {/* Right: Notifications + User menu */}
                <div className="flex items-center gap-4">
                    <button className="relative p-2 text-gray-500 hover:text-blue-800 transition">
                        <span className="sr-only">Notifications</span>
                        <HiOutlineBell className="text-xl" />
                    </button>
                    <div className="relative" ref={userMenuRef}>
                        <button
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            onClick={() => setUserMenuOpen((v) => !v)}
                            aria-label="User menu"
                        >
                            <FaUserCircle className="text-2xl" />
                        </button>
                        {userMenuOpen && (
                            <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-2 z-50 animate-fade-in">
                                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-slate-100 transition" onClick={() => setUserMenuOpen(false)}>Profile</button>
                                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-slate-100 transition" onClick={() => setUserMenuOpen(false)}>Settings</button>
                                <div className="border-t border-slate-100 my-1"></div>
                                <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-100 transition" onClick={handleLogout}>Logout</button>
                            </div>
                        )}
                    </div>
                    {/* Hamburger button for small screens */}
                    <button
                        className="md:hidden text-2xl text-gray-700"
                        onClick={() => setOpen(!open)}
                        aria-label="Open menu"
                    >
                        <FaBars />
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {open && (
                <div className="absolute top-14 right-4 bg-white shadow rounded flex flex-col space-y-2 px-4 py-2 md:hidden z-50">
                    {links.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className={`text-gray-700 hover:text-blue-600 ${
                                active === link.name ? "underline underline-offset-4 decoration-2 decoration-blue-600" : ""
                            }`}
                            onClick={(e) => {
                                e.preventDefault();
                                handleNavigation(link);
                            }}
                        >
                            {link.name}
                        </a>
                    ))}
                </div>
            )}
        </header>
    );
}
