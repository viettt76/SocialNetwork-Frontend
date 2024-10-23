import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import routes from '~/routes';
import { SetupInterceptors } from '~/utils/axios';
import DefaultLayout from '~/layouts/DefaultLayout';
import { getMyInfoService } from './services/userServices';
import * as actions from './redux/actions';
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
    return (
        <BrowserRouter>
            <NavigateFunctionComponent />
            <FetchUserInfo />
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

function FetchUserInfo() {
    const dispatch = useDispatch();
    const location = useLocation();

    useEffect(() => {
        const fetchPersonalInfo = async () => {
            try {
                const res = (await getMyInfoService()).data;
                dispatch(
                    actions.saveUserInfo({
                        id: res?.id,
                        firstName: res?.firstName,
                        lastName: res?.lastName,
                        birthday: res?.dateOfBirth,
                        avatar: res?.avatarUrl,
                        homeTown: res?.homeTown,
                        school: res?.school,
                        workplace: res?.workplace,
                    }),
                );
            } catch (error) {
                console.log(error);
            }
        };

        if (location.pathname !== '/login') {
            fetchPersonalInfo();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

export default App;
