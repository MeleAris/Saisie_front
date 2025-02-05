import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../constantes/constante';
import { AuthContext } from "../context/authContext";
import '../styles/Login.css';

const Login = () => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { dispatch } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur de connexion');
            }

            dispatch({ type: "LOGIN", payload: data.token });
            localStorage.setItem('user', data.teacher.id);
            navigate('/');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container">
                <form className="login-form" onSubmit={handleSubmit}>
                    <h2>Connexion</h2>
                    {error && <p className="error-message">{error}</p>}
                    <input
                        type="text"
                        placeholder="Login"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Se connecter</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
