require('dotenv').config()
const { Sequelize } = require('sequelize')
const fs = require('fs')
const path = require('path')
const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME } = process.env

let sequelize

if (process.env.NODE_ENV === 'production') {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  })

  sequelize
    .authenticate()
    .then(() => {
      console.log('Connection has been established successfully.')
    })
    .catch((err) => {
      console.error('Unable to connect to the database:', err)
    })
} else {
  sequelize = new Sequelize(
    `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`,
    {
      logging: false, // set to console.log to see the raw SQL queries
      native: false // lets Sequelize know we can use pg-native for ~30% more speed
    }
  )
}
const basename = path.basename(__filename)

const modelDefiners = []

// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, '/models'))
  .filter(
    (file) =>
      file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
  )
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, '/models', file)))
  })

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach((model) => model(sequelize))
// Capitalizamos los nombres de los modelos ie: product => Product
const entries = Object.entries(sequelize.models)
const capsEntries = entries.map((entry) => [
  entry[0][0].toUpperCase() + entry[0].slice(1),
  entry[1]
])
sequelize.models = Object.fromEntries(capsEntries)

// En sequelize.models están todos los modelos importados como propiedades
// Para relacionarlos hacemos un destructuring

const { Product, User, Publication, Favorite, Buy, BuyItem, Question, Review, Conversation, Message, Delivery, Varietal, ReviewBuy } = sequelize.models

// Aca vendrian las relaciones
User.hasMany(Publication)
Publication.belongsTo(User)

Product.hasMany(Publication)
Publication.belongsTo(Product)

Publication.hasMany(Favorite)
Favorite.belongsTo(Publication)

Publication.hasMany(BuyItem)
BuyItem.belongsTo(Publication)

Buy.hasMany(BuyItem)
BuyItem.belongsTo(Buy)

Buy.belongsTo(User)
User.hasMany(Buy)

User.hasMany(Favorite)
Favorite.belongsTo(User)

User.hasMany(Question)
Question.belongsTo(User)

Publication.hasMany(Question)
Question.belongsTo(Publication)

User.hasMany(Review)
Review.belongsTo(User)

Product.hasMany(Review)
Review.belongsTo(Product)

User.hasMany(Message)
Message.belongsTo(User)

Conversation.hasMany(Message)
Message.belongsTo(Conversation)

Conversation.belongsToMany(User, { through: 'ConversationUsers' })
User.belongsToMany(Conversation, { through: 'ConversationUsers' })

Buy.hasOne(Delivery)
Delivery.belongsTo(Buy)

ReviewBuy.belongsTo(User)
User.hasMany(ReviewBuy)

Publication.hasMany(ReviewBuy)
ReviewBuy.belongsTo(Publication)

module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize // para importart la conexión { conn } = require('./db.js');
}
