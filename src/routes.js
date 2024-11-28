import OnlySidebarDefault from '~/layouts/OnlySidebarLayout';
import AdminLayout from '~/layouts/AdminLayout';

import Home from '~/pages/Home';
import Search from '~/pages/Search';
import Login from '~/pages/Login';
import Profile from '~/pages/Profile';
import ManagePost from '~/pages/Admin/ManagePost';

const routes = [
    { path: '/', component: Home },
    { path: '/search', component: Search, layout: OnlySidebarDefault },
    { path: '/login', component: Login, layout: null },
    { path: '/profile', component: Profile, layout: OnlySidebarDefault },
];

export const protectedRoutes = [{ path: '/admin/manage-post', element: ManagePost, layout: AdminLayout }];

export default routes;
