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

        return insertOneResult
    },

    // 撈資料
    find: async (collectionName , condition = null , column = null) => {
        const collection = await connectDB(collectionName)
        const findResult = await collection.find(condition).project(column).toArray()

        return findResult
    },

    // 撈一筆資料
    findOne: async (collectionName , condition , column = null) => {
        const collection = await connectDB(collectionName)
        const findOneResult = await collection.findOne(condition , {projection: column})

        return findOneResult
    },

    // 撈筆數
    findCount: async (collectionName , condition) => {
        const collection = await connectDB(collectionName)
        const findCountResult = await collection.countDocuments(condition)

        return findCountResult
    },

    // 更新
    updateOne: async (collectionName , condition , update , options) => {
        const collection = await connectDB(collectionName)
        const updateOneResult = await collection.updateOne(condition , update , options)

        return updateOneResult
    },

    // 搜尋一個集合
    aggregate: async (collectionName , unwind ,  condition , column) => {
        const collection = await connectDB(collectionName)
        const aggregateResult = await collection.aggregate([unwind , {"$match":condition} , {"$project":column}]).toArray()

        return aggregateResult
    },

    // 資料庫關閉
    close: () => {
        client.close()
    },
}

exports.db = db