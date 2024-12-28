import React, { createContext, useEffect, useState } from 'react';
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
import { getAllEmotionsService } from '~/services/postServices';
import { HubConnectionBuilder } from '@microsoft/signalr';

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
    const [notificationConnection, setNotificationConnection] = useState(null);

    useEffect(() => {
        const connectNotificationHub = async () => {
            const connection = new HubConnectionBuilder()
                .withUrl('https://localhost:7072/notification')
                .withAutomaticReconnect()
                .build();

            try {
                await connection.start();
                setNotificationConnection(connection);
            } catch (error) {
                console.error('Notification Hub Connection Failed:', error);
            }
        };

        connectNotificationHub();

        return () => {
            if (notificationConnection) {
                notificationConnection.stop();
            }
        };
    }, []);
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
                                    <Layout notificationConnection={notificationConnection}>
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
                        dateOfBirthFormatted: res?.dateOfBirthFormatted,
                        avatar: res?.avatarUrl,
                        address: res?.address,
                        school: res?.school,
                        workplace: res?.workplace,
                        gender: res?.gender,
                        isPrivate: res?.isPrivate,
                        totalOfFirend: res?.totalOfFirend,
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
