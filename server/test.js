import mongoose from 'mongoose';

async function check() {
    await mongoose.connect('mongodb+srv://chinmaysevak60_db_user:JhLliUj9BbQUqeIv@edutracker.yyfwvv9.mongodb.net/edutracker');
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log("Users:");
    console.log(users);
    process.exit(0);
}

check();
