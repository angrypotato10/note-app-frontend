describe('Note app', function () {
	beforeEach(function () {
		cy.request('POST', 'http://localhost:3001/api/testing/reset')
		const user = {
			name: 'Nahid',
			username: 'nahid',
			password: '12345',
		}
		cy.request('POST', 'http://localhost:3001/api/users/', user)
		cy.visit('http://localhost:3000')
	})

	it('front page can be opened', function () {
		cy.contains('Notes')
		cy.contains(
			'Note app, Department of Computer Science, University of Helsinki 2020'
		)
	})

	it('login form can be opened', function () {
		cy.contains('login').click()
		cy.get('#username').type('nahid')
		cy.get('#password').type('12345')
		cy.get('#login-button').click()

		cy.contains('Nahid logged in')
	})

	describe('when logged in', function () {
		beforeEach(function () {
			cy.contains('login').click()
			cy.get('#username').type('nahid')
			cy.get('#password').type('12345')
			cy.get('#login-button').click()
		})

		it('a new note can be created', function () {
			cy.contains('new note').click()
			cy.get('input').type('a note created by cypress')
			cy.contains('save').click()
			cy.contains('a note created by cypress')
		})
	})
})
