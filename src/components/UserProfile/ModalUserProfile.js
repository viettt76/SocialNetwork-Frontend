import clsx from 'clsx';
import styles from './Profile.module.scss';
import React, { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { userInfoSelector } from '~/redux/selectors';

const ModalUserProfile = ({ show, handleClose, onSave }) => {
    const userInfo = useSelector(userInfoSelector);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        gender: '',
        birthday: '',
        avatar: null,
        homeTown: '',
        school: '',
        workplace: '',
        isPrivate: false,
    });

    useEffect(() => {
        setFormData({
            firstName: userInfo?.firstName,
            lastName: userInfo?.lastName,
            gender: userInfo?.gender,
            birthday: userInfo?.birthday,
            avatar: userInfo?.avatar,
            homeTown: userInfo?.homeTown,
            school: userInfo?.school,
            workplace: userInfo?.workplace,
            isPrivate: userInfo?.isPrivate,
        });
    }, [userInfo]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };
    const handleSave = () => {
        onSave(formData);
        handleClose();
    };
    return (
        <Modal className={clsx(styles['modal'])} show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Thông tin người dùng</Modal.Title>
            </Modal.Header>
            <Modal.Body className={clsx(styles['modal-body'])}>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Tên</Form.Label>
                        <Form.Control
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="Nhập tên"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Họ</Form.Label>
                        <Form.Control
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Nhập họ"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3 fz-16 d-flex align-items-center">
                        <Form.Label className="me-4">Giới tính</Form.Label>
                        <Form.Check
                            inline
                            type="radio"
                            name="gender"
                            label="Nam"
                            value={formData.gender}
                            checked={formData?.gender === 'male'}
                            onChange={handleChange}
                        />
                        <Form.Check
                            inline
                            type="radio"
                            name="gender"
                            label="Nữ"
                            value={formData.gender}
                            checked={formData?.gender === 'female'}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formCreatedAt">
                        <Form.Label>Ngày sinh</Form.Label>
                        <Form.Control type="date" name="birthday" value={formData.birthday} onChange={handleChange} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Địa chỉ</Form.Label>
                        <Form.Control
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Nhập địa chỉ"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formPrivacy">
                        <Form.Check
                            type="checkbox"
                            name="isPrivate"
                            className="fz-16"
                            checked={formData.isPrivate}
                            onChange={handleChange}
                            label="Trang cá nhân riêng tư"
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Save Changes
                </Button>
                <button className={clsx(styles['close-btn'])} onClick={handleClose}>
                    Đóng
                </button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalUserProfile;
