import OnlySidebarDefault from '~/layouts/OnlySidebarLayout';
import AdminLayout from '~/layouts/AdminLayout';
import HeaderSidebarLayout from '~/layouts/HeaderSidebarLayout';

import Home from '~/pages/Home';
import Search from '~/pages/Search';
import Login from '~/pages/Login';
import Profile from '~/pages/Profile';
import ManagePost from '~/pages/Admin/ManagePost';
import FriendRequests from '~/pages/Friends/FriendRequests';
import MyFriends from '~/pages/Friends/MyFriends';
import SentFriendRequests from '~/pages/Friends/SentFriendRequests';

const routes = [
    { path: '/', component: Home },
    { path: '/search', component: Search, layout: OnlySidebarDefault },
    { path: '/login', component: Login, layout: null },
    { path: '/profile', component: Profile, layout: OnlySidebarDefault },
    { path: '/friends', component: MyFriends, layout: HeaderSidebarLayout },
    { path: '/friends/requests', component: FriendRequests, layout: HeaderSidebarLayout },
    { path: '/friends/sent-requests', component: SentFriendRequests, layout: HeaderSidebarLayout },
];

export const protectedRoutes = [{ path: '/admin/manage-post', element: ManagePost, layout: AdminLayout }];

export default routes;
