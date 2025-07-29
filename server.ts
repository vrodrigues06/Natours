import mongoose from 'mongoose';
import 'dotenv/config';
import { app } from './app.js';

const port = process.env.PORT || 3333;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.DATABASE!);
    console.log('✅ Conexão com o banco de dados estabelecida');
    app.listen(port, () => {
      console.log(`Server is Running on port ${port}`);
    });
  } catch (err) {
    console.error('❌ Falha ao conectar ao banco de dados:', err);
    process.exit(1); // encerra o processo em caso de falha
  }
};

startServer();
