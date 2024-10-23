import clsx from 'clsx';
import styles from './WritePost.module.scss';
import defaultAvatar from '~/assets/imgs/default-avatar.png';
import { Link } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import attachmentImg from '~/assets/imgs/attachment.png';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { submitPostService } from '~/services/postServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { loadingSelector, userInfoSelector } from '~/redux/selectors';
import * as actions from '~/redux/actions';
import LoadingOverlay from '~/components/LoadingOverlay';
import { uploadToCloudinary } from '~/utils/commonUtils';

const WritePost = () => {
    const dispatch = useDispatch();
    const loading = useSelector(loadingSelector);
    const userInfo = useSelector(userInfoSelector);

    const [showModalWritePost, setShowModalWritePost] = useState(false);
    const handleShowModalWritePost = () => setShowModalWritePost(true);
    const handleCloseModalWritePost = () => setShowModalWritePost(false);

    const [visibility, setVisibility] = useState(1);
    const [content, setContent] = useState('');
    const [images, setImages] = useState([]);
    const [imagesUpload, setImagesUpload] = useState([]);

    const maxVisibleImages = 4;
    const [visibleImages, setVisibleImages] = useState([]);
    const [remainingImages, setRemainingImages] = useState(0);

    useEffect(() => {
        if (images?.length > maxVisibleImages) {
            setVisibleImages(images.slice(0, maxVisibleImages - 1));
            setRemainingImages(images.length - maxVisibleImages + 1);
        } else {
            setRemainingImages(0);
            setVisibleImages([...images]);
        }
    }, [images]);

    const handleChooseFile = (e) => {
        const files = Array.from(e.target.files);

        const imagesArray = files.map((file) => {
            return URL.createObjectURL(file);
        });

        setImages([...images, ...imagesArray]);

        setImagesUpload([...imagesUpload, ...files]);
    };

    const deleteAllImages = () => {
        setImages([]);
        setImagesUpload([]);
    };

    const handleSubmitPost = async () => {
        try {
            const imagesUrl = [];
            dispatch(actions.startLoading('writePost'));
            if (imagesUpload.length > 0) {
                const uploadPromises = imagesUpload.map((fileUpload) => uploadToCloudinary(fileUpload));

                const uploadedUrls = await Promise.all(uploadPromises);
                imagesUrl.push(...uploadedUrls);
            }

            await submitPostService({ visibility, content, images: imagesUrl });
            dispatch(actions.stopLoading('writePost'));
            handleCloseModalWritePost();
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className={clsx(styles['write-post'])}>
            {loading?.writePost && <LoadingOverlay />}
            <Link to={`/profile/${userInfo?.id}`}>
                <img className={clsx(styles['avatar'])} src={userInfo?.avatar || defaultAvatar} />
            </Link>
            <div className={clsx(styles['input'])} onClick={handleShowModalWritePost}>
                Đăng bài
            </div>
            <Modal show={showModalWritePost} className={clsx(styles['modal-post'])} onHide={handleCloseModalWritePost}>
                <Modal.Header closeButton className={clsx(styles['modal-header'])}>
                    <Modal.Title className={clsx(styles['modal-title'])}>Tạo bài viết</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-flex align-items-center">
                        <img className={clsx(styles['avatar'])} src={userInfo?.avatar || defaultAvatar} />
                        <div>
                            <h6 className={clsx(styles['name'])}>
                                {userInfo?.lastName} {userInfo?.firstName}
                            </h6>
                            <div className={clsx(styles['visibility'])}>Bạn bè</div>
                        </div>
                    </div>
                    <textarea
                        value={content}
                        className={clsx(styles['post-input'])}
                        placeholder="Viết nội dung"
                        onChange={(e) => setContent(e.target.value)}
                    />

                    {images?.length > 0 ? (
                        <div className={clsx(styles['images-layout-wrapper'])}>
                            <div className={clsx(styles['image-btn-wrapper'])}>
                                <div className={clsx(styles['btn'])}>Chỉnh sửa</div>
                                <label htmlFor="post-attachment" className={clsx(styles['btn'])}>
                                    Thêm ảnh/video
                                </label>
                                <input id="post-attachment" type="file" multiple hidden onChange={handleChooseFile} />
                            </div>
                            <div className={clsx(styles['close-btn'])} onClick={deleteAllImages}>
                                <FontAwesomeIcon icon={faXmark} />
                            </div>
                            <div
                                className={clsx(styles['images-layout'], {
                                    [styles[`layout-${visibleImages?.length}`]]:
                                        remainingImages <= 0 || !remainingImages,
                                    [styles[`layout-remaining`]]: remainingImages > 0,
                                })}
                            >
                                {visibleImages?.map((img, index) => {
                                    return (
                                        <div className={clsx(styles['image-wrapper'])} key={`image-${index}`}>
                                            <Link to={img}>
                                                <img src={img} />
                                            </Link>
                                        </div>
                                    );
                                })}
                                {remainingImages > 0 && (
                                    <Link className={clsx(styles['overlay'])}>+{remainingImages}</Link>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <span className="fz-16" data-tooltip-id="tool-tip-attachment">
                                <label htmlFor="post-attachment">
                                    <img src={attachmentImg} />
                                </label>
                                <input id="post-attachment" type="file" multiple hidden onChange={handleChooseFile} />
                                <ReactTooltip noArrow id="tool-tip-attachment" place="bottom" content="Ảnh/Video" />
                            </span>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <button
                        className={clsx(styles['post-btn'])}
                        onClick={handleSubmitPost}
                        disabled={!content && images?.length == 0}
                    >
                        Đăng bài
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default WritePost;
