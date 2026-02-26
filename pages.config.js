/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AdminApprovals from './pages/AdminApprovals';
import AdminCooks from './pages/AdminCooks';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminUsers from './pages/AdminUsers';
import BecomeACook from './pages/BecomeACook';
import Cart from './pages/Cart';
import CookDashboard from './pages/CookDashboard';
import CookMenu from './pages/CookMenu';
import CookOrders from './pages/CookOrders';
import CookPending from './pages/CookPending';
import CookProfile from './pages/CookProfile';
import CookRejected from './pages/CookRejected';
import CookSettings from './pages/CookSettings';
import Home from './pages/Home';
import Landing from './pages/Landing';
import MyOrders from './pages/MyOrders';
import OrderTracking from './pages/OrderTracking';
import Search from './pages/Search';
import Support from './pages/Support';
import AdminSupport from './pages/AdminSupport';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminApprovals": AdminApprovals,
    "AdminCooks": AdminCooks,
    "AdminDashboard": AdminDashboard,
    "AdminOrders": AdminOrders,
    "AdminUsers": AdminUsers,
    "BecomeACook": BecomeACook,
    "Cart": Cart,
    "CookDashboard": CookDashboard,
    "CookMenu": CookMenu,
    "CookOrders": CookOrders,
    "CookPending": CookPending,
    "CookProfile": CookProfile,
    "CookRejected": CookRejected,
    "CookSettings": CookSettings,
    "Home": Home,
    "Landing": Landing,
    "MyOrders": MyOrders,
    "OrderTracking": OrderTracking,
    "Search": Search,
    "Support": Support,
    "AdminSupport": AdminSupport,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};