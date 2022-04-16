describe('Blog app', function() {
  beforeEach(function() {
    cy.request('POST', 'http://localhost:3003/api/testing/reset')
    const user = {
      name: 'Jesse Toivanen',
      username: 'toivane4',
      password: 'salainen'
    }
    cy.request('POST', 'http://localhost:3003/api/users/', user)
    cy.visit('http://localhost:3000')
  })

  it('Login form is shown', function() {
    cy.get('#username')
    cy.get('#password')
    cy.get('#login-button')
  })

  describe('Login', function() {
    it('succeeds with correct credentials', function() {
      cy.get('#username').type('toivane4')
      cy.get('#password').type('salainen')
      cy.get('#login-button').click()

      cy.contains('logged in as Jesse Toivanen')
    })

    it('fails with wrong credentials', function() {
      cy.get('#username').type('feikki')
      cy.get('#password').type('julkinen')
      cy.get('#login-button').click()

      cy
        .get('.error')
        .should('contain', 'wrong username or password')
        .and('have.css', 'color', 'rgb(255, 0, 0)')
        .and('have.css', 'border-style', 'solid')
    })
  })

  describe('When logged in', function() {
    beforeEach(function() {
      cy.login({ username: 'toivane4', password: 'salainen' })
    })

    it('a blog can be created', function() {
      cy.contains('create new blog').click()
      cy.get('#title-input').type('Test Engineering')
      cy.get('#author-input').type('Gerhard Berger')
      cy.get('#url-input').type('http://greatblogs.com/gberger/testing')
      cy.get('#create-button').click()
      cy.contains('Test Engineering')
    })

    it('a blog can be liked', function() {
      cy.createBlog({
        title: 'Test Engineering',
        author: 'Gerhard Berger',
        url: 'http://greatblogs.com/gberger/testing'
      })

      cy.get('.view-button').click()
      cy.get('.like-button').click()
      cy.contains('likes 1')
    })

    it('a blog can be removed by the user who created the blog', function() {
      cy.createBlog({
        title: 'Test Engineering',
        author: 'Gerhard Berger',
        url: 'http://greatblogs.com/gberger/testing'
      })

      cy.get('.view-button').click()
      cy.get('.remove-button').click()
      cy.get('html').should('not.contain', 'Test Engineering')
    })

    it('a blog can not be removed by an user who did not create it', function() {
      const newUser = {
        name: 'Matti Luukkainen',
        username: 'mluukkai',
        password: 'salasana1'
      }
      cy.request('POST', 'http://localhost:3003/api/users/', newUser)

      cy.createBlog({
        title: 'Test Engineering',
        author: 'Gerhard Berger',
        url: 'http://greatblogs.com/gberger/testing'
      })

      cy.get('#logout-button').click()
      cy.login({ username: 'mluukkai', password: 'salasana1' })

      cy.get('.view-button').click()
      cy.get('.remove-button').should('not.exist')
    })
  })

  describe('When there are several blogs', function() {
    beforeEach(function() {
      cy.login({ username: 'toivane4', password: 'salainen' })
      cy.createBlog({
        title: 'Test Engineering',
        author: 'Gerhard Berger',
        url: 'http://greatblogs.com/gberger/testing'
      })
      cy.createBlog({
        title: 'Mysteries of Cypress',
        author: 'Alan Jones',
        url: 'http://greatblogs.com/ajones/mystery'
      })
      cy.createBlog({
        title: 'Holding Out for Hero',
        author: 'Bonnie Tyler',
        url: 'http://greatblogs.com/btyler/hero'
      })
    })

    it('blogs are ordered by the amount of likes', function() {
      cy.get('.blog').eq(0).should('contain.text', 'Test Engineering')
      cy.get('.blog').eq(1).should('contain.text', 'Mysteries of Cypress')
      cy.get('.blog').eq(2).should('contain.text', 'Holding Out for Hero')

      cy.contains('Test Engineering').contains('view').click()
      cy.get('.blog .moreInfo').eq(0).find('.like-button').click().wait(100).click().wait(100).click()
      cy.contains('Mysteries of Cypress').contains('view').click()
      cy
        .get('.blog .moreInfo')
        .eq(1)
        .find('.like-button')
        .click()
        .wait(100)
        .click()
        .wait(100)
        .click()
        .wait(100)
        .click()
        .wait(100)
        .click()
        .wait(100)
        .click()
      cy.contains('Holding Out for Hero').contains('view').click()
      cy.get('.blog .moreInfo').eq(2).find('.like-button').click().wait(100).click().wait(100).click().wait(100).click()

      cy.get('.blog').eq(0).should('contain.text', 'Mysteries of Cypress')
      cy.get('.blog').eq(1).should('contain.text', 'Holding Out for Hero')
      cy.get('.blog').eq(2).should('contain.text', 'Test Engineering')
    })
  })
})
