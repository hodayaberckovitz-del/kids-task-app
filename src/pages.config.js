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
import ChildSelector from './pages/ChildSelector';
import Dashboard from './pages/Dashboard';
import Guide from './pages/Guide';
import Home from './pages/Home';
import JoinFamily from './pages/JoinFamily';
import ParentPanel from './pages/ParentPanel';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Registration from './pages/Registration';
import Rewards from './pages/Rewards';
import Tasks from './pages/Tasks';
import TermsOfService from './pages/TermsOfService';
import Wishlist from './pages/Wishlist';
import __Layout from './Layout.jsx';


export const PAGES = {
    "ChildSelector": ChildSelector,
    "Dashboard": Dashboard,
    "Guide": Guide,
    "Home": Home,
    "JoinFamily": JoinFamily,
    "ParentPanel": ParentPanel,
    "PrivacyPolicy": PrivacyPolicy,
    "Registration": Registration,
    "Rewards": Rewards,
    "Tasks": Tasks,
    "TermsOfService": TermsOfService,
    "Wishlist": Wishlist,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};