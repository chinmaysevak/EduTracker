import mongoose from 'mongoose';
import User from './models/User.js';

async function test() {
    await mongoose.connect('mongodb+srv://chinmaysevak60_db_user:JhLliUj9BbQUqeIv@edutracker.yyfwvv9.mongodb.net/edutracker');
    const userList = await User.find({});
    if (userList.length === 0) return console.log('No users found in model User');

    const userId = userList[0]._id;
    console.log('Testing with user ID:', userId);

    const reqUserId = userId.toString();

    const update = { theme: 'light' };
    const updatedUser = await User.findByIdAndUpdate(reqUserId, update, { new: true }).select('-passwordHash');

    console.log('Update result:', updatedUser ? 'Found!' : 'Null!');
    if (!updatedUser) {
        // Check if the user really exists
        const check = await User.findById(reqUserId);
        console.log('Check findById:', check ? 'Found' : 'Null');
    }

    process.exit(0);
}

test();
