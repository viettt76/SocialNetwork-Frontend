import clsx from 'clsx';
import styles from './UserDashboard.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import { changePasswordService, deleteAccountService, logoutService } from '~/services/authServices';
import { useDispatch } from 'react-redux';
import * as actions from '~/redux/actions';
import socket from '~/socket';
import defaultAvatar from '~/assets/imgs/default-avatar.png';
import { useSelector } from 'react-redux';
import { userInfoSelector } from '~/redux/selectors';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faRightFromBracket, faUser, faUserCog } from '@fortawesome/free-solid-svg-icons';
import Menu from '~/components/Menu';
import { useEffect, useRef, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import customToastify from '~/utils/customToastify';

const UserDashboard = ({ userDashboardRef, showUserDashboard, setShowUserDashboard }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const userInfo = useSelector(userInfoSelector);

    const handleLogout = async () => {
        try {
            localStorage.removeItem('isAuthenticated');
            await logoutService();
            dispatch(actions.clearUserInfo());
            dispatch(actions.closeAllChat());
            socket.disconnect();
        } catch (error) {
            console.log(error);
        } finally {
            navigate('/login');
        }
    };

    const [showModalDeleteAccount, setShowModalDeleteAccount] = useState(false);
    const [password, setPassword] = useState('');
    const [errorDetail, setErrorDetail] = useState('');

    const handleShowModalDeleteAccount = () => setShowModalDeleteAccount(true);
    const handleHideModalDeleteAccount = () => setShowModalDeleteAccount(false);

    const handleDeleteAccount = async () => {
        try {
            await deleteAccountService(password);
            localStorage.removeItem('isAuthenticated');
            dispatch(actions.clearUserInfo());
            dispatch(actions.closeAllChat());
            socket.disconnect();
            navigate('/login');
        } catch (error) {
            console.log(error);
            if (error.status === 400 || error.status === 422) {
                setErrorDetail('Mật khẩu không chính xác');
            }
        }
    };

    const formChangePasswordRef = useRef(null);

    const [showModalChangePassword, setShowModalChangePassword] = useState(false);
    const [validatedFormChangePassword, setValidatedFormChangePassword] = useState(false);
    const [formChangePassword, setFormChangePassword] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [errorMessageChangePassword, setErrorMessageChangePassword] = useState('');

    const handleShowModalChangePassword = () => setShowModalChangePassword(true);
    const handleHideModalChangePassword = () => setShowModalChangePassword(false);

    const handleChangeFormChangePassword = (e) => {
        const { name, value } = e.target;

        setFormChangePassword({
            ...formChangePassword,
            [name]: value,
        });
    };

    const handleChangePassword = async (e) => {
        try {
            if (formChangePasswordRef.current.checkValidity() === false) {
                e.preventDefault();
                e.stopPropagation();
                setValidatedFormChangePassword(true);
            } else {
                await changePasswordService({
                    currentPassword: formChangePassword?.currentPassword,
                    newPassword: formChangePassword?.newPassword,
                });

                setShowModalChangePassword(false);
                setShowUserDashboard(false);
                customToastify.success('Đổi mật khẩu thành công');
            }
        } catch (error) {
            console.log(error);
            if (error?.status === 400) {
                setErrorMessageChangePassword('Mật khẩu hiện tại không chính xác');
            } else {
                setErrorMessageChangePassword('Đã xảy ra lỗi vui lòng thử lại');
            }
        }
    };

    const menu = [
        {
            id: 'main',
            depthLevel: 1,
            menu: [
                [
                    ...(userInfo?.role?.toLowerCase() === 'admin'
                        ? [
                              {
                                  label: (
                                      <Link to="/admin/manage-post" className={clsx(styles['dashboard-link'])}>
                                          <FontAwesomeIcon
                                              icon={faUserCog}
                                              className={clsx(styles['dashboard-link-icon'])}
                                          />
                                          Trang quản trị
                                      </Link>
                                  ),
                              },
                          ]
                        : []),
                    // {
                    //     label: (
                    //         <Link className={clsx(styles['dashboard-link'])}>
                    //             <FontAwesomeIcon icon={faUser} className={clsx(styles['dashboard-link-icon'])} />
                    //             Tài khoản
                    //         </Link>
                    //     ),
                    //     goToMenu: 'account',
                    // },
                    {
                        label: (
                            <div className={clsx(styles['dashboard-link'])} onClick={handleLogout}>
                                <FontAwesomeIcon
                                    icon={faRightFromBracket}
                                    className={clsx(styles['dashboard-link-icon'])}
                                />
                                Đăng xuất
                            </div>
                        ),
                    },
                ],
            ],
        },
        {
            id: 'account',
            depthLevel: 2,
            back: 'main',
            menu: [
                {
                    label: <div onClick={handleShowModalChangePassword}>Đổi mật khẩu</div>,
                },
                {
                    label: <div onClick={handleShowModalDeleteAccount}>Xoá tài khoản</div>,
                },
            ],
        },
    ];

    return (
        <>
            {showUserDashboard ? (
                <>
                    <div ref={userDashboardRef} className={clsx(styles['dashboard-wrapper'])}>
                        <Menu menu={menu} bottom={56} left={20} className={clsx(styles['menu'])} />
                    </div>
                </>
            ) : (
                <div></div>
            )}
            {/* <Modal
                ref={showModalDeleteAccount ? modalDeleteAccountRef : null}
                show={showModalDeleteAccount}
                onHide={handleHideModalDeleteAccount}
                className={clsx(styles['modal'])}
            >
                <Modal.Header className="fz-16" closeButton>
                    <Modal.Title>
                        <div className={clsx(styles['modal-title'])}>Xoá tài khoản</div>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="fz-16">
                        <div>
                            Không ai có thể nhìn thấy tài khoản của bạn, bao gồm tất cả nội dung được lưu trữ trong đó.
                        </div>
                        <div>Bạn có thể khôi phục lại tài khoản của mình và tất cả nội dung bất cứ lúc nào.</div>
                        <div className="mt-4">
                            **{' '}
                            <span className="fz-15">
                                Nếu bạn xác nhận xoá tài khoản vui lòng nhập mật khẩu và nhấn nút
                            </span>{' '}
                            <b>&quot;Xoá tài khoản&quot;</b> <span className="fz-15">để xác nhận xoá</span> **
                        </div>
                        <input
                            className="form-control mt-3"
                            name="password"
                            type="password"
                            placeholder="Mật khẩu"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {errorDetail && <div className={clsx(styles['error-detail'])}>{errorDetail}</div>}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <div className="d-flex align-items-revert">
                        <div className={clsx(styles['btn-cancel'])} onClick={handleHideModalDeleteAccount}>
                            Huỷ
                        </div>
                        <Button className="fz-16" variant="danger" onClick={handleDeleteAccount}>
                            Xoá tài khoản
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>

            <Modal
                ref={showModalChangePassword ? modalChangePasswordRef : null}
                show={showModalChangePassword}
                onHide={handleHideModalChangePassword}
                className={clsx(styles['modal'])}
            >
                <Modal.Header className="fz-16" closeButton>
                    <Modal.Title>
                        <div className={clsx(styles['modal-title'])}>Đổi mật khẩu</div>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form ref={formChangePasswordRef} noValidate validated={validatedFormChangePassword}>
                        <Form.Group className="mb-3" md="12">
                            <Form.Label>Mật khẩu hiện tại</Form.Label>
                            <Form.Control
                                value={formChangePassword.currentPassword}
                                name="currentPassword"
                                className={clsx('fz-16', {
                                    [[styles['invalid']]]: errorMessageChangePassword,
                                })}
                                minLength={6}
                                type="password"
                                required
                                isInvalid={errorMessageChangePassword}
                                onChange={handleChangeFormChangePassword}
                            />
                            {errorMessageChangePassword && (
                                <Form.Control.Feedback type="invalid" className="fz-16">
                                    Mật khẩu hiện tại không đúng
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>
                        <Form.Group className="mb-3" md="12">
                            <Form.Label>Mật khẩu mới</Form.Label>
                            <Form.Control
                                value={formChangePassword.newPassword}
                                name="newPassword"
                                className="fz-16"
                                minLength={6}
                                type="password"
                                required
                                onChange={handleChangeFormChangePassword}
                            />
                            <Form.Control.Feedback type="invalid" className="fz-16">
                                Mật khẩu phải ít nhất 6 ký tự
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3" md="12">
                            <Form.Label>Xác nhận mật khẩu mới</Form.Label>
                            <Form.Control
                                value={formChangePassword.confirmNewPassword}
                                name="confirmNewPassword"
                                className="fz-16"
                                minLength={6}
                                pattern={formChangePassword?.newPassword}
                                type="password"
                                required
                                onChange={handleChangeFormChangePassword}
                            />
                            <Form.Control.Feedback type="invalid" className="fz-16">
                                Mật khẩu xác nhận không chính xác
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <div className="d-flex align-items-revert">
                        <div className={clsx(styles['btn-cancel'])} onClick={handleHideModalChangePassword}>
                            Huỷ
                        </div>
                        <Button className="fz-16" onClick={handleChangePassword}>
                            Đổi mật khẩu
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal> */}
        </>
    );
};

export default UserDashboard;
