import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../button/Button';
import './ToMain.scss';


interface Props {
    children?: any;
}

export function ToMain(props: Props) {
    return (
        <div className="component-to-main">
            <div className="component-to-main-header">{props.children}</div>
            <div className="component-to-main-button">
                <Link to="/">
                    <Button value="To main" />
                </Link>
            </div>
        </div>
    );
}
