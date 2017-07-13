const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create a new TODO', (done) => {
    var text = 'Test todo text';

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        
        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch((e) => done(e));
      })
  });
});

describe('GET /todos', () => {
  it('Should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
      });
});

describe('GET /todos/:id', () => {
  it('Should return 404 for non-valid id', (done) => {
    request(app)
      .get('/todos/123')
      .expect(404)
      .end(done);
  });

  it('Should return 404 for non-existing id', (done) => {
    var newId = new ObjectID();
    request(app)
      .get(`/todos/${newId.toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('Should return todo for valid id', (done) => {
    request(app)
      .get(`/todos/${todos[0]['_id']}`)
      .expect(200)
      .expect((todo) => {
        expect(todo.body.todo.text).toBe('First test todo');
      })
      .end(done)
  });
});

describe('DELETE /todos/:id', () => {
  it('should return 404 for non-valid id', (done) => {
    var newId = '123abc';
    request(app)
      .delete(`/todos/${newId}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-existing id', (done) => {
    var newId = new ObjectID().toHexString();
    request(app)
      .delete(`/todos/${newId}`)
      .expect(404)
      .end(done);  
  });

  it('should delete document for valid id and return this document', (done) => {
    var newId = todos[0]._id.toHexString();
    request(app)
      .delete(`/todos/${newId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(newId);
        expect(res.body.todo.text).toBe('First test todo');
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.findById(newId).then((todo) => {
          expect(todo).toNotExist();
          done();
        }).catch((e) => done(e));
      });
  });
})

describe('PATCH /todos/:id', () => {
  it('should make todo completed', (done) => {
    var patchTodo = {
      'text' : 'Todo is patched',
      'completed': true
    };
    var newId = todos[0]._id.toHexString();
    request(app)
      .patch(`/todos/${newId}`)
      .send(patchTodo)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.findById(newId).then((todo) => {
          expect(todo.completed).toBe(true);
          expect(todo.completedAt).toBeA('number');
          expect(todo.text).toBe(patchTodo.text);
          done();
        }).catch((e) => done(e))
      })

  });

  it('should make todo uncompleted', () => {
    var patchTodo = {
      'completed': false
    };
    var newId = todos[0]._id.toHexString();
    request(app)
      .patch(`/todos/${newId}`)
      .send(patchTodo)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.findById(newId).then((todo) => {
          expect(todo.completed).toBe(false);
          expect(todo.completedAt).toBe(null);
          done();
        }).catch((e) => done(e))
      })
  });
});
