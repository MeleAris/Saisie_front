import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../constantes/constante';
import { AuthContext } from "../context/authContext";
import '../styles/Classes.css';

const Dashboard = () => {
    const [selectedClass, setSelectedClass] = useState('');

    const [classes, setClasses] = useState([]);
    const [matieres, setMatieres] = useState([]);
    const [ens, setEns] = useState([]);
    const [error, setError] = useState('');
    const [students, setStudents] = useState([]);
    const [allStudentNotes, setAllStudentNotes] = useState({});
    const { dispatch } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/classes`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.status === 403) {
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

                if (response.status === 403) {
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

                if (response.status === 403) {
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

    const subjectsByClass = useMemo(() => {
        const groupedSubjects = {};

        ens.forEach(entry => {
            const { classe_id, matiere_id } = entry;

            // Trouver la matière correspondante
            const matiere = matieres.find(m => m.id === matiere_id);
            if (!matiere) return;

            // Ajouter la matière à la classe correspondante
            if (!groupedSubjects[classe_id]) {
                groupedSubjects[classe_id] = [];
            }

            // Vérifie pour éviter les doublons
            if (!groupedSubjects[classe_id].some(m => m.id === matiere.id)) {
                groupedSubjects[classe_id].push(matiere);
            }
        });

        return groupedSubjects;
    }, [ens, matieres]);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch(`${API_URL}/students/${selectedClass}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (response.status === 403) {
                    dispatch({ type: "LOGOUT" });
                    navigate('/login');
                    return;
                }
                if (!response.ok) throw new Error('Erreur lors de la récupération des données');
                const data = await response.json();
                setStudents(data);
            } catch (err) {
                setError(err.message);
            } finally {
                //setLoading(false);
            }
        };
        const fetchNotes = async () => {
            try {
                const response = await fetch(`${API_URL}/notes`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });

                if (response.status === 403) {
                    dispatch({ type: "LOGOUT" });
                    navigate('/login');
                    return;
                }

                if (!response.ok) throw new Error('Erreur lors de la récupération des données');
                const data = await response.json();

                //Formatage des notes enregistrées
                const formattedNotes = data.reduce((acc, note) => {
                    if (!acc[note.student_id]) {
                        acc[note.student_id] = {};
                    }

                    acc[note.student_id][note.matiere_id] = {
                        note_classe: note.note_classe,
                        note_devoir: note.note_devoir,
                        note_compo: note.note_compo,
                    };

                    return acc;
                }, {});


                setAllStudentNotes(formattedNotes);
            } catch (err) {
                setError(err.message);
            } finally {
                //setLoading(false);
            }
        };

        fetchStudents();
        fetchNotes();
    }, [selectedClass]);

    return (
        <div className="student-list-container">
            <div className="student-header">
                <h1>Dashboard - Notes par classe</h1>
            </div>
            <div style={{ display: 'flex' }}>
                <aside style={{ minWidth: '150px', marginRight: '20px' }}>
                    <h3>Liste Classes</h3>
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                        {classes.map((cls) => (
                            <li
                                key={cls.id}
                                style={{
                                    padding: '8px 0',
                                    cursor: 'pointer',
                                    fontWeight: selectedClass === cls.id ? 'bold' : 'normal',
                                    color: selectedClass === cls.id ? '#2c3e50' : 'black',
                                }}
                                onClick={() => setSelectedClass(cls.id)}
                            >
                                {cls.libelle}
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* Student Notes Table */}
                <div className="table-container">
                    <table className="student-table">
                        <thead>
                            <tr>
                                <th>Nom & Prénoms</th>
                                {
                                    subjectsByClass[selectedClass]?.map((subject) => (
                                        <th key={subject.id}>{subject.libelle}</th>
                                    ))
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr key={student.id}>
                                    <td>{student.nom_prenom}</td>
                                    {subjectsByClass[selectedClass]?.map((subject) => {
                                        const notes = allStudentNotes[student.id]?.[subject.id];
                                        return (
                                            <td key={subject.id}>
                                                {notes
                                                    ? `${notes.note_classe} / ${notes.note_devoir} / ${notes.note_compo}`
                                                    : "—"}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
