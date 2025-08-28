const {Sequelize , DataTypes} = require("sequelize");

const sequelize = new Sequelize({
    storage: process.env.DB_NAME || "database.sqlite",
    dialect : "sqlite",
    logging : false
})

// !!USER MODEL !!
const User = sequelize.define("User",{
    name : { type : DataTypes.STRING , allowNull : false },
    email : { type : DataTypes.STRING , allowNull : false , unique : true },
    password : { type : DataTypes.STRING , allowNull : false },
    role : { type : DataTypes.ENUM("admin","professor","student"), allowNull : false }
});

// !!APPOINTMENT MODEL !!

const Appointment = sequelize.define("Appointment",{
    start : { type : DataTypes.DATE , allowNull : false },
    end : { type : DataTypes.DATE , allowNull : false },
    status : { type : DataTypes.ENUM("booked","cancelled"), allowNull : false , defaultValue:"booked"}
})

// !!AVAILABILITY MODEL !!

const Availability = sequelize.define("Availability",{
    start : { type : DataTypes.DATE , allowNull : false },
    end : { type : DataTypes.DATE , allowNull : false },
})


//  ?? Association ??

User.hasMany(Availability,{as : "availabilities",foreignKey : "professorId"});
Availability.belongsTo(User,{foreignKey : "professorId"});

User.hasMany(Appointment,{as : "professorAppointments",foreignKey : "professorId"});
Appointment.belongsTo(User,{foreignKey : "professorId"});

User.hasMany(Appointment,{as : "studentAppointments",foreignKey : "studentId"});
Appointment.belongsTo(User,{foreignKey : "studentId"});


async function init({ force = false } = {}) {
    await sequelize.sync({ force });
  }
  

module.exports = {
    sequelize,
    User,
    Availability,
    Appointment,
    init
  };

    

