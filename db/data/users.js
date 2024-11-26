const bcrypt = require('bcryptjs')

module.exports = [
  {
    email: 'admin@email.com',
    username: 'admin',
    password: bcrypt.hashSync('pass', 10),
    passwordConfirmation: bcrypt.hashSync('pass', 10)
  },
]
//   {
//     username: 'sam',
//     password: bcrypt.hashSync('pass', 10)
//   },
//   {
//     username: 'iury',
//     password: bcrypt.hashSync('pass', 10)
//   },
//   {
//     username: 'michael',
//     password: bcrypt.hashSync('pass', 10)
//   },
//   {
//     username: 'samet',
//     password: bcrypt.hashSync('pass', 10)
//   },
//   {
//     username: 'peter',
//     password: bcrypt.hashSync('pass', 10)
//   },
// ]