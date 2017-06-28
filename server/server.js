var {mongoose} = require('./db/mongoose.js');
var {Todo} = require('./models/todo.js');
var {User} = require('./models/user.js');
// save new smtg

var newTodo = new Todo({
  text: '    Edit the video            '
});

newTodo.save().then((doc) => {
  console.log(JSON.stringify(doc, undefined, 2));
}, (e) => {
  console.log('Unable to save Todo');
});

var newUser = new User({
  email: '   user@example.com   '
});

newUser.save().then((doc) => {
  console.log(JSON.stringify(doc, undefined, 2))
}, (e) => {
  console.log('Unable to save user', e)
});
