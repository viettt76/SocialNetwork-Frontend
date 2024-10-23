import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { CSSTransition } from 'react-transition-group';

import clsx from 'clsx';
import styles from './Menu.module.scss';
import { ArrowIcon } from '~/components/Icons';

const Menu = forwardRef(
    ({ menu, paddingBlock = '1rem', fontSize = '1.6rem', top, right, bottom, left, className }, ref) => {
        const [activeMenu, setActiveMenu] = useState('main');
        const [menuHeight, setMenuHeight] = useState(null);
        const menuRef = useRef(null);

        useEffect(() => {
            setMenuHeight(menuRef.current?.firstChild?.offsetHeight);
        }, []);

        useImperativeHandle(ref, () => {
            return {
                setActiveMenu: (menu) => {
                    setActiveMenu(menu);
                },
            };
        });

        function calcHeight(el) {
            setTimeout(() => {
                const height = el?.offsetHeight;
                setMenuHeight(height);
            }, 100);
        }

        const MenuItem = ({ children, leftIcon, rightIcon, goToMenu, goBack, className }) => {
            return (
                <div
                    className={clsx(className, styles['menu-item'], {
                        [[styles['go-back']]]: goBack,
                    })}
                    style={{ paddingBlock, fontSize }}
                    onClick={() => goToMenu && setActiveMenu(goToMenu)}
                >
                    {leftIcon && <span className={clsx(styles['icon-left'])}>{leftIcon}</span>}
                    {children}
                    {rightIcon && <span className={clsx(styles['icon-right'])}>{rightIcon}</span>}
                </div>
            );
        };

        return (
            <div
                className={clsx(className, styles['menu-wrapper'])}
                style={{ height: menuHeight, top, right, bottom, left }}
                ref={menuRef}
            >
                {menu?.map((item, index) => {
                    return (
                        <CSSTransition
                            key={`item-${index + 1}`}
                            in={activeMenu === item?.id}
                            timeout={500}
                            classNames={`menu-${item?.depthLevel}`}
                            unmountOnExit
                            onEnter={calcHeight}
                        >
                            <div className={clsx(styles[`menu`])}>
                                {item?.back && (
                                    <MenuItem
                                        className={item?.className}
                                        leftIcon={<ArrowIcon />}
                                        rightIcon={item?.rightIcon}
                                        goBack={true}
                                        goToMenu={item?.back}
                                    ></MenuItem>
                                )}
                                {item?.menu?.map((itemLevel2, indexLevel2) => {
                                    if (itemLevel2?.length > 0) {
                                        return (
                                            <div
                                                key={`item-level-${itemLevel2?.depthLevel}-${indexLevel2}`}
                                                className={clsx(itemLevel2?.className, styles['group-menu-item'])}
                                            >
                                                {itemLevel2?.map((itemLevel3, indexLevel3) => {
                                                    return (
                                                        <MenuItem
                                                            key={`item-level-${itemLevel2?.depthLevel}-${indexLevel3}`}
                                                            className={itemLevel3?.className}
                                                            leftIcon={itemLevel3?.leftIcon}
                                                            rightIcon={itemLevel3?.rightIcon}
                                                            goToMenu={itemLevel3?.goToMenu}
                                                        >
                                                            {itemLevel3?.label}
                                                        </MenuItem>
                                                    );
                                                })}
                                            </div>
                                        );
                                    }
                                    return (
                                        <MenuItem
                                            key={`item-level-${itemLevel2?.depthLevel}-${indexLevel2}`}
                                            className={itemLevel2?.className}
                                            leftIcon={itemLevel2?.leftIcon}
                                            rightIcon={itemLevel2?.rightIcon}
                                            goToMenu={itemLevel2?.goToMenu}
                                        >
                                            {itemLevel2?.label}
                                        </MenuItem>
                                    );
                                })}
                            </div>
                        </CSSTransition>
                    );
                })}
            </div>
        );
    },
);

Menu.displayName = 'Menu';

export default Menu;
