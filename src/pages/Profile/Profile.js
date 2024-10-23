import UserProfile from '~/components/UserProfile';

const Profile = () => {
    return (
        <div className="d-flex justify-content-center mt-5">
            <UserProfile userInfo={{ id: 1 }} />
        </div>
    );
};

export default Profile;
