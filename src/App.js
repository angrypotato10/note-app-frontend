import React, { useState, useEffect } from 'react'
import Note from './components/Note'
import Notification from './components/Notification'
import Footer from './components/Footer'
import LoginForm from './components/LoginForm'
import Togglable from './components/Togglable'
import NoteForm from './components/NoteForm'
import noteService from './services/notes'
import loginService from './services/login'
import './index.css'

const App = () => {
	const [notes, setNotes] = useState([])
	const [showAll, setShowAll] = useState(true)
	const [errorMessage, setErrorMessage] = useState(null)

	const [user, setUser] = useState(null)

	useEffect(() => {
		noteService.getAll().then((initialNotes) => {
			setNotes(initialNotes)
		})
	}, [])

	useEffect(() => {
		const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')
		if (loggedUserJSON) {
			const user = JSON.parse(loggedUserJSON)
			setUser(user)
			noteService.setToken(user.token)
		}
	}, [])

	const handleLogin = async (username, password) => {
		try {
			const user = await loginService.login({
				username,
				password,
			})

			window.localStorage.setItem('loggedNoteappUser', JSON.stringify(user))

			noteService.setToken(user.token)
			setUser(user)
		} catch (exception) {
			setErrorMessage('Wrong credentials')
			setTimeout(() => {
				setErrorMessage(null)
			}, 5000)
		}
	}

	const toggleImportanceOf = (id) => {
		const note = notes.find((n) => n.id === id)
		const changedNote = { ...note, important: !note.important }

		noteService
			.update(id, changedNote)
			.then((returnedNote) => {
				setNotes(notes.map((note) => (note.id !== id ? note : returnedNote)))
			})
			.catch((error) => {
				setErrorMessage(
					`Note '${note.content}' was already removed from server`
				)
				setTimeout(() => {
					setErrorMessage(null)
				}, 3000)
				setNotes(notes.filter((n) => n.id !== id))
			})
	}

	const notesToShow = showAll ? notes : notes.filter((note) => note.important)

	const rows = () =>
		notesToShow.map((note) => (
			<Note
				key={note.id}
				note={note}
				toggleImportance={() => toggleImportanceOf(note.id)}
			/>
		))

	const addNote = (noteObject) => {
		noteFormRef.current.toggleVisibility()
		noteService.create(noteObject).then((returnedNote) => {
			setNotes(notes.concat(returnedNote))
		})
	}

	const loginForm = () => (
		<Togglable buttonLabel="login">
			<LoginForm handleLogin={handleLogin} />
		</Togglable>
	)

	const noteFormRef = React.createRef()

	const noteForm = () => (
		<Togglable buttonLabel="new note" ref={noteFormRef}>
			<NoteForm createNote={addNote} />
		</Togglable>
	)

	return (
		<div>
			<h1>Notes</h1>

			<Notification message={errorMessage} />

			{user === null ? (
				loginForm()
			) : (
				<div>
					<p>{user.name} logged in</p>
					{noteForm()}
				</div>
			)}

			<div>
				<button onClick={() => setShowAll(!showAll)}>
					show {showAll ? 'important' : 'all'}
				</button>
			</div>
			<ul>{rows()}</ul>

			<Footer />
		</div>
	)
}

export default App
