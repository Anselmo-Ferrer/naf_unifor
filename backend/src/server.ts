import express from "express"
import cors from "cors"
import usuarioRoutes from "./routes/usuarioRoutes"
import servicoRoutes from "./routes/servicoRoutes"
import agendamentoRoutes from "./routes/agendamentoRoutes"
import authRoutes from "./routes/authRoutes"

const app = express()

// Configurar CORS para aceitar requisições da Vercel e localhost
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3001',
  'http://localhost:3000',
].filter(Boolean) as string[]

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Permitir requisições sem origin (ex: Postman, mobile apps)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(express.json())

app.use("/auth", authRoutes)
app.use("/usuarios", usuarioRoutes)
app.use("/servicos", servicoRoutes)
app.use("/agendamentos", agendamentoRoutes)

app.get("/", (_req, res) => {
  res.send("API do sistema de agendamento funcionando")
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})

//npx ts-node src/server.ts