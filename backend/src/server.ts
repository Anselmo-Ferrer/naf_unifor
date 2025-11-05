import express from "express"
import cors from "cors"
import usuarioRoutes from "./routes/usuarioRoutes"
import servicoRoutes from "./routes/servicoRoutes"
import agendamentoRoutes from "./routes/agendamentoRoutes"

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())

// Rotas
app.use("/usuarios", usuarioRoutes)
app.use("/servicos", servicoRoutes);
app.use("/agendamentos", agendamentoRoutes);

// Rota raiz (teste rápido)
app.get("/", (_req, res) => {
  res.send("API do sistema de agendamento funcionando 🚀")
})

// Porta
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`)
})

// npx ts-node src/server.ts