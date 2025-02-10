import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../constantes/constante';
import { AuthContext } from "../context/authContext";
import '../styles/Classes.css';

const Classes = () => {
    const [classes, setClasses] = useState([]);
    const [matieres, setMatieres] = useState([]);
    const [ens, setEns] = useState([]);
    const [error, setError] = useState('');
    const { dispatch } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/classes`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.status === 401) {
                    dispatch({ type: "LOGOUT" });
                    navigate('/login');
                    return;
                }

                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des classes');
                }

                const data = await response.json();
                setClasses(data);
            } catch (error) {
                setError(error.message);
            }
        };
        const fetchEns = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/enseignement`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.status === 401) {
                    dispatch({ type: "LOGOUT" });
                    navigate('/login');
                    return;
                }

                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des données');
                }

                const data = await response.json();
                setEns(data);
            } catch (error) {
                setError(error.message);
            }
        };
        const fetchMatieres = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/matieres`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.status === 401) {
                    dispatch({ type: "LOGOUT" });
                    navigate('/login');
                    return;
                }

                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des données');
                }

                const data = await response.json();
                setMatieres(data);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchClasses();
        fetchEns();
        fetchMatieres();
    }, []);

    const teacherId = parseInt(localStorage.getItem('user'));

    const subjectsByClass = useMemo(() => {
        // Créer un dictionnaire avec les classes comme clés
        const groupedSubjects = {};

        // Initialiser toutes les classes avec un tableau vide
        classes.forEach(classe => {
            groupedSubjects[classe.id] = [];
        });

        // Regrouper les matières par classe pour ce professeur
        ens
            .filter(s => s.teacher_id === teacherId)
            .forEach(ens => {
                const classe = classes.find(c => c.id === ens.classe_id);
                const matiere = matieres.find(m => m.id === ens.matiere_id);

                if (classe && matiere) {
                    groupedSubjects[classe.id].push(matiere);
                }
            });

        return groupedSubjects;
    }, [ens, classes, matieres, teacherId]);

    return (
        <div className="classes-container">
            <h2>Liste des Classes</h2>
            {error && <p className="error-message">{error}</p>}
            <div className="classes-grid">
                {Object.entries(subjectsByClass).map(([classe, subjects]) => {
                    const clas = classes.find(c => c.id === parseInt(classe));
                    return (
                        clas && subjects.length > 0 ? (
                            subjects.map((subject, index) => (
                                <div key={`${clas.id}-${index}`} className="class-card" onClick={() => { navigate(`/students/${clas.id}`); localStorage.setItem('classe', clas.libelle); localStorage.setItem('subject', subject.id); localStorage.setItem('subjectName', subject.libelle); }}>
                                    <h3>{clas.libelle} - {subject.libelle}</h3>
                                </div>
                            ))
                        ) : null
                    )
                })}
            </div>
        </div>
    );
};

export default Classes;
