import clsx from 'clsx';
import styles from './ManagePost.module.scss';
import defaultAvatar from '~/assets/imgs/default-avatar.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEarthAmerica } from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { RemovePost } from '~/services/postServices';

const Post = ({ id, posterId, firstName, lastName, avatar, content, createdAt, pictures = [{}] }) => {
    const maxVisibleImages = 4;
    let visibleImages;
    let remainingImages;
    if (pictures?.length > maxVisibleImages) {
        visibleImages = pictures.slice(0, maxVisibleImages - 1);
        remainingImages = pictures.length - maxVisibleImages + 1;
    } else {
        visibleImages = [...pictures];
    }

    const handleDenyPost = async (postId) => {
        try {
            await RemovePost(postId);
            setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    return (
        <div className={clsx(styles['post-content-wrapper'])}>
            <div className={clsx(styles['post-header'])}>
                <Link to={`/profile/${posterId}`}>
                    <img
                        className={clsx(styles['avatar-user'])}
                        src={avatar || defaultAvatar}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = defaultAvatar;
                        }}
                    />
                </Link>
                <div>
                    <h5 className={clsx(styles['post-username'])}>{`${lastName} ${firstName}`}</h5>
                    <div className={clsx('d-flex', styles['add-info'])}>
                        <span>{format(new Date(createdAt), 'dd/MM/yyyy')}</span>
                        <span>
                            <FontAwesomeIcon icon={faEarthAmerica} />
                        </span>
                    </div>
                </div>
            </div>
            <div className={clsx(styles['post-content'], styles['background'])}>{content && <div>{content}</div>}</div>
            <PhotoProvider>
                <div
                    className={clsx(styles['images-layout'], {
                        [styles[`layout-${visibleImages?.length}`]]: remainingImages <= 0 || !remainingImages,
                        [styles[`layout-remaining`]]: remainingImages > 0,
                    })}
                >
                    {visibleImages?.map((img) => (
                        <PhotoView key={`picture-${img?.id}`} src={img?.pictureUrl}>
                            <div className={clsx(styles['image-wrapper'])}>
                                <img src={img?.pictureUrl} alt="" />
                            </div>
                        </PhotoView>
                    ))}
                    {remainingImages > 0 && <Link className={clsx(styles['overlay'])}>+{remainingImages}</Link>}
                </div>
            </PhotoProvider>
            <div className={clsx(styles['approve-wrapper'])}>
                <div className={clsx(styles['btn-accept'])}>Phê duyệt</div>
                <div className={clsx(styles['btn-deny'])} onClick={() => handleDenyPost(id)}>
                    Từ chối
                </div>
            </div>
        </div>
    );
};

export default Post;
