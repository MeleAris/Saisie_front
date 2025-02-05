import axios from 'axios';
import React, { useState } from 'react';

const Form = () => {
    const [formData, setFormData] = useState({
        nomEleve: '',
        matiere: '',
        note: '',
        commentaire: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Convertir la note en nombre décimal
            const noteDecimal = parseFloat(formData.note);

            const response = await axios.post('http://localhost:5001/api/notes', {
                ...formData,
                note: noteDecimal
            });

            setMessage(response.data.message);

            // Réinitialiser le formulaire
            setFormData({
                nomEleve: '',
                matiere: '',
                note: '',
                commentaire: ''
            });
            setMessage('');
            setError('');
        } catch (error) {
            console.error('Erreur:', error);
            setError('Erreur lors de l\'enregistrement de la note');
        }
    };

    console.log('message', message);
    console.log('error', error);

    return (
        <div className="container">
            <header>
                <h1>Saisie des Notes</h1>
            </header>

            <main>
                <form onSubmit={handleSubmit} className="form-card">
                    {message && <div className="message">{message}</div>}
                    {error && <div className="error">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="nomEleve">Nom de l'élève:</label>
                        <input
                            type="text"
                            id="nomEleve"
                            name="nomEleve"
                            value={formData.nomEleve}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="matiere">Matière:</label>
                        <select
                            id="matiere"
                            name="matiere"
                            value={formData.matiere}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Sélectionner une matière</option>
                            <option value="mathematiques">Mathématiques</option>
                            <option value="francais">Français</option>
                            <option value="histoire">Histoire</option>
                            <option value="sciences">Sciences</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="note">Note (/20):</label>
                        <input
                            type="number"
                            id="note"
                            name="note"
                            min="0"
                            max="20"
                            value={formData.note}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="commentaire">Commentaire:</label>
                        <textarea
                            id="commentaire"
                            name="commentaire"
                            value={formData.commentaire}
                            onChange={handleChange}
                            rows="3"
                        ></textarea>
                    </div>

                    <button type="submit">Enregistrer la note</button>
                </form>
            </main>

            <footer>
                <p>© 2025 Système de Notes Scolaires</p>
            </footer>
        </div>
    );
};

export default Form;