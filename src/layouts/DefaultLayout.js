import FriendsList from '~/components/FriendsList';
import Header from '~/components/Header';
import Sidebar from '~/components/Sidebar';

const DefaultLayout = ({ children }) => {
    return (
        <div className="d-flex">
            <Sidebar />
            <div style={{ flex: 1 }}>
                <Header />
                <div className="d-flex">
                    <div style={{ marginLeft: '7.6rem', marginTop: '-2.6rem', flex: 1 }}>{children}</div>
                    <FriendsList />
                </div>
            </div>
        </div>
    );
};

export default DefaultLayout;
