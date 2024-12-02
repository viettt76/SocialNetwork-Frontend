import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import routes, { protectedRoutes } from '~/routes';
import { SetupInterceptors } from '~/utils/axios';
import DefaultLayout from '~/layouts/DefaultLayout';
import { getMyInfoService } from '~/services/userServices';
import * as actions from '~/redux/actions';
import signalRClient from '~/components/Post/signalRClient';
import { openChatsSelector, userInfoSelector } from '~/redux/selectors';
import ChatPopup from '~/components/ChatPopup';
import ChatGroupPopup from '~/components/ChatGroupPopup';

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
    const openChats = useSelector(openChatsSelector);
    const userInfo = useSelector(userInfoSelector);

    return (
        <FetchAllEmotionsPost>
            <BrowserRouter>
                <NavigateFunctionComponent />
                <FetchUserInfo />
                {openChats?.slice(0, 2)?.map((item, index) => {
                    if (item?.isGroupChat) {
                        return <ChatGroupPopup index={index} key={`group-chat-${item?.id}`} group={item} />;
                    }
                    return <ChatPopup index={index} key={`friend-chat-${item?.id}`} friend={item} />;
                })}
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
                    {userInfo?.role !== 'admin' &&
                        protectedRoutes.map((route, index) => {
                            const Page = route.element;
                            let Layout = DefaultLayout;
                            if (route.layout) {
                                Layout = route.layout;
                            } else if (route.layout === null) {
                                Layout = React.Fragment;
                            }
                            return (
                                <Route
                                    key={`route-admin-${index}`}
                                    path={route.path}
                                    element={
                                        <Layout>
                                            <Page />
                                        </Layout>
                                    }
                                ></Route>
                            );
                        })}
                </Routes>
            </BrowserRouter>
        </FetchAllEmotionsPost>
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

        if (location.pathname.toLowerCase() !== '/login') {
            fetchPersonalInfo();
        }
        signalRClient.start();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

export const EmotionsTypeContext = createContext(null);

function FetchAllEmotionsPost({ children }) {
    const [emotionsType, setEmotionsType] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await getAllEmotionsService();
                setEmotionsType(
                    res?.map((item) => ({
                        id: item?.emotionTypeID,
                        name: item?.emotionName,
                    })),
                );
            } catch (error) {
                console.log(error);
            }
        })();
    }, []);

    return <EmotionsTypeContext.Provider value={emotionsType}>{children}</EmotionsTypeContext.Provider>;
}

export default App;
