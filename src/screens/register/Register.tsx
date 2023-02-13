import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'src/components/button/Button';
import { Input } from 'src/components/input/Input';
import './Register.scss';

export function Register() {
    return (
        <form
            className="segment screen-register"
            onSubmit={(event) => {
                event.preventDefault();
            }}
        >
            <div className="screen-register-title">Signing up</div>
            <Input label="Login" name="login" />
            <Input label="Password" name="password" password={true} />
            <Input label="Repeat password" name="password" password={true} />
            <Input label="Email" name="email" />
            <div className="screen-register-buttons">
                <Button className="screen-register-buttons-sign-up" value="Sign up" />
                <Link to="/login">
                    <Button className="screen-register-buttons-back" style="grey" value="Back" />
                </Link>
            </div>
        </form>
    );
}
