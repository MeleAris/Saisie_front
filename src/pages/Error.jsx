
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ErrorPage = ({ code, title, message }) => {
    const navigate = useNavigate();

    return (
        <div className="container">
            <main className="flex items-center justify-center min-h-screen p-4 bg-[#f5f5f5]">
                <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md text-center">
                    <div className="mb-6">
                        <h1 className="text-[120px] font-bold text-[#2c3e50] leading-none">{code}</h1>
                        <h2 className="text-2xl font-semibold text-[#2c3e50] mb-4">{title}</h2>
                        <p className="text-gray-600 mb-8">{message}</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="w-full px-6 py-3 text-white bg-[#2c3e50] rounded-md hover:bg-[#34495e] active:transform active:translate-y-px"
                        >
                            Retour à l'accueil
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            className="w-full px-6 py-3 text-[#2c3e50] bg-transparent border-2 border-[#2c3e50] rounded-md hover:bg-gray-50 active:transform active:translate-y-px"
                        >
                            Page précédente
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

// Page 404
export const NotFound = () => (
    <ErrorPage
        code="404"
        title="Page non trouvée"
        message="Désolé, la page que vous recherchez n'existe pas ou a été déplacée."
    />
);

// Page 500
export const ServerError = () => (
    <ErrorPage
        code="500"
        title="Erreur serveur"
        message="Désolé, une erreur inattendue s'est produite. Nos équipes ont été notifiées et travaillent à résoudre le problème."
    />
);

export default ErrorPage;