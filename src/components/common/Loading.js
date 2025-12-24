// Loading Spinner Component
import React from 'react';
import { Spinner } from 'react-bootstrap';
import './Loading.css';

const Loading = ({ size = 'md', text = 'Loading...', fullPage = false }) => {
    const spinnerSize = size === 'sm' ? 'sm' : undefined;

    if (fullPage) {
        return (
            <div className="loading-fullpage">
                <div className="loading-content">
                    <div className="loading-logo">
                        <span>AR ONE</span>
                    </div>
                    <Spinner animation="border" size={spinnerSize} className="loading-spinner" />
                    <p className="loading-text">{text}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`loading-container loading-${size}`}>
            <Spinner animation="border" size={spinnerSize} className="loading-spinner" />
            {text && <p className="loading-text">{text}</p>}
        </div>
    );
};

export default Loading;
