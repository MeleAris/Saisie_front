import { PencilIcon, PlusIcon, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL } from '../constantes/constante';
import '../styles/StudentList.css';

const StudentList = () => {
    const { id } = useParams();
    const [students, setStudents] = useState([]);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentNotes, setStudentNotes] = useState({ id: null, note_classe: null, note_devoir: null, note_compo: null });

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch(`${API_URL}/students/${id}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
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
                if (!response.ok) throw new Error('Erreur lors de la récupération des données');
                const data = await response.json();

                setNotes(data);
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

    const handleNoteChange = (e) => {
        setStudentNotes({ ...studentNotes, [e.target.name]: e.target.value });
    };

    const handleOpenModal = (student) => {
        setSelectedStudent(student);
        setShowModal(true);
    };
    const handleOpenUpdateModal = (student, notes) => {
        setSelectedStudent(student);
        setStudentNotes({
            id: notes.id,
            note_classe: notes.note_classe,
            note_devoir: notes.note_devoir,
            note_compo: notes.note_compo
        });
        setShowUpdateModal(true);
    };

    const handleSaveNote = async () => {
        try {
            const response = await fetch(`${API_URL}/notes`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    eleve: selectedStudent.id,
                    matiere: localStorage.getItem('subject'),
                    note_classe: studentNotes.note_classe,
                    note_devoir: studentNotes.note_devoir,
                    note_compo: studentNotes.note_compo,
                })
            });

            if (!response.ok) throw new Error('Erreur lors de l\'enregistrement de la note');

            setShowModal(false);
            setStudentNotes({ note_classe: null, note_devoir: null, note_compo: null });
            window.location.reload();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleUpdateNote = async () => {
        try {
            const response = await fetch(`${API_URL}/notes`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: studentNotes.id,
                    eleve: selectedStudent.id,
                    matiere: localStorage.getItem('subject'),
                    note_classe: studentNotes.note_classe,
                    note_devoir: studentNotes.note_devoir,
                    note_compo: studentNotes.note_compo,
                })
            });

            if (!response.ok) throw new Error('Erreur lors de la modification de la note');

            setShowUpdateModal(false);
            setStudentNotes({ id: null, note_classe: null, note_devoir: null, note_compo: null });
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
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((student) => {
                            const studentNotevalues = notes.find(note => note.student_id === student.id && note.matiere_id === parseInt(localStorage.getItem('subject')));
                            return (
                                <tr key={student.id}>
                                    <td>{student.nom_prenom}</td>
                                    <td>{studentNotevalues && studentNotevalues.note_classe}</td>
                                    <td>{studentNotevalues && studentNotevalues.note_devoir}</td>
                                    <td>{studentNotevalues && studentNotevalues.note_compo}</td>
                                    <td className="actions">
                                        {
                                            studentNotevalues && (studentNotevalues.note_classe || studentNotevalues.note_devoir || studentNotevalues.note_compo) ? (
                                                <button onClick={() => handleOpenUpdateModal(student, studentNotevalues)} className="update-btn">
                                                    <PencilIcon size={20} />
                                                </button>
                                            ) : (
                                                <button onClick={() => handleOpenModal(student)} className="view-btn">
                                                    <PlusIcon size={20} />
                                                </button>
                                            )
                                        }
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            {showModal && selectedStudent && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Notes de {selectedStudent.nom_prenom}</h2>
                        <input
                            type="number"
                            name="note_classe"
                            placeholder="Entrer la note de classe"
                            value={studentNotes.note_classe}
                            min={0}
                            max={20}
                            onChange={handleNoteChange}
                        />
                        <input
                            type="number"
                            name="note_devoir"
                            placeholder="Entrer la note de devoir"
                            value={studentNotes.note_devoir}
                            min={0}
                            max={20}
                            onChange={handleNoteChange}
                        />
                        <input
                            type="number"
                            name="note_compo"
                            placeholder="Entrer la note de composition"
                            value={studentNotes.note_compo}
                            min={0}
                            max={20}
                            onChange={handleNoteChange}
                        />
                        <div className="modal-buttons">
                            <button onClick={handleSaveNote} className="save-btn">Enregistrer</button>
                            <button onClick={() => setShowModal(false)} className="close-btn">Annuler</button>
                        </div>
                    </div>
                </div>
            )}
            {showUpdateModal && selectedStudent && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Notes de {selectedStudent.nom_prenom}</h2>
                        <input
                            type="number"
                            name="note_classe"
                            placeholder="Entrer la note de classe"
                            value={studentNotes.note_classe}
                            min={0}
                            max={20}
                            onChange={handleNoteChange}
                        />
                        <input
                            type="number"
                            name="note_devoir"
                            placeholder="Entrer la note de devoir"
                            value={studentNotes.note_devoir}
                            min={0}
                            max={20}
                            onChange={handleNoteChange}
                        />
                        <input
                            type="number"
                            name="note_compo"
                            placeholder="Entrer la note de composition"
                            value={studentNotes.note_compo}
                            min={0}
                            max={20}
                            onChange={handleNoteChange}
                        />
                        <div className="modal-buttons">
                            <button onClick={handleUpdateNote} className="save-btn">Enregistrer</button>
                            <button onClick={() => setShowUpdateModal(false)} className="close-btn">Annuler</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentList;
