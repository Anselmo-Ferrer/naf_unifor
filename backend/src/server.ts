import express from "express"
import cors from "cors"
import usuarioRoutes from "./routes/usuarioRoutes"
import servicoRoutes from "./routes/servicoRoutes"
import agendamentoRoutes from "./routes/agendamentoRoutes"
import authRoutes from "./routes/authRoutes"

const app = express()

app.use(cors())
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