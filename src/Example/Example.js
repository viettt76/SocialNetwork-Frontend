import Footer from '~/components/Footer';
import Header from '~/components/Header';
import styles from './Example.module.scss';
import clsx from 'clsx';
import { loginService, signupService } from '~/services/authServices';
import Logo from '~/components/Logo';
import { LikeIcon } from '~/components/Icons';

// { status: 400, message: 'lỗi đăng nhập }

const Example = () => {
    const handleLogin = async () => {
        try {
            const response = await loginService({ password: '123456', username: 'viet' });
            console.log(response);
        } catch (error) {
            console.log(error);
        }
    };

    const handleSignup = async () => {
        try {
            const response = await signupService({ password: '123456', username: 'viet' });
            console.log(response);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <>
            <Header />
            <div className={clsx(styles['text'], styles['un'])}>Example</div>
            <button onClick={handleLogin}>Login</button>
            <button onClick={handleSignup}>Signup</button>
            <Logo />
            <LikeIcon />
            <Footer />
        </>
    );
};

export default Example;
