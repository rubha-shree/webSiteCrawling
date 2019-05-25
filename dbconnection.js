const  mongoose  = require("mongoose");

const  url  =  "mongodb://localhost:27017/test";
const  connect  =  mongoose.connect(url, { useNewUrlParser: true  });

let connection = mongoose.connection;

connection.on('error', (error) => {
    console.log("Connection Error: ", error);
});

connection.once('open', (data)=> {
    console.log("Connection succecfull");
})

module.exports  =  connection;