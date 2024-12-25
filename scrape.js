import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import input from 'input';
import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

const pumpfunSchema = new mongoose.Schema({
    dev: { type: String, required: true },
    contract: { type: String, required: true },
    id: { type: String, required: true }
});
const Pumpfun = mongoose.model('Pumpfun', pumpfunSchema);

const apiId = parseInt("22404174"); // replace with your api_id
const apiHash = 'facdb90910cc908b011310faf757ad8e'; // replace with your api_hash
const stringSession = new StringSession(process.env.TG_SESSION);

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://charmdev1114:fDEd6g0jbqjP2WGY@cluster0.acd0g.mongodb.net/pump', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1); 
    }
};

const save = async (dev, contract, id) => {
    try {
        const newPumpFun = new Pumpfun({
            dev: dev,
            contract: contract,
            id: id,
        });
        await newPumpFun.save();
        console.log(`Saved pumpfun ${contract} with dev: ${dev} dev`);
    } catch (err) {
        console.error(`Error saving pumpfun ${contract} to MongoDB:`, err);
    }
};

const main = async () => {

    await connectDB();

    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 500,
    });

    await client.start({
        phoneNumber: async () => await input.text('Please enter your number: '),
        password: async () => await input.text('Please enter your password: '),
        phoneCode: async () => await input.text('Please enter the code you received: '),
        onError: (err) => { console.log(err); main() },
    });

    console.log('TG Connected...');
    // console.log(client.session.save());

    const channelToListen = await client.getEntity('https://t.me/OMNItech_pools')
    const res = await client.getMessages(channelToListen, { limit : 1000, offsetId: 11429 } );

    for (let i = 0; i < res.length; i++) {
        const message = res[i].message;
        if(message) {
            const contractAddress = message.match(/Contract:\s([A-Za-z0-9]{44})/);
            const devWallet = message.match(/Dev:\s([A-Za-z0-9]{4})/);
            if (devWallet && contractAddress) {
                const contract = contractAddress[1];
                const dev = devWallet[1];  
                const id = res[i].id;
                console.log('Contract: ', contract);
                console.log('Dev: ', dev);
                console.log('id: ', res[i].id);
                await save(dev, contract, id);
            }
        }
        
    }

}

main()