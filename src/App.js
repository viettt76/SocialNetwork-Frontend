import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import routes from '~/routes';
import { SetupInterceptors } from '~/utils/axios';
import DefaultLayout from '~/layouts/DefaultLayout';

function NavigateFunctionComponent() {
    let navigate = useNavigate();
    const [ran, setRan] = useState(false);

    if (!ran) {
        SetupInterceptors(navigate);
        setRan(true);
    }
    return <></>;
}

function App() {
    const friend = {
        id: 'd6b95a50-23ed-4a7c-9b45-1dd6e3afb959',
        firstname: 'dien',
        lastname: 'dinh',
        avatar: '123.jpg',
    };

    return (
        <BrowserRouter>
            <NavigateFunctionComponent />
            {/* <FetchUserInfo /> */}
            <Routes>
                {routes.map((route, index) => {
                    const Page = route.component;
                    let Layout = DefaultLayout;
                    if (route.layout) {
                        Layout = route.layout;
                    } else if (route.layout === null) {
                        Layout = React.Fragment;
                    }
                    return (
                        <Route
                            key={`route-${index}`}
                            path={route.path}
                            element={
                                <Layout>
                                    <Page />
                                </Layout>
                            }
                        />
                    );
                })}
            </Routes>
        </BrowserRouter>
    );
}

// function FetchUserInfo() {
//     const dispatch = useDispatch();
//     const location = useLocation();

//     useEffect(() => {
//         const fetchPersonalInfo = async () => {
//             try {
//                 const res = await getMyInfoService();
//                 dispatch(
//                     actions.saveUserInfo({
//                         id: res?.id,
//                         firstName: res?.firstName,
//                         lastName: res?.lastName,
//                         age: res?.age,
//                         avatar: res?.avatar,
//                         homeTown: res?.homeTown,
//                         school: res?.school,
//                         workplace: res?.workplace,
//                     }),
//                 );
//             } catch (error) {
//                 console.log(error);
//             }
//         };

//         if (location.pathname !== '/login') {
//             fetchPersonalInfo();
//         }
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, []);

//     return null;
// }

export default App;
