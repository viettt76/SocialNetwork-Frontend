import clsx from 'clsx';
import styles from './Profile.module.scss';
import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const ModalUserProfile = ({ show, handleClose, onSave }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        createdAt: '',
        isPublic: true,
    });
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
                    <Form.Group className="mb-3" controlId="formFirstName">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="Enter your first name"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formLastName">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Enter your last name"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formCreatedAt">
                        <Form.Label>Created At</Form.Label>
                        <Form.Control type="date" name="createdAt" value={formData.createdAt} onChange={handleChange} />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formPrivacy">
                        <Form.Check
                            type="checkbox"
                            name="isPublic"
                            checked={formData.isPublic}
                            onChange={handleChange}
                            label="Make profile public"
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
