import { Request, Response } from "express"
import bcrypt from "bcrypt"
import { PrismaClient } from "../generated/prisma"

const prisma = new PrismaClient()

export const loginUsuario = async (req: Request, res: Response) => {
  const { email, senha } = req.body

  if (!email || !senha) {
    return res.status(400).json({ error: "Email e senha são obrigatórios" })
  }

  try {
    // Buscar usuário pelo email
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        telefone: true,
        role: true,
        senha: true,
      }
    })

    if (!usuario) {
      return res.status(400).json({ error: "Email ou senha incorretos" })
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha)

    if (!senhaValida) {
      return res.status(400).json({ error: "Email ou senha incorretos" })
    }

    // Remover senha do objeto de resposta
    const { senha: _, ...usuarioSemSenha } = usuario

    // Retornar dados do usuário (sem a senha)
    res.json({
      message: "Login realizado com sucesso",
      usuario: usuarioSemSenha
    })
  } catch (error) {
    console.error("Erro ao autenticar usuário:", error)
    res.status(500).json({ error: "Erro ao autenticar usuário" })
  }
}

export const registrarUsuario = async (req: Request, res: Response) => {
  const { nome, email, cpf, telefone, senha } = req.body

  if (!nome || !email || !cpf || !telefone || !senha) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" })
  }

  try {
    // Verificar se usuário já existe
    const usuarioExistente = await prisma.usuario.findFirst({
      where: {
        OR: [{ email }, { cpf }]
      }
    })

    if (usuarioExistente) {
      return res.status(400).json({
        error: usuarioExistente.email === email
          ? "Email já cadastrado"
          : "CPF já cadastrado"
      })
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10)

    // Criar usuário
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        cpf,
        telefone,
        senha: senhaHash,
        role: "user"
      },
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        telefone: true,
        role: true,
      }
    })

    res.status(201).json({
      message: "Usuário criado com sucesso",
      usuario
    })
  } catch (error: any) {
    console.error("Erro ao registrar usuário:", error)
    res.status(500).json({ error: "Erro ao criar usuário" })
  }
}

export const esqueceuSenha = async (req: Request, res: Response) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: "Email é obrigatório" })
  }

  try {
    // Verificar se usuário existe
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    })

    // Por segurança, sempre retornar a mesma mensagem
    res.json({
      message: "Se o email estiver cadastrado, você receberá instruções para recuperação"
    })
  } catch (error: any) {
    console.error("Erro ao processar recuperação de senha:", error)
    res.status(500).json({ error: "Erro ao processar solicitação" })
  }
}

export const redefinirSenha = async (req: Request, res: Response) => {
  const { email, novaSenha } = req.body

  if (!email || !novaSenha) {
    return res.status(400).json({ error: "Email e nova senha são obrigatórios" })
  }

  try {
    // Hash da nova senha
    const senhaHash = await bcrypt.hash(novaSenha, 10)

    // Atualizar senha
    await prisma.usuario.update({
      where: { email },
      data: { senha: senhaHash }
    })

    res.json({ message: "Senha redefinida com sucesso" })
  } catch (error: any) {
    console.error("Erro ao redefinir senha:", error)
    res.status(500).json({ error: "Erro ao redefinir senha" })
  }
}