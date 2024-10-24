import Home from '~/pages/Home';
import Search from '~/pages/Search';
import Login from '~/pages/Login';
import Profile from '~/pages/Profile';
import OnlySidebarDefault from '~/layouts/OnlySidebarLayout';

const routes = [
    { path: '/', component: Home },
    { path: '/search', component: Search, layout: OnlySidebarDefault },
    { path: '/login', component: Login, layout: null },
    { path: '/profile', component: Profile, layout: OnlySidebarDefault },
];

export default routes;
