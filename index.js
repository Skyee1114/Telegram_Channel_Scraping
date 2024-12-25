import mongoose from "mongoose"
import fs from 'fs';

const filterSchema = new mongoose.Schema({
    dev: { type: String, required: true },
    contract: { type: String, required: true },
    count: { type: Number, required: true }
});
const Filter = mongoose.model('Filter', filterSchema);

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

const logToFile = (message) => {
    const logFilePath = './logs.txt'; // Path to the log file
    const timestamp = new Date().toISOString(); // ISO timestamp for the log entry
    const logMessage = `[${timestamp}] ${message}\n`;
  
    // Append the log message to the file
    fs.appendFileSync(logFilePath, logMessage, { encoding: 'utf-8' });
  
    // Log to the console as well
    console.log(message);
}

const main = async() => {
    await connectDB();

    const filters = await Filter.find()

    for (let i = 0; i < filters.length; i++) {
        const response = await fetch(`https://frontend-api.pump.fun/coins/${filters[i].contract}`);
        if (response.status == 200) {
            const content = await response.json();
            const creator = content.creator;
            const url = `https://frontend-api.pump.fun/coins/user-created-coins/${creator}?offset=0&limit=10&includeNsfw=true`;
            try {
                const res = await fetch(url);
                if (res.status == 200) {
                  const content = await res.json();
                  const length = content.length;
                  if(length >= 2) {
                    let completCount = 0;
                    for(let i = 0; i < length; i++){
                      if(content[i].raydium_pool) {
                        completCount++;
                      }
                    }
                    if(completCount/length >= 0.5){
                      logToFile(`--->User: ${creator}`);               
                    }
                  }
  
                }
            
            } catch (error) {
                console.error('Fetch error:', error);
            }                

        }      
        
    }
    console.log('Process completed.');
}

main()