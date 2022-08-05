const { MongoClient } = require('mongodb');
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'chatRoom';

const connectDB = async (collectionName) => {
    // Use connect method to connect to the server
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    return collection
}

const db = {
    // 新增
    insertOne: async (collectionName , object) => {
        const collection = await connectDB(collectionName)
        const insertOneResult = await collection.insertOne(object)
        await client.close()

        return insertOneResult
    },

    // 撈資料
    find: async (collectionName , condition) => {
        const collection = await connectDB(collectionName)
        const findResult = await collection.find(condition).toArray()
        await client.close()

        return findResult
    },

    // 撈一筆資料
    findOne: async (collectionName , condition) => {
        const collection = await connectDB(collectionName)
        const findOneResult = await collection.findOne(condition)
        await client.close()

        return findOneResult
    },

    // 撈筆數
    findCount: async (collectionName , condition) => {
        const collection = await connectDB(collectionName)
        const findCountResult = await collection.countDocuments(condition)
        await client.close()

        return findCountResult
    },
}

exports.db = db