const mongoose = require("mongoose");

module.exports = () => {
    mongoose.connect(process.env.DB_CONN_STRING, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    });

    mongoose.connection.on("open", () => {
        console.log("Veritabanı bağlantısı başarıyla kuruldu.");
    });

    mongoose.connection.on("error", () => {
        console.log("Veritabanı bağlantısı kurulamadı.");
    });
};