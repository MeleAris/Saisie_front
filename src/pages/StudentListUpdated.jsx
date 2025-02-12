import { Search } from 'lucide-react';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL } from '../constantes/constante';
import { AuthContext } from "../context/authContext";
import '../styles/StudentList.css';

const StudentList = () => {
    const { id } = useParams();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [allStudentNotes, setAllStudentNotes] = useState({});
    const { dispatch } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch(`${API_URL}/students/${id}`, {
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
                setLoading(false);
            }
        };
        const fetchNotes = async () => {
            try {
                const response = await fetch(`${API_URL}/notes/${localStorage.getItem('subject')}`, {
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
                    acc[note.student_id] = { note_classe: note.note_classe, note_devoir: note.note_devoir, note_compo: note.note_compo };
                    return acc;
                }, {});

                setAllStudentNotes(formattedNotes);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
        fetchNotes();
    }, [id]);

    const filteredStudents = students.filter(student =>
        student.nom_prenom.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleNoteChange = (studentId, e) => {
        const { name, value } = e.target;
        const formattedValue = value === '' ? null : parseFloat(parseFloat(value).toFixed(2));
        setAllStudentNotes(prevState => ({
            ...prevState,
            [studentId]: {
                ...prevState[studentId],
                [name]: formattedValue
            }
        }));
    };

    const handleSaveAllNotes = async () => {
        try {
            const notesToSave = Object.keys(allStudentNotes).map(studentId => ({
                eleve: studentId,
                matiere: localStorage.getItem('subject'),
                ...allStudentNotes[studentId]
            }));

            const response = await fetch(`${API_URL}/notes/bulk`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(notesToSave)
            });

            if (!response.ok) throw new Error('Erreur lors de l\'enregistrement des notes');

            alert('Notes enregistrées avec succès');
            window.location.reload();
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div className="loading">Chargement...</div>;
    if (error) return <div className="error">Une erreur est survenue : {error}</div>;

    return (
        <div className="student-list-container">
            <div className="student-header">
                <h1>Liste des élèves [{localStorage.getItem('classe')}]</h1>
                <h2>Notes de {localStorage.getItem('subjectName')}</h2>
                <div className="search-add-container">
                    <div className="search-bar">
                        <Search className="icon" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher un élève..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="table-container">
                <table className="student-table">
                    <thead>
                        <tr>
                            <th>Nom et prénoms</th>
                            <th>Note Classe</th>
                            <th>Note Devoir</th>
                            <th>Note Composition</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((student) => {
                            return (
                                <tr key={student.id}>
                                    <td>{student.nom_prenom}</td>
                                    <td>
                                        <input
                                            type="number"
                                            name="note_classe"
                                            placeholder="Note Classe"
                                            value={allStudentNotes[student.id]?.note_classe || ''}
                                            min={0}
                                            max={20}
                                            onChange={(e) => handleNoteChange(student.id, e)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            name="note_devoir"
                                            placeholder="Note Devoir"
                                            value={allStudentNotes[student.id]?.note_devoir || ''}
                                            min={0}
                                            max={20}
                                            onChange={(e) => handleNoteChange(student.id, e)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            name="note_compo"
                                            placeholder="Note Composition"
                                            value={allStudentNotes[student.id]?.note_compo || ''}
                                            min={0}
                                            max={20}
                                            onChange={(e) => handleNoteChange(student.id, e)}
                                        />
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            <div className="save-all-notes-container">
                <button onClick={handleSaveAllNotes} className="save-all-notes-btn">Enregistrer toutes les notes</button>
            </div>
        </div>
    );
};

export default StudentList;