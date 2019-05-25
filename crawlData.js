const  mongoose  = require("mongoose");
const dbConnection = require('./dbconnection');
const  Schema  =  mongoose.Schema;
let schema = {
    url: {
        type: String
    },
    params: {
        type: Array
    }
};
const  crawlDataSchema  =  new Schema(
    schema,
    {
        timestamps: true
    }
);

let  crawlData  =  dbConnection.model("crawldata", crawlDataSchema);
module.exports  =  crawlData;