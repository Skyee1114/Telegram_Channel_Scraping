import mongoose from "mongoose";

const pumpfunSchema = new mongoose.Schema({
    dev: { type: String, required: true },
    contract: { type: String, required: true },
    id: { type: String, required: true }
});
const Pumpfun = mongoose.model('Pumpfun', pumpfunSchema);

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

const main = async () => {
    await connectDB();
    const pumpFuns = await Pumpfun.find();
    
    // Group by developer and calculate counts
    const devCounts = pumpFuns.reduce((acc, { dev, contract }) => {
        if (!acc[dev]) {
            acc[dev] = { count: 0, contract };
        }
        acc[dev].count += 1;
        return acc;
    }, {});
    
    // Iterate over the developers and save data to Filter collection
    for (const dev in devCounts) {
        const { count, contract } = devCounts[dev];
        
        // Only save if the developer count is greater than 3
        if (count >= 2) {
            const newFilter = new Filter({
                dev,
                contract,
                count
            });

            await newFilter.save();
            console.log(`Saved filter for dev: ${dev}, count: ${count}, contract: ${contract}`);
        } else {
            console.log(`Skipping dev: ${dev} as count is ${count}`);
        }
    }
    console.log('Process completed.');
}

main()